-- =====================================================================
-- Gestão Equipe - Planta Interna SP  ·  schema Supabase
-- Perfis: admin (tudo + usuários) · supervisor (escala/férias da própria
-- supervisão) · leitura (somente consulta). Cadastro só @vtal.com.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- perfis ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nome text,
  role text not null default 'leitura' check (role in ('admin','supervisor','leitura')),
  supervisao_id text,
  created_at timestamptz not null default now()
);

-- ---------- dados ----------
create table if not exists public.areas (
  id text primary key, dados jsonb not null,
  updated_at timestamptz not null default now(), updated_by uuid default auth.uid());
create table if not exists public.supervisoes (
  id text primary key, dados jsonb not null,
  updated_at timestamptz not null default now(), updated_by uuid default auth.uid());
create table if not exists public.colaboradores (
  id text primary key, supervisao_id text, ativo boolean not null default true, dados jsonb not null,
  updated_at timestamptz not null default now(), updated_by uuid default auth.uid());
create table if not exists public.feriados (
  data date primary key, nome text not null,
  updated_at timestamptz not null default now(), updated_by uuid default auth.uid());
create table if not exists public.ferias (
  id text primary key, colab_id text not null, dados jsonb not null,
  updated_at timestamptz not null default now(), updated_by uuid default auth.uid());
create index if not exists ferias_colab on public.ferias(colab_id);
create table if not exists public.escala (
  colab_id text not null, data date not null, valor text not null, acionado boolean not null default false,
  updated_at timestamptz not null default now(), updated_by uuid default auth.uid(),
  primary key (colab_id, data));
create index if not exists escala_data on public.escala(data);
create table if not exists public.hist_agg (
  colab_id text not null, ym text not null, j3 numeric, sa numeric,
  primary key (colab_id, ym));
create table if not exists public.config (
  chave text primary key, valor jsonb not null,
  updated_at timestamptz not null default now(), updated_by uuid default auth.uid());

-- ---------- auditoria (histórico de alterações) ----------
create table if not exists public.audit_log (
  id bigserial primary key,
  at timestamptz not null default now(),
  user_id uuid default auth.uid(),
  email text default (auth.jwt() ->> 'email'),
  tabela text not null, op text not null, chave text,
  antes jsonb, depois jsonb);
create index if not exists audit_at on public.audit_log(at desc);

create or replace function public.audit_trigger() returns trigger
language plpgsql security definer set search_path = public as $$
declare k text;
begin
  if tg_table_name = 'escala' then k := coalesce(new.colab_id, old.colab_id) || '|' || coalesce(new.data, old.data)::text;
  elsif tg_table_name = 'feriados' then k := coalesce(new.data, old.data)::text;
  elsif tg_table_name = 'config' then k := coalesce(new.chave, old.chave);
  elsif tg_table_name = 'hist_agg' then k := coalesce(new.colab_id, old.colab_id) || '|' || coalesce(new.ym, old.ym);
  else k := coalesce(new.id, old.id)::text; end if;
  insert into public.audit_log(tabela, op, chave, antes, depois)
  values (tg_table_name, tg_op, k,
          case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
          case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end);
  return coalesce(new, old);
end $$;

do $$ declare t text; begin
  foreach t in array array['areas','supervisoes','colaboradores','feriados','ferias','escala','config'] loop
    execute format('drop trigger if exists audit_%1$s on public.%1$s', t);
    execute format('create trigger audit_%1$s after insert or update or delete on public.%1$s for each row execute function public.audit_trigger()', t);
  end loop;
end $$;

create or replace function public.touch_updated() returns trigger language plpgsql as $$
begin new.updated_at := now(); new.updated_by := auth.uid(); return new; end $$;
do $$ declare t text; begin
  foreach t in array array['areas','supervisoes','colaboradores','feriados','ferias','escala','config'] loop
    execute format('drop trigger if exists touch_%1$s on public.%1$s', t);
    execute format('create trigger touch_%1$s before update on public.%1$s for each row execute function public.touch_updated()', t);
  end loop;
end $$;

-- ---------- funções de permissão ----------
create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid() $$;
create or replace function public.my_sup() returns text
language sql stable security definer set search_path = public as $$
  select supervisao_id from public.profiles where id = auth.uid() $$;
create or replace function public.colab_sup(cid text) returns text
language sql stable security definer set search_path = public as $$
  select supervisao_id from public.colaboradores where id = cid $$;
create or replace function public.is_vtal() returns boolean
language sql stable as $$ select coalesce(lower(auth.jwt() ->> 'email') like '%@vtal.com', false) $$;
create or replace function public.can_edit_colab(cid text) returns boolean
language sql stable security definer set search_path = public as $$
  select public.my_role() = 'admin'
      or (public.my_role() = 'supervisor' and public.my_sup() is not null and public.colab_sup(cid) = public.my_sup()) $$;

-- ---------- cadastro: só @vtal.com, entra como leitura ----------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if lower(new.email) not like '%@vtal.com' then
    raise exception 'Cadastro permitido somente com e-mail @vtal.com';
  end if;
  insert into public.profiles(id, email, nome, role)
  values (new.id, lower(new.email), coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email,'@',1)),
          case when lower(new.email) in (select lower(valor #>> '{}') from public.config where chave like 'admin_inicial%') then 'admin' else 'leitura' end)
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.areas enable row level security;
alter table public.supervisoes enable row level security;
alter table public.colaboradores enable row level security;
alter table public.feriados enable row level security;
alter table public.ferias enable row level security;
alter table public.escala enable row level security;
alter table public.hist_agg enable row level security;
alter table public.config enable row level security;
alter table public.audit_log enable row level security;

do $$ declare t text; begin
  foreach t in array array['areas','supervisoes','colaboradores','feriados','ferias','escala','hist_agg','config'] loop
    execute format('drop policy if exists ler on public.%1$s', t);
    execute format('create policy ler on public.%1$s for select to authenticated using (public.is_vtal() and public.my_role() is not null)', t);
  end loop;
  foreach t in array array['areas','supervisoes','colaboradores','feriados','hist_agg','config'] loop
    execute format('drop policy if exists admin_grava on public.%1$s', t);
    execute format('create policy admin_grava on public.%1$s for all to authenticated using (public.my_role() = ''admin'') with check (public.my_role() = ''admin'')', t);
  end loop;
end $$;

drop policy if exists grava on public.escala;
create policy grava on public.escala for all to authenticated
  using (public.can_edit_colab(colab_id)) with check (public.can_edit_colab(colab_id));
drop policy if exists grava on public.ferias;
create policy grava on public.ferias for all to authenticated
  using (public.can_edit_colab(colab_id)) with check (public.can_edit_colab(colab_id));

drop policy if exists ver_proprio on public.profiles;
create policy ver_proprio on public.profiles for select to authenticated using (id = auth.uid() or public.my_role() = 'admin');
drop policy if exists admin_altera on public.profiles;
create policy admin_altera on public.profiles for update to authenticated using (public.my_role() = 'admin') with check (public.my_role() = 'admin');
drop policy if exists admin_remove on public.profiles;
create policy admin_remove on public.profiles for delete to authenticated using (public.my_role() = 'admin' and id <> auth.uid());

drop policy if exists ver_auditoria on public.audit_log;
create policy ver_auditoria on public.audit_log for select to authenticated using (public.my_role() in ('admin','supervisor'));

-- impede que um admin rebaixe a si mesmo e fique sem administrador
create or replace function public.guard_profiles() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.role = 'admin' and new.role <> 'admin' and (select count(*) from public.profiles where role = 'admin') <= 1 then
    raise exception 'É preciso manter pelo menos um administrador';
  end if;
  return new;
end $$;
drop trigger if exists guard_profiles on public.profiles;
create trigger guard_profiles before update on public.profiles for each row execute function public.guard_profiles();
