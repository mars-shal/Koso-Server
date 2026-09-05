-- Koso-Server: full Supabase schema migration.
--
-- Status quo found via PostgREST introspection today:
--   * Clients, Projects, Documents exist but are EMPTY PLACEHOLDERS
--     (only `id` + `created_at` columns -- no domain columns at all).
--   * Payments and "Meeting Logs" are empty junk tables (no API uses them).
--   * Logs, Meetings, Milestones, PaymentLinks, Transactions do not exist.
--
-- What this file does:
--   1. ALTERs Clients / Projects / Documents to add the real columns the API uses.
--   2. CREATEs Logs, Meetings, Milestones, PaymentLinks, Transactions.
--   3. DROPs the two empty placeholder tables (Payments, "Meeting Logs").
--
-- Run it in the Supabase Dashboard -> SQL Editor. Idempotent (IF NOT EXISTS /
-- ADD COLUMN IF NOT EXISTS), safe to re-run.
--
-- After running:
--   * PostgREST caches the schema. If the API still returns
--     "Could not find the table ... in the schema cache" for a minute or two,
--     run `NOTIFY pgrst, 'reload schema';` in the SQL editor to force a reload.
--
-- RLS is enabled on every table; the backend's service-role key bypasses RLS.
-- If the frontend ever reads tables directly with the anon key, add policies.

-- ============================================================
-- 1. REPAIR existing placeholder tables (empty; 0 rows confirmed).
-- ============================================================

-- ---------- Clients ----------
-- Backend columns (src/clients/clients.service.ts): email, first_name, last_name, phone.
-- Frontend needs: type ('Company' | 'Freelance' | 'Personal') to drive the
-- Business/Personal mode filter, and optionally status.
alter table public.Clients
  add column if not exists email      text,
  add column if not exists first_name text,
  add column if not exists last_name  text,
  add column if not exists phone      text,
  add column if not exists type       text not null default 'Personal'
    check (type in ('Company', 'Freelance', 'Personal')),
  add column if not exists status     text;

alter table public.Clients
  add constraint Clients_email_key unique (email);
alter table public.Clients
  alter column email set not null;

-- ---------- Projects ----------
-- Backend columns (src/projects/projects.service.ts): client_id, name, description,
-- status, agreed_amount, paid_amount, start_date, end_date.
alter table public.Projects
  add column if not exists client_id     text,
  add column if not exists name          text,
  add column if not exists description   text,
  add column if not exists status        text,
  add column if not exists agreed_amount numeric,
  add column if not exists paid_amount   numeric,
  add column if not exists start_date    date,
  add column if not exists end_date      date;

alter table public.Projects
  alter column name set not null;

-- ---------- Documents ----------
-- Backend columns (src/documents/documents.service.ts): client_id, project_id,
-- name, type, signed, file_url.
alter table public.Documents
  add column if not exists client_id  text,
  add column if not exists project_id text,
  add column if not exists name       text,
  add column if not exists type       text,
  add column if not exists signed     text,
  add column if not exists file_url   text;

-- ============================================================
-- 2. CREATE the 5 missing tables.
-- ============================================================

-- ---------- Logs ----------
-- Columns match src/logs/logs.service.ts (client_id, project_id, type, message, timestamp).
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

-- ---------- Meetings ----------
-- Columns match src/meetings/meetings.service.ts (client_id, project_id, date, summary, duration).
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

-- ---------- Milestones ----------
-- Columns match src/milestones/milestones.service.ts (project_id, name, due_date,
-- status, description). status: 'complete' | 'incomplete'.
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

-- ---------- PaymentLinks ----------
-- Columns match src/payment-links/payment-links.service.ts (type, linked_client_id,
-- linked_project_id, linked_label, amount, currency, status, url).
-- type: 'Invoice' | 'Donation'; status: 'Active' | 'Inactive'. amount in base unit.
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

-- ---------- Transactions ----------
-- Columns match src/transactions/transactions.service.ts and the Paystack webhook
-- (payment_link_id, payer_name, payer_email, amount, currency, date, status, gateway_ref).
-- status: 'Succeeded' | 'Pending' | 'Failed' | 'Refunded'.
-- gateway_ref is UNIQUE so webhook retries stay idempotent.
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

-- ============================================================
-- 3. Remove the empty placeholder tables (0 rows, unused by the API).
--    Delete these two statements if you prefer to keep them around.
-- ============================================================
drop table if exists public."Payments";
drop table if exists public."Meeting Logs";
