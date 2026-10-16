import { createClient } from "@supabase/supabase-js";
import { paths, lessons } from "../src/lib/curriculum.ts";
import { sourceCatalog } from "../src/lib/sources.ts";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key)
  throw new Error("Supabase URL and service role key are required");
const db = createClient(url, key, { auth: { persistSession: false } });
const slug = (s) =>
  s
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replace(/-$/, "");
for (const [i, [title, modules]] of Object.entries(paths).entries()) {
  const id = slug(title);
  const { error: subjectError } = await db
    .from("subjects")
    .upsert({ id, title, sequence: i + 1 });
  if (subjectError) throw subjectError;
  for (const [j, name] of modules.entries()) {
    const lesson = lessons.find((x) => x.subject === title && x.title === name);
    const { error } = await db.from("modules").upsert({
      id: lesson?.slug || slug(`${title}-${name}`),
      subject_id: id,
      title: name,
      status: "draft",
      curriculum_version: 1,
      content: lesson || null,
      sequence: j + 1,
    });
    if (error) throw error;
  }
}
for (const source of sourceCatalog) {
  const { data, error } = await db
    .from("sources")
    .upsert(
      {
        title: source.title,
        author: source.author,
        url: source.url,
        revised: source.revised,
        resource_type: source.type,
        why_useful: source.whyUseful,
        checked_at: source.checkedAt,
        access_status: source.accessStatus,
      },
      { onConflict: "url" },
    )
    .select("id")
    .single();
  if (error) throw error;
  for (const module_id of source.supportedModules) {
    const { error: linkError } = await db
      .from("module_sources")
      .upsert({ module_id, source_id: data.id });
    if (linkError) throw linkError;
  }
}
console.log(
  `Seeded ${Object.keys(paths).length} subjects, ${Object.values(paths).flat().length} module plans, ${lessons.length} draft lesson records, ${sourceCatalog.length} checked source URLs.`,
);
