'use client'
import { useState, useEffect } from 'react'
import { getTopicMastery, getRecentSessions, getStudentStats, type TopicMastery, type PracticeSession } from '@/lib/student/service'

const MASTERY_STYLE = {
  not_started: { bg: 'bg-gray-100',   text: 'text-gray-400',  bar: 'bg-gray-200',   label: 'Not started', pct: 0  },
  weak:        { bg: 'bg-red-50',     text: 'text-red-600',   bar: 'bg-red-400',    label: 'Weak',        pct: 25 },
  developing:  { bg: 'bg-amber-50',   text: 'text-amber-600', bar: 'bg-amber-400',  label: 'Developing',  pct: 50 },
  strong:      { bg: 'bg-blue-50',    text: 'text-blue-600',  bar: 'bg-blue-500',   label: 'Strong',      pct: 75 },
  mastered:    { bg: 'bg-green-50',   text: 'text-green-600', bar: 'bg-green-500',  label: 'Mastered',    pct: 100},
}

// Demo mastery data
const DEMO_MASTERY: TopicMastery[] = [
  { topic_id:'t1', sessions_done:5, total_attempted:48, total_correct:42, accuracy_pct:87, last_practiced: new Date(Date.now()-3600000).toISOString(), mastery_level:'mastered',  topic:{name:'Basic percentage concepts', chapters:{name:'Percentage', subjects:{name:'Quant', code:'MATHS', color:'#3B82F6'}}} },
  { topic_id:'t2', sessions_done:4, total_attempted:40, total_correct:30, accuracy_pct:75, last_practiced: new Date(Date.now()-86400000).toISOString(), mastery_level:'strong',    topic:{name:'HCF and LCM',              chapters:{name:'Number System', subjects:{name:'Quant', code:'MATHS', color:'#3B82F6'}}} },
  { topic_id:'t3', sessions_done:3, total_attempted:28, total_correct:13, accuracy_pct:46, last_practiced: new Date(Date.now()-172800000).toISOString(), mastery_level:'weak',   topic:{name:'Time Speed Distance',       chapters:{name:'TSD', subjects:{name:'Quant', code:'MATHS', color:'#3B82F6'}}} },
  { topic_id:'t4', sessions_done:2, total_attempted:20, total_correct:11, accuracy_pct:55, last_practiced: new Date(Date.now()-259200000).toISOString(), mastery_level:'developing', topic:{name:'Seating Arrangement',   chapters:{name:'Arrangement', subjects:{name:'Reasoning', code:'REASONING', color:'#8B5CF6'}}} },
  { topic_id:'t5', sessions_done:3, total_attempted:30, total_correct:22, accuracy_pct:73, last_practiced: new Date(Date.now()-345600000).toISOString(), mastery_level:'strong',  topic:{name:'Analogy',                  chapters:{name:'Analogy', subjects:{name:'Reasoning', code:'REASONING', color:'#8B5CF6'}}} },
  { topic_id:'t6', sessions_done:1, total_attempted:15, total_correct:6,  accuracy_pct:40, last_practiced: new Date(Date.now()-432000000).toISOString(), mastery_level:'weak',   topic:{name:'Syllogism',                 chapters:{name:'Logic', subjects:{name:'Reasoning', code:'REASONING', color:'#8B5CF6'}}} },
  { topic_id:'t7', sessions_done:4, total_attempted:35, total_correct:32, accuracy_pct:91, last_practiced: new Date(Date.now()-518400000).toISOString(), mastery_level:'mastered', topic:{name:'Types of numbers',       chapters:{name:'Number System', subjects:{name:'Quant', code:'MATHS', color:'#3B82F6'}}} },
  { topic_id:'t8', sessions_done:2, total_attempted:18, total_correct:9,  accuracy_pct:50, last_practiced: new Date(Date.now()-604800000).toISOString(), mastery_level:'developing', topic:{name:'Current Affairs',      chapters:{name:'Current Affairs', subjects:{name:'GK', code:'GK', color:'#F59E0B'}}} },
]
const DEMO_SESSIONS: PracticeSession[] = [
  { id:'s1', topic_id:'t1', mode:'practice', started_at: new Date(Date.now()-3600000).toISOString(), completed_at: new Date(Date.now()-1800000).toISOString(), total_questions:10, attempted:10, correct:9, score_pct:90, topic:{name:'Basic percentage concepts'} },
  { id:'s2', topic_id:'t3', mode:'timed',    started_at: new Date(Date.now()-86400000).toISOString(), completed_at: new Date(Date.now()-84000000).toISOString(), total_questions:15, attempted:14, correct:6, score_pct:43, topic:{name:'Time Speed Distance'} },
  { id:'s3', topic_id:'t5', mode:'practice', started_at: new Date(Date.now()-172800000).toISOString(), completed_at: new Date(Date.now()-170000000).toISOString(), total_questions:10, attempted:10, correct:7, score_pct:70, topic:{name:'Analogy'} },
  { id:'s4', topic_id:'t2', mode:'practice', started_at: new Date(Date.now()-259200000).toISOString(), completed_at: new Date(Date.now()-256000000).toISOString(), total_questions:12, attempted:12, correct:9, score_pct:75, topic:{name:'HCF and LCM'} },
  { id:'s5', topic_id:'t7', mode:'timed',    started_at: new Date(Date.now()-345600000).toISOString(), completed_at: new Date(Date.now()-342000000).toISOString(), total_questions:10, attempted:10, correct:10, score_pct:100, topic:{name:'Types of numbers'} },
]
const DEMO_STATS = { sessions_done: 12, questions_done: 148, overall_accuracy: 71, topics_mastered: 3, topics_weak: 4 }

export default function ProgressPage() {
  const [mastery,  setMastery]  = useState<TopicMastery[]>(DEMO_MASTERY)
  const [sessions, setSessions] = useState<PracticeSession[]>(DEMO_SESSIONS)
  const [stats,    setStats]    = useState(DEMO_STATS)
  const [tab,      setTab]      = useState<'heatmap'|'list'>('heatmap')
  const studentId = 'demo'

  useEffect(() => {
    if (studentId === 'demo') return
    Promise.all([
      getTopicMastery(studentId).then(setMastery).catch(()=>{}),
      getRecentSessions(studentId).then(setSessions).catch(()=>{}),
      getStudentStats(studentId).then(setStats).catch(()=>{}),
    ])
  }, [studentId])

  const masteryGroups = {
    mastered:    mastery.filter(m => m.mastery_level === 'mastered'),
    strong:      mastery.filter(m => m.mastery_level === 'strong'),
    developing:  mastery.filter(m => m.mastery_level === 'developing'),
    weak:        mastery.filter(m => m.mastery_level === 'weak'),
    not_started: mastery.filter(m => m.mastery_level === 'not_started'),
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', { day:'numeric', month:'short' })
  }
  const scoreColor = (s: number) => s >= 80 ? 'text-green-600' : s >= 60 ? 'text-amber-600' : 'text-red-500'

  return (
    <div className="p-7 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Progress</h1>
        <p className="text-sm text-gray-500 mt-1">Track your mastery across all topics</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          { label:'Sessions',      value: stats.sessions_done,    color:'text-gray-900' },
          { label:'Questions',     value: stats.questions_done,   color:'text-gray-900' },
          { label:'Accuracy',      value: stats.overall_accuracy+'%', color: stats.overall_accuracy>=70?'text-green-600':stats.overall_accuracy>=50?'text-amber-600':'text-red-500' },
          { label:'Mastered',      value: stats.topics_mastered,  color:'text-green-600' },
          { label:'Need work',     value: stats.topics_weak,      color:'text-red-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <p className={`text-xl font-semibold ${color}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-5">
        {/* Left: mastery breakdown */}
        <div className="col-span-3">
          {/* Tabs */}
          <div className="flex gap-1 mb-4">
            {(['heatmap','list'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${tab===t ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                {t === 'heatmap' ? 'Mastery heatmap' : 'Topic list'}
              </button>
            ))}
          </div>

          {tab === 'heatmap' ? (
            <div className="space-y-4">
              {(Object.entries(masteryGroups) as [string, TopicMastery[]][])
                .filter(([, items]) => items.length > 0)
                .map(([level, items]) => {
                  const style = MASTERY_STYLE[level as keyof typeof MASTERY_STYLE]
                  return (
                    <div key={level} className={`rounded-xl border border-gray-100 p-4 ${style.bg}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-xs font-semibold uppercase tracking-wide ${style.text}`}>{style.label}</span>
                        <span className={`text-xs ${style.text} opacity-60`}>{items.length} topic{items.length!==1?'s':''}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {items.map(m => (
                          <div key={m.topic_id} className="bg-white/70 rounded-lg px-3 py-2 text-xs">
                            <p className="font-medium text-gray-800">{m.topic.name}</p>
                            <p className={`${style.text} mt-0.5`}>{m.accuracy_pct}% accuracy</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-50">
                {mastery.map(m => {
                  const style = MASTERY_STYLE[m.mastery_level]
                  return (
                    <div key={m.topic_id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{m.topic.name}</p>
                        <p className="text-xs text-gray-400">{m.topic.chapters.subjects.name} · {m.sessions_done} sessions</p>
                      </div>
                      <div className="w-24 text-right">
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                          <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${m.accuracy_pct}%` }} />
                        </div>
                        <p className={`text-xs font-medium ${style.text}`}>{m.accuracy_pct}%</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: recent sessions */}
        <div className="col-span-2">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Session history</h2>
          <div className="space-y-2">
            {sessions.map(s => {
              const score = s.score_pct ?? 0
              return (
                <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-gray-800 truncate flex-1">{s.topic.name}</p>
                    <span className={`text-sm font-bold ${scoreColor(score)}`}>{score}%</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] text-gray-400 capitalize">{s.mode}</span>
                    <span className="text-[10px] text-gray-400">{s.correct}/{s.attempted} correct</span>
                    <span className="text-[10px] text-gray-400 ml-auto">{s.completed_at ? formatDate(s.completed_at) : ''}</span>
                  </div>
                  {/* Score bar */}
                  <div className="h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${score>=80?'bg-green-400':score>=60?'bg-amber-400':'bg-red-400'}`} style={{ width:`${score}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
