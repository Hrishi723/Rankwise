-- ============================================================
-- RANKWISE — Seed Data (Phase 1)
-- Run after 001_schema.sql
-- ============================================================

-- ============================================================
-- EXAM CATEGORIES
-- ============================================================
insert into exam_categories (code, name, description, icon, sort_order) values
  ('SSC',     'SSC',     'Staff Selection Commission',           '📋', 1),
  ('BANKING', 'Banking', 'IBPS, SBI, RBI and other bank exams', '🏦', 2),
  ('RAILWAY', 'Railway', 'RRB NTPC, Group D, ALP and more',     '🚂', 3),
  ('DEFENCE', 'Defence', 'NDA, CDS, AFCAT, Agniveer',           '🎖️', 4);

-- ============================================================
-- EXAMS
-- ============================================================
insert into exams (category_id, code, name, conducting_body, total_marks, duration_mins, negative_marking, tiers) values
  -- SSC
  ((select id from exam_categories where code='SSC'), 'SSC_CGL',  'SSC Combined Graduate Level',       'SSC',  200, 60,  0.50, 4),
  ((select id from exam_categories where code='SSC'), 'SSC_CHSL', 'SSC Combined Higher Secondary Level','SSC',  200, 60,  0.50, 3),
  ((select id from exam_categories where code='SSC'), 'SSC_MTS',  'SSC Multi Tasking Staff',            'SSC',  150, 90,  0.25, 2),
  ((select id from exam_categories where code='SSC'), 'SSC_GD',   'SSC GD Constable',                   'SSC',  160, 60,  0.25, 1),
  -- Banking
  ((select id from exam_categories where code='BANKING'), 'SBI_PO',    'SBI Probationary Officer',        'SBI',  250, 60,  0.25, 3),
  ((select id from exam_categories where code='BANKING'), 'SBI_CLERK', 'SBI Clerk (Junior Associate)',    'SBI',  200, 60,  0.25, 2),
  ((select id from exam_categories where code='BANKING'), 'IBPS_PO',   'IBPS Probationary Officer',       'IBPS', 250, 60,  0.25, 3),
  ((select id from exam_categories where code='BANKING'), 'IBPS_CLERK','IBPS Clerk',                      'IBPS', 200, 60,  0.25, 2),
  ((select id from exam_categories where code='BANKING'), 'RBI_GRADE_B','RBI Grade B Officer',            'RBI',  300, 120, 0.25, 3),
  -- Railway
  ((select id from exam_categories where code='RAILWAY'), 'RRB_NTPC',   'RRB Non-Technical Popular Categories','RRB', 150, 90, 0.33, 2),
  ((select id from exam_categories where code='RAILWAY'), 'RRB_GROUP_D','RRB Group D',                         'RRB', 100, 90, 0.33, 1),
  ((select id from exam_categories where code='RAILWAY'), 'RRB_ALP',    'RRB Assistant Loco Pilot',            'RRB', 150, 60, 0.33, 3),
  -- Defence
  ((select id from exam_categories where code='DEFENCE'), 'NDA',      'National Defence Academy',        'UPSC', 900, 150, 0.33, 2),
  ((select id from exam_categories where code='DEFENCE'), 'CDS',      'Combined Defence Services',       'UPSC', 300, 120, 0.33, 2),
  ((select id from exam_categories where code='DEFENCE'), 'AFCAT',    'Air Force Common Admission Test', 'IAF',  300, 120, 0.33, 2),
  ((select id from exam_categories where code='DEFENCE'), 'AGNIVEER', 'Agniveer (Army/Navy/Air Force)',   'MOD',  200, 60,  0.25, 1);

-- ============================================================
-- EXAM PATTERNS (key exams)
-- ============================================================
-- SSC CGL Tier 1
insert into exam_patterns (exam_id, tier_number, section_name, subject_code, total_questions, marks_per_q, time_mins, sort_order)
select id, 1, 'General Intelligence & Reasoning', 'REASONING', 25, 2, null, 1 from exams where code='SSC_CGL' union all
select id, 1, 'General Awareness',                'GK',         25, 2, null, 2 from exams where code='SSC_CGL' union all
select id, 1, 'Quantitative Aptitude',            'MATHS',      25, 2, null, 3 from exams where code='SSC_CGL' union all
select id, 1, 'English Comprehension',            'ENGLISH',    25, 2, null, 4 from exams where code='SSC_CGL';

-- IBPS PO Prelims
insert into exam_patterns (exam_id, tier_number, section_name, subject_code, total_questions, marks_per_q, time_mins, sort_order)
select id, 1, 'English Language',       'ENGLISH',   30, 1, 20, 1 from exams where code='IBPS_PO' union all
select id, 1, 'Quantitative Aptitude',  'MATHS',     35, 1, 20, 2 from exams where code='IBPS_PO' union all
select id, 1, 'Reasoning Ability',      'REASONING', 35, 1, 20, 3 from exams where code='IBPS_PO';

-- RRB NTPC CBT 1
insert into exam_patterns (exam_id, tier_number, section_name, subject_code, total_questions, marks_per_q, time_mins, sort_order)
select id, 1, 'Mathematics',            'MATHS',     30, 1, null, 1 from exams where code='RRB_NTPC' union all
select id, 1, 'General Intelligence',   'REASONING', 30, 1, null, 2 from exams where code='RRB_NTPC' union all
select id, 1, 'General Awareness',      'GK',        40, 1, null, 3 from exams where code='RRB_NTPC';

-- NDA Paper
insert into exam_patterns (exam_id, tier_number, section_name, subject_code, total_questions, marks_per_q, time_mins, sort_order)
select id, 1, 'Mathematics',            'MATHS',    120, 2.5, 150, 1 from exams where code='NDA' union all
select id, 1, 'General Ability Test',   'GK',       150, 4,   150, 2 from exams where code='NDA';

-- ============================================================
-- SUBJECTS
-- ============================================================
insert into subjects (code, name, description, color, is_shared, sort_order) values
  ('MATHS',     'Quantitative Aptitude', 'Arithmetic, Algebra, Geometry, Mensuration, Data Interpretation', '#3B82F6', true,  1),
  ('REASONING', 'Reasoning',             'Verbal, Non-Verbal, Logical, Analytical Reasoning',               '#8B5CF6', true,  2),
  ('ENGLISH',   'English Language',      'Grammar, Vocabulary, Comprehension, Error Detection',             '#10B981', false, 3),
  ('GK',        'General Awareness',     'Current Affairs, History, Polity, Geography, Science, Economy',   '#F59E0B', true,  4),
  ('HINDI',     'Hindi Language',        'Hindi Grammar, Comprehension, Translation',                       '#EF4444', false, 5),
  ('COMPUTER',  'Computer Awareness',    'Basics, MS Office, Internet, Networking, DBMS',                   '#6366F1', false, 6),
  ('BANKING',   'Banking & Economy',     'RBI Policy, Financial Markets, Banking Awareness, Economy',       '#14B8A6', false, 7),
  ('SCIENCE',   'General Science',       'Physics, Chemistry, Biology — class 10+2 level',                  '#84CC16', false, 8),
  ('MATHS_ADV', 'Advanced Mathematics',  'Calculus, Statistics, Matrices, Vectors (NDA/CDS level)',         '#F97316', false, 9),
  ('DESCRIPTIVE','Descriptive Writing',  'Essay, Letter, Precis Writing',                                   '#A78BFA', false, 10);

-- ============================================================
-- EXAM ↔ SUBJECT LINKS
-- ============================================================
-- SSC CGL
insert into exam_subjects (exam_id, subject_id, weightage_pct)
select e.id, s.id,
  case s.code when 'MATHS' then 25 when 'REASONING' then 25 when 'ENGLISH' then 25 when 'GK' then 25 end
from exams e, subjects s
where e.code='SSC_CGL' and s.code in ('MATHS','REASONING','ENGLISH','GK');

-- SSC CHSL
insert into exam_subjects (exam_id, subject_id, weightage_pct)
select e.id, s.id, 25 from exams e, subjects s
where e.code='SSC_CHSL' and s.code in ('MATHS','REASONING','ENGLISH','GK');

-- IBPS PO / SBI PO / IBPS CLERK / SBI CLERK
insert into exam_subjects (exam_id, subject_id, weightage_pct)
select e.id, s.id, null from exams e, subjects s
where e.code in ('IBPS_PO','SBI_PO','IBPS_CLERK','SBI_CLERK')
  and s.code in ('MATHS','REASONING','ENGLISH','GK','COMPUTER','BANKING','DESCRIPTIVE');

-- RBI Grade B
insert into exam_subjects (exam_id, subject_id, weightage_pct)
select e.id, s.id, null from exams e, subjects s
where e.code='RBI_GRADE_B' and s.code in ('MATHS','REASONING','ENGLISH','GK','BANKING','DESCRIPTIVE');

-- RRB NTPC / Group D
insert into exam_subjects (exam_id, subject_id, weightage_pct)
select e.id, s.id, null from exams e, subjects s
where e.code in ('RRB_NTPC','RRB_GROUP_D') and s.code in ('MATHS','REASONING','GK','SCIENCE','HINDI');

-- RRB ALP
insert into exam_subjects (exam_id, subject_id, weightage_pct)
select e.id, s.id, null from exams e, subjects s
where e.code='RRB_ALP' and s.code in ('MATHS','REASONING','GK','SCIENCE');

-- NDA
insert into exam_subjects (exam_id, subject_id, weightage_pct)
select e.id, s.id, case s.code when 'MATHS_ADV' then 33 else 67 end from exams e, subjects s
where e.code='NDA' and s.code in ('MATHS_ADV','GK','ENGLISH','SCIENCE');

-- CDS / AFCAT
insert into exam_subjects (exam_id, subject_id, weightage_pct)
select e.id, s.id, null from exams e, subjects s
where e.code in ('CDS','AFCAT') and s.code in ('MATHS','GK','ENGLISH','REASONING','DESCRIPTIVE');

-- Agniveer
insert into exam_subjects (exam_id, subject_id, weightage_pct)
select e.id, s.id, null from exams e, subjects s
where e.code='AGNIVEER' and s.code in ('MATHS','REASONING','GK','SCIENCE','ENGLISH');

-- ============================================================
-- CHAPTERS & TOPICS (Maths — full syllabus)
-- ============================================================
insert into chapters (subject_id, name, sort_order)
select id, ch, row_number() over() from subjects, (values
  ('Number System'),('Simplification'),('Percentage'),('Profit & Loss'),
  ('Simple & Compound Interest'),('Ratio & Proportion'),('Time & Work'),
  ('Time, Speed & Distance'),('Averages'),('Mixtures & Alligations'),
  ('Algebra'),('Geometry'),('Mensuration'),('Trigonometry'),('Data Interpretation'),
  ('Statistics'),('Sequence & Series'),('Permutation & Combination'),('Probability')
) as t(ch) where subjects.code='MATHS';

-- Reasoning chapters
insert into chapters (subject_id, name, sort_order)
select id, ch, row_number() over() from subjects, (values
  ('Analogy'),('Classification'),('Series'),('Coding-Decoding'),
  ('Blood Relations'),('Direction & Distance'),('Order & Ranking'),
  ('Seating Arrangement'),('Puzzle'),('Syllogism'),
  ('Statement & Conclusion'),('Input-Output'),('Data Sufficiency'),
  ('Non-Verbal Reasoning'),('Mathematical Operations')
) as t(ch) where subjects.code='REASONING';

-- GK chapters
insert into chapters (subject_id, name, sort_order)
select id, ch, row_number() over() from subjects, (values
  ('Current Affairs'),('Indian History'),('Indian Polity & Constitution'),
  ('Indian Geography'),('World Geography'),('Indian Economy'),
  ('Science & Technology'),('Biology'),('Physics'),('Chemistry'),
  ('Sports'),('Books & Authors'),('Awards & Honours'),
  ('Important Days'),('Government Schemes')
) as t(ch) where subjects.code='GK';

-- English chapters
insert into chapters (subject_id, name, sort_order)
select id, ch, row_number() over() from subjects, (values
  ('Reading Comprehension'),('Grammar'),('Vocabulary'),
  ('Error Detection'),('Fill in the Blanks'),('Sentence Rearrangement'),
  ('Cloze Test'),('Para Jumbles'),('Idioms & Phrases'),('Synonyms & Antonyms')
) as t(ch) where subjects.code='ENGLISH';

-- ============================================================
-- TOPICS for Percentage chapter (sample)
-- ============================================================
insert into topics (chapter_id, name, difficulty, expected_time_mins, sort_order)
select c.id, t.name, t.diff, t.mins, t.ord
from chapters c, (values
  ('Basic percentage concepts',                  'easy',   1, 1),
  ('Percentage increase and decrease',           'easy',   2, 2),
  ('Successive percentage change',               'medium', 2, 3),
  ('Percentage and fractions conversion',        'easy',   1, 4),
  ('Percentage applied to profit and loss',      'medium', 3, 5),
  ('Population growth and depreciation',         'medium', 3, 6),
  ('Data interpretation using percentages',      'hard',   4, 7)
) as t(name, diff, mins, ord)
where c.name = 'Percentage';

-- Topics for Number System
insert into topics (chapter_id, name, difficulty, expected_time_mins, sort_order)
select c.id, t.name, t.diff, t.mins, t.ord
from chapters c, (values
  ('Types of numbers',                     'easy',   1, 1),
  ('Divisibility rules',                   'easy',   2, 2),
  ('HCF and LCM',                          'medium', 3, 3),
  ('Unit digit problems',                  'medium', 2, 4),
  ('Remainder theorem',                    'hard',   4, 5),
  ('Number series patterns',               'medium', 3, 6)
) as t(name, diff, mins, ord)
where c.name = 'Number System';

-- Topics for Ratio & Proportion
insert into topics (chapter_id, name, difficulty, expected_time_mins, sort_order)
select c.id, t.name, t.diff, t.mins, t.ord
from chapters c, (values
  ('Basic ratio concepts',                 'easy',   1, 1),
  ('Compounded ratio',                     'medium', 2, 2),
  ('Proportion types',                     'medium', 2, 3),
  ('Partnership problems',                 'medium', 3, 4),
  ('Dividing amounts in ratio',            'easy',   2, 5)
) as t(name, diff, mins, ord)
where c.name = 'Ratio & Proportion';

-- ============================================================
-- SAMPLE QUESTIONS (Percentage chapter)
-- ============================================================
with topic_id as (select id from topics where name='Basic percentage concepts' limit 1)
insert into questions (topic_id, question_text, question_type, difficulty, is_pyq, pyq_year, pyq_exam_code, solution_text, marks)
values
  ((select id from topic_id), 'What is 15% of 240?', 'mcq', 'easy', true, 2022, 'SSC_CGL',
   'Solution: 15% of 240 = (15/100) × 240 = 36', 1),
  ((select id from topic_id), 'If 35% of a number is 84, what is the number?', 'mcq', 'easy', false, null, null,
   'Solution: Number = 84 × (100/35) = 240', 1),
  ((select id from topic_id), 'A student scored 540 out of 750. What percentage did she score?', 'mcq', 'easy', true, 2023, 'RRB_NTPC',
   'Solution: Percentage = (540/750) × 100 = 72%', 1);

-- Add options for first question
with q as (select id from questions where question_text='What is 15% of 240?' limit 1)
insert into question_options (question_id, option_text, is_correct, sort_order) values
  ((select id from q), '32', false, 1),
  ((select id from q), '36', true,  2),
  ((select id from q), '38', false, 3),
  ((select id from q), '42', false, 4);

with q as (select id from questions where question_text='If 35% of a number is 84, what is the number?' limit 1)
insert into question_options (question_id, option_text, is_correct, sort_order) values
  ((select id from q), '220', false, 1),
  ((select id from q), '240', true,  2),
  ((select id from q), '260', false, 3),
  ((select id from q), '280', false, 4);

with q as (select id from questions where question_text like 'A student scored 540%' limit 1)
insert into question_options (question_id, option_text, is_correct, sort_order) values
  ((select id from q), '68%', false, 1),
  ((select id from q), '70%', false, 2),
  ((select id from q), '72%', true,  3),
  ((select id from q), '75%', false, 4);
