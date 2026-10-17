import { describe, expect, it } from "vitest";
import { getLesson, lessons, paths } from "./curriculum";
import { sourceCatalog } from "./sources";

describe("research curriculum integrity", () => {
  it("contains the PDF's three topics for each of twelve subjects", () => {
    expect(Object.keys(paths)).toHaveLength(12);
    expect(Object.values(paths).every((topics) => topics.length === 3)).toBe(
      true,
    );
    expect(lessons).toHaveLength(36);
    expect(new Set(lessons.map((lesson) => lesson.slug)).size).toBe(36);
    for (const [subject, topics] of Object.entries(paths)) {
      expect(
        lessons
          .filter((lesson) => lesson.subject === subject)
          .map((lesson) => lesson.title),
      ).toEqual(topics);
    }
  });

  it("keeps each brief's explanation, discussion plan, application, and source access notes", () => {
    expect(sourceCatalog).toHaveLength(50);
    expect(new Set(sourceCatalog.map((source) => source.url)).size).toBe(50);
    for (const lesson of lessons) {
      expect(lesson.explanation.join(" ").length).toBeGreaterThan(100);
      expect(lesson.example).toBeTruthy();
      expect(lesson.limitation).toBeTruthy();
      expect(lesson.questions).toHaveLength(3);
      expect(lesson.teachBack).toBeTruthy();
      expect(lesson.application).toBeTruthy();
      expect(lesson.objectives.length).toBeGreaterThanOrEqual(2);
      expect(lesson.sources.length).toBeGreaterThan(0);
      for (const source of lesson.sources) {
        expect(source.supportedModules).toContain(lesson.slug);
        expect(source.accessStatus).toBeTruthy();
      }
    }
  });

  it("does not serve retired topics", () => {
    expect(getLesson("music-rhythm")).toBeUndefined();
    expect(getLesson("art-and-design-visual-elements")).toBeUndefined();
    expect(getLesson("biology-cells")).toBeUndefined();
    expect(getLesson("philosophy-can-you-be-right-by-luck")?.title).toBe(
      "Can you be right by luck?",
    );
  });
});
