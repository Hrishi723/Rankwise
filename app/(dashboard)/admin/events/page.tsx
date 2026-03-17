'use client'
import { useState } from 'react'
import { Plus, Calendar, Video, MessageCircle } from 'lucide-react'

const eventTypes = [
  { value: 'class',         label: 'Live class',      color: 'bg-blue-100 text-blue-700' },
  { value: 'mock_test',     label: 'Mock test',       color: 'bg-red-100 text-red-700' },
  { value: 'revision',      label: 'Revision',        color: 'bg-purple-100 text-purple-700' },
  { value: 'doubt_session', label: 'Doubt session',   color: 'bg-amber-100 text-amber-700' },
  { value: 'announcement',  label: 'Announcement',    color: 'bg-gray-100 text-gray-700' },
  { value: 'exam_alert',    label: 'Exam alert',      color: 'bg-green-100 text-green-700' },
]

export default function EventsPage() {
  const [showForm, setShowForm] = useState(false)
  const events: any[] = []

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Event master</h1>
          <p className="text-sm text-gray-500 mt-0.5">Classes, tests, doubt sessions — with WhatsApp notifications</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={14} /> Create event
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Create event</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
              <input type="text" placeholder="e.g. Percentage chapter — live class"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Event type</label>
              <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                {eventTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Exam</label>
              <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All exams</option>
                <option>SSC CGL</option><option>IBPS PO</option><option>RRB NTPC</option><option>NDA</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Start date & time</label>
              <input type="datetime-local"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">End date & time</label>
              <input type="datetime-local"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Meeting URL</label>
              <input type="url" placeholder="https://zoom.us/j/..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">WhatsApp group ID</label>
              <input type="text" placeholder="Group ID to notify"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <MessageCircle size={15} className="text-green-600 flex-shrink-0" />
            <div className="flex items-center gap-2 flex-1">
              <input type="checkbox" id="wa-notify" className="rounded" />
              <label htmlFor="wa-notify" className="text-sm text-green-700">Send WhatsApp notification to batch group when event is created</label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Create event</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {events.length === 0 && !showForm && (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <Calendar size={20} className="text-blue-500" />
          </div>
          <p className="text-gray-700 font-medium mb-1">No events scheduled</p>
          <p className="text-gray-400 text-sm mb-4">Create your first class, test, or announcement</p>
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            Create first event
          </button>
        </div>
      )}

      {/* Event type legend */}
      <div className="mt-6 bg-white rounded-xl border border-gray-100 p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Event types</p>
        <div className="flex flex-wrap gap-2">
          {eventTypes.map(t => (
            <span key={t.value} className={`text-xs font-medium px-2.5 py-1 rounded-lg ${t.color}`}>{t.label}</span>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
          <MessageCircle size={12} className="text-green-500" />
          Events with WhatsApp group ID will send automatic notifications via WhatsApp Business API (Phase 5)
        </div>
      </div>
    </div>
  )
}
