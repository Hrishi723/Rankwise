'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Upload, Search, X, SlidersHorizontal } from 'lucide-react'
import {
  fetchQuestions, fetchSubjectTree, fetchBankStats, deleteQuestion,
  type QuestionWithMeta, type QuestionFilters
} from '@/lib/questions/service'
import BankStats       from '@/components/questions/BankStats'
import QuestionCard    from '@/components/questions/QuestionCard'
import TopicBrowser    from '@/components/questions/TopicBrowser'
import AddQuestionForm from '@/components/questions/AddQuestionForm'
import BulkUploadModal from '@/components/questions/BulkUploadModal'

const PYQ_OPTIONS  = [
  { value: 'all',  label: 'All' },
  { value: 'pyq',  label: 'PYQ only' },
  { value: 'new',  label: 'Non-PYQ' },
]
const TYPE_OPTIONS = [
  { value: '',           label: 'All types' },
  { value: 'mcq',        label: 'MCQ' },
  { value: 'integer',    label: 'Integer' },
  { value: 'descriptive',label: 'Descriptive' },
]

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<QuestionWithMeta[]>([])
  const [stats,     setStats]     = useState<any>(null)
  const [subjects,  setSubjects]  = useState<any[]>([])
  const [topicMap,  setTopicMap]  = useState<Record<string,string>>({})
  const [total,     setTotal]     = useState(0)
  const [loading,   setLoading]   = useState(true)
  const [search,      setSearch]      = useState('')
  const [difficulty,  setDifficulty]  = useState<'' | 'easy' | 'medium' | 'hard'>('')
  const [qtype,       setQtype]       = useState('')
  const [pyqFilter,   setPyqFilter]   = useState('all')
  const [topicId,     setTopicId]     = useState<string | null>(null)
  const [page,        setPage]        = useState(1)
  const [showAdd,    setShowAdd]    = useState(false)
  const [showBulk,   setShowBulk]   = useState(false)
  const [showSidebar,setShowSidebar]= useState(true)
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    fetchSubjectTree().then(subs => {
      setSubjects(subs)
      const map: Record<string,string> = {}
      subs.forEach((sub: any) => {
        sub.chapters?.forEach((ch: any) => {
          ch.topics?.forEach((t: any) => { map[t.name.toLowerCase()] = t.id })
        })
      })
      setTopicMap(map)
    }).catch(() => {})
    fetchBankStats().then(setStats).catch(() => {})
  }, [])

  const loadQuestions = useCallback(async (filters: QuestionFilters) => {
    setLoading(true)
    try {
      const res = await fetchQuestions(filters)
      setQuestions(res.questions)
      setTotal(res.total)
    } catch { setQuestions([]); setTotal(0) }
    setLoading(false)
  }, [])

  useEffect(() => {
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      loadQuestions({
        search: search || undefined,
        difficulty: difficulty || undefined,
        type: qtype as any || undefined,
        is_pyq: pyqFilter === 'pyq' ? true : pyqFilter === 'new' ? false : null,
        topic_id: topicId ?? undefined,
        page, per_page: 20,
      })
    }, 300)
  }, [search, difficulty, qtype, pyqFilter, topicId, page, loadQuestions])

  function handleDelete(id: string) {
    if (!confirm('Delete this question?')) return
    deleteQuestion(id).then(() => {
      setQuestions(qs => qs.filter(q => q.id !== id))
      setTotal(t => t - 1)
      fetchBankStats().then(setStats).catch(() => {})
    }).catch(() => {})
  }

  function handleSaved() {
    setShowAdd(false); setPage(1)
    loadQuestions({ page: 1, per_page: 20 })
    fetchBankStats().then(setStats).catch(() => {})
  }

  function handleBulkDone() {
    setShowBulk(false); setPage(1)
    loadQuestions({ page: 1, per_page: 20 })
    fetchBankStats().then(setStats).catch(() => {})
  }

  function clearFilters() { setSearch(''); setDifficulty(''); setQtype(''); setPyqFilter('all'); setTopicId(null); setPage(1) }
  const hasFilters = search || difficulty || qtype || pyqFilter !== 'all' || topicId

  const SEED: QuestionWithMeta[] = [
    { id:'1', question_text:'What is 15% of 240?', question_type:'mcq', difficulty:'easy', is_pyq:true, pyq_year:2022, pyq_exam_code:'SSC_CGL', solution_text:'15% of 240 = 36', solution_video_url:null, marks:1, time_limit_secs:90, tags:['percentage'], topic_id:'t1', is_active:true, created_at:new Date().toISOString(), topic_name:'Basic percentage concepts', chapter_name:'Percentage', subject_name:'Quantitative Aptitude', subject_code:'MATHS', subject_color:'#3B82F6', options:[{id:'o1',option_text:'32',is_correct:false,sort_order:0},{id:'o2',option_text:'36',is_correct:true,sort_order:1},{id:'o3',option_text:'38',is_correct:false,sort_order:2},{id:'o4',option_text:'42',is_correct:false,sort_order:3}] },
    { id:'2', question_text:'If 35% of a number is 84, what is the number?', question_type:'mcq', difficulty:'easy', is_pyq:false, pyq_year:null, pyq_exam_code:null, solution_text:'Number = 84 × (100/35) = 240', solution_video_url:null, marks:1, time_limit_secs:90, tags:['percentage'], topic_id:'t1', is_active:true, created_at:new Date().toISOString(), topic_name:'Basic percentage concepts', chapter_name:'Percentage', subject_name:'Quantitative Aptitude', subject_code:'MATHS', subject_color:'#3B82F6', options:[{id:'o5',option_text:'220',is_correct:false,sort_order:0},{id:'o6',option_text:'240',is_correct:true,sort_order:1},{id:'o7',option_text:'260',is_correct:false,sort_order:2},{id:'o8',option_text:'280',is_correct:false,sort_order:3}] },
    { id:'3', question_text:'A student scored 540 out of 750. What percentage did she score?', question_type:'mcq', difficulty:'easy', is_pyq:true, pyq_year:2023, pyq_exam_code:'RRB_NTPC', solution_text:'(540/750) × 100 = 72%', solution_video_url:null, marks:1, time_limit_secs:90, tags:['percentage'], topic_id:'t1', is_active:true, created_at:new Date().toISOString(), topic_name:'Basic percentage concepts', chapter_name:'Percentage', subject_name:'Quantitative Aptitude', subject_code:'MATHS', subject_color:'#3B82F6', options:[{id:'o9',option_text:'68%',is_correct:false,sort_order:0},{id:'o10',option_text:'70%',is_correct:false,sort_order:1},{id:'o11',option_text:'72%',is_correct:true,sort_order:2},{id:'o12',option_text:'75%',is_correct:false,sort_order:3}] },
  ]

  const displayQ = questions.length > 0 ? questions : (loading ? [] : SEED)
  const displayTotal = questions.length > 0 ? total : SEED.length
  const PER_PAGE = 20
  const totalPages = Math.ceil(displayTotal / PER_PAGE)

  return (
    <div className="flex h-full">
      {showSidebar && (
        <div className="w-56 flex-shrink-0 border-r border-gray-100 p-3">
          <TopicBrowser subjects={subjects} selectedTopicId={topicId} onSelectTopic={(id) => { setTopicId(id); setPage(1) }} />
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSidebar(s => !s)} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
              <SlidersHorizontal size={14} />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Question bank</h1>
              <p className="text-xs text-gray-400 mt-0.5">{displayTotal.toLocaleString()} questions</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowBulk(true)} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
              <Upload size={13} /> Bulk upload
            </button>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              <Plus size={13} /> Add question
            </button>
          </div>
        </div>

        <BankStats stats={stats ?? { total: displayTotal, easy: 3, medium: 0, hard: 0, pyq: 2, mcq: 3, topics_covered: 1 }} />

        <div className="bg-white rounded-xl border border-gray-100 p-3 mb-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search questions, solutions, tags…" className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-1">
            {(['all','easy','medium','hard'] as const).map(d => (
              <button key={d} onClick={() => { setDifficulty(d === 'all' ? '' : d as any); setPage(1) }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${ (difficulty === d || (d === 'all' && !difficulty)) ? d === 'easy' ? 'bg-green-50 border-green-300 text-green-700' : d === 'medium' ? 'bg-amber-50 border-amber-300 text-amber-700' : d === 'hard' ? 'bg-red-50 border-red-300 text-red-700' : 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50' }`}>
                {d === 'all' ? 'All' : d}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {PYQ_OPTIONS.map(o => (
              <button key={o.value} onClick={() => { setPyqFilter(o.value); setPage(1) }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${pyqFilter === o.value ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                {o.label}
              </button>
            ))}
          </div>
          <select value={qtype} onChange={e => { setQtype(e.target.value); setPage(1) }} className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 bg-white">
            {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-500 hover:text-red-600 border border-gray-200 rounded-lg hover:border-red-200 hover:bg-red-50 transition-colors">
              <X size={11} /> Clear
            </button>
          )}
        </div>

        {(topicId || search) && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {topicId && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-100 text-blue-700 text-xs rounded-full">Topic filtered <button onClick={() => setTopicId(null)}><X size={10}/></button></span>}
            {search && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">"{search}" <button onClick={() => setSearch('')}><X size={10}/></button></span>}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-white rounded-xl border border-gray-100 animate-pulse" />)}</div>
        ) : displayQ.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
            <p className="text-gray-500 font-medium">No questions found</p>
            <p className="text-gray-400 text-sm mt-1">Try clearing filters or add questions</p>
            <button onClick={() => setShowAdd(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Add first question</button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayQ.map((q, i) => <QuestionCard key={q.id} question={q} index={(page-1)*PER_PAGE+i+1} onDelete={handleDelete} onEdit={() => {}} />)}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE,displayTotal)} of {displayTotal.toLocaleString()}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40">← Prev</button>
              {[...Array(Math.min(5,totalPages))].map((_,i) => { const p=Math.max(1,page-2)+i; if(p>totalPages) return null; return <button key={p} onClick={() => setPage(p)} className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${p===page?'bg-blue-600 text-white border-blue-600':'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{p}</button> })}
              <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>

      {showAdd && <AddQuestionForm onClose={() => setShowAdd(false)} onSaved={handleSaved} />}
      {showBulk && <BulkUploadModal topicMap={topicMap} onClose={() => setShowBulk(false)} onDone={handleBulkDone} />}
    </div>
  )
}
