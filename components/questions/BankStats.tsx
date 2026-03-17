'use client'

interface Stats {
  total: number; easy: number; medium: number; hard: number
  pyq: number; mcq: number; topics_covered: number
}

export default function BankStats({ stats }: { stats: Stats | null }) {
  if (!stats) return null
  const items = [
    { label: 'Total questions', value: stats.total,          color: 'text-gray-900' },
    { label: 'Easy',            value: stats.easy,           color: 'text-green-600' },
    { label: 'Medium',          value: stats.medium,         color: 'text-amber-600' },
    { label: 'Hard',            value: stats.hard,           color: 'text-red-600' },
    { label: 'PYQ',             value: stats.pyq,            color: 'text-purple-600' },
    { label: 'MCQ',             value: stats.mcq,            color: 'text-blue-600' },
    { label: 'Topics covered',  value: stats.topics_covered, color: 'text-teal-600' },
  ]
  return (
    <div className="grid grid-cols-7 gap-0 bg-white rounded-xl border border-gray-100 overflow-hidden mb-5">
      {items.map(({ label, value, color }, i) => (
        <div key={label} className={`py-3 px-4 text-center ${i < items.length - 1 ? 'border-r border-gray-100' : ''}`}>
          <p className={`text-xl font-semibold ${color}`}>{value.toLocaleString()}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  )
}
