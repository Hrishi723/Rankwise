'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { LayoutDashboard, BookOpen, BarChart2, Calendar, Zap, Sparkles } from 'lucide-react'

const nav = [
  { label: 'Dashboard',  href: '/student/dashboard', icon: LayoutDashboard },
  { label: 'Practice',   href: '/student/practice',  icon: BookOpen },
  { label: 'Visual Solve', href: '/student/solve',   icon: Sparkles, highlight: true },
  { label: 'Progress',   href: '/student/progress',  icon: BarChart2 },
  { label: 'Events',     href: '/student/events',    icon: Calendar },
]

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-52 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        <div className="h-14 flex items-center px-5 border-b border-gray-100 gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <Zap size={14} className="text-white" fill="white" />
          </div>
          <span className="text-base font-semibold tracking-tight text-gray-900">Rankwise</span>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {nav.map(({ label, href, icon: Icon, highlight }) => {
            const active = path === href || path.startsWith(href + '/')
            return (
              <Link key={href} href={href} className={clsx(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors',
                active
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : (highlight && !active)
                  ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}>
                <Icon size={15} />
                {label}
                {highlight && !active && <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 bg-blue-600 text-white rounded-full">AI</span>}
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <Link href="/overview" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
            <span>&#8594;</span> Admin panel
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
