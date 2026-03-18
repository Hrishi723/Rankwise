'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, Bookmark, Clock, CheckCircle, XCircle, SkipForward, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { fetchPracticeQuestions, startSession, saveAnswer, completeSession, toggleBookmark } from '@/lib/student/service'

interface Option   { id: string; option_text: string; is_correct: boolean; sort_order: number }
interface Question {
  id: string; question_text: string; question_type: string; difficulty: string
  solution_text: string | null; marks: number; time_limit_secs: number; options: Option[]
}

type AnswerState = 'unanswered' | 'correct' | 'wrong' | 'skipped'
type Stage = 'loading' | 'playing' | 'result'

const DEMO_QUESTIONS: Question[] = [
  { id:'q1', question_text:'What is 15% of 240?', question_type:'mcq', difficulty:'easy', solution_text:'15% of 240 = (15/100) × 240 = 36', marks:1, time_limit_secs:90, options:[{id:'o1',option_text:'32',is_correct:false,sort_order:0},{id:'o2',option_text:'36',is_correct:true,sort_order:1},{id:'o3',option_text:'38',is_correct:false,sort_order:2},{id:'o4',option_text:'42',is_correct:false,sort_order:3}] },
  { id:'q2', question_text:'If 35% of a number is 84, what is the number?', question_type:'mcq', difficulty:'easy', solution_text:'Number = 84 × (100/35) = 240', marks:1, time_limit_secs:90, options:[{id:'o5',option_text:'220',is_correct:false,sort_order:0},{id:'o6',option_text:'240',is_correct:true,sort_order:1},{id:'o7',option_text:'260',is_correct:false,sort_order:2},{id:'o8',option_text:'280',is_correct:false,sort_order:3}] },
  { id:'q3', question_text:'A student scored 540 out of 750. What percentage did she score?', question_type:'mcq', difficulty:'easy', solution_text:'(540/750) × 100 = 72%', marks:1, time_limit_secs:90, options:[{id:'o9',option_text:'68%',is_correct:false,sort_order:0},{id:'o10',option_text:'70%',is_correct:false,sort_order:1},{id:'o11',option_text:'72%',is_correct:true,sort_order:2},{id:'o12',option_text:'75%',is_correct:false,sort_order:3}] },
  { id:'q4', question_text:'A price increased from ₹800 to ₹1000. What is the percentage increase?', question_type:'mcq', difficulty:'medium', solution_text:'Increase = 200, % = (200/800)×100 = 25%', marks:1, time_limit_secs:90, options:[{id:'o13',option_text:'20%',is_correct:false,sort_order:0},{id:'o14',option_text:'22%',is_correct:false,sort_order:1},{id:'o15',option_text:'25%',is_correct:true,sort_order:2},{id:'o16',option_text:'30%',is_correct:false,sort_order:3}] },
  { id:'q5', question_text:'A number is first increased by 20% and then decreased by 20%. What is the net change?', question_type:'mcq', difficulty:'medium', solution_text:'Net change = -x²/100 = -400/100 = -4% (decrease)', marks:1, time_limit_secs:90, options:[{id:'o17',option_text:'0% change',is_correct:false,sort_order:0},{id:'o18',option_text:'4% decrease',is_correct:true,sort_order:1},{id:'o19',option_text:'4% increase',is_correct:false,sort_order:2},{id:'o20',option_text:'2% decrease',is_correct:false,sort_order:3}] },
]

const diffStyle: Record<string,string> = {
  easy:'bg-green-50 text-green-700', medium:'bg-amber-50 text-amber-700', hard:'bg-red-50 text-red-700',
}

export default function PracticeSessionPage() {
  const params  = useParams()
  const router  = useRouter()
  const topicId = params.topicId as string

  const [stage,      setStage]      = useState<Stage>('loading')
  const [questions,  setQuestions]  = useState<Question[]>([])
  const [qIndex,     setQIndex]     = useState(0)
  const [selected,   setSelected]   = useState<string | null>(null)
  const [revealed,   setRevealed]   = useState(false)
  const [answers,    setAnswers]    = useState<{ questionId: string; optionId: string | null; correct: boolean; skipped: boolean; secs: number }[]>([])
  const [elapsed,    setElapsed]    = useState(0)
  const [qElapsed,   setQElapsed]   = useState(0)
  const [sessionId,  setSessionId]  = useState<string | null>(null)
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set())
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const qTimerRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const studentId = 'demo'

  // load questions
  useEffect(() => {
    fetchPracticeQuestions(topicId, 10)
      .then(qs => {
        const loaded = qs.length > 0 ? qs : DEMO_QUESTIONS
        setQuestions(loaded)
        // try to start a real session
        startSession(studentId, topicId, null, 'practice', loaded.length)
          .then(id => setSessionId(id))
          .catch(() => {})
        setStage('playing')
      })
      .catch(() => {
        setQuestions(DEMO_QUESTIONS)
        setStage('playing')
      })
  }, [topicId])

  // global timer
  useEffect(() => {
    if (stage !== 'playing') return
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [stage])

  // per-question timer
  useEffect(() => {
    if (stage !== 'playing') return
    setQElapsed(0)
    clearInterval(qTimerRef.current)
    qTimerRef.current = setInterval(() => setQElapsed(e => e + 1), 1000)
    return () => clearInterval(qTimerRef.current)
  }, [qIndex, stage])

  const currentQ = questions[qIndex]

  function handleSelect(optionId: string) {
    if (revealed) return
    setSelected(optionId)
  }

  function handleReveal() {
    if (!selected || revealed) return
    setRevealed(true)
  }

  async function handleNext(skip = false) {
    const isCorrect = skip ? false : (currentQ.options.find(o => o.id === selected)?.is_correct ?? false)
    const ans = { questionId: currentQ.id, optionId: skip ? null : selected, correct: isCorrect, skipped: skip, secs: qElapsed }
    const newAnswers = [...answers, ans]
    setAnswers(newAnswers)

    if (sessionId) {
      saveAnswer(sessionId, currentQ.id, skip ? null : selected, isCorrect, skip, qElapsed).catch(() => {})
    }

    if (qIndex + 1 >= questions.length) {
      // session complete
      clearInterval(timerRef.current)
      clearInterval(qTimerRef.current)
      const correct  = newAnswers.filter(a => a.correct).length
      const attempted = newAnswers.filter(a => !a.skipped).length
      if (sessionId) {
        completeSession(sessionId, studentId, topicId, correct, attempted, elapsed).catch(() => {})
      }
      setStage('result')
    } else {
      setQIndex(i => i + 1)
      setSelected(null)
      setRevealed(false)
    }
  }

  async function handleBookmark() {
    if (!currentQ) return
    const isNow = await toggleBookmark(studentId, currentQ.id).catch(() => !bookmarked.has(currentQ.id))
    setBookmarked(prev => {
      const s = new Set(prev)
      isNow ? s.add(currentQ.id) : s.delete(currentQ.id)
      return s
    })
  }

  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`

  // ── Loading ──────────────────────────────────────────────────
  if (stage === 'loading') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading questions…</p>
        </div>
      </div>
    )
  }

  // ── Result screen ─────────────────────────────────────────────
  if (stage === 'result') {
    const correct  = answers.filter(a => a.correct).length
    const skipped  = answers.filter(a => a.skipped).length
    const wrong    = answers.length - correct - skipped
    const score    = answers.length > 0 ? Math.round((correct / (answers.length - skipped || 1)) * 100) : 0
    const scoreColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-red-500'
    const scoreBg    = score >= 80 ? 'bg-green-50' : score >= 60 ? 'bg-amber-50' : 'bg-red-50'

    return (
      <div className="p-7 max-w-lg mx-auto">
        <div className={`rounded-2xl border p-8 text-center mb-6 ${scoreBg} border-gray-100`}>
          <div className={`text-6xl font-bold mb-1 ${scoreColor}`}>{score}%</div>
          <p className="text-gray-600 font-medium">Session complete</p>
          <p className="text-sm text-gray-400 mt-1">{formatTime(elapsed)} · {questions.length} questions</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <p className="text-xl font-semibold text-green-600">{correct}</p>
            <p className="text-xs text-gray-400">Correct</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <p className="text-xl font-semibold text-red-500">{wrong}</p>
            <p className="text-xs text-gray-400">Wrong</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <p className="text-xl font-semibold text-gray-400">{skipped}</p>
            <p className="text-xs text-gray-400">Skipped</p>
          </div>
        </div>

        {/* Per-question review */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Question review</p>
          </div>
          <div className="divide-y divide-gray-50">
            {questions.map((q, i) => {
              const ans = answers[i]
              const icon = ans?.skipped ? <SkipForward size={14} className="text-gray-400" /> : ans?.correct ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-400" />
              return (
                <div key={q.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="mt-0.5">{icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 truncate">{q.question_text}</p>
                    {!ans?.correct && !ans?.skipped && q.solution_text && (
                      <p className="text-xs text-blue-600 mt-0.5 truncate">{q.solution_text}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-300">{ans?.secs}s</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => { setStage('loading'); setQIndex(0); setAnswers([]); setElapsed(0); setSelected(null); setRevealed(false); setStage('playing') }}
            className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">
            <RotateCcw size={14} /> Try again
          </button>
          <Link href="/student/dashboard" className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium text-center hover:bg-blue-700">
            Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  // ── Playing ───────────────────────────────────────────────────
  const progress = ((qIndex) / questions.length) * 100
  const correctOption = currentQ.options.find(o => o.is_correct)

  return (
    <div className="p-7 max-w-2xl">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-5">
        <Link href="/student/practice" className="text-gray-400 hover:text-gray-600">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs text-gray-400 font-mono min-w-[40px] text-right">{qIndex+1}/{questions.length}</span>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock size={12} /> {formatTime(elapsed)}
        </div>
        <button onClick={handleBookmark} className={`${bookmarked.has(currentQ.id) ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'} transition-colors`}>
          <Bookmark size={16} fill={bookmarked.has(currentQ.id) ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${diffStyle[currentQ.difficulty]}`}>
            {currentQ.difficulty}
          </span>
          <span className="text-[10px] text-gray-400">{currentQ.marks} mark{currentQ.marks !== 1 ? 's' : ''}</span>
          <span className="ml-auto text-xs text-gray-300 font-mono">{formatTime(qElapsed)}</span>
        </div>
        <p className="text-base text-gray-900 leading-relaxed">{currentQ.question_text}</p>
      </div>

      {/* Options */}
      <div className="space-y-2.5 mb-5">
        {currentQ.options.map((opt, i) => {
          const isSelected = selected === opt.id
          const isCorrect  = opt.is_correct
          let style = 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50/30'
          if (isSelected && !revealed) style = 'bg-blue-50 border-blue-400 text-blue-800'
          if (revealed && isCorrect)   style = 'bg-green-50 border-green-400 text-green-800'
          if (revealed && isSelected && !isCorrect) style = 'bg-red-50 border-red-300 text-red-700'

          return (
            <button key={opt.id} onClick={() => handleSelect(opt.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-sm text-left transition-all ${style} ${revealed ? 'cursor-default' : 'cursor-pointer'}`}>
              <span className="w-6 h-6 rounded-full border border-current/30 flex items-center justify-center text-xs font-mono flex-shrink-0">
                {'ABCD'[i]}
              </span>
              <span className="flex-1">{opt.option_text}</span>
              {revealed && isCorrect    && <CheckCircle size={16} className="text-green-500 flex-shrink-0" />}
              {revealed && isSelected && !isCorrect && <XCircle size={16} className="text-red-400 flex-shrink-0" />}
            </button>
          )
        })}
      </div>

      {/* Solution (after reveal) */}
      {revealed && currentQ.solution_text && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs font-semibold text-blue-700 mb-1">Solution</p>
              <p className="text-sm text-blue-800 leading-relaxed">{currentQ.solution_text}</p>
            </div>
            <Link
              href={`/student/solve?q=${encodeURIComponent(currentQ.question_text)}`}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 flex-shrink-0"
            >
              ✦ Visual solve
            </Link>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button onClick={() => handleNext(true)}
          className="flex items-center gap-1.5 px-4 py-3 border border-gray-200 text-gray-500 rounded-xl text-sm hover:bg-gray-50 transition-colors">
          <SkipForward size={14} /> Skip
        </button>
        {!revealed ? (
          <button onClick={handleReveal} disabled={!selected}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors">
            Check answer
          </button>
        ) : (
          <button onClick={() => handleNext(false)}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            {qIndex + 1 >= questions.length ? 'Finish session' : 'Next question →'}
          </button>
        )}
      </div>
    </div>
  )
}
