-- Preserve historical Razorpay rows while making Dodo the only new checkout provider.
alter table public.billing_subscriptions
  drop constraint if exists billing_subscriptions_provider_check;
alter table public.billing_subscriptions
  add constraint billing_subscriptions_provider_check
  check (provider in ('razorpay', 'dodo'));
alter table public.billing_subscriptions
  alter column provider_subscription_id drop not null;
alter table public.billing_subscriptions
  add column if not exists checkout_session_id text unique;

create unique index if not exists one_open_dodo_subscription_per_user
  on public.billing_subscriptions (user_id)
  where provider = 'dodo' and status in
    ('preparing', 'pending', 'active', 'on_hold', 'paused', 'past_due');
