create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'razorpay' check (provider = 'razorpay'),
  provider_subscription_id text not null unique,
  checkout_url text not null,
  status text not null,
  paid_count integer not null default 0,
  total_count integer not null,
  current_end timestamptz,
  cancel_at_cycle_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists billing_subscriptions_user_created_idx
  on public.billing_subscriptions (user_id, created_at desc);

alter table public.billing_subscriptions enable row level security;
revoke all on public.billing_subscriptions from anon, authenticated;
grant select on public.billing_subscriptions to authenticated;
grant select, insert, update, delete on public.billing_subscriptions to service_role;
create policy own_billing_subscriptions on public.billing_subscriptions
  for select to authenticated using (user_id = auth.uid());
