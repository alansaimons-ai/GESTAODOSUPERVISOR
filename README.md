# Gestão Equipe — Planta Interna SP

Escala de plantão (J3 e sobreaviso), histórico de plantões e controle de férias da equipe de Planta Interna SP.

- **Frontend:** site estático (`index.html`, `app.js`, `styles.css`) publicado na Vercel.
- **Banco e login:** Supabase (Postgres + Auth). Esquema em `supabase/schema.sql`, dados iniciais em `supabase/seed.sql`.

## Perfis
| Perfil | Pode |
|---|---|
| Leitura | consultar tudo (padrão de toda conta nova) |
| Supervisor | editar escala e férias dos colaboradores da supervisão vinculada |
| Administrador | editar tudo, cadastros e gerenciar acessos |

Cadastro livre somente para e-mails `@vtal.com` (com confirmação por e-mail). O primeiro administrador é definido em `config.admin_inicial`.

Todas as alterações ficam em `audit_log` (quem, quando, valor anterior e novo).

## Configuração
1. Rodar `supabase/schema.sql` e depois `supabase/seed.sql` no SQL Editor do Supabase.
2. Preencher `config.js` com a URL do projeto e a chave `anon`.
3. Em Supabase → Authentication → URL Configuration, cadastrar a URL da Vercel como Site URL / Redirect URL.
