'use client'
import { useState, useRef } from 'react'
import { Upload, X, CheckCircle, AlertCircle, Download, ChevronDown } from 'lucide-react'
import { parseCSV, generateTemplateCSV, type ParseResult } from '@/lib/questions/csv-parser'
import { addQuestion } from '@/lib/questions/service'

interface Props {
  topicMap: Record<string, string>   // topic_name → topic_id
  onClose: () => void
  onDone: (count: number) => void
}

type Stage = 'idle' | 'parsed' | 'uploading' | 'done'

export default function BulkUploadModal({ topicMap, onClose, onDone }: Props) {
  const [stage, setStage] = useState<Stage>('idle')
  const [parsed, setParsed] = useState<ParseResult | null>(null)
  const [progress, setProgress] = useState(0)
  const [uploadErrors, setUploadErrors] = useState<{ row: number; message: string }[]>([])
  const [showErrors, setShowErrors] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function downloadTemplate() {
    const csv = generateTemplateCSV()
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'rankwise_questions_template.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  function handleFile(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const result = parseCSV(text)
      setParsed(result)
      setStage('parsed')
    }
    reader.readAsText(file)
  }

  async function handleUpload() {
    if (!parsed) return
    setStage('uploading')
    setProgress(0)
    const errs: typeof uploadErrors = []
    let success = 0

    for (let i = 0; i < parsed.rows.length; i++) {
      const row = parsed.rows[i]
      const topicId = topicMap[row.topic_name.toLowerCase().trim()]
      if (!topicId) {
        errs.push({ row: i + 2, message: `Topic not found: "${row.topic_name}"` })
        setProgress(Math.round(((i + 1) / parsed.rows.length) * 100))
        continue
      }
      try {
        await addQuestion({
          question_text:  row.question_text,
          question_type:  'mcq',
          difficulty:     row.difficulty,
          topic_id:       topicId,
          is_pyq:         row.is_pyq,
          pyq_year:       row.pyq_year,
          pyq_exam_code:  row.pyq_exam_code,
          solution_text:  row.solution_text,
          tags:           row.tags,
          options:        row.options,
        })
        success++
      } catch (err: any) {
        errs.push({ row: i + 2, message: err.message ?? 'Unknown error' })
      }
      setProgress(Math.round(((i + 1) / parsed.rows.length) * 100))
    }

    setUploadErrors(errs)
    setStage('done')
    if (success > 0) onDone(success)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.35)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl border border-gray-100 w-full max-w-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="font-semibold text-gray-900">Bulk question upload</p>
            <p className="text-xs text-gray-400 mt-0.5">Upload a CSV to import questions in bulk</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Template download */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
            <div>
              <p className="text-sm font-medium text-blue-800">Download template CSV</p>
              <p className="text-xs text-blue-600 mt-0.5">Includes all required columns with 2 example rows</p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"
            >
              <Download size={12} /> Template
            </button>
          </div>

          {/* Upload zone */}
          {stage === 'idle' && (
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
            >
              <Upload size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-600 font-medium">Drop your CSV here</p>
              <p className="text-xs text-gray-400 mt-1">or click to browse</p>
              <input ref={fileRef} type="file" accept=".csv" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
            </div>
          )}

          {/* Parse result */}
          {stage === 'parsed' && parsed && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl text-center">
                  <p className="text-xl font-semibold text-gray-900">{parsed.total}</p>
                  <p className="text-xs text-gray-400">Total rows</p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl text-center">
                  <p className="text-xl font-semibold text-green-700">{parsed.valid}</p>
                  <p className="text-xs text-green-600">Valid</p>
                </div>
                <div className="p-3 bg-red-50 rounded-xl text-center">
                  <p className="text-xl font-semibold text-red-700">{parsed.errors.length}</p>
                  <p className="text-xs text-red-500">Errors</p>
                </div>
              </div>

              {parsed.errors.length > 0 && (
                <div className="border border-red-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowErrors(s => !s)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-red-50 text-sm text-red-700"
                  >
                    <span className="font-medium">{parsed.errors.length} parse errors</span>
                    <ChevronDown size={14} className={showErrors ? 'rotate-180' : ''} />
                  </button>
                  {showErrors && (
                    <div className="max-h-36 overflow-y-auto divide-y divide-red-50">
                      {parsed.errors.map((e, i) => (
                        <div key={i} className="px-4 py-2 text-xs text-red-600">
                          <span className="font-mono text-red-400 mr-2">Row {e.row}:</span>{e.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => { setStage('idle'); setParsed(null) }}
                  className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                  Choose another file
                </button>
                <button
                  onClick={handleUpload}
                  disabled={parsed.valid === 0}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  Upload {parsed.valid} questions →
                </button>
              </div>
            </div>
          )}

          {/* Uploading progress */}
          {stage === 'uploading' && (
            <div className="space-y-3 py-4">
              <p className="text-sm text-center text-gray-600">Uploading questions…</p>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-center text-gray-400">{progress}% complete</p>
            </div>
          )}

          {/* Done */}
          {stage === 'done' && (
            <div className="py-4 text-center space-y-3">
              <CheckCircle size={40} className="text-green-500 mx-auto" />
              <div>
                <p className="font-semibold text-gray-900">Upload complete</p>
                <p className="text-sm text-gray-500 mt-1">
                  {parsed!.valid - uploadErrors.length} questions added successfully
                  {uploadErrors.length > 0 ? `, ${uploadErrors.length} failed` : ''}
                </p>
              </div>
              {uploadErrors.length > 0 && (
                <div className="text-left border border-red-100 rounded-xl max-h-32 overflow-y-auto">
                  {uploadErrors.map((e, i) => (
                    <div key={i} className="px-4 py-2 text-xs text-red-600 border-b border-red-50 last:border-0">
                      <span className="font-mono text-red-400 mr-2">Row {e.row}:</span>{e.message}
                    </div>
                  ))}
                </div>
              )}
              <button onClick={onClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
