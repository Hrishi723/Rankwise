-- RANKWISE Phase 3 Schema - run after 002_seed.sql

create extension if not exists "uuid-ossp";

create table if not exists student_exams (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references user_profiles(id) on delete cascade,
  exam_id uuid not null references exams(id) on delete cascade,
  target_date date,
  is_primary boolean not null default false,
  enrolled_at timestamptz not null default now(),
  unique (student_id, exam_id)
);

create table if not exists student_onboarding (
  student_id uuid primary key references user_profiles(id) on delete cascade,
  exams_selected boolean not null default false,
  timeframe_set boolean not null default false,
  profile_complete boolean not null default false,
  completed_at timestamptz
);

create table if not exists practice_sessions (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references user_profiles(id) on delete cascade,
  topic_id uuid not null references topics(id),
  exam_id uuid references exams(id),
  mode text not null default 'practice' check (mode in ('practice','timed','flashcard')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  total_questions int not null default 0,
  attempted int not null default 0,
  correct int not null default 0,
  time_taken_secs int,
  score_pct numeric(5,2)
);

create table if not exists practice_answers (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references practice_sessions(id) on delete cascade,
  question_id uuid not null references questions(id),
  selected_option_id uuid references question_options(id),
  is_correct boolean,
  is_skipped boolean not null default false,
  time_taken_secs int,
  answered_at timestamptz not null default now()
);

create table if not exists topic_mastery (
  student_id uuid not null references user_profiles(id) on delete cascade,
  topic_id uuid not null references topics(id) on delete cascade,
  sessions_done int not null default 0,
  total_attempted int not null default 0,
  total_correct int not null default 0,
  accuracy_pct numeric(5,2) not null default 0,
  last_practiced timestamptz,
  mastery_level text not null default 'not_started' check (mastery_level in ('not_started','weak','developing','strong','mastered')),
  updated_at timestamptz not null default now(),
  primary key (student_id, topic_id)
);

create table if not exists study_plan_tasks (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references user_profiles(id) on delete cascade,
  topic_id uuid not null references topics(id),
  scheduled_date date not null,
  task_type text not null default 'practice' check (task_type in ('practice','revision','new_topic')),
  target_questions int not null default 10,
  is_done boolean not null default false,
  done_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists bookmarks (
  student_id uuid not null references user_profiles(id) on delete cascade,
  question_id uuid not null references questions(id) on delete cascade,
  note text,
  created_at timestamptz not null default now(),
  primary key (student_id, question_id)
);

alter table student_exams enable row level security;
alter table student_onboarding enable row level security;
alter table practice_sessions enable row level security;
alter table practice_answers enable row level security;
alter table topic_mastery enable row level security;
alter table study_plan_tasks enable row level security;
alter table bookmarks enable row level security;

create policy "Own student_exams" on student_exams for all using (student_id = auth.uid());
create policy "Own onboarding" on student_onboarding for all using (student_id = auth.uid());
create policy "Own sessions" on practice_sessions for all using (student_id = auth.uid());
create policy "Own answers" on practice_answers for all using (session_id in (select id from practice_sessions where student_id = auth.uid()));
create policy "Own mastery" on topic_mastery for all using (student_id = auth.uid());
create policy "Own study plan" on study_plan_tasks for all using (student_id = auth.uid());
create policy "Own bookmarks" on bookmarks for all using (student_id = auth.uid());

create index if not exists idx_student_exams_student on student_exams(student_id);
create index if not exists idx_sessions_student on practice_sessions(student_id, started_at desc);
create index if not exists idx_mastery_student on topic_mastery(student_id, accuracy_pct desc);
create index if not exists idx_plan_student_date on study_plan_tasks(student_id, scheduled_date);
