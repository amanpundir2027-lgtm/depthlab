# Depth Lab

A learning companion prototype built with Next.js, Supabase, Deepgram, and a configurable OpenAI text model. The curriculum has **36 research briefs across 12 subjects**, three topics per subject, imported from the user-provided *Depth Lab 36 Topic Research* PDF. The pack includes 50 source records with access notes. All 36 are published as research briefs with their source access notes. They are concise research summaries; full specialist review and expanded lessons are still pending.

## Local development

Requires Node 24, npm, and a Supabase project. Copy `.env.example` to `.env.local` and enter values securely. Do not commit `.env.local`. Run `npm ci`, then `npm run dev`. Run `npm test`, `npm run typecheck`, and `npm run build` to validate code. Apply `supabase/migrations/0001_core.sql` to Supabase through its SQL editor or a connected Supabase CLI, then run `npm run seed` with server variables available in the process. The seed is repeatable and marks the 36 research briefs as published. Configure Supabase Auth's Site URL as `https://depthlab.me` and allow `/auth/callback` on both `depthlab.me` and `www.depthlab.me`.

The public waitlist needs `supabase/migrations/0002_waitlist.sql`, `NEXT_PUBLIC_SUPABASE_URL`, and the server-only `SUPABASE_SERVICE_ROLE_KEY`. The API saves normalized email addresses in a private table and returns an error if storage is unavailable. Dodo Payments checkout is prepared but remains disabled until its account, product, secrets, webhook, and test payment are verified.

## Dodo Payments billing launch

1. Production has `supabase/migrations/0003_billing.sql` and `supabase/migrations/0004_dodo.sql` applied. The latter allows Dodo checkout sessions and protects against a second open subscription. Apply both migrations to any new Supabase environment.
2. Complete Dodo merchant onboarding. In **Test Mode**, create a recurring product with **INR 49,900 paise (₹499)**, **1 Month** payment frequency, **12 Month** subscription period, no trial or discount, and **tax inclusive** pricing. Save its product ID.
3. Create a Dodo webhook at `https://depthlab.me/api/billing/webhook`, subscribed to `subscription.*` events. Save its webhook secret. The route verifies Dodo's webhook signature and fetches the current subscription state from Dodo before saving it.
4. Add `DODO_PAYMENTS_ENVIRONMENT=test_mode`, `DODO_PAYMENTS_API_KEY`, `DODO_PAYMENTS_PRODUCT_ID`, and `DODO_PAYMENTS_WEBHOOK_SECRET` as server-only Vercel environment variables. Deploy with `BILLING_ENABLED=true` only after the migration and webhook are ready. No Dodo secret belongs in `NEXT_PUBLIC_` variables.
5. Sign in to Depth Lab, make a Dodo test subscription, and verify checkout, the webhook, the status on `/settings`, and cancellation at period end. Repeat using live credentials and a live ₹499 monthly product when the account is approved. Check Dodo's current fees, supported Indian subscription payment methods, tax handling, and terms before taking live payments.

The hosted Dodo checkout handles payment details. The app never trusts a checkout redirect as proof of payment; only signed webhook updates backed by Dodo's API change subscription status. Until `BILLING_ENABLED=true` and all required variables exist, the homepage continues to show “Coming soon”. Public lessons remain accessible regardless of subscription status. Dodo subscription metadata must retain the Depth Lab billing and user IDs for webhook matching; verify this in the test transaction.

## Provider configuration

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are public client configuration.
- `SUPABASE_SERVICE_ROLE_KEY`, `DEEPGRAM_API_KEY`, and `OPENAI_API_KEY` are server secrets. Never use `NEXT_PUBLIC_` for them.
- `OPENAI_MODEL` defaults to `gpt-4.1-mini`; verify model availability and current pricing in the connected account before launch.

A Deepgram Member-level key grants temporary tokens with a default 30-second connection window through the SDK's `auth.v1.tokens.grant()`. This expiry does not close an already connected stream. The app closes a voice connection after 20 minutes and caps token grants at 30 per user per hour. It uses Deepgram Listen V1 Nova-3 with `en-IN`, interim and final results. Actual model suitability, provider prices, credit balance, account permissions, and browser WebM compatibility require live verification.

The tutor API caps calls at 100 per user per hour and assessment at 20 per user per hour through a database-backed limit. These are application controls, not provider spending caps. Voice and tutor operations require an authenticated user. Browser speech synthesis has device-dependent voices and can fail; text remains visible. Data retention choices cover app storage, not independently verified provider retention.

## Deployment status

The primary domain is https://depthlab.me, with https://www.depthlab.me also attached to the Vercel project. The earlier https://depthlab-one.vercel.app address remains available. The project is connected to a Supabase free-plan resource. The waitlist, core learning-data, and Dodo billing migrations have been applied; the repeatable seed contains 12 subjects, 36 published research briefs, and 50 source records. A production waitlist signup and separate-user note/progress isolation were verified with temporary records, then cleaned up. Supabase Auth's Site URL and production callback URL are configured; a generated magic link was verified to redirect to the production callback, and the user confirmed delivery and sign-in through a real inbox. Deepgram and OpenAI credentials are not configured, and production voice, usage, and mobile audio have not passed live acceptance checks. Dodo billing code is deployed but real payments remain disabled pending merchant setup, credentials, and a test transaction. The published research briefs retain their source access limits; expanded lessons still need subject review. Existing learner-owned notes and progress remain stored under their original topic IDs when topics are replaced.
