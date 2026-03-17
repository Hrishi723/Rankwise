'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'

const subjects = [
  { code: 'MATHS',      name: 'Quantitative Aptitude', desc: 'Arithmetic, Algebra, Geometry, Mensuration, DI', color: '#3B82F6', shared: true,  chapters: 19, topics: 16, exams: ['SSC','BANKING','RAILWAY','DEFENCE'] },
  { code: 'REASONING',  name: 'Reasoning',              desc: 'Verbal, Non-Verbal, Logical, Analytical',       color: '#8B5CF6', shared: true,  chapters: 15, topics: 0,  exams: ['SSC','BANKING','RAILWAY','DEFENCE'] },
  { code: 'GK',         name: 'General Awareness',      desc: 'Current Affairs, History, Polity, Geography',   color: '#F59E0B', shared: true,  chapters: 15, topics: 0,  exams: ['SSC','BANKING','RAILWAY','DEFENCE'] },
  { code: 'ENGLISH',    name: 'English Language',        desc: 'Grammar, Vocabulary, Comprehension',            color: '#10B981', shared: false, chapters: 10, topics: 0,  exams: ['SSC','BANKING','DEFENCE'] },
  { code: 'HINDI',      name: 'Hindi Language',          desc: 'Hindi Grammar, Comprehension, Translation',     color: '#EF4444', shared: false, chapters: 0,  topics: 0,  exams: ['SSC','RAILWAY'] },
  { code: 'COMPUTER',   name: 'Computer Awareness',      desc: 'Basics, MS Office, Internet, Networking',       color: '#6366F1', shared: false, chapters: 0,  topics: 0,  exams: ['BANKING'] },
  { code: 'BANKING',    name: 'Banking & Economy',       desc: 'RBI Policy, Markets, Banking Awareness',        color: '#14B8A6', shared: false, chapters: 0,  topics: 0,  exams: ['BANKING'] },
  { code: 'SCIENCE',    name: 'General Science',         desc: 'Physics, Chemistry, Biology — class 10+2',      color: '#84CC16', shared: false, chapters: 0,  topics: 0,  exams: ['RAILWAY','DEFENCE'] },
  { code: 'MATHS_ADV',  name: 'Advanced Mathematics',   desc: 'Calculus, Statistics, Matrices, Vectors',       color: '#F97316', shared: false, chapters: 0,  topics: 0,  exams: ['DEFENCE'] },
  { code: 'DESCRIPTIVE',name: 'Descriptive Writing',    desc: 'Essay, Letter, Precis Writing',                 color: '#A78BFA', shared: false, chapters: 0,  topics: 0,  exams: ['BANKING','DEFENCE'] },
]

const catColors: Record<string, string> = {
  SSC:     'bg-blue-100 text-blue-800',
  BANKING: 'bg-green-100 text-green-800',
  RAILWAY: 'bg-amber-100 text-amber-800',
  DEFENCE: 'bg-pink-100 text-pink-800',
}

export default function SubjectsPage() {
  const [filter, setFilter] = useState('ALL')

  const filtered = subjects.filter(s =>
    filter === 'ALL' ? true :
    filter === 'SHARED' ? s.shared :
    s.exams.includes(filter)
  )

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Subject master</h1>
          <p className="text-sm text-gray-500 mt-0.5">{subjects.length} subjects · {subjects.filter(s=>s.shared).length} shared across exams</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus size={14} /> Add subject
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5">
        {['ALL','SHARED','SSC','BANKING','RAILWAY','DEFENCE'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {f === 'ALL' ? 'All' : f === 'SHARED' ? 'Shared' : f}
          </button>
        ))}
      </div>

      {/* Subject cards */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map(s => (
          <div key={s.code} className="bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-200 transition-colors cursor-pointer">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ backgroundColor: s.color + '22' }}>
                <div className="w-full h-full rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 text-sm">{s.name}</p>
                  {s.shared && <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-teal-50 text-teal-600 font-medium">shared</span>}
                </div>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{s.desc}</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 mb-3">
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-800">{s.chapters}</p>
                <p className="text-[10px] text-gray-400">Chapters</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-800">{s.topics}</p>
                <p className="text-[10px] text-gray-400">Topics</p>
              </div>
              <div className="flex-1" />
              <code className="text-[10px] bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded font-mono">{s.code}</code>
            </div>

            {/* Exam tags */}
            <div className="flex flex-wrap gap-1">
              {s.exams.map(e => (
                <span key={e} className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${catColors[e]}`}>{e}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
