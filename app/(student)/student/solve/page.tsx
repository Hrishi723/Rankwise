'use client'
import { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, RotateCcw, BookOpen, ChevronRight, Zap, ArrowRight } from 'lucide-react'
import StepCard from '@/components/solver/StepCard'

interface SolverResult {
  topic: string
  difficulty: string
  shortcut: string
  steps: { title: string; explanation: string; visual: { type: string; data: any }; highlight: string }[]
  answer: string
  exam_tips: string[]
}

const DIFFICULTY_STYLE: Record<string, string> = {
  easy:   'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  hard:   'bg-red-100 text-red-700',
}

const EXAMPLE_PROBLEMS = [
  'A train travels 360 km in 4 hours. What is its speed?',
  'What is 15% of 240?',
  'A price increased from ₹800 to ₹1000. What is the % increase?',
  'A and B can do a work in 10 and 15 days. In how many days together?',
  'Divide ₹800 in ratio 3:5 between A and B.',
  'In an exam, 60% students passed. If 480 failed, how many appeared?',
]

export default function SolvePage() {
  const [problem, setProblem]   = useState('')
  const [result,   setResult]   = useState<SolverResult | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [revealed, setRevealed] = useState(false)
  const [visStep,  setVisStep]  = useState(-1)   // step-by-step reveal index
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-step reveal after solve
  useEffect(() => {
    if (!result || !revealed) return
    setVisStep(-1)
    result.steps.forEach((_, i) => {
      setTimeout(() => setVisStep(i), i * 200)
    })
  }, [result, revealed])

  async function handleSolve(q?: string) {
    const text = (q ?? problem).trim()
    if (!text) return
    if (q) setProblem(q)
    setLoading(true)
    setError('')
    setResult(null)
    setRevealed(false)
    setVisStep(-1)

    try {
      const res = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem: text }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
      setRevealed(true)
    } catch (e: any) {
      setError('Could not solve this problem. Try rephrasing it.')
    }
    setLoading(false)
  }

  function handleReset() {
    setProblem('')
    setResult(null)
    setRevealed(false)
    setVisStep(-1)
    setError('')
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  return (
    <div className="min-h-full">
      {/* Hero input area */}
      <div className={`transition-all duration-500 ${result ? 'py-5 border-b border-gray-100 bg-white sticky top-0 z-10 shadow-sm' : 'py-16 flex flex-col items-center justify-center min-h-[50vh]'}`}>
        <div className={`${result ? 'max-w-3xl mx-auto px-6' : 'w-full max-w-2xl px-6'}`}>
          {!result && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
                <Sparkles size={14} className="text-blue-500" />
                <span className="text-sm font-medium text-blue-700">AI-powered visual solver</span>
              </div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-3">Solve any maths problem</h1>
              <p className="text-gray-500 text-base">Type a question — get a step-by-step visual solution with exam shortcuts</p>
            </div>
          )}

          {/* Input */}
          <div className="relative bg-white rounded-2xl border border-gray-200 shadow-sm focus-within:border-blue-400 focus-within:shadow-md transition-all">
            <textarea
              ref={inputRef}
              value={problem}
              onChange={e => setProblem(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !loading) { e.preventDefault(); handleSolve() } }}
              placeholder="Type your maths problem here… e.g. 'What is 15% of 240?' or 'A train travels 360 km in 4 hrs'"
              rows={result ? 2 : 3}
              className="w-full px-5 py-4 text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between px-4 pb-3">
              <p className="text-xs text-gray-400">Press Enter to solve · Shift+Enter for new line</p>
              <div className="flex gap-2">
                {result && (
                  <button onClick={handleReset}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-500 rounded-xl text-xs hover:bg-gray-50">
                    <RotateCcw size={12} /> New problem
                  </button>
                )}
                <button
                  onClick={() => handleSolve()}
                  disabled={!problem.trim() || loading}
                  className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
                >
                  {loading
                    ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Solving…</>
                    : <><Sparkles size={13} /> Solve</>}
                </button>
              </div>
            </div>
          </div>

          {/* Example problems */}
          {!result && (
            <div className="mt-5">
              <p className="text-xs text-gray-400 text-center mb-3">Try an example</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {EXAMPLE_PROBLEMS.map(p => (
                  <button key={p} onClick={() => handleSolve(p)}
                    className="px-3 py-1.5 bg-white border border-gray-200 text-xs text-gray-600 rounded-full hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                    {p.length > 42 ? p.slice(0, 42) + '…' : p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
          )}
        </div>
      </div>

      {/* Solution */}
      {result && (
        <div className="max-w-3xl mx-auto px-6 py-6">
          {/* Meta row */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100">
              <BookOpen size={12} className="text-blue-600" />
              <span className="text-xs font-semibold text-blue-700">{result.topic}</span>
            </div>
            <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${DIFFICULTY_STYLE[result.difficulty] ?? 'bg-gray-100 text-gray-600'}`}>
              {result.difficulty}
            </span>
            <div className="flex-1" />
            <span className="text-xs text-gray-400">{result.steps.length} steps</span>
          </div>

          {/* Shortcut banner */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl mb-6">
            <Zap size={16} className="text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" />
            <div>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-0.5">Exam shortcut</p>
              <p className="text-sm text-amber-800">{result.shortcut}</p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3 mb-6">
            {result.steps.map((step, i) => (
              <StepCard
                key={i}
                step={step}
                index={i}
                total={result.steps.length}
                isActive={i === visStep}
                isRevealed={visStep >= i}
              />
            ))}
          </div>

          {/* Final answer */}
          <div className="p-5 bg-green-50 border border-green-200 rounded-2xl mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg font-bold">A</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Answer</p>
                <p className="text-xl font-bold text-green-800">{result.answer}</p>
              </div>
            </div>
          </div>

          {/* Exam tips */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Exam tips</p>
            <div className="space-y-2.5">
              {result.exam_tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <ArrowRight size={13} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Try another CTA */}
          <div className="mt-6 text-center">
            <button onClick={handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
              <Sparkles size={13} /> Solve another problem
            </button>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-14 bg-gray-50" />
              <div className="p-5 space-y-3">
                <div className="h-3 bg-gray-100 rounded-full w-4/5" />
                <div className="h-3 bg-gray-100 rounded-full w-3/5" />
                <div className="h-20 bg-gray-50 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
