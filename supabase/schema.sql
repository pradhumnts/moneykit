create table household_sync (
  id text primary key default 'default',
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into household_sync (id, state) values ('default', '{}'::jsonb);

create table household_sync_history (
  id bigserial primary key,
  state jsonb not null,
  saved_at timestamptz not null default now()
);
