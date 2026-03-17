-- ============================================================
-- RANKWISE — Phase 2 Schema additions
-- Question bank engine: FTS, stats, bulk upload tracking
-- Run after 001_schema.sql
-- ============================================================

-- Full-text search index on questions
alter table questions
  add column if not exists search_vector tsvector
    generated always as (
      to_tsvector('english',
        coalesce(question_text, '') || ' ' ||
        coalesce(solution_text, '') || ' ' ||
        coalesce(array_to_string(tags, ' '), '')
      )
    ) stored;

create index if not exists questions_fts_idx on questions using gin(search_vector);

-- Composite indexes for common filter patterns
create index if not exists questions_difficulty_topic on questions(difficulty, topic_id) where is_active = true;
create index if not exists questions_pyq on questions(pyq_year, pyq_exam_code) where is_pyq = true;
create index if not exists questions_type on questions(question_type) where is_active = true;

-- ============================================================
-- BULK UPLOAD JOBS — track CSV import status
-- ============================================================
create table if not exists bulk_upload_jobs (
  id            uuid primary key default uuid_generate_v4(),
  academy_id    uuid not null references academies(id) on delete cascade,
  uploaded_by   uuid references user_profiles(id),
  filename      text not null,
  total_rows    int not null default 0,
  success_count int not null default 0,
  error_count   int not null default 0,
  status        text not null default 'pending'
                  check (status in ('pending','processing','done','failed')),
  errors        jsonb,                          -- [{row: N, message: "..."}]
  created_at    timestamptz not null default now(),
  completed_at  timestamptz
);

alter table bulk_upload_jobs enable row level security;
create policy "Academy upload jobs" on bulk_upload_jobs for all
  using (academy_id = (select academy_id from user_profiles where id = auth.uid()));

-- ============================================================
-- QUESTION STATS VIEW  (per topic summary)
-- ============================================================
create or replace view question_topic_stats as
select
  t.id                                            as topic_id,
  t.name                                          as topic_name,
  c.name                                          as chapter_name,
  s.name                                          as subject_name,
  s.code                                          as subject_code,
  s.color                                         as subject_color,
  count(q.id)                                     as total_questions,
  count(q.id) filter (where q.difficulty='easy')  as easy_count,
  count(q.id) filter (where q.difficulty='medium')as medium_count,
  count(q.id) filter (where q.difficulty='hard')  as hard_count,
  count(q.id) filter (where q.is_pyq=true)        as pyq_count,
  count(q.id) filter (where q.question_type='mcq')as mcq_count
from topics t
join chapters c on c.id = t.chapter_id
join subjects s on s.id = c.subject_id
left join questions q on q.topic_id = t.id and q.is_active = true
group by t.id, t.name, c.name, s.name, s.code, s.color;

-- ============================================================
-- QUESTION BANK SUMMARY VIEW (global stats)
-- ============================================================
create or replace view question_bank_summary as
select
  count(*)                                              as total,
  count(*) filter (where difficulty='easy')             as easy,
  count(*) filter (where difficulty='medium')           as medium,
  count(*) filter (where difficulty='hard')             as hard,
  count(*) filter (where is_pyq=true)                   as pyq,
  count(*) filter (where question_type='mcq')           as mcq,
  count(*) filter (where question_type='descriptive')   as descriptive,
  count(*) filter (where question_type='integer')       as integer_type,
  count(distinct topic_id)                              as topics_covered
from questions
where is_active = true;

-- ============================================================
-- INSERT policy for questions (admins/teachers can add)
-- ============================================================
drop policy if exists "Questions scope" on questions;

create policy "Questions select" on questions for select
  using (academy_id is null
    or academy_id = (select academy_id from user_profiles where id = auth.uid()));

create policy "Questions insert" on questions for insert
  with check (
    academy_id = (select academy_id from user_profiles where id = auth.uid())
    and (select role from user_profiles where id = auth.uid()) in ('academy_admin','teacher','super_admin')
  );

create policy "Questions update" on questions for update
  using (
    academy_id = (select academy_id from user_profiles where id = auth.uid())
    and (select role from user_profiles where id = auth.uid()) in ('academy_admin','teacher','super_admin')
  );

create policy "Questions delete" on questions for delete
  using (
    academy_id = (select academy_id from user_profiles where id = auth.uid())
    and (select role from user_profiles where id = auth.uid()) in ('academy_admin','super_admin')
  );

-- Same for options
create policy "Options insert" on question_options for insert
  with check (
    exists (
      select 1 from questions q
      where q.id = question_id
      and (q.academy_id is null or q.academy_id = (select academy_id from user_profiles where id = auth.uid()))
    )
  );

create policy "Options update" on question_options for update
  using (
    exists (
      select 1 from questions q
      where q.id = question_id
      and q.academy_id = (select academy_id from user_profiles where id = auth.uid())
    )
  );

create policy "Options delete" on question_options for delete
  using (
    exists (
      select 1 from questions q
      where q.id = question_id
      and q.academy_id = (select academy_id from user_profiles where id = auth.uid())
    )
  );
