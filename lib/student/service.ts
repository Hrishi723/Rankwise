import { createClient } from '@/lib/supabase/client'

export interface StudentExam {
  id: string
  exam_id: string
  target_date: string | null
  is_primary: boolean
  exam: { code: string; name: string; category_id: string; exam_categories: { code: string; name: string } }
}

export interface TopicMastery {
  topic_id: string
  sessions_done: number
  total_attempted: number
  total_correct: number
  accuracy_pct: number
  last_practiced: string | null
  mastery_level: 'not_started' | 'weak' | 'developing' | 'strong' | 'mastered'
  topic: { name: string; chapters: { name: string; subjects: { name: string; code: string; color: string } } }
}

export interface PracticeSession {
  id: string
  topic_id: string
  mode: string
  started_at: string
  completed_at: string | null
  total_questions: number
  attempted: number
  correct: number
  score_pct: number | null
  topic: { name: string }
}

export interface StudyTask {
  id: string
  topic_id: string
  scheduled_date: string
  task_type: 'practice' | 'revision' | 'new_topic'
  target_questions: number
  is_done: boolean
  topic: { name: string; chapters: { name: string; subjects: { code: string; color: string } } }
}

export async function getStudentExams(studentId: string): Promise<StudentExam[]> {
  const sb = createClient()
  const { data } = await sb
    .from('student_exams')
    .select('id, exam_id, target_date, is_primary, exams!inner(code, name, category_id, exam_categories!inner(code, name))')
    .eq('student_id', studentId)
    .order('is_primary', { ascending: false })
  return (data || []).map((d: any) => ({ ...d, exam: d.exams }))
}

export async function saveExamEnrollments(studentId: string, exams: { exam_id: string; target_date?: string; is_primary?: boolean }[]) {
  const sb = createClient()
  const sbe = sb as any
  await sbe.from('student_exams').upsert(
    exams.map(e => ({ student_id: studentId, ...e })),
    { onConflict: 'student_id,exam_id' }
  )
  const sb2 = sb as any
  await sb2.from('student_onboarding').upsert({
    student_id: studentId, exams_selected: true,
    timeframe_set: exams.some(e => e.target_date != null),
  }, { onConflict: 'student_id' })
}

export async function getTopicMastery(studentId: string): Promise<TopicMastery[]> {
  const sb = createClient()
  const { data } = await sb
    .from('topic_mastery')
    .select('*, topics!inner(name, chapters!inner(name, subjects!inner(name, code, color)))')
    .eq('student_id', studentId)
    .order('last_practiced', { ascending: false })
    .limit(30)
  return (data || []).map((d: any) => ({ ...d, topic: d.topics }))
}

export async function getWeakTopics(studentId: string): Promise<TopicMastery[]> {
  const sb = createClient()
  const { data } = await sb
    .from('topic_mastery')
    .select('*, topics!inner(name, chapters!inner(name, subjects!inner(name, code, color)))')
    .eq('student_id', studentId)
    .in('mastery_level', ['weak', 'developing'])
    .order('accuracy_pct', { ascending: true })
    .limit(8)
  return (data || []).map((d: any) => ({ ...d, topic: d.topics }))
}

export async function getRecentSessions(studentId: string): Promise<PracticeSession[]> {
  const sb = createClient()
  const { data } = await sb
    .from('practice_sessions')
    .select('*, topics!inner(name)')
    .eq('student_id', studentId)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(10)
  return (data || []).map((d: any) => ({ ...d, topic: d.topics }))
}

export async function getStudentStats(studentId: string) {
  const sb = createClient()
  const [sessions, mastery] = await Promise.all([
    sb.from('practice_sessions').select('correct, attempted').eq('student_id', studentId).not('completed_at', 'is', null),
    sb.from('topic_mastery').select('mastery_level').eq('student_id', studentId),
  ])
  const sess = (sessions.data || []) as any[]
  const mast = (mastery.data  || []) as any[]
  const totalQ = sess.reduce((s, r) => s + (r.attempted || 0), 0)
  const totalC = sess.reduce((s, r) => s + (r.correct  || 0), 0)
  return {
    sessions_done:    sess.length,
    questions_done:   totalQ,
    overall_accuracy: totalQ > 0 ? Math.round((totalC / totalQ) * 100) : 0,
    topics_mastered:  mast.filter(m => m.mastery_level === 'mastered').length,
    topics_weak:      mast.filter(m => ['weak','developing'].includes(m.mastery_level)).length,
  }
}

export async function fetchPracticeQuestions(topicId: string, count = 10) {
  const sb = createClient()
  const { data } = await sb
    .from('questions')
    .select('id, question_text, question_type, difficulty, solution_text, marks, time_limit_secs, question_options(id, option_text, is_correct, sort_order)')
    .eq('topic_id', topicId)
    .eq('is_active', true)
    .limit(count)
  return (data || []).map((q: any) => ({
    ...q,
    options: (q.question_options || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
  }))
}

export async function startSession(studentId: string, topicId: string, examId: string | null, mode: string, totalQ: number) {
  const sb = createClient()
  const sbs = sb as any
  const { data, error } = await sbs
    .from('practice_sessions')
    .insert({ student_id: studentId, topic_id: topicId, exam_id: examId, mode, total_questions: totalQ })
    .select('id').single()
  if (error) throw error
  return (data as any).id as string
}

export async function saveAnswer(sessionId: string, questionId: string, selectedOptionId: string | null, isCorrect: boolean, isSkipped: boolean, timeSecs: number) {
  const sb = createClient()
  const sba = sb as any
  await sba.from('practice_answers').insert({ session_id: sessionId, question_id: questionId, selected_option_id: selectedOptionId, is_correct: isCorrect, is_skipped: isSkipped, time_taken_secs: timeSecs })
}

export async function completeSession(sessionId: string, studentId: string, topicId: string, correct: number, attempted: number, timeSecs: number) {
  const sb = createClient()
  const scorePct = attempted > 0 ? Math.round((correct / attempted) * 100) : 0
  const sbup = sb as any
  await sbup.from('practice_sessions').update({ completed_at: new Date().toISOString(), correct, attempted, time_taken_secs: timeSecs, score_pct: scorePct }).eq('id', sessionId)

  const sbq = sb as any
  const { data: existing } = await sbq.from('topic_mastery').select('total_attempted,total_correct,sessions_done').eq('student_id', studentId).eq('topic_id', topicId).single()
  const pa = (existing as any)?.total_attempted ?? 0
  const pc = (existing as any)?.total_correct   ?? 0
  const ps = (existing as any)?.sessions_done   ?? 0
  const na = pa + attempted, nc = pc + correct
  const acc = na > 0 ? Math.round((nc / na) * 100) : 0
  const lvl = na === 0 ? 'not_started' : acc >= 85 ? 'mastered' : acc >= 70 ? 'strong' : acc >= 50 ? 'developing' : 'weak'

  const sbm = sb as any
  await sbm.from('topic_mastery').upsert({ student_id: studentId, topic_id: topicId, sessions_done: ps+1, total_attempted: na, total_correct: nc, accuracy_pct: acc, mastery_level: lvl, last_practiced: new Date().toISOString(), updated_at: new Date().toISOString() }, { onConflict: 'student_id,topic_id' })
  return scorePct
}

export async function toggleBookmark(studentId: string, questionId: string) {
  const sb = createClient()
  const sbbk = sb as any
  const { data: ex } = await sbbk.from('bookmarks').select('question_id').eq('student_id', studentId).eq('question_id', questionId).single()
  if (ex) { await sbbk.from('bookmarks').delete().eq('student_id', studentId).eq('question_id', questionId); return false }
  const sbx = sb as any
  await sbx.from('bookmarks').insert({ student_id: studentId, question_id: questionId })
  return true
}
