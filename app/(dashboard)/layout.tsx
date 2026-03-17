'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import {
  LayoutDashboard, BookOpen, GraduationCap, Users,
  HelpCircle, Calendar, Settings, ChevronRight, Layers
} from 'lucide-react'

const nav = [
  { label: 'Overview',         href: '/overview',           icon: LayoutDashboard },
  { label: 'Exam master',      href: '/admin/exams',        icon: BookOpen },
  { label: 'Subject master',   href: '/admin/subjects',     icon: Layers },
  { label: 'Teacher master',   href: '/admin/teachers',     icon: GraduationCap },
  { label: 'Question bank',    href: '/admin/questions',    icon: HelpCircle },
  { label: 'Events',           href: '/admin/events',       icon: Calendar },
  { label: 'Settings',         href: '/admin/settings',     icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-gray-100">
          <span className="text-base font-semibold tracking-tight text-gray-900">Rankwise</span>
          <span className="ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">ERP</span>
        </div>
        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {nav.map(({ label, href, icon: Icon }) => {
            const active = path === href || path.startsWith(href + '/')
            return (
              <Link key={href} href={href} className={clsx(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}>
                <Icon size={15} />
                {label}
                {active && <ChevronRight size={12} className="ml-auto opacity-50" />}
              </Link>
            )
          })}
        </nav>
        {/* Academy pill */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-gray-50">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">R</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">Demo Academy</p>
              <p className="text-[10px] text-gray-400">Pro plan</p>
            </div>
          </div>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
