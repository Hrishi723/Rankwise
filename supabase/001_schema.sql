-- ============================================================
-- RANKWISE ERP — Phase 1 Schema
-- Multi-tenant: every row is scoped to an academy (tenant)
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- TENANTS (Academies)
-- ============================================================
create table academies (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  slug          text unique not null,           -- subdomain / URL slug
  logo_url      text,
  city          text,
  state         text,
  phone         text,
  email         text unique not null,
  plan          text not null default 'trial'   check (plan in ('trial','starter','pro','enterprise')),
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- USERS & ROLES
-- ============================================================
create table user_profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  academy_id    uuid references academies(id) on delete cascade,
  role          text not null default 'student' check (role in ('super_admin','academy_admin','teacher','student')),
  full_name     text not null,
  phone         text,
  avatar_url    text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- EXAM MASTER
-- ============================================================
create table exam_categories (
  id            uuid primary key default uuid_generate_v4(),
  code          text unique not null,           -- SSC, BANKING, RAILWAY, DEFENCE
  name          text not null,
  description   text,
  icon          text,                           -- emoji or icon name
  is_active     boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

create table exams (
  id              uuid primary key default uuid_generate_v4(),
  category_id     uuid not null references exam_categories(id),
  code            text unique not null,         -- SSC_CGL, SBI_PO, RRB_NTPC etc.
  name            text not null,
  conducting_body text,                         -- SSC, IBPS, RRB etc.
  description     text,
  total_marks     int,
  duration_mins   int,
  negative_marking numeric(3,2) default 0.25,
  tiers           int default 1,               -- number of exam stages/tiers
  eligibility     text,
  official_url    text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

create table exam_patterns (
  id              uuid primary key default uuid_generate_v4(),
  exam_id         uuid not null references exams(id) on delete cascade,
  tier_number     int not null default 1,
  section_name    text not null,
  subject_code    text not null,
  total_questions int not null,
  marks_per_q     numeric(4,2) not null default 1,
  time_mins       int,
  sort_order      int not null default 0
);

-- ============================================================
-- SUBJECT & TOPIC MASTER
-- ============================================================
create table subjects (
  id            uuid primary key default uuid_generate_v4(),
  code          text unique not null,           -- MATHS, REASONING, ENGLISH, GK etc.
  name          text not null,
  description   text,
  color         text,                           -- hex for UI
  icon          text,
  is_shared     boolean not null default false, -- appears in multiple exams
  sort_order    int not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Links exams to subjects (many-to-many)
create table exam_subjects (
  exam_id         uuid not null references exams(id) on delete cascade,
  subject_id      uuid not null references subjects(id) on delete cascade,
  weightage_pct   numeric(5,2),                 -- % of paper this subject holds
  primary key (exam_id, subject_id)
);

create table chapters (
  id            uuid primary key default uuid_generate_v4(),
  subject_id    uuid not null references subjects(id) on delete cascade,
  name          text not null,
  description   text,
  sort_order    int not null default 0,
  is_active     boolean not null default true
);

create table topics (
  id            uuid primary key default uuid_generate_v4(),
  chapter_id    uuid not null references chapters(id) on delete cascade,
  name          text not null,
  description   text,
  difficulty    text default 'medium' check (difficulty in ('easy','medium','hard')),
  expected_time_mins int default 2,
  sort_order    int not null default 0,
  is_active     boolean not null default true
);

-- ============================================================
-- TEACHER MASTER
-- ============================================================
create table teachers (
  id              uuid primary key default uuid_generate_v4(),
  academy_id      uuid not null references academies(id) on delete cascade,
  user_id         uuid references user_profiles(id),
  name            text not null,
  email           text not null,
  phone           text,
  bio             text,
  photo_url       text,
  experience_yrs  int default 0,
  rating          numeric(3,2) default 0,
  whatsapp_number text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table teacher_subjects (
  teacher_id    uuid not null references teachers(id) on delete cascade,
  subject_id    uuid not null references subjects(id) on delete cascade,
  is_primary    boolean not null default false,
  primary key (teacher_id, subject_id)
);

-- ============================================================
-- QUESTION BANK MASTER
-- ============================================================
create table questions (
  id              uuid primary key default uuid_generate_v4(),
  academy_id      uuid references academies(id),   -- null = global question
  topic_id        uuid not null references topics(id),
  question_text   text not null,
  question_html   text,                             -- rich formatted version
  question_type   text not null default 'mcq'
                    check (question_type in ('mcq','true_false','integer','descriptive')),
  difficulty      text not null default 'medium'
                    check (difficulty in ('easy','medium','hard')),
  is_pyq          boolean not null default false,   -- previous year question
  pyq_year        int,
  pyq_exam_code   text,
  solution_text   text,
  solution_html   text,
  solution_video_url text,
  time_limit_secs int default 90,
  marks           numeric(4,2) default 1,
  tags            text[],
  source          text,
  created_by      uuid references user_profiles(id),
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table question_options (
  id              uuid primary key default uuid_generate_v4(),
  question_id     uuid not null references questions(id) on delete cascade,
  option_text     text not null,
  option_html     text,
  is_correct      boolean not null default false,
  sort_order      int not null default 0
);

-- Links questions to exams (a question can appear in multiple exams)
create table question_exam_tags (
  question_id   uuid not null references questions(id) on delete cascade,
  exam_id       uuid not null references exams(id) on delete cascade,
  primary key (question_id, exam_id)
);

-- ============================================================
-- EVENT MASTER
-- ============================================================
create table events (
  id              uuid primary key default uuid_generate_v4(),
  academy_id      uuid not null references academies(id) on delete cascade,
  title           text not null,
  description     text,
  event_type      text not null default 'class'
                    check (event_type in ('class','mock_test','revision','doubt_session','announcement','exam_alert')),
  starts_at       timestamptz not null,
  ends_at         timestamptz,
  is_online       boolean not null default true,
  meeting_url     text,
  whatsapp_group_id text,                         -- WA group to notify
  notify_whatsapp boolean not null default false,
  exam_id         uuid references exams(id),
  subject_id      uuid references subjects(id),
  teacher_id      uuid references teachers(id),
  max_students    int,
  created_by      uuid references user_profiles(id),
  status          text not null default 'scheduled'
                    check (status in ('scheduled','live','completed','cancelled')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- BATCHES (groups of students at an academy)
-- ============================================================
create table batches (
  id              uuid primary key default uuid_generate_v4(),
  academy_id      uuid not null references academies(id) on delete cascade,
  name            text not null,
  description     text,
  exam_id         uuid references exams(id),
  teacher_id      uuid references teachers(id),
  starts_on       date,
  ends_on         date,
  whatsapp_group_link text,
  max_students    int,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

create table batch_students (
  batch_id      uuid not null references batches(id) on delete cascade,
  student_id    uuid not null references user_profiles(id) on delete cascade,
  joined_at     timestamptz not null default now(),
  primary key (batch_id, student_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table academies          enable row level security;
alter table user_profiles      enable row level security;
alter table teachers           enable row level security;
alter table events             enable row level security;
alter table batches            enable row level security;
alter table batch_students     enable row level security;
alter table questions          enable row level security;

-- Global masters are readable by all authenticated users
create policy "Global masters readable" on exam_categories for select using (true);
create policy "Global exams readable"   on exams           for select using (true);
create policy "Global exam patterns"    on exam_patterns   for select using (true);
create policy "Global subjects readable" on subjects        for select using (true);
create policy "Global chapters readable" on chapters        for select using (true);
create policy "Global topics readable"   on topics          for select using (true);
create policy "Global options readable"  on question_options for select using (true);
create policy "Global exam subjects"     on exam_subjects   for select using (true);
create policy "Global q exam tags"       on question_exam_tags for select using (true);
create policy "Global teacher subjects"  on teacher_subjects for select using (true);

-- Academy-scoped tables: users can only see their own academy's data
create policy "Academy own data" on academies for all
  using (id = (select academy_id from user_profiles where id = auth.uid()));

create policy "Own profile" on user_profiles for all
  using (id = auth.uid() or academy_id = (select academy_id from user_profiles where id = auth.uid()));

create policy "Academy teachers" on teachers for all
  using (academy_id = (select academy_id from user_profiles where id = auth.uid()));

create policy "Academy events" on events for all
  using (academy_id = (select academy_id from user_profiles where id = auth.uid()));

create policy "Academy batches" on batches for all
  using (academy_id = (select academy_id from user_profiles where id = auth.uid()));

create policy "Questions scope" on questions for select
  using (academy_id is null or academy_id = (select academy_id from user_profiles where id = auth.uid()));

-- ============================================================
-- INDEXES for performance
-- ============================================================
create index on user_profiles (academy_id);
create index on exams (category_id);
create index on chapters (subject_id);
create index on topics (chapter_id);
create index on questions (topic_id);
create index on questions (is_pyq);
create index on questions (difficulty);
create index on events (academy_id, starts_at);
create index on batches (academy_id);
create index on teachers (academy_id);

-- ============================================================
-- UPDATED_AT trigger
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger t_academies    before update on academies    for each row execute function set_updated_at();
create trigger t_user_profiles before update on user_profiles for each row execute function set_updated_at();
create trigger t_teachers     before update on teachers     for each row execute function set_updated_at();
create trigger t_questions    before update on questions    for each row execute function set_updated_at();
create trigger t_events       before update on events       for each row execute function set_updated_at();
