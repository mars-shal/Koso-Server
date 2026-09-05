-- Koso-Server: create tables missing from the live Supabase database.
-- The deployed API returns 400 "Could not find the table 'public.X' in the schema cache"
-- for each of these. Run this in the Supabase Dashboard → SQL Editor.
--
-- Safe to run multiple times (all statements are idempotent: IF NOT EXISTS).
--
-- NOTE: after creating tables, if the API STILL returns the schema-cache error for a few
-- minutes, run `NOTIFY pgrst, 'reload schema';` in the same SQL editor to force PostgREST
-- to pick up the new tables immediately.
--
-- RLS is enabled on every table; the backend's service-role key bypasses RLS, so API
-- calls through Koso-Server keep working. If the frontend later reads tables directly
-- with the anon key, add policies then.

-- ============================================================
-- Logs
-- Columns match src/logs/logs.service.ts (client_id, project_id,
-- type, message, timestamp).
-- ============================================================
create table if not exists public.Logs (
  id         uuid           primary key default gen_random_uuid(),
  client_id  text           not null,
  project_id text,
  type       text           not null,
  message    text           not null,
  timestamp  timestamptz,
  created_at timestamptz    not null default now()
);
alter table public.Logs enable row level security;

-- ============================================================
-- Meetings
-- Columns match src/meetings/meetings.service.ts (client_id,
-- project_id, date, summary, duration).
-- ============================================================
create table if not exists public.Meetings (
  id         uuid        primary key default gen_random_uuid(),
  client_id  text        not null,
  project_id text,
  date       timestamptz not null,
  summary    text        not null,
  duration   text,
  created_at timestamptz not null default now()
);
alter table public.Meetings enable row level security;

-- ============================================================
-- Milestones
-- Columns match src/milestones/milestones.service.ts (project_id,
-- name, due_date, status, description). status enum:
-- 'complete' | 'incomplete'
-- ============================================================
create table if not exists public.Milestones (
  id          uuid      primary key default gen_random_uuid(),
  project_id  text,
  name        text      not null,
  due_date    date,
  status      text      not null default 'incomplete'
              check (status in ('complete', 'incomplete')),
  description text,
  created_at  timestamptz not null default now()
);
alter table public.Milestones enable row level security;

-- ============================================================
-- PaymentLinks
-- Columns match src/payment-links/payment-links.service.ts (type,
-- linked_client_id, linked_project_id, linked_label, amount,
-- currency, status, url). type: 'Invoice' | 'Donation';
-- status: 'Active' | 'Inactive'. amount is in the base unit (naira).
-- ============================================================
create table if not exists public.PaymentLinks (
  id                 uuid      primary key default gen_random_uuid(),
  type               text      not null check (type in ('Invoice', 'Donation')),
  linked_client_id   text,
  linked_project_id  text,
  linked_label       text      not null,
  amount             numeric,
  currency           text      not null default 'NGN',
  status             text      not null default 'Active'
                      check (status in ('Active', 'Inactive')),
  url                text,
  created_at         timestamptz not null default now()
);
alter table public.PaymentLinks enable row level security;

-- ============================================================
-- Transactions
-- Columns match src/transactions/transactions.service.ts and the
-- Paystack webhook (payment_link_id, payer_name, payer_email,
-- amount, currency, date, status, gateway_ref). status enum:
-- 'Succeeded' | 'Pending' | 'Failed' | 'Refunded'.
-- gateway_ref is UNIQUE so webhook retries stay idempotent
-- (the backend upserts on it).
-- ============================================================
create table if not exists public.Transactions (
  id              uuid          primary key default gen_random_uuid(),
  payment_link_id text,
  payer_name      text,
  payer_email     text,
  amount          numeric       not null,
  currency        text          not null default 'NGN',
  date            timestamptz,
  status          text          not null default 'Pending'
                    check (status in ('Succeeded', 'Pending', 'Failed', 'Refunded')),
  gateway_ref     text          unique,
  created_at      timestamptz   not null default now()
);
alter table public.Transactions enable row level security;