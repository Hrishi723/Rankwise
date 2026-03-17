'use client'
import { useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'

interface Topic   { id: string; name: string; difficulty: string }
interface Chapter { id: string; name: string; topics: Topic[] }
interface Subject { id: string; name: string; code: string; color: string | null; chapters: Chapter[] }

interface Props {
  subjects: Subject[]
  selectedTopicId: string | null
  onSelectTopic: (id: string | null) => void
}

export default function TopicBrowser({ subjects, selectedTopicId, onSelectTopic }: Props) {
  const [openSubjects, setOpenSubjects] = useState<Set<string>>(new Set())
  const [openChapters, setOpenChapters] = useState<Set<string>>(new Set())

  function toggleSubject(id: string) {
    setOpenSubjects(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }
  function toggleChapter(id: string) {
    setOpenChapters(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Browse by topic</p>
      </div>
      <div className="overflow-y-auto max-h-[calc(100vh-240px)]">
        {/* All option */}
        <button
          onClick={() => onSelectTopic(null)}
          className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${
            selectedTopicId === null ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          All questions
        </button>

        {subjects.map(sub => {
          const subOpen = openSubjects.has(sub.id)
          return (
            <div key={sub.id}>
              {/* Subject row */}
              <button
                onClick={() => toggleSubject(sub.id)}
                className="w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: sub.color ?? '#6B7280' }}
                />
                <span className="text-xs font-semibold text-gray-700 flex-1">{sub.name}</span>
                {subOpen
                  ? <ChevronDown size={12} className="text-gray-400" />
                  : <ChevronRight size={12} className="text-gray-400" />}
              </button>

              {subOpen && sub.chapters.map(ch => {
                const chOpen = openChapters.has(ch.id)
                return (
                  <div key={ch.id}>
                    {/* Chapter row */}
                    <button
                      onClick={() => toggleChapter(ch.id)}
                      className="w-full text-left pl-8 pr-4 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-xs text-gray-600 flex-1">{ch.name}</span>
                      {chOpen
                        ? <ChevronDown size={11} className="text-gray-400" />
                        : <ChevronRight size={11} className="text-gray-400" />}
                    </button>

                    {/* Topics */}
                    {chOpen && ch.topics.map(topic => (
                      <button
                        key={topic.id}
                        onClick={() => onSelectTopic(topic.id === selectedTopicId ? null : topic.id)}
                        className={`w-full text-left pl-12 pr-4 py-1.5 flex items-center gap-2 transition-colors text-xs ${
                          topic.id === selectedTopicId
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }`}
                      >
                        <span className="flex-1 truncate">{topic.name}</span>
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
