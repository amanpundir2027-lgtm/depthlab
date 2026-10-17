import { describe, expect, it } from "vitest";
import { lessons, paths } from "./curriculum";
import { sourceCatalog } from "./sources";

describe("curriculum integrity", () => {
  it("maps fourteen six-module paths with unique lesson IDs", () => {
    expect(Object.keys(paths)).toHaveLength(14);
    expect(Object.values(paths).every((modules) => modules.length === 6)).toBe(
      true,
    );
    expect(new Set(lessons.map((lesson) => lesson.slug)).size).toBe(
      lessons.length,
    );
  });
  it("provides one distinct draft for every mapped module", () => {
    expect(lessons).toHaveLength(84);
    for (const [subject, modules] of Object.entries(paths)) {
      for (const title of modules) {
        const matches = lessons.filter(
          (x) => x.subject === subject && x.title === title,
        );
        expect(matches).toHaveLength(1);
        expect(matches[0].question).toBeTruthy();
        expect(matches[0].explanation.join(" ").length).toBeGreaterThan(100);
        expect(matches[0].exercise).toBeTruthy();
      }
    }
  });
  it("keeps checked source claims attached only to researched drafts", () => {
    for (const lesson of lessons.filter((x) => x.sources.length)) {
      expect(lesson.sources.length).toBeGreaterThan(0);
      expect(
        sourceCatalog.some(
          (source) =>
            source.url === lesson.sources[0].url &&
            source.supportedModules.includes(lesson.slug),
        ),
      ).toBe(true);
    }
    expect(lessons.filter((x) => x.sources.length)).toHaveLength(12);
  });
});
