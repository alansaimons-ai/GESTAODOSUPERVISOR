-- =====================================================================
-- Versão 3 · telefone no cadastro de usuários
-- Rodar uma vez no SQL Editor do Supabase.
-- =====================================================================
alter table public.profiles add column if not exists telefone text;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if lower(new.email) not like '%@vtal.com' then
    raise exception 'Cadastro permitido somente com e-mail @vtal.com';
  end if;
  insert into public.profiles(id, email, nome, telefone, role)
  values (new.id, lower(new.email),
          coalesce(nullif(new.raw_user_meta_data ->> 'nome',''), split_part(new.email,'@',1)),
          nullif(new.raw_user_meta_data ->> 'telefone',''),
          case when lower(new.email) in (select lower(valor #>> '{}') from public.config where chave like 'admin_inicial%') then 'admin' else 'leitura' end)
  on conflict (id) do nothing;
  return new;
end $$;
