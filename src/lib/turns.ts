export class TurnAssembler {
  private finalized = "";
  private interim = "";
  private sent = false;
  onTranscript?: (text: string) => void;
  onTurn?: (text: string) => void;
  receive(event: {
    is_final?: boolean;
    speech_final?: boolean;
    channel?: { alternatives?: { transcript?: string }[] };
  }) {
    const text = event.channel?.alternatives?.[0]?.transcript?.trim() || "";
    if (event.is_final && text) {
      this.finalized = [this.finalized, text].filter(Boolean).join(" ");
      this.interim = "";
    } else if (!event.is_final) this.interim = text;
    this.onTranscript?.(
      [this.finalized, this.interim].filter(Boolean).join(" "),
    );
    if (event.speech_final) this.send();
  }
  send() {
    if (this.sent) return;
    const text = this.finalized.trim();
    if (!text) return;
    this.sent = true;
    this.onTurn?.(text);
    this.finalized = "";
    this.interim = "";
    this.onTranscript?.("");
  }
  reset() {
    this.finalized = "";
    this.interim = "";
    this.sent = false;
    this.onTranscript?.("");
  }
  next() {
    this.sent = false;
  }
}
