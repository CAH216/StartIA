-- ============================================================
-- StratIA — Schéma Supabase complet
-- Colle ce fichier dans : Supabase > SQL Editor > New Query
-- ============================================================

-- Activer uuid
create extension if not exists "pgcrypto";

-- ─── 1. USERS ────────────────────────────────────────────────
-- Profils publics, extends auth.users de Supabase Auth
create table if not exists public.users (
  id            uuid primary key,                          -- lié à auth.users.id
  email         text unique not null,
  full_name     text,
  company_name  text,
  sector        text,
  province      text,
  role          text not null default 'user'               -- 'user' | 'admin'
                check (role in ('user', 'admin')),
  plan          text not null default 'free'               -- 'free' | 'pro'
                check (plan in ('free', 'pro')),
  avatar_url    text,
  created_at    timestamptz not null default now(),
  last_active_at timestamptz not null default now()
);

-- RLS : chaque user voit/modifie seulement son propre profil
alter table public.users enable row level security;

create policy "users_select_own" on public.users
  for select using (auth.uid() = id or
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- Trigger : on crée automatiquement un profil quand un user s'inscrit
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ─── 2. DIAGNOSTICS ──────────────────────────────────────────
create table if not exists public.diagnostics (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  score      integer not null check (score between 0 and 100),
  level      text not null,
  summary    text,
  data       jsonb,                                        -- résultat complet (priorities, tools, risks…)
  created_at timestamptz not null default now()
);

alter table public.diagnostics enable row level security;

create policy "diag_select_own" on public.diagnostics
  for select using (
    auth.uid() = user_id or
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

create policy "diag_insert_own" on public.diagnostics
  for insert with check (auth.uid() = user_id);

create index on public.diagnostics (user_id, created_at desc);


-- ─── 3. TASKS ────────────────────────────────────────────────
-- Progression roadmap persistée en base (remplace localStorage)
create table if not exists public.tasks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  task_key   text not null,                                -- ex: "0-1" (mois-tâche)
  status     text not null default 'idle'
             check (status in ('idle', 'active', 'done')),
  updated_at timestamptz not null default now(),
  unique (user_id, task_key)
);

alter table public.tasks enable row level security;

create policy "tasks_select_own" on public.tasks
  for select using (
    auth.uid() = user_id or
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

create policy "tasks_insert_own" on public.tasks
  for insert with check (auth.uid() = user_id);

create policy "tasks_update_own" on public.tasks
  for update using (auth.uid() = user_id);

create index on public.tasks (user_id);


-- ─── 4. SESSIONS ─────────────────────────────────────────────
-- Historique des conversations avec l'assistant IA
create table if not exists public.sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  title      text,
  messages   jsonb not null default '[]',                  -- [{role, content}]
  created_at timestamptz not null default now()
);

alter table public.sessions enable row level security;

create policy "sessions_select_own" on public.sessions
  for select using (
    auth.uid() = user_id or
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

create policy "sessions_insert_own" on public.sessions
  for insert with check (auth.uid() = user_id);

create policy "sessions_update_own" on public.sessions
  for update using (auth.uid() = user_id);

create index on public.sessions (user_id, created_at desc);


-- ─── 5. SUBSCRIPTIONS ────────────────────────────────────────
create table if not exists public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references public.users(id) on delete cascade,
  plan                   text not null default 'free'
                         check (plan in ('free', 'pro')),
  status                 text not null default 'active'
                         check (status in ('active', 'cancelled', 'past_due')),
  started_at             timestamptz not null default now(),
  expires_at             timestamptz,
  stripe_customer_id     text,
  stripe_subscription_id text,
  unique (user_id)
);

alter table public.subscriptions enable row level security;

create policy "subs_select_own" on public.subscriptions
  for select using (
    auth.uid() = user_id or
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

create policy "subs_insert_own" on public.subscriptions
  for insert with check (auth.uid() = user_id);

create policy "subs_update_own" on public.subscriptions
  for update using (auth.uid() = user_id);


-- ─── 6. CERTIFICATES ─────────────────────────────────────────
-- Un user peut avoir plusieurs certificats (formation, RBQ, CCQ, etc.)
create table if not exists public.certificates (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users(id) on delete cascade,
  name           text not null,                            -- ex: "Licence RBQ entrepreneur général"
  issuer         text,                                     -- ex: "Régie du bâtiment du Québec"
  issue_date     date,
  expiry_date    date,                                     -- null = pas d'expiration
  credential_url text,                                     -- lien vers la vérification en ligne
  file_url       text,                                     -- URL du fichier uploadé (Supabase Storage)
  notes          text,
  created_at     timestamptz not null default now()
);

alter table public.certificates enable row level security;

create policy "cert_select_own" on public.certificates
  for select using (
    auth.uid() = user_id or
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

create policy "cert_insert_own" on public.certificates
  for insert with check (auth.uid() = user_id);

create policy "cert_update_own" on public.certificates
  for update using (auth.uid() = user_id);

create policy "cert_delete_own" on public.certificates
  for delete using (auth.uid() = user_id);

create index on public.certificates (user_id, expiry_date asc nulls last);


-- ─── VUES ADMIN ──────────────────────────────────────────────
-- Vue agrégée pour le dashboard admin (lecture seule)
create or replace view public.admin_user_summary as
select
  u.id,
  u.email,
  u.full_name,
  u.company_name,
  u.sector,
  u.province,
  u.role,
  u.plan,
  u.created_at,
  u.last_active_at,
  coalesce(d.latest_score, 0)        as diagnostic_score,
  coalesce(t.done_count, 0)          as tasks_done,
  coalesce(t.total_count, 0)         as tasks_total,
  coalesce(c.cert_count, 0)          as certificates_count,
  s.status                           as subscription_status
from public.users u
left join lateral (
  select score as latest_score
  from public.diagnostics
  where user_id = u.id
  order by created_at desc limit 1
) d on true
left join lateral (
  select
    count(*) filter (where status = 'done') as done_count,
    count(*) as total_count
  from public.tasks
  where user_id = u.id
) t on true
left join lateral (
  select count(*) as cert_count
  from public.certificates
  where user_id = u.id
) c on true
left join public.subscriptions s on s.user_id = u.id;
