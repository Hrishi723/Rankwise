import { BookOpen, Users, HelpCircle, Calendar, TrendingUp, Layers } from 'lucide-react'

const stats = [
  { label: 'Exams configured', value: '16', icon: BookOpen,    color: 'bg-blue-50 text-blue-600' },
  { label: 'Subjects',         value: '10', icon: Layers,      color: 'bg-purple-50 text-purple-600' },
  { label: 'Questions',        value: '3',  icon: HelpCircle,  color: 'bg-amber-50 text-amber-600' },
  { label: 'Teachers',         value: '0',  icon: Users,       color: 'bg-green-50 text-green-600' },
  { label: 'Events',           value: '0',  icon: Calendar,    color: 'bg-pink-50 text-pink-600' },
  { label: 'Students',         value: '0',  icon: TrendingUp,  color: 'bg-teal-50 text-teal-600' },
]

const exams = [
  { category: 'SSC',     exams: ['CGL', 'CHSL', 'MTS', 'GD Constable'],         color: 'bg-blue-100 text-blue-800' },
  { category: 'Banking', exams: ['SBI PO', 'SBI Clerk', 'IBPS PO', 'IBPS Clerk', 'RBI Grade B'], color: 'bg-green-100 text-green-800' },
  { category: 'Railway', exams: ['RRB NTPC', 'Group D', 'ALP'],                  color: 'bg-amber-100 text-amber-800' },
  { category: 'Defence', exams: ['NDA', 'CDS', 'AFCAT', 'Agniveer'],             color: 'bg-pink-100 text-pink-800' },
]

const quickActions = [
  { label: 'Add teacher',    href: '/admin/teachers/new',   desc: 'Onboard a faculty member' },
  { label: 'Add question',   href: '/admin/questions/new',  desc: 'Add to question bank' },
  { label: 'Create event',   href: '/admin/events/new',     desc: 'Schedule a class or test' },
  { label: 'Create batch',   href: '/admin/batches/new',    desc: 'Group students by exam' },
]

export default function OverviewPage() {
  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome to Rankwise ERP — Phase 1 is live.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
              <Icon size={16} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Exams configured */}
        <div className="col-span-3 bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Exams configured</h2>
          <div className="space-y-3">
            {exams.map(({ category, exams: list, color }) => (
              <div key={category} className="flex items-start gap-3">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md min-w-[62px] text-center ${color}`}>
                  {category}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {list.map(e => (
                    <span key={e} className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-md border border-gray-100">{e}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Quick actions</h2>
          <div className="space-y-2">
            {quickActions.map(({ label, href, desc }) => (
              <a key={href} href={href} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                <span className="text-gray-300 group-hover:text-gray-500 text-base">→</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Phase roadmap */}
      <div className="mt-6 bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Build roadmap</h2>
        <div className="flex gap-3 flex-wrap">
          {[
            { phase: 'Phase 1', label: 'Foundation + Masters',      status: 'done' },
            { phase: 'Phase 2', label: 'Question bank engine',       status: 'next' },
            { phase: 'Phase 3', label: 'Student app',                status: 'upcoming' },
            { phase: 'Phase 4', label: 'Visual maths AI',            status: 'upcoming' },
            { phase: 'Phase 5', label: 'Doubt + WhatsApp',           status: 'upcoming' },
            { phase: 'Phase 6', label: 'Current affairs engine',     status: 'upcoming' },
            { phase: 'Phase 7', label: 'Mock tests + analytics',     status: 'upcoming' },
          ].map(({ phase, label, status }) => (
            <div key={phase} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border
              ${status === 'done'     ? 'bg-green-50 border-green-200 text-green-700' :
                status === 'next'     ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                        'bg-gray-50 border-gray-100 text-gray-400'}`}>
              <span className="font-semibold">{phase}</span>
              <span>{label}</span>
              {status === 'done' && <span className="text-green-500 font-bold">✓</span>}
              {status === 'next' && <span className="text-blue-400 text-[10px] font-medium">next</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Student app shortcut */}
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-blue-900">Student app</p>
          <p className="text-xs text-blue-600 mt-0.5">View the student-facing dashboard, practice engine, and progress tracker</p>
        </div>
        <a href="/student/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex-shrink-0">
          Open app →
        </a>
      </div>
    </div>
  )
}
