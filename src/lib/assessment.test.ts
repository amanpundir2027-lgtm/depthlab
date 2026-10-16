import { describe, it, expect } from "vitest";
import { decideState, Feedback } from "./assessment";
const base: Feedback = {
  accuracy: "demonstrated",
  reasoning: "demonstrated",
  limitations: "demonstrated",
  application: "demonstrated",
  comments: {},
  correction: "",
  nextReview: "",
};
describe("mastery rules", () => {
  it("does not grant mastery for an initial strong attempt", () =>
    expect(decideState(base)).toBe("demonstrated"));
  it("requires delayed independent evidence", () =>
    expect(decideState(base, 1, true)).toBe("mastered"));
  it("marks an evidence gap for review", () =>
    expect(decideState({ ...base, reasoning: "insufficient" }, 2, true)).toBe(
      "needs_review",
    ));
});
