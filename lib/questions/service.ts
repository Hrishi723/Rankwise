import { createClient } from '@/lib/supabase/client'

export type Difficulty = 'easy' | 'medium' | 'hard'
export type QuestionType = 'mcq' | 'true_false' | 'integer' | 'descriptive'

export interface QuestionFilters {
  search?:      string
  subject_id?:  string
  topic_id?:    string
  chapter_id?:  string
  difficulty?:  Difficulty | ''
  type?:        QuestionType | ''
  is_pyq?:      boolean | null
  exam_id?:     string
  page?:        number
  per_page?:    number
}

export interface QuestionWithMeta {
  id: string
  question_text: string
  question_type: QuestionType
  difficulty: Difficulty
  is_pyq: boolean
  pyq_year: number | null
  pyq_exam_code: string | null
  solution_text: string | null
  solution_video_url: string | null
  marks: number
  time_limit_secs: number
  tags: string[] | null
  topic_id: string
  is_active: boolean
  created_at: string
  // joined
  topic_name: string
  chapter_name: string
  subject_name: string
  subject_code: string
  subject_color: string | null
  options: { id: string; option_text: string; is_correct: boolean; sort_order: number }[]
}

export interface AddQuestionPayload {
  question_text: string
  question_type: QuestionType
  difficulty: Difficulty
  topic_id: string
  is_pyq: boolean
  pyq_year?: number | null
  pyq_exam_code?: string | null
  solution_text?: string
  solution_video_url?: string
  marks?: number
  time_limit_secs?: number
  tags?: string[]
  options: { option_text: string; is_correct: boolean }[]
  exam_ids?: string[]
}

// ── Fetch questions with filters ──────────────────────────────
export async function fetchQuestions(filters: QuestionFilters = {}) {
  const supabase = createClient()
  const { page = 1, per_page = 20 } = filters
  const from = (page - 1) * per_page
  const to = from + per_page - 1

  let query = supabase
    .from('questions')
    .select(`
      id, question_text, question_type, difficulty, is_pyq,
      pyq_year, pyq_exam_code, solution_text, solution_video_url,
      marks, time_limit_secs, tags, topic_id, is_active, created_at,
      topics!inner (
        id, name,
        chapters!inner (
          id, name,
          subjects!inner ( id, name, code, color )
        )
      ),
      question_options ( id, option_text, is_correct, sort_order )
    `, { count: 'exact' })
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filters.search) {
    query = query.textSearch('search_vector', filters.search, { type: 'websearch' })
  }
  if (filters.difficulty) query = query.eq('difficulty', filters.difficulty)
  if (filters.type)       query = query.eq('question_type', filters.type)
  if (filters.is_pyq === true)  query = query.eq('is_pyq', true)
  if (filters.is_pyq === false) query = query.eq('is_pyq', false)
  if (filters.topic_id)   query = query.eq('topic_id', filters.topic_id)

  const { data, error, count } = await query
  if (error) throw error

  // flatten joins
  const questions: QuestionWithMeta[] = (data || []).map((q: any) => ({
    ...q,
    topic_name:    q.topics?.name ?? '',
    chapter_name:  q.topics?.chapters?.name ?? '',
    subject_name:  q.topics?.chapters?.subjects?.name ?? '',
    subject_code:  q.topics?.chapters?.subjects?.code ?? '',
    subject_color: q.topics?.chapters?.subjects?.color ?? null,
    options:       (q.question_options || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
  }))

  return { questions, total: count ?? 0, page, per_page }
}

// ── Fetch single question ────────────────────────────────────
export async function fetchQuestion(id: string): Promise<QuestionWithMeta | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('questions')
    .select(`
      *, topics!inner(name, chapters!inner(name, subjects!inner(name, code, color))),
      question_options(*)
    `)
    .eq('id', id)
    .single()
  if (error) return null
  const q = data as any
  return {
    ...q,
    topic_name:    q.topics?.name ?? '',
    chapter_name:  q.topics?.chapters?.name ?? '',
    subject_name:  q.topics?.chapters?.subjects?.name ?? '',
    subject_code:  q.topics?.chapters?.subjects?.code ?? '',
    subject_color: q.topics?.chapters?.subjects?.color ?? null,
    options:       (q.question_options || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
  }
}

// ── Add question ─────────────────────────────────────────────
export async function addQuestion(payload: AddQuestionPayload) {
  const supabase = createClient()

  const { data: q, error: qErr } = await supabase
    .from('questions')
    .insert({
      question_text:     payload.question_text,
      question_type:     payload.question_type,
      difficulty:        payload.difficulty,
      topic_id:          payload.topic_id,
      is_pyq:            payload.is_pyq,
      pyq_year:          payload.pyq_year ?? null,
      pyq_exam_code:     payload.pyq_exam_code ?? null,
      solution_text:     payload.solution_text ?? null,
      solution_video_url:payload.solution_video_url ?? null,
      marks:             payload.marks ?? 1,
      time_limit_secs:   payload.time_limit_secs ?? 90,
      tags:              payload.tags ?? null,
    } as any)
    .select('id')
    .single()

  if (qErr) throw qErr
  const qRecord = q as any

  // insert options
  if (payload.options.length > 0) {
    const { error: optErr } = await supabase
      .from('question_options')
      .insert(
        payload.options.map((o, i) => ({
          question_id:  qRecord.id,
          option_text:  o.option_text,
          is_correct:   o.is_correct,
          sort_order:   i,
        })) as any
      )
    if (optErr) throw optErr
  }

  // tag exams
  if (payload.exam_ids && payload.exam_ids.length > 0) {
    await supabase.from('question_exam_tags').insert(
      payload.exam_ids.map(exam_id => ({ question_id: qRecord.id, exam_id })) as any
    )
  }

  return qRecord.id
}

// ── Delete question ──────────────────────────────────────────
export async function deleteQuestion(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('questions').update({ is_active: false } as never).eq('id', id)
  if (error) throw error
}

// ── Fetch subjects → chapters → topics tree ──────────────────
export async function fetchSubjectTree() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('subjects')
    .select('id, name, code, color, chapters(id, name, topics(id, name, difficulty))')
    .eq('is_active', true)
    .order('sort_order')
  if (error) throw error
  return data || []
}

// ── Fetch exams list ─────────────────────────────────────────
export async function fetchExams() {
  const supabase = createClient()
  const { data } = await supabase
    .from('exams')
    .select('id, code, name, category_id, exam_categories(code, name)')
    .eq('is_active', true)
    .order('name')
  return data || []
}

// ── Bank summary stats ───────────────────────────────────────
export async function fetchBankStats() {
  const supabase = createClient()
  const { data } = await supabase.from('question_bank_summary').select('*').single()
  return data as {
    total: number; easy: number; medium: number; hard: number
    pyq: number; mcq: number; descriptive: number; topics_covered: number
  } | null
}

// ── Topic stats ──────────────────────────────────────────────
export async function fetchTopicStats() {
  const supabase = createClient()
  const { data } = await supabase
    .from('question_topic_stats')
    .select('*')
    .order('total_questions', { ascending: false })
  return data || []
}
