'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { addQuestion, fetchSubjectTree, type AddQuestionPayload } from '@/lib/questions/service'

interface Props {
  onClose: () => void
  onSaved: () => void
}

const DIFFICULTIES = ['easy','medium','hard'] as const
const TYPES        = ['mcq','true_false','integer','descriptive'] as const

interface Option { text: string; isCorrect: boolean }

export default function AddQuestionForm({ onClose, onSaved }: Props) {
  // subject tree
  const [subjects, setSubjects] = useState<any[]>([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedChapter, setSelectedChapter] = useState('')
  const [selectedTopic, setSelectedTopic]   = useState('')

  // form fields
  const [qText,     setQText]     = useState('')
  const [qType,     setQType]     = useState<typeof TYPES[number]>('mcq')
  const [diff,      setDiff]      = useState<typeof DIFFICULTIES[number]>('medium')
  const [options,   setOptions]   = useState<Option[]>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ])
  const [solution,  setSolution]  = useState('')
  const [videoUrl,  setVideoUrl]  = useState('')
  const [isPyq,     setIsPyq]     = useState(false)
  const [pyqYear,   setPyqYear]   = useState('')
  const [pyqExam,   setPyqExam]   = useState('')
  const [marks,     setMarks]     = useState('1')
  const [tagsRaw,   setTagsRaw]   = useState('')
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')

  useEffect(() => {
    fetchSubjectTree().then(setSubjects).catch(() => {})
  }, [])

  const chapters = subjects.find(s => s.id === selectedSubject)?.chapters ?? []
  const topics   = chapters.find((c: any) => c.id === selectedChapter)?.topics ?? []

  function setCorrect(idx: number) {
    setOptions(opts => opts.map((o, i) => ({ ...o, isCorrect: i === idx })))
  }
  function setOptionText(idx: number, text: string) {
    setOptions(opts => opts.map((o, i) => i === idx ? { ...o, text } : o))
  }
  function addOption() {
    if (options.length < 6) setOptions(opts => [...opts, { text: '', isCorrect: false }])
  }
  function removeOption(idx: number) {
    if (options.length > 2) setOptions(opts => opts.filter((_, i) => i !== idx))
  }

  async function handleSave() {
    setError('')
    if (!qText.trim())       return setError('Question text is required')
    if (!selectedTopic)      return setError('Please select a topic')
    if (qType === 'mcq' && !options.some(o => o.isCorrect))
                              return setError('Mark one option as correct')
    if (qType === 'mcq' && options.some(o => !o.text.trim()))
                              return setError('Fill in all options')

    setSaving(true)
    try {
      const payload: AddQuestionPayload = {
        question_text:   qText.trim(),
        question_type:   qType,
        difficulty:      diff,
        topic_id:        selectedTopic,
        is_pyq:          isPyq,
        pyq_year:        isPyq && pyqYear ? parseInt(pyqYear) : null,
        pyq_exam_code:   isPyq ? pyqExam || null : null,
        solution_text:   solution.trim() || undefined,
        solution_video_url: videoUrl.trim() || undefined,
        marks:           parseFloat(marks) || 1,
        tags:            tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [],
        options:         qType === 'mcq'
                          ? options.map(o => ({ option_text: o.text, is_correct: o.isCorrect }))
                          : [],
      }
      await addQuestion(payload)
      onSaved()
    } catch (e: any) {
      setError(e.message ?? 'Failed to save question')
      setSaving(false)
    }
  }

  const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelCls = "block text-xs font-medium text-gray-600 mb-1"

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.35)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl border border-gray-100 w-full max-w-2xl my-8 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <p className="font-semibold text-gray-900">Add question</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Type + Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Question type</label>
              <select value={qType} onChange={e => setQType(e.target.value as any)} className={inputCls}>
                {TYPES.map(t => <option key={t} value={t}>{t === 'true_false' ? 'True / False' : t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Difficulty</label>
              <div className="flex gap-2">
                {DIFFICULTIES.map(d => (
                  <button key={d} onClick={() => setDiff(d)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      diff === d
                        ? d === 'easy'   ? 'bg-green-50 border-green-300 text-green-700'
                        : d === 'medium' ? 'bg-amber-50 border-amber-300 text-amber-700'
                        :                  'bg-red-50 border-red-300 text-red-700'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >{d}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Subject → Chapter → Topic */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Subject</label>
              <select value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setSelectedChapter(''); setSelectedTopic('') }} className={inputCls}>
                <option value="">Select</option>
                {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Chapter</label>
              <select value={selectedChapter} onChange={e => { setSelectedChapter(e.target.value); setSelectedTopic('') }} className={inputCls} disabled={!selectedSubject}>
                <option value="">Select</option>
                {chapters.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Topic</label>
              <select value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)} className={inputCls} disabled={!selectedChapter}>
                <option value="">Select</option>
                {topics.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          {/* Question text */}
          <div>
            <label className={labelCls}>Question text</label>
            <textarea rows={3} value={qText} onChange={e => setQText(e.target.value)}
              placeholder="Type the question here…"
              className={inputCls + ' resize-none'} />
          </div>

          {/* MCQ Options */}
          {qType === 'mcq' && (
            <div>
              <label className={labelCls}>Options <span className="text-gray-400 font-normal">(click radio to mark correct)</span></label>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-400 w-4">{'ABCD'[i] || i}</span>
                    <input
                      type="radio" name="correct" checked={opt.isCorrect}
                      onChange={() => setCorrect(i)}
                      className="accent-blue-600 flex-shrink-0"
                    />
                    <input type="text" value={opt.text}
                      onChange={e => setOptionText(i, e.target.value)}
                      placeholder={`Option ${'ABCD'[i] || i + 1}`}
                      className={`${inputCls} flex-1`}
                    />
                    {options.length > 2 && (
                      <button onClick={() => removeOption(i)} className="text-gray-300 hover:text-red-400">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
                {options.length < 6 && (
                  <button onClick={addOption}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1">
                    <Plus size={12} /> Add option
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Solution */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Solution / explanation</label>
              <textarea rows={2} value={solution} onChange={e => setSolution(e.target.value)}
                placeholder="Step-by-step solution…"
                className={inputCls + ' resize-none'} />
            </div>
            <div>
              <label className={labelCls}>Solution video URL <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/..." className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Marks</label>
              <input type="number" value={marks} onChange={e => setMarks(e.target.value)}
                step="0.5" min="0.5" className={inputCls} />
            </div>
          </div>

          {/* PYQ toggle */}
          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
            <input type="checkbox" id="pyq" checked={isPyq} onChange={e => setIsPyq(e.target.checked)}
              className="mt-0.5 accent-purple-600" />
            <div className="flex-1">
              <label htmlFor="pyq" className="text-sm font-medium text-purple-800 cursor-pointer">Previous Year Question (PYQ)</label>
              {isPyq && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-xs font-medium text-purple-700 mb-1">Year</label>
                    <input type="number" value={pyqYear} onChange={e => setPyqYear(e.target.value)}
                      placeholder="2023" min="1990" max="2030"
                      className="w-full px-3 py-1.5 text-sm border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-purple-700 mb-1">Exam code</label>
                    <select value={pyqExam} onChange={e => setPyqExam(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white">
                      <option value="">Select exam</option>
                      {['SSC_CGL','SSC_CHSL','SSC_MTS','IBPS_PO','IBPS_CLERK','SBI_PO','SBI_CLERK','RRB_NTPC','RRB_GROUP_D','NDA','CDS','AFCAT','AGNIVEER'].map(c =>
                        <option key={c} value={c}>{c.replace(/_/g,' ')}</option>
                      )}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className={labelCls}>Tags <span className="text-gray-400 font-normal">(comma separated)</span></label>
            <input type="text" value={tagsRaw} onChange={e => setTagsRaw(e.target.value)}
              placeholder="percentage, arithmetic, shortcut"
              className={inputCls} />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
              <span>⚠</span> {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
              {saving ? 'Saving…' : 'Save question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
