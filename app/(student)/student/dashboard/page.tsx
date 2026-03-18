'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TrendingUp, BookOpen, Target, Flame, ChevronRight, CheckCircle, Circle, Sparkles } from 'lucide-react'
import { getStudentStats, getWeakTopics, getRecentSessions, type TopicMastery, type PracticeSession } from '@/lib/student/service'

const MASTERY_STYLE = {
  not_started: { bg: 'bg-gray-100',   text: 'text-gray-500',  bar: 'bg-gray-300',   label: 'Not started' },
  weak:        { bg: 'bg-red-50',     text: 'text-red-600',   bar: 'bg-red-400',    label: 'Weak' },
  developing:  { bg: 'bg-amber-50',   text: 'text-amber-600', bar: 'bg-amber-400',  label: 'Developing' },
  strong:      { bg: 'bg-blue-50',    text: 'text-blue-600',  bar: 'bg-blue-500',   label: 'Strong' },
  mastered:    { bg: 'bg-green-50',   text: 'text-green-600', bar: 'bg-green-500',  label: 'Mastered' },
}

// Demo data shown before Supabase is connected
const DEMO_STATS = { sessions_done: 12, questions_done: 148, overall_accuracy: 71, topics_mastered: 3, topics_weak: 5 }
const DEMO_WEAK: TopicMastery[] = [
  { topic_id:'t1', sessions_done:3, total_attempted:28, total_correct:13, accuracy_pct:46, last_practiced: new Date(Date.now()-86400000).toISOString(), mastery_level:'weak', topic:{ name:'Time, Speed & Distance', chapters:{ name:'TSD', subjects:{ name:'Quantitative Aptitude', code:'MATHS', color:'#3B82F6' } } } },
  { topic_id:'t2', sessions_done:2, total_attempted:20, total_correct:10, accuracy_pct:50, last_practiced: new Date(Date.now()-172800000).toISOString(), mastery_level:'developing', topic:{ name:'Seating Arrangement', chapters:{ name:'Arrangement', subjects:{ name:'Reasoning', code:'REASONING', color:'#8B5CF6' } } } },
  { topic_id:'t3', sessions_done:1, total_attempted:15, total_correct:6, accuracy_pct:40, last_practiced: new Date(Date.now()-259200000).toISOString(), mastery_level:'weak', topic:{ name:'Syllogism', chapters:{ name:'Logic', subjects:{ name:'Reasoning', code:'REASONING', color:'#8B5CF6' } } } },
]
const DEMO_SESSIONS: PracticeSession[] = [
  { id:'s1', topic_id:'t4', mode:'practice', started_at: new Date(Date.now()-3600000).toISOString(), completed_at: new Date(Date.now()-1800000).toISOString(), total_questions:10, attempted:10, correct:8, score_pct:80, topic:{ name:'Basic percentage concepts' } },
  { id:'s2', topic_id:'t5', mode:'timed',    started_at: new Date(Date.now()-86400000).toISOString(), completed_at: new Date(Date.now()-83000000).toISOString(), total_questions:15, attempted:14, correct:9, score_pct:64, topic:{ name:'Number System' } },
  { id:'s3', topic_id:'t6', mode:'practice', started_at: new Date(Date.now()-172800000).toISOString(), completed_at: new Date(Date.now()-169000000).toISOString(), total_questions:10, attempted:10, correct:6, score_pct:60, topic:{ name:'Analogy' } },
]
const DEMO_TASKS = [
  { id:'tk1', topic_id:'t1', is_done:true,  task_type:'revision',  target_questions:10, topic:{ name:'Percentage',            subjects:{ code:'MATHS',     color:'#3B82F6' } } },
  { id:'tk2', topic_id:'t3', is_done:false, task_type:'practice',  target_questions:10, topic:{ name:'Time Speed Distance',   subjects:{ code:'MATHS',     color:'#3B82F6' } } },
  { id:'tk3', topic_id:'t4', is_done:false, task_type:'new_topic', target_questions:10, topic:{ name:'Seating Arrangement',   subjects:{ code:'REASONING', color:'#8B5CF6' } } },
  { id:'tk4', topic_id:'t6', is_done:false, task_type:'practice',  target_questions:10, topic:{ name:'Current Affairs',       subjects:{ code:'GK',        color:'#F59E0B' } } },
]

export default function StudentDashboard() {
  const [stats,    setStats]    = useState(DEMO_STATS)
  const [weak,     setWeak]     = useState<TopicMastery[]>(DEMO_WEAK)
  const [sessions, setSessions] = useState<PracticeSession[]>(DEMO_SESSIONS)
  const studentId = 'demo'   // replace with auth.uid() in production

  useEffect(() => {
    if (studentId === 'demo') return
    Promise.all([
      getStudentStats(studentId).then(setStats).catch(() => {}),
      getWeakTopics(studentId).then(setWeak).catch(() => {}),
      getRecentSessions(studentId).then(setSessions).catch(() => {}),
    ])
  }, [studentId])

  const doneTasks  = DEMO_TASKS.filter(t => t.is_done).length
  const totalTasks = DEMO_TASKS.length

  return (
    <div className="p-7 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Good morning 👋</h1>
          <p className="text-sm text-gray-500 mt-1">You have {totalTasks - doneTasks} tasks left for today. Keep going!</p>
        </div>
        <Link href="/student/practice"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
          <BookOpen size={14} /> Start practicing
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Sessions done',   value: stats.sessions_done,    icon: Flame,      color: 'bg-orange-50 text-orange-500' },
          { label: 'Questions done',  value: stats.questions_done,   icon: BookOpen,   color: 'bg-blue-50 text-blue-500' },
          { label: 'Accuracy',        value: stats.overall_accuracy + '%', icon: Target, color: 'bg-green-50 text-green-500' },
          { label: 'Topics mastered', value: stats.topics_mastered,  icon: TrendingUp, color: 'bg-purple-50 text-purple-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon size={16} />
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Visual Solver CTA */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white mb-6">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">Visual Maths Solver</p>
          <p className="text-xs text-blue-100 mt-0.5">Type any problem — get animated step-by-step solution with exam shortcuts</p>
        </div>
        <Link href="/student/solve" className="px-4 py-2 bg-white text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-50 flex-shrink-0">
          Try it →
        </Link>
      </div>

      <div className="grid grid-cols-5 gap-5">
        {/* Left: today's plan + weak topics */}
        <div className="col-span-3 space-y-5">
          {/* Today's study plan */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-800">Today's plan</h2>
              <span className="text-xs text-gray-400">{doneTasks}/{totalTasks} done</span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(doneTasks/totalTasks)*100}%` }} />
            </div>
            <div className="space-y-2">
              {DEMO_TASKS.map(task => (
                <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${task.is_done ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100 hover:border-blue-100 hover:bg-blue-50/30'}`}>
                  {task.is_done
                    ? <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                    : <Circle size={16} className="text-gray-300 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${task.is_done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.topic.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{task.task_type} · {task.target_questions} questions</p>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: task.topic.subjects.color }} />
                  {!task.is_done && (
                    <Link href={`/student/practice/${task.topic_id}`} className="text-xs text-blue-600 font-medium hover:underline flex-shrink-0">
                      Start →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent sessions */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-800">Recent sessions</h2>
              <Link href="/student/progress" className="text-xs text-blue-600 hover:underline">View all</Link>
            </div>
            <div className="space-y-2">
              {sessions.map(s => {
                const score = s.score_pct ?? 0
                const scoreColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-red-500'
                return (
                  <div key={s.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">{s.topic.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{s.mode} · {s.attempted} questions</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${scoreColor}`}>{score}%</p>
                      <p className="text-xs text-gray-400">{s.correct}/{s.attempted}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: weak topics */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-800">Needs attention</h2>
              <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">{weak.length} topics</span>
            </div>
            <div className="space-y-3">
              {weak.map(m => {
                const style = MASTERY_STYLE[m.mastery_level]
                return (
                  <Link key={m.topic_id} href={`/student/practice/${m.topic_id}`}
                    className="block p-3 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/20 transition-colors group">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-xs font-medium text-gray-800 leading-tight">{m.topic.name}</p>
                      <ChevronRight size={12} className="text-gray-300 group-hover:text-blue-400 flex-shrink-0 mt-0.5" />
                    </div>
                    <p className="text-[10px] text-gray-400 mb-2">{m.topic.chapters.subjects.name}</p>
                    {/* Accuracy bar */}
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${m.accuracy_pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-[10px] font-medium ${style.text}`}>{style.label}</span>
                      <span className="text-[10px] text-gray-400">{m.accuracy_pct}% accuracy</span>
                    </div>
                  </Link>
                )
              })}
            </div>
            <Link href="/student/practice" className="block mt-3 text-center text-xs text-blue-600 hover:underline">
              Browse all topics →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
