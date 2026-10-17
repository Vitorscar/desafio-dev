-- Execute no SQL Editor do Supabase para ativar a votação compartilhada.
-- Depois cole a URL do projeto e a chave anon em script.js (SUPABASE_URL e SUPABASE_KEY).
create table if not exists votes (
  id bigint generated always as identity primary key,
  voter_id text not null,
  category text not null check (category in ('ui','idea','use')),
  dev text not null check (dev in ('k','v')),
  created_at timestamptz not null default now(),
  unique (voter_id, category)
);
alter table votes enable row level security;
create policy "todos leem votos" on votes for select using (true);
create policy "todos podem votar" on votes for insert with check (true);
-- Sem update nem delete: ninguém altera votos pela API.
-- Observação: o voter_id fica no navegador, então quem limpar os dados do navegador pode votar de novo.
-- Para um controle mais forte, use Supabase Anonymous Sign-ins e troque voter_id por auth.uid().
