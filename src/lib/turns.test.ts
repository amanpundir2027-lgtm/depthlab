import { describe, it, expect } from "vitest";
import { TurnAssembler } from "./turns";
describe("Deepgram turn assembly", () => {
  it("combines final segments and submits once at the end of speech", () => {
    const a = new TurnAssembler();
    const turns: string[] = [];
    a.onTurn = (t) => turns.push(t);
    a.receive({
      is_final: true,
      speech_final: false,
      channel: { alternatives: [{ transcript: "I think it" }] },
    });
    a.receive({
      is_final: false,
      speech_final: false,
      channel: { alternatives: [{ transcript: "is causal" }] },
    });
    expect(turns).toEqual([]);
    a.receive({
      is_final: true,
      speech_final: true,
      channel: { alternatives: [{ transcript: "is causal" }] },
    });
    a.send();
    expect(turns).toEqual(["I think it is causal"]);
  });
  it("permits a new turn after reset", () => {
    const a = new TurnAssembler();
    const turns: string[] = [];
    a.onTurn = (t) => turns.push(t);
    a.receive({
      is_final: true,
      speech_final: true,
      channel: { alternatives: [{ transcript: "first" }] },
    });
    a.next();
    a.receive({
      is_final: true,
      speech_final: true,
      channel: { alternatives: [{ transcript: "second" }] },
    });
    expect(turns).toEqual(["first", "second"]);
  });
});
