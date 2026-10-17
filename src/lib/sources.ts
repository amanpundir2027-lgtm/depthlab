import research from "./researchCurriculum.json" with { type: "json" };

export type SourceRecord = {
  id: string;
  title: string;
  author: string;
  url: string;
  revised: string;
  type: string;
  whyUseful: string;
  supportedModules: string[];
  accessStatus: string;
  checkedAt: string;
};

export const sourceCatalog: SourceRecord[] = research.sources.map((source) => ({
  ...source,
  supportedModules: research.lessons
    .filter((lesson) => lesson.sourceIds.includes(source.id))
    .map((lesson) => lesson.slug),
}));
