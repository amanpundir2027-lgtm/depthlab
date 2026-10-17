import research from "./researchCurriculum.json" with { type: "json" };
import { sourceCatalog } from "./sources.ts";

export type Lesson = {
  slug: string;
  title: string;
  subject: string;
  question: string;
  stage: string;
  concepts: string[];
  objectives: string[];
  minutes: number;
  explanation: string[];
  example: string;
  limitation: string;
  connection: string;
  exercise: string;
  teachBack: string;
  application: string;
  reviewLater: string;
  questions: string[];
  sources: (typeof sourceCatalog)[number][];
};

export const paths: Record<string, string[]> = Object.fromEntries(
  [...new Set(research.lessons.map((lesson) => lesson.subject))].map(
    (subject) => [
      subject,
      research.lessons
        .filter((lesson) => lesson.subject === subject)
        .sort((a, b) => a.sequence - b.sequence)
        .map((lesson) => lesson.title),
    ],
  ),
);

export const lessons: Lesson[] = research.lessons.map((brief) => ({
  slug: brief.slug,
  title: brief.title,
  subject: brief.subject,
  question: brief.question,
  stage: brief.stage,
  concepts: brief.concepts,
  objectives: brief.objectives,
  minutes: brief.minutes,
  explanation: brief.explanation,
  example: brief.example,
  limitation: brief.limitation,
  connection: brief.connection,
  exercise: brief.application,
  teachBack: brief.teachBack,
  application: brief.application,
  reviewLater: brief.reviewLater,
  questions: brief.questions,
  sources: sourceCatalog.filter((source) =>
    brief.sourceIds.includes(source.id),
  ),
}));

export function getLesson(slug: string) {
  return lessons.find((lesson) => lesson.slug === slug);
}
