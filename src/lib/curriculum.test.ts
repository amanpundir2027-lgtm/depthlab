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
  it("links every draft lesson to a checked source record", () => {
    expect(lessons).toHaveLength(12);
    for (const lesson of lessons) {
      expect(lesson.sources.length).toBeGreaterThan(0);
      expect(
        sourceCatalog.some(
          (source) =>
            source.url === lesson.sources[0].url &&
            source.supportedModules.includes(lesson.slug),
        ),
      ).toBe(true);
    }
  });
});
