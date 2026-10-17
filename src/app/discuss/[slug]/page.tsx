import { getLesson } from "@/lib/curriculum";
import { notFound } from "next/navigation";
import { Conversation } from "@/components/Conversation";
export default async function Discuss({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();
  return (
    <>
      <div className="eyebrow">
        {lesson.subject} · Research brief discussion
      </div>
      <h1>{lesson.title}</h1>
      <p className="lead">
        {lesson.question} Speak or type. The tutor will ask about your
        reasoning, not your accent.
      </p>
      <Conversation lesson={lesson} />
    </>
  );
}
