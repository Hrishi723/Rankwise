'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Topic   { id: string; name: string; difficulty: string }
interface Chapter { id: string; name: string; topics: Topic[] }
interface Subject { id: string; name: string; code: string; color: string | null; chapters: Chapter[] }

const MASTERY_COLOR: Record<string,string> = {
  not_started: 'bg-gray-200', weak: 'bg-red-400', developing: 'bg-amber-400', strong: 'bg-blue-500', mastered: 'bg-green-500',
}

// Demo subject tree
const DEMO_SUBJECTS: Subject[] = [
  { id:'s1', name:'Quantitative Aptitude', code:'MATHS', color:'#3B82F6', chapters:[
    { id:'c1', name:'Percentage', topics:[
      { id:'t1', name:'Basic percentage concepts', difficulty:'easy' },
      { id:'t2', name:'Percentage increase and decrease', difficulty:'easy' },
      { id:'t3', name:'Successive percentage change', difficulty:'medium' },
    ]},
    { id:'c2', name:'Number System', topics:[
      { id:'t4', name:'Types of numbers', difficulty:'easy' },
      { id:'t5', name:'HCF and LCM', difficulty:'medium' },
      { id:'t6', name:'Remainder theorem', difficulty:'hard' },
    ]},
    { id:'c3', name:'Time, Speed & Distance', topics:[
      { id:'t7', name:'Basic TSD concepts', difficulty:'easy' },
      { id:'t8', name:'Relative speed', difficulty:'medium' },
      { id:'t9', name:'Trains and boats', difficulty:'medium' },
    ]},
  ]},
  { id:'s2', name:'Reasoning', code:'REASONING', color:'#8B5CF6', chapters:[
    { id:'c4', name:'Analogy', topics:[
      { id:'t10', name:'Word analogy', difficulty:'easy' },
      { id:'t11', name:'Number analogy', difficulty:'medium' },
    ]},
    { id:'c5', name:'Seating Arrangement', topics:[
      { id:'t12', name:'Linear arrangement', difficulty:'medium' },
      { id:'t13', name:'Circular arrangement', difficulty:'hard' },
    ]},
    { id:'c6', name:'Syllogism', topics:[
      { id:'t14', name:'Basic syllogism', difficulty:'medium' },
      { id:'t15', name:'Possibility cases', difficulty:'hard' },
    ]},
  ]},
  { id:'s3', name:'General Awareness', code:'GK', color:'#F59E0B', chapters:[
    { id:'c7', name:'Current Affairs', topics:[
      { id:'t16', name:'National current affairs', difficulty:'medium' },
      { id:'t17', name:'International affairs', difficulty:'medium' },
    ]},
    { id:'c8', name:'Indian Polity', topics:[
      { id:'t18', name:'Constitution basics', difficulty:'easy' },
      { id:'t19', name:'Parliament and legislation', difficulty:'medium' },
    ]},
  ]},
]

const diffStyle: Record<string,string> = {
  easy:'bg-green-50 text-green-700 border-green-200',
  medium:'bg-amber-50 text-amber-700 border-amber-200',
  hard:'bg-red-50 text-red-700 border-red-200',
}

export default function PracticePage() {
  const [subjects, setSubjects] = useState<Subject[]>(DEMO_SUBJECTS)
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('ALL')

  useEffect(() => {
    const sb = createClient()
    ;(async () => {
      try {
        const { data } = await sb.from('subjects').select('id, name, code, color, chapters(id, name, topics(id, name, difficulty))').eq('is_active', true).order('sort_order')
        if (data && data.length > 0) setSubjects(data as any)
      } catch { /* use demo data */ }
    })()
  }, [])

  const subjectCodes = ['ALL', ...subjects.map(s => s.code)]
  const filteredSubjects = subjects
    .filter(s => filter === 'ALL' || s.code === filter)
    .map(s => ({
      ...s,
      chapters: s.chapters.map(c => ({
        ...c,
        topics: c.topics.filter(t =>
          !search || t.name.toLowerCase().includes(search.toLowerCase())
        )
      })).filter(c => !search || c.topics.length > 0)
    }))
    .filter(s => !search || s.chapters.length > 0)

  const totalTopics = subjects.reduce((n, s) => n + s.chapters.reduce((m, c) => m + c.topics.length, 0), 0)

  return (
    <div className="p-7 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Practice</h1>
        <p className="text-sm text-gray-500 mt-1">{totalTopics} topics · choose one to start a session</p>
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search topics…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-1.5">
          {subjectCodes.map(code => {
            const sub = subjects.find(s => s.code === code)
            return (
              <button key={code} onClick={() => setFilter(code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${filter === code ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {code === 'ALL' ? 'All' : sub?.name.split(' ')[0] ?? code}
              </button>
            )
          })}
        </div>
      </div>

      {/* Subject sections */}
      <div className="space-y-6">
        {filteredSubjects.map(sub => (
          <div key={sub.id}>
            {/* Subject header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ background: sub.color ?? '#6B7280' }} />
              <h2 className="text-sm font-semibold text-gray-700">{sub.name}</h2>
              <span className="text-xs text-gray-400">
                {sub.chapters.reduce((n, c) => n + c.topics.length, 0)} topics
              </span>
            </div>

            {/* Chapters grid */}
            <div className="space-y-3">
              {sub.chapters.map(ch => (
                <div key={ch.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-4 py-2.5 bg-gray-50/70 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-600">{ch.name}</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {ch.topics.map(topic => (
                      <Link key={topic.id} href={`/student/practice/${topic.id}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50/30 transition-colors group">
                        <div className="flex-1">
                          <p className="text-sm text-gray-800 group-hover:text-blue-700 transition-colors">{topic.name}</p>
                        </div>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${diffStyle[topic.difficulty]}`}>
                          {topic.difficulty}
                        </span>
                        <ChevronRight size={13} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
