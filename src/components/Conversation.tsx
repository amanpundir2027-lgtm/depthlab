"use client";
import { DeepgramClient } from "@deepgram/sdk";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, authHeader } from "./Providers";
import { TurnAssembler } from "@/lib/turns";
import type { Lesson } from "@/lib/curriculum";
type Stage =
  | "ready"
  | "connecting"
  | "listening"
  | "transcribing"
  | "thinking"
  | "speaking"
  | "paused"
  | "reconnecting"
  | "text mode"
  | "ended";
type Message = { role: "user" | "assistant"; content: string };
export function Conversation({ lesson }: { lesson: Lesson }) {
  const { user, db } = useAccount();
  const [stage, setStage] = useState<Stage>("ready");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [tutorMuted, setTutorMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [retain, setRetain] = useState(false);
  const [retainFeedback, setRetainFeedback] = useState(false);
  const [sessionId, setSessionId] = useState<string>();
  const [teachBack, setTeachBack] = useState("");
  const [application, setApplication] = useState("");
  const [feedback, setFeedback] = useState<{
    feedback: Record<string, unknown>;
    state: string;
  } | null>(null);
  const [assessing, setAssessing] = useState(false);
  const socket = useRef<{
    close: () => void;
    sendMedia: (data: Blob) => void;
  } | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const generation = useRef<AbortController | null>(null);
  const epoch = useRef(0);
  const msgRef = useRef<Message[]>([]);
  const assembler = useRef(new TurnAssembler());
  const lastReply = useRef("");
  const stageRef = useRef<Stage>("ready");
  const sessionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);
  const stopSpeech = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window)
      window.speechSynthesis.cancel();
  };
  const stopMic = () => {
    if (sessionTimer.current) clearTimeout(sessionTimer.current);
    sessionTimer.current = null;
    if (recorder.current?.state === "recording") {
      recorder.current.ondataavailable = null;
      recorder.current.stop();
    }
    recorder.current = null;
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    socket.current?.close();
    socket.current = null;
  };
  const append = useCallback((message: Message) => {
    msgRef.current = [...msgRef.current, message];
    setMessages(msgRef.current);
  }, []);
  const speak = (text: string) => {
    lastReply.current = text;
    if (tutorMuted || !("speechSynthesis" in window)) {
      setStage("paused");
      return;
    }
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = speechSynthesis.getVoices();
      utterance.voice =
        voices.find((v) => /en-IN/i.test(v.lang)) ||
        voices.find((v) => /^en/i.test(v.lang)) ||
        null;
      utterance.rate = rate;
      utterance.onend = () =>
        setStage((current) => (current === "speaking" ? "listening" : current));
      utterance.onerror = () => {
        setError("Speech playback failed. The reply is still readable.");
        setStage("paused");
      };
      setStage("speaking");
      speechSynthesis.speak(utterance);
    } catch {
      setError("Speech playback is unavailable. Read the response below.");
      setStage("paused");
    }
  };
  const submit = useCallback(
    async (text: string) => {
      const answer = text.trim();
      if (!answer || !db || !user) return;
      if (stageRef.current === "speaking") {
        msgRef.current = msgRef.current.slice(0, -1);
        setMessages(msgRef.current);
      }
      epoch.current++;
      const current = epoch.current;
      generation.current?.abort();
      stopSpeech();
      assembler.current.next();
      setCaption("");
      setDraft("");
      setError("");
      append({ role: "user", content: answer });
      setStage("thinking");
      const snapshot = msgRef.current;
      const controller = new AbortController();
      generation.current = controller;
      try {
        const res = await fetch("/api/tutor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(await authHeader(db)),
          },
          body: JSON.stringify({ slug: lesson.slug, messages: snapshot }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (current !== epoch.current) return;
        if (!res.ok) throw Error(data.error || "Tutor unavailable");
        append({ role: "assistant", content: data.answer });
        speak(data.answer);
        if (retain && sessionId)
          await db
            .from("tutor_sessions")
            .update({
              messages: [
                ...snapshot,
                { role: "assistant", content: data.answer },
              ],
            })
            .eq("id", sessionId);
      } catch (e) {
        if (current !== epoch.current) return;
        setError(e instanceof Error ? e.message : "Tutor unavailable");
        setStage("text mode");
      }
    },
    [db, user, lesson.slug, append, retain, sessionId, tutorMuted, rate],
  );
  useEffect(() => {
    assembler.current.onTranscript = (text) => {
      setCaption(text);
      if (text && stageRef.current === "speaking") {
        stopSpeech();
        setStage("transcribing");
      }
    };
    assembler.current.onTurn = (text) => {
      setStage("transcribing");
      submit(text);
    };
  }, [submit]);
  const start = async () => {
    if (!db || !user) {
      setError("Sign in to start a session.");
      return;
    }
    setError("");
    setStage("connecting");
    try {
      const tracks = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      stream.current = tracks;
      const resp = await fetch("/api/deepgram-token", {
        method: "POST",
        headers: await authHeader(db),
      });
      const data = await resp.json();
      if (!resp.ok) throw Error(data.error);
      const client = new DeepgramClient({ accessToken: data.token });
      const connection = await client.listen.v1.connect({
        model: "nova-3",
        language: "en-IN",
        interim_results: "true",
        punctuate: "true",
        smart_format: "true",
        endpointing: 800,
      });
      socket.current = connection;
      connection.on("message", (event) => {
        if (event.type === "Results") assembler.current.receive(event);
      });
      connection.on("error", () => {
        setError("Transcription connection failed. Switch to text or retry.");
        setStage("reconnecting");
      });
      connection.on("close", () => {
        if (stream.current) {
          setError("Transcription disconnected. Use text or retry.");
          setStage("reconnecting");
          stopMic();
        }
      });
      connection.connect();
      await connection.waitForOpen();
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const rec = new MediaRecorder(tracks, { mimeType: mime });
      recorder.current = rec;
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) connection.sendMedia(e.data);
      };
      rec.start(250);
      sessionTimer.current = setTimeout(
        () => {
          stopMic();
          setStage("paused");
          setError(
            "Voice session limit reached. Resume to start a new connection.",
          );
        },
        20 * 60 * 1000,
      );
      setStage("listening");
      const { data: created } = await db
        .from("tutor_sessions")
        .insert({
          user_id: user.id,
          module_id: lesson.slug,
          retain_transcript: retain,
        })
        .select("id")
        .single();
      if (created) setSessionId(created.id);
    } catch (e) {
      stopMic();
      setError(
        e instanceof Error
          ? e.message
          : "Microphone unavailable. Use text mode.",
      );
      setStage("text mode");
    }
  };
  const pause = () => {
    stopMic();
    setStage("paused");
  };
  const end = async () => {
    epoch.current++;
    generation.current?.abort();
    stopSpeech();
    stopMic();
    assembler.current.reset();
    setStage("ended");
    if (db && sessionId)
      await db
        .from("tutor_sessions")
        .update({ ended_at: new Date().toISOString() })
        .eq("id", sessionId);
  };
  useEffect(
    () => () => {
      epoch.current++;
      generation.current?.abort();
      stopSpeech();
      stopMic();
    },
    [],
  );
  const assess = async () => {
    if (!db) return;
    setAssessing(true);
    setError("");
    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await authHeader(db)),
        },
        body: JSON.stringify({
          slug: lesson.slug,
          teachBack,
          application,
          retainFeedback,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw Error(data.error);
      setFeedback(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Assessment failed");
    } finally {
      setAssessing(false);
    }
  };
  return (
    <>
      <div className="two">
        <div className="stack">
          <div className="panel">
            <div className="row">
              <span className="state" role="status">
                {stage}
              </span>
              <span className="muted">
                {stream.current ? "Microphone active" : "Microphone off"}
              </span>
            </div>
            <h2>Talk it through</h2>
            <p>{lesson.question}</p>
            <div className="row">
              <button
                className="button"
                onClick={start}
                disabled={
                  !user ||
                  ["connecting", "listening", "speaking", "thinking"].includes(
                    stage,
                  )
                }
              >
                Start / resume voice
              </button>
              <button
                className="button secondary"
                onClick={pause}
                disabled={!stream.current}
              >
                Pause microphone
              </button>
              <button
                className="button ghost"
                onClick={() => {
                  stopMic();
                  setStage("text mode");
                }}
              >
                Switch to text
              </button>
              <button className="button ghost" onClick={end}>
                End session
              </button>
            </div>
            <div className="row" style={{ marginTop: 12 }}>
              <button
                className="button ghost"
                onClick={() => {
                  stopSpeech();
                  setStage("paused");
                }}
              >
                Interrupt / stop speech
              </button>
              <button
                className="button ghost"
                onClick={() => {
                  setTutorMuted(!tutorMuted);
                  stopSpeech();
                }}
              >
                {tutorMuted ? "Unmute tutor" : "Mute tutor"}
              </button>
              <button
                className="button ghost"
                onClick={() => speak(lastReply.current)}
                disabled={!lastReply.current}
              >
                Replay reply
              </button>
            </div>
            <div className="field">
              <label htmlFor="rate">Speaking rate: {rate.toFixed(1)}×</label>
              <input
                id="rate"
                type="range"
                min="0.8"
                max="1.2"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
              />
            </div>
            <label>
              <input
                type="checkbox"
                checked={retain}
                onChange={(e) => setRetain(e.target.checked)}
                style={{ width: "auto" }}
              />{" "}
              Save conversation text for this session
            </label>
            <p className="muted">
              Muting stops tutor audio. Pausing stops microphone capture. Ending
              closes recording, transcription, and the tutor request.
            </p>
            {caption && (
              <div className="notice" aria-live="polite">
                <strong>Live transcript — review before sending</strong>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
                <button
                  className="button secondary"
                  onClick={() => {
                    assembler.current.reset();
                    submit(caption);
                  }}
                >
                  Send corrected answer
                </button>
              </div>
            )}
            {error && (
              <div role="alert" className="notice error">
                {error}
              </div>
            )}
          </div>
          <div className="panel">
            <h3>Conversation</h3>
            {!messages.length && (
              <p className="muted">
                Start with what you already know. You can ask for a simpler
                explanation, another example, or a deeper challenge.
              </p>
            )}
            {messages.map((m, i) => (
              <div className={`message ${m.role}`} key={i}>
                <small>{m.role === "user" ? "You" : "Tutor"}</small>
                <p>{m.content}</p>
              </div>
            ))}
            <div className="field">
              <label htmlFor="answer">Your answer or question</label>
              <textarea
                id="answer"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type if speaking is inconvenient, or correct a transcript here."
              />
            </div>
            <button
              className="button"
              disabled={!user || !draft.trim()}
              onClick={() => submit(draft)}
            >
              Send answer
            </button>
          </div>
        </div>
        <aside className="stack">
          <div className="panel">
            <div className="eyebrow">Learning objectives</div>
            <ul>
              {lesson.objectives.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <p>
              <a href={`/lesson/${lesson.slug}`}>Return to lesson →</a>
            </p>
          </div>
          <div className="panel">
            <div className="eyebrow">Show what you know</div>
            <h3>Teach back</h3>
            <p>{lesson.teachBack}</p>
            <textarea
              aria-label="Teach-back answer"
              value={teachBack}
              onChange={(e) => setTeachBack(e.target.value)}
            />
            <h3>Apply it somewhere new</h3>
            <p>{lesson.application}</p>
            <textarea
              aria-label="Application answer"
              value={application}
              onChange={(e) => setApplication(e.target.value)}
            />
            <p className="muted">
              Edit these answers before grading. Only the text shown here is
              assessed.
            </p>
            <label>
              <input
                type="checkbox"
                checked={retainFeedback}
                onChange={(e) => setRetainFeedback(e.target.checked)}
                style={{ width: "auto" }}
              />{" "}
              Save submitted answers and feedback in attempt history
            </label>
            <button
              className="button"
              disabled={
                assessing || !user || !teachBack.trim() || !application.trim()
              }
              onClick={assess}
            >
              {assessing ? "Assessing…" : "Submit for feedback"}
            </button>
            {feedback && (
              <div className="notice success">
                <strong>State: {feedback.state.replaceAll("_", " ")}</strong>
                {Object.entries(
                  feedback.feedback.comments as Record<string, string>,
                ).map(([k, v]) => (
                  <p key={k}>
                    <strong>{k}:</strong> {v}
                  </p>
                ))}
                <p>
                  <strong>Correction:</strong>{" "}
                  {String(feedback.feedback.correction)}
                </p>
                <p>
                  <strong>Review task:</strong>{" "}
                  {String(feedback.feedback.nextReview)}
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
