-- =====================================================================
-- Versão 5 · justificativa de horas extras (BA / ESTAÇÃO / MOTIVO)
-- Rodar uma vez no SQL Editor do Supabase.
-- =====================================================================
alter table public.horas_extras add column if not exists ba text;
alter table public.horas_extras add column if not exists estacao text;
alter table public.horas_extras add column if not exists justificativa text;
alter table public.horas_extras add column if not exists justificado_por uuid;
alter table public.horas_extras add column if not exists justificado_nome text;
alter table public.horas_extras add column if not exists justificado_em timestamptz;

-- supervisor pode justificar as horas da própria supervisão
drop policy if exists supervisor_justifica on public.horas_extras;
create policy supervisor_justifica on public.horas_extras for update to authenticated
  using (colab_id is not null and public.can_edit_colab(colab_id))
  with check (colab_id is not null and public.can_edit_colab(colab_id));

-- quem não é admin só altera os campos de justificativa
create or replace function public.guard_horas_extras() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if public.my_role() <> 'admin' then
    if (new.data, new.colaborador, new.colab_id, new.funcao, new.motivo, new.inicio, new.termino, new.horas, new.classificacao, new.turno, new.cidade, new.supervisao)
       is distinct from
       (old.data, old.colaborador, old.colab_id, old.funcao, old.motivo, old.inicio, old.termino, old.horas, old.classificacao, old.turno, old.cidade, old.supervisao) then
      raise exception 'Somente o administrador altera os dados do lançamento; o supervisor pode apenas justificar.';
    end if;
  end if;
  new.justificado_por := auth.uid();
  new.justificado_em := now();
  return new;
end $$;
drop trigger if exists guard_horas_extras on public.horas_extras;
create trigger guard_horas_extras before update on public.horas_extras
  for each row when (old.justificativa is distinct from new.justificativa or old.ba is distinct from new.ba or old.estacao is distinct from new.estacao or old.horas is distinct from new.horas or old.motivo is distinct from new.motivo)
  execute function public.guard_horas_extras();
