create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists survey_responses (
  id uuid primary key default gen_random_uuid(),
  respondent_code text not null unique,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  status text not null default 'in_progress' check (status in ('in_progress', 'submitted')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists survey_sections (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text not null,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists survey_questions (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references survey_sections(id) on delete cascade,
  key text not null unique,
  type text not null,
  label text not null,
  helper_text text,
  required boolean not null default false,
  options_json jsonb not null default '[]'::jsonb,
  config_json jsonb not null default '{}'::jsonb,
  sort_order integer not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists survey_answers (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references survey_responses(id) on delete cascade,
  question_id text not null,
  question_type text not null,
  answer_value_json jsonb,
  answer_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint survey_answers_response_question_unique unique (response_id, question_id)
);

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists analysis_tags (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references survey_responses(id) on delete cascade,
  question_id text not null,
  tag_type text not null,
  tag_value text not null,
  created_at timestamptz not null default now(),
  constraint analysis_tags_unique unique (response_id, question_id, tag_type, tag_value)
);

create index if not exists survey_responses_status_idx on survey_responses(status);
create index if not exists survey_responses_submitted_at_idx on survey_responses(submitted_at desc);
create index if not exists survey_answers_question_id_idx on survey_answers(question_id);
create index if not exists survey_answers_response_id_idx on survey_answers(response_id);
create index if not exists analysis_tags_response_id_idx on analysis_tags(response_id);
create index if not exists analysis_tags_question_id_idx on analysis_tags(question_id);

drop trigger if exists survey_responses_set_updated_at on survey_responses;
create trigger survey_responses_set_updated_at
before update on survey_responses
for each row execute function set_updated_at();

drop trigger if exists survey_sections_set_updated_at on survey_sections;
create trigger survey_sections_set_updated_at
before update on survey_sections
for each row execute function set_updated_at();

drop trigger if exists survey_questions_set_updated_at on survey_questions;
create trigger survey_questions_set_updated_at
before update on survey_questions
for each row execute function set_updated_at();

drop trigger if exists survey_answers_set_updated_at on survey_answers;
create trigger survey_answers_set_updated_at
before update on survey_answers
for each row execute function set_updated_at();

drop trigger if exists admin_users_set_updated_at on admin_users;
create trigger admin_users_set_updated_at
before update on admin_users
for each row execute function set_updated_at();
