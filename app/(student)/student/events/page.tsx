'use client'
import { useState } from 'react'
import { Calendar, Video, MessageCircle, Clock } from 'lucide-react'

const TYPE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  class:         { bg:'bg-blue-50',   text:'text-blue-700',   label:'Live class' },
  mock_test:     { bg:'bg-red-50',    text:'text-red-700',    label:'Mock test' },
  revision:      { bg:'bg-purple-50', text:'text-purple-700', label:'Revision' },
  doubt_session: { bg:'bg-amber-50',  text:'text-amber-700',  label:'Doubt session' },
  announcement:  { bg:'bg-gray-100',  text:'text-gray-700',   label:'Announcement' },
  exam_alert:    { bg:'bg-green-50',  text:'text-green-700',  label:'Exam alert' },
}

const DEMO_EVENTS = [
  { id:'e1', title:'Percentage & Ratio — Live Class', event_type:'class', starts_at: new Date(Date.now()+3600000*2).toISOString(), ends_at: new Date(Date.now()+3600000*3).toISOString(), is_online:true, meeting_url:'https://zoom.us/j/demo', teacher:'Ramesh Sharma', subject:'Quantitative Aptitude', status:'scheduled' },
  { id:'e2', title:'SSC CGL Tier 1 Full Mock Test', event_type:'mock_test', starts_at: new Date(Date.now()+3600000*26).toISOString(), ends_at: new Date(Date.now()+3600000*27.5).toISOString(), is_online:true, meeting_url:null, teacher:null, subject:'All subjects', status:'scheduled' },
  { id:'e3', title:'Reasoning Shortcuts — Revision Session', event_type:'revision', starts_at: new Date(Date.now()+3600000*50).toISOString(), ends_at: new Date(Date.now()+3600000*51).toISOString(), is_online:true, meeting_url:'https://zoom.us/j/demo2', teacher:'Priya Nair', subject:'Reasoning', status:'scheduled' },
  { id:'e4', title:'Weekly Doubt Clearing Session', event_type:'doubt_session', starts_at: new Date(Date.now()+3600000*74).toISOString(), ends_at: new Date(Date.now()+3600000*75.5).toISOString(), is_online:true, meeting_url:'https://meet.jit.si/rankwise-doubts', teacher:'All teachers', subject:'All subjects', status:'scheduled' },
  { id:'e5', title:'SBI PO Prelims — Application open', event_type:'exam_alert', starts_at: new Date(Date.now()-3600000*2).toISOString(), ends_at: null, is_online:false, meeting_url:null, teacher:null, subject:null, status:'completed' },
]

function formatEventTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 0)   return 'Started'
  if (hours < 1)   return 'In ' + Math.floor(diff / 60000) + ' min'
  if (hours < 24)  return 'Today, ' + d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })
  if (hours < 48)  return 'Tomorrow, ' + d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })
  return d.toLocaleDateString('en-IN', { day:'numeric', month:'short' }) + ', ' + d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })
}

export default function StudentEventsPage() {
  const upcoming = DEMO_EVENTS.filter(e => e.status !== 'completed')
  const past     = DEMO_EVENTS.filter(e => e.status === 'completed')

  return (
    <div className="p-7 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Events</h1>
        <p className="text-sm text-gray-500 mt-1">{upcoming.length} upcoming events from your academy</p>
      </div>

      {/* Upcoming */}
      <div className="space-y-3 mb-8">
        {upcoming.map(ev => {
          const style = TYPE_STYLE[ev.event_type]
          return (
            <div key={ev.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-200 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${style.bg}`}>
                  {ev.event_type === 'mock_test' ? <Calendar size={14} className={style.text} />
                   : ev.is_online ? <Video size={14} className={style.text} />
                   : <Calendar size={14} className={style.text} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900">{ev.title}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${style.bg} ${style.text}`}>{style.label}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                      <Clock size={11} /> {formatEventTime(ev.starts_at)}
                    </span>
                    {ev.teacher && <span className="text-xs text-gray-400">{ev.teacher}</span>}
                    {ev.subject  && <span className="text-xs text-gray-400">{ev.subject}</span>}
                  </div>
                </div>
              </div>

              {ev.meeting_url && (
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-3">
                  <a href={ev.meeting_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">
                    <Video size={11} /> Join class
                  </a>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50">
                    <MessageCircle size={11} /> WhatsApp reminder
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Past events</h2>
          <div className="space-y-2">
            {past.map(ev => {
              const style = TYPE_STYLE[ev.event_type]
              return (
                <div key={ev.id} className="bg-gray-50 rounded-xl border border-gray-100 p-3 opacity-70">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>{style.label}</span>
                    <p className="text-sm text-gray-700 flex-1">{ev.title}</p>
                    <span className="text-xs text-gray-400">{new Date(ev.starts_at).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
