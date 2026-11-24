-- =====================================================================
-- Versão 4 · horas extras justificadas (controle manual)
-- Rodar uma vez no SQL Editor; depois rodar seed_horas_extras.sql.
-- =====================================================================
create table if not exists public.horas_extras (
  id bigserial primary key,
  data date not null,
  colaborador text not null,
  colab_id text,
  funcao text, motivo text, inicio text, termino text,
  horas numeric not null,
  classificacao text, turno text, cidade text, supervisao text,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid()
);
create index if not exists he_data on public.horas_extras(data);
create index if not exists he_colab on public.horas_extras(colab_id);
alter table public.horas_extras enable row level security;
drop policy if exists ler on public.horas_extras;
create policy ler on public.horas_extras for select to authenticated using (public.is_vtal() and public.my_role() in ('admin','supervisor'));
drop policy if exists admin_grava on public.horas_extras;
create policy admin_grava on public.horas_extras for all to authenticated using (public.my_role() = 'admin') with check (public.my_role() = 'admin');
grant select, insert, update, delete on public.horas_extras to authenticated;
grant usage, select on sequence public.horas_extras_id_seq to authenticated;

-- metas de sobreaviso (horas/mês para toda a equipe)
insert into public.config(chave, valor) values ('metasSobreaviso', '[{"desde":"2000-01","valor":2300},{"desde":"2026-09","valor":2000}]'::jsonb)
on conflict (chave) do nothing;
