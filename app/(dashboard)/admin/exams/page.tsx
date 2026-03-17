'use client'
import { useState } from 'react'
import { Search, Plus, ExternalLink } from 'lucide-react'

const categories = [
  { code: 'SSC',     label: 'SSC',     color: 'bg-blue-100 text-blue-800' },
  { code: 'BANKING', label: 'Banking', color: 'bg-green-100 text-green-800' },
  { code: 'RAILWAY', label: 'Railway', color: 'bg-amber-100 text-amber-800' },
  { code: 'DEFENCE', label: 'Defence', color: 'bg-pink-100 text-pink-800' },
]

const exams = [
  { code: 'SSC_CGL',    name: 'SSC Combined Graduate Level',        category: 'SSC',     body: 'SSC',  marks: 200, duration: 60,  tiers: 4, negative: '0.50', active: true },
  { code: 'SSC_CHSL',   name: 'SSC Combined Higher Secondary Level',category: 'SSC',     body: 'SSC',  marks: 200, duration: 60,  tiers: 3, negative: '0.50', active: true },
  { code: 'SSC_MTS',    name: 'SSC Multi Tasking Staff',            category: 'SSC',     body: 'SSC',  marks: 150, duration: 90,  tiers: 2, negative: '0.25', active: true },
  { code: 'SSC_GD',     name: 'SSC GD Constable',                   category: 'SSC',     body: 'SSC',  marks: 160, duration: 60,  tiers: 1, negative: '0.25', active: true },
  { code: 'SBI_PO',     name: 'SBI Probationary Officer',           category: 'BANKING', body: 'SBI',  marks: 250, duration: 60,  tiers: 3, negative: '0.25', active: true },
  { code: 'SBI_CLERK',  name: 'SBI Clerk (Junior Associate)',       category: 'BANKING', body: 'SBI',  marks: 200, duration: 60,  tiers: 2, negative: '0.25', active: true },
  { code: 'IBPS_PO',    name: 'IBPS Probationary Officer',          category: 'BANKING', body: 'IBPS', marks: 250, duration: 60,  tiers: 3, negative: '0.25', active: true },
  { code: 'IBPS_CLERK', name: 'IBPS Clerk',                        category: 'BANKING', body: 'IBPS', marks: 200, duration: 60,  tiers: 2, negative: '0.25', active: true },
  { code: 'RBI_GRADE_B',name: 'RBI Grade B Officer',               category: 'BANKING', body: 'RBI',  marks: 300, duration: 120, tiers: 3, negative: '0.25', active: true },
  { code: 'RRB_NTPC',   name: 'RRB Non-Technical Popular Categories',category: 'RAILWAY',body: 'RRB',  marks: 150, duration: 90,  tiers: 2, negative: '0.33', active: true },
  { code: 'RRB_GROUP_D',name: 'RRB Group D',                       category: 'RAILWAY', body: 'RRB',  marks: 100, duration: 90,  tiers: 1, negative: '0.33', active: true },
  { code: 'RRB_ALP',    name: 'RRB Assistant Loco Pilot',           category: 'RAILWAY', body: 'RRB',  marks: 150, duration: 60,  tiers: 3, negative: '0.33', active: true },
  { code: 'NDA',        name: 'National Defence Academy',           category: 'DEFENCE', body: 'UPSC', marks: 900, duration: 150, tiers: 2, negative: '0.33', active: true },
  { code: 'CDS',        name: 'Combined Defence Services',          category: 'DEFENCE', body: 'UPSC', marks: 300, duration: 120, tiers: 2, negative: '0.33', active: true },
  { code: 'AFCAT',      name: 'Air Force Common Admission Test',    category: 'DEFENCE', body: 'IAF',  marks: 300, duration: 120, tiers: 2, negative: '0.33', active: true },
  { code: 'AGNIVEER',   name: 'Agniveer (Army/Navy/Air Force)',      category: 'DEFENCE', body: 'MOD',  marks: 200, duration: 60,  tiers: 1, negative: '0.25', active: true },
]

export default function ExamsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')

  const filtered = exams.filter(e =>
    (filter === 'ALL' || e.category === filter) &&
    (e.name.toLowerCase().includes(search.toLowerCase()) || e.code.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Exam master</h1>
          <p className="text-sm text-gray-500 mt-0.5">{exams.length} exams configured across 4 categories</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus size={14} /> Add exam
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Search exams..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-1.5">
          {[{ code: 'ALL', label: 'All', color: '' }, ...categories].map(({ code, label, color }) => (
            <button key={code} onClick={() => setFilter(code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === code
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Exam</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Body</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Marks</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Duration</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tiers</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Negative</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(exam => {
              const cat = categories.find(c => c.code === exam.category)
              return (
                <tr key={exam.code} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{exam.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{exam.code}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${cat?.color}`}>{exam.category}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs font-medium">{exam.body}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{exam.marks}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{exam.duration} min</td>
                  <td className="px-4 py-3 text-right text-gray-700">{exam.tiers}</td>
                  <td className="px-4 py-3 text-right text-gray-500">−{exam.negative}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-gray-400 hover:text-blue-600 transition-colors"><ExternalLink size={13} /></button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
