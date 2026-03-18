# Rankwise — Academy ERP

> The operating system for exam preparation academies.
> Multi-tenant SaaS · SSC · Banking · Railway · Defence · AI-powered

---

## What is Rankwise?

Rankwise is a full-stack SaaS platform sold to coaching academies. Each academy gets a white-labelled ERP to manage exams, subjects, teachers, question banks, events, and student progress — all in one place.

Students get a separate app with practice sessions, a mastery tracker, and a Visual Maths Solver powered by Claude AI that explains any problem step-by-step with animated visuals.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Database + Auth | Supabase (Postgres + Row Level Security) |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| AI | Anthropic Claude API (Visual Solver) |
| Deployment | Vercel (recommended) |

---

## Project structure

```
rankwise/
├── app/
│   ├── (auth)/                    # Login + 3-step academy signup
│   ├── (dashboard)/               # Admin ERP (academy staff)
│   │   ├── overview/              # Dashboard home
│   │   └── admin/
│   │       ├── exams/             # Exam master — 16 exams, 4 categories
│   │       ├── subjects/          # Subject master — shared subject linking
│   │       ├── teachers/          # Teacher master — profile, WhatsApp, subjects
│   │       ├── questions/         # Question bank — MCQ, PYQ, bulk upload
│   │       └── events/            # Event master — classes, tests, WA notify
│   ├── (student)/                 # Student-facing app (separate layout)
│   │   └── student/
│   │       ├── dashboard/         # Personalised home — plan, weak topics, sessions
│   │       ├── practice/          # Topic browser → MCQ session engine
│   │       ├── practice/[topicId] # Live practice — timer, reveal, bookmark
│   │       ├── solve/             # Visual Maths Solver (AI-powered)
│   │       ├── progress/          # Mastery heatmap + session history
│   │       └── events/            # Upcoming classes, tests, doubt sessions
│   └── api/
│       └── solve/                 # Edge API route → Claude AI solver
├── components/
│   ├── questions/                 # BankStats, QuestionCard, AddForm, BulkUpload, TopicBrowser
│   └── solver/                    # StepCard, VisualRenderers (11 visual types)
├── lib/
│   ├── supabase/                  # Browser + server Supabase clients
│   ├── questions/                 # Question bank service + CSV parser
│   └── student/                   # Student data service
├── supabase/
│   ├── 001_schema.sql             # All tables, RLS, indexes, triggers
│   ├── 002_seed.sql               # 16 exams, 10 subjects, chapters, topics, sample Qs
│   ├── 003_phase2_questions.sql   # Full-text search, stats views, insert policies
│   └── 004_phase3_student.sql     # Student tables: sessions, mastery, study plan
├── types/
│   └── database.ts                # Full TypeScript types for all DB tables
└── middleware.ts                  # Auth session refresh + route protection
```

---

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/your-org/rankwise.git
cd rankwise
npm install
```

### 2. Create Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Copy **Project URL** and **Anon key** from Settings → API

### 3. Set up environment variables

```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 4. Run database migrations

In Supabase Dashboard → SQL Editor, run these files **in order**:

```
supabase/001_schema.sql      # Core schema + RLS
supabase/002_seed.sql        # Exam/subject seed data
supabase/003_phase2_questions.sql   # Question bank indexes + views
supabase/004_phase3_student.sql     # Student activity tables
```

### 5. Start dev server

```bash
npm run dev
# Open http://localhost:3000
```

Sign up as an academy admin at `/signup`, then explore:
- Admin ERP at `/overview`
- Student app at `/student/dashboard`
- Visual Solver at `/student/solve`

---

## Visual Maths Solver (Phase 4)

The solver uses Claude AI to break any aptitude or maths problem into visual, animated steps.

Add your Anthropic API key to `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Without the key** — the solver runs in demo mode with rich pre-built solutions. Fully functional for demos and development.

**With the key** — Claude generates custom step-by-step solutions with automatically chosen visual types (percentage bars, ratio bars, speed-distance diagrams, Venn diagrams, geometry, equation walkthroughs, and more) tailored to each problem.

---

## Database schema overview

```
academies              → tenants (one per coaching institute)
user_profiles          → all users: super_admin | academy_admin | teacher | student
exam_categories        → SSC, BANKING, RAILWAY, DEFENCE
exams                  → 16 exams with marks/duration/tiers/negative marking
exam_patterns          → section-wise paper structure per exam tier
subjects               → 10 subjects with shared-subject flag
exam_subjects          → many-to-many exam ↔ subject with weightage %
chapters               → grouped under subjects
topics                 → leaf nodes with difficulty + expected time
teachers               → faculty with WhatsApp, subject assignments, ratings
questions              → MCQ/descriptive, PYQ-tagged, solution text + video
question_options       → answer options (4 per MCQ)
question_exam_tags     → question appears in multiple exams
events                 → class/test/doubt/announcement with WA notify flag
batches                → student groups per exam
batch_students         → enrollment
student_exams          → which exams a student is preparing for
practice_sessions      → one topic session with score/time
practice_answers       → per-question responses
topic_mastery          → aggregated accuracy: not_started→weak→developing→strong→mastered
study_plan_tasks       → daily auto-generated study tasks
bookmarks              → student bookmarks a question
```

All tables use Row Level Security — each academy's data is completely isolated.

---

## Phase roadmap

| Phase | Feature | Status |
|---|---|---|
| 1 | Foundation + Masters (exams, subjects, teachers, questions, events) | ✅ Done |
| 2 | Question bank engine (bulk upload, FTS, filters, CSV import) | ✅ Done |
| 3 | Student app (onboarding, practice engine, mastery tracker) | ✅ Done |
| 4 | Visual Maths Solver (Claude AI + 11 visual types) | ✅ Done |
| 5 | Doubt system + WhatsApp Business API | 🔜 Next |
| 6 | Current affairs engine (auto MCQ from news) | ⏳ |
| 7 | Mock tests + full analytics + percentile | ⏳ |

---

## Deploy to Vercel

```bash
npx vercel

# Set these environment variables in Vercel dashboard:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY
# ANTHROPIC_API_KEY
```

---

## Selling to academies

Rankwise is sold as a **white-label SaaS** to coaching institutes. Each academy gets:
- Isolated tenant (data separation via RLS)
- Choose which exam categories they teach
- Manage their own teachers, batches, and students
- Access to the global question bank + their private questions
- AI-powered Visual Solver as a premium differentiator

---

## License

Private — all rights reserved.
