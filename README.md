# Depth Lab

A learning companion prototype built with Next.js, Supabase, Deepgram, and a configurable OpenAI text model. The curriculum has **36 research briefs across 12 subjects**, three topics per subject, imported from the user-provided *Depth Lab 36 Topic Research* PDF. The pack includes 50 source records with access notes. These are research drafts; source and subject review and lesson expansion remain incomplete. There are **zero published modules**.

## Local development

Requires Node 24, npm, and a Supabase project. Copy `.env.example` to `.env.local` and enter values securely. Do not commit `.env.local`. Run `npm ci`, then `npm run dev`. Run `npm test`, `npm run typecheck`, and `npm run build` to validate code. Apply `supabase/migrations/0001_core.sql` to Supabase through its SQL editor or a connected Supabase CLI, then run `npm run seed` with server variables available in the process. The seed is repeatable and marks content as draft. Configure Supabase Auth's Site URL and redirect allowlist for `/auth/callback` at the deployed host.

The public waitlist needs `supabase/migrations/0002_waitlist.sql`, `NEXT_PUBLIC_SUPABASE_URL`, and the server-only `SUPABASE_SERVICE_ROLE_KEY`. The API saves normalized email addresses in a private table and returns an error if storage is unavailable. The ₹499/month plan is displayed for launch planning; checkout and recurring billing are not active until a payment gateway is integrated.

## Provider configuration

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are public client configuration.
- `SUPABASE_SERVICE_ROLE_KEY`, `DEEPGRAM_API_KEY`, and `OPENAI_API_KEY` are server secrets. Never use `NEXT_PUBLIC_` for them.
- `OPENAI_MODEL` defaults to `gpt-4.1-mini`; verify model availability and current pricing in the connected account before launch.

A Deepgram Member-level key grants temporary tokens with a default 30-second connection window through the SDK's `auth.v1.tokens.grant()`. This expiry does not close an already connected stream. The app closes a voice connection after 20 minutes and caps token grants at 30 per user per hour. It uses Deepgram Listen V1 Nova-3 with `en-IN`, interim and final results. Actual model suitability, provider prices, credit balance, account permissions, and browser WebM compatibility require live verification.

The tutor API caps calls at 100 per user per hour and assessment at 20 per user per hour through a database-backed limit. These are application controls, not provider spending caps. Voice and tutor operations require an authenticated user. Browser speech synthesis has device-dependent voices and can fail; text remains visible. Data retention choices cover app storage, not independently verified provider retention.

## Deployment status

The public Vercel site is live at https://depthlab-one.vercel.app. The project is connected to a Supabase free-plan resource. The waitlist and core learning-data migrations have been applied; the repeatable seed contains 12 subjects, 36 draft topic modules, and 50 source records. A production waitlist signup and separate-user note/progress isolation were verified with temporary records, then cleaned up. Supabase Auth's Site URL and production callback URL are configured; a generated magic link was verified to redirect to the production callback, and the user confirmed delivery and sign-in through a real inbox. Deepgram and OpenAI credentials are not configured, and production voice, usage, and mobile audio have not passed live acceptance checks. The ₹499/month payment gateway is not integrated. The research briefs need subject review and expansion before publication. Existing learner-owned notes and progress remain stored under their original topic IDs when topics are replaced.
