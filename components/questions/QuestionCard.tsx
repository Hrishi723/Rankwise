'use client'
import { useState } from 'react'
import { ChevronDown, ChevronUp, Trash2, Pencil, Play } from 'lucide-react'
import type { QuestionWithMeta } from '@/lib/questions/service'

const diffStyle: Record<string, string> = {
  easy:   'bg-green-50 text-green-700 border-green-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  hard:   'bg-red-50 text-red-700 border-red-200',
}

interface Props {
  question: QuestionWithMeta
  index: number
  onDelete?: (id: string) => void
  onEdit?: (id: string) => void
}

export default function QuestionCard({ question: q, index, onDelete, onEdit }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden transition-shadow hover:shadow-sm">
      {/* Header row */}
      <div
        className="flex items-start gap-3 p-4 cursor-pointer select-none"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-xs text-gray-300 font-mono mt-0.5 min-w-[28px] text-right">{index}</span>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 leading-snug">{q.question_text}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {/* Difficulty */}
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${diffStyle[q.difficulty]}`}>
              {q.difficulty}
            </span>
            {/* Subject → topic breadcrumb */}
            <span className="text-[10px] text-gray-400">
              {q.subject_name} › {q.chapter_name} › {q.topic_name}
            </span>
            {/* PYQ badge */}
            {q.is_pyq && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                PYQ {q.pyq_year}{q.pyq_exam_code ? ` · ${q.pyq_exam_code}` : ''}
              </span>
            )}
            {/* Tags */}
            {q.tags?.map(tag => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-50 text-gray-400 border border-gray-100">{tag}</span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          <span className="text-xs text-gray-300">{q.marks}m</span>
          {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </div>

      {/* Expanded: options + solution */}
      {open && (
        <div className="border-t border-gray-50 bg-gray-50/40 p-4">
          {/* MCQ options */}
          {q.question_type === 'mcq' && q.options.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {q.options.map((opt, i) => (
                <div
                  key={opt.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
                    opt.is_correct
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-white border-gray-100 text-gray-600'
                  }`}
                >
                  <span className="text-xs font-mono text-gray-300 w-4">{'ABCD'[i]}.</span>
                  <span className="flex-1">{opt.option_text}</span>
                  {opt.is_correct && <span className="text-green-500 text-xs font-medium">✓</span>}
                </div>
              ))}
            </div>
          )}

          {/* Solution */}
          {q.solution_text && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs font-semibold text-blue-700 mb-1">Solution</p>
              <p className="text-sm text-blue-800 leading-relaxed">{q.solution_text}</p>
            </div>
          )}

          {/* Video link */}
          {q.solution_video_url && (
            <a
              href={q.solution_video_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline mb-3"
            >
              <Play size={11} /> Watch solution video
            </a>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            {onEdit && (
              <button
                onClick={() => onEdit(q.id)}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-white transition-colors"
              >
                <Pencil size={11} /> Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(q.id)}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 border border-red-100 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={11} /> Delete
              </button>
            )}
            <span className="ml-auto text-[10px] text-gray-300 self-center">
              {new Date(q.created_at).toLocaleDateString('en-IN')}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
