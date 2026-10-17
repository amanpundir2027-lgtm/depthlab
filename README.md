# Depth Lab

A learning companion prototype built with Next.js, Supabase, Deepgram, and a configurable OpenAI text model. All 14 subjects have six modules and **84 draft lessons**. Twelve reference links have been checked for Philosophy and Science; the other 72 drafts still need source research. Claim-level review, source variety, and editorial expansion remain incomplete. There are **zero published modules**.

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

A new Vercel project is connected to this repository, and an authenticated preview deployment is ready. Supabase, Deepgram, and OpenAI credentials were not yet configured when this note was last updated. A working preview build does not prove production voice, auth, writes, usage, mobile audio, or isolation. The content also needs source checking and expansion before publication. Do not describe this as a completed voice-led release until live acceptance checks pass.
