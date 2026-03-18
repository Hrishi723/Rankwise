'use client'

const COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  blue:   { fill: '#EFF6FF', stroke: '#3B82F6', text: '#1D4ED8' },
  green:  { fill: '#F0FDF4', stroke: '#22C55E', text: '#15803D' },
  red:    { fill: '#FEF2F2', stroke: '#EF4444', text: '#B91C1C' },
  orange: { fill: '#FFF7ED', stroke: '#F97316', text: '#C2410C' },
  purple: { fill: '#FAF5FF', stroke: '#A855F7', text: '#7E22CE' },
}
const C = (c: string) => COLORS[c] ?? COLORS.blue

// ── Percentage Bar ─────────────────────────────────────────────
export function PercentageBar({ data }: { data: any }) {
  const { whole, parts } = data
  if (!parts?.length) return null
  const total = parts.reduce((s: number, p: any) => s + p.value, 0)
  let cursor = 0
  return (
    <div className="w-full">
      <div className="relative h-10 w-full rounded-xl overflow-hidden border border-gray-100 flex">
        {parts.map((p: any, i: number) => {
          const w = (p.value / (whole || total)) * 100
          const c = C(p.color || 'blue')
          const x = cursor
          cursor += w
          return (
            <div key={i} title={p.label}
              className="relative flex items-center justify-center text-xs font-semibold transition-all duration-700 overflow-hidden"
              style={{ width: `${w}%`, background: c.fill, borderRight: i < parts.length - 1 ? `1px solid ${c.stroke}` : 'none' }}>
              {w > 12 && <span style={{ color: c.text }} className="truncate px-1">{p.label}</span>}
            </div>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-3 mt-2">
        {parts.map((p: any, i: number) => {
          const c = C(p.color || 'blue')
          return (
            <div key={i} className="flex items-center gap-1.5 text-xs">
              <div className="w-3 h-3 rounded-sm" style={{ background: c.stroke }} />
              <span className="text-gray-600">{p.label}</span>
              <span className="font-semibold" style={{ color: c.text }}>{p.value}</span>
              <span className="text-gray-400">({p.pct ?? Math.round((p.value/whole)*100)}%)</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Ratio Bar ──────────────────────────────────────────────────
export function RatioBar({ data }: { data: any }) {
  const { total, segments } = data
  if (!segments?.length) return null
  return (
    <div className="w-full">
      <div className="relative h-12 w-full rounded-xl overflow-hidden border border-gray-100 flex">
        {segments.map((s: any, i: number) => {
          const w = (s.value / total) * 100
          const c = C(s.color || 'blue')
          return (
            <div key={i}
              className="flex items-center justify-center text-xs font-semibold transition-all duration-700 overflow-hidden"
              style={{ width: `${w}%`, background: c.fill, borderRight: i < segments.length - 1 ? `1px solid ${c.stroke}` : 'none' }}>
              {w > 10 && <span style={{ color: c.text }} className="px-1 truncate">{s.label}</span>}
            </div>
          )
        })}
      </div>
      <div className="flex justify-between mt-1.5 text-xs text-gray-400">
        <span>0</span>
        <span className="font-medium text-gray-600">Total: {total}</span>
      </div>
    </div>
  )
}

// ── Table ──────────────────────────────────────────────────────
export function TableVis({ data }: { data: any }) {
  const { headers, rows, highlight_row } = data
  if (!headers?.length) return null
  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {headers.map((h: string, i: number) => (
              <th key={i} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows?.map((row: string[], ri: number) => (
            <tr key={ri} className={highlight_row === ri ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}>
              {row.map((cell: string, ci: number) => (
                <td key={ci} className={`px-4 py-2.5 ${highlight_row === ri ? 'font-semibold text-blue-800' : 'text-gray-700'}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Equation ──────────────────────────────────────────────────
export function EquationVis({ data }: { data: any }) {
  const { lhs, rhs, steps } = data
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
      <div className="flex items-center gap-3 text-base font-mono flex-wrap">
        <span className="text-blue-700 font-semibold">{lhs}</span>
        <span className="text-gray-400">=</span>
        <span className="text-gray-700">{rhs}</span>
      </div>
      {steps?.length > 0 && (
        <div className="mt-3 space-y-1 pl-4 border-l-2 border-blue-200">
          {steps.map((s: string, i: number) => (
            <div key={i} className="text-sm font-mono text-gray-600">{s}</div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Number Line ────────────────────────────────────────────────
export function NumberLine({ data }: { data: any }) {
  const { min, max, markers, ranges } = data
  const span = max - min || 1
  const pct  = (v: number) => ((v - min) / span) * 100

  return (
    <div className="w-full px-2 py-4">
      <div className="relative h-8">
        {/* Ranges */}
        {ranges?.map((r: any, i: number) => {
          const c = C(r.color || 'blue')
          return (
            <div key={i} className="absolute top-3 h-2 rounded-full"
              style={{ left: `${pct(r.from)}%`, width: `${pct(r.to) - pct(r.from)}%`, background: c.stroke, opacity: 0.35 }} />
          )
        })}
        {/* Baseline */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-300 rounded" />
        {/* Markers */}
        {markers?.map((m: any, i: number) => (
          <div key={i} className="absolute top-0 flex flex-col items-center" style={{ left: `${pct(m.value)}%`, transform: 'translateX(-50%)' }}>
            <div className={`text-xs font-semibold mb-1 ${m.highlight ? 'text-blue-700' : 'text-gray-500'}`}>{m.label}</div>
            <div className={`w-3 h-3 rounded-full border-2 ${m.highlight ? 'bg-blue-500 border-blue-700' : 'bg-white border-gray-400'}`} />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

// ── Speed Distance ─────────────────────────────────────────────
export function SpeedDistance({ data }: { data: any }) {
  const { distance, unit, segments } = data
  if (!segments?.length) return null
  const segColors = ['blue','green','orange','purple','red']
  return (
    <div className="w-full">
      {/* Journey bar */}
      <div className="relative h-10 w-full rounded-xl overflow-hidden border border-gray-100 flex mb-3">
        {segments.map((s: any, i: number) => {
          const w = (s.distance / distance) * 100
          const c = C(segColors[i % segColors.length])
          return (
            <div key={i} className="flex items-center justify-center text-xs font-semibold"
              style={{ width: `${w}%`, background: c.fill, borderRight: i < segments.length - 1 ? `1px solid ${c.stroke}` : 'none' }}>
              <span style={{ color: c.text }} className="truncate px-1">{s.label}</span>
            </div>
          )
        })}
      </div>
      {/* Segment table */}
      <div className="overflow-hidden rounded-xl border border-gray-100">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Segment','Speed','Time','Distance'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {segments.map((s: any, i: number) => (
              <tr key={i} className="bg-white">
                <td className="px-3 py-2 font-medium text-gray-700">{s.label}</td>
                <td className="px-3 py-2 text-gray-600">{s.speed} {unit}/h</td>
                <td className="px-3 py-2 text-gray-600">{s.time} hr</td>
                <td className="px-3 py-2 text-gray-600">{s.distance} {unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Work Time ─────────────────────────────────────────────────
export function WorkTime({ data }: { data: any }) {
  const { workers, combined_rate } = data
  if (!workers?.length) return null
  return (
    <div className="w-full space-y-2.5">
      {workers.map((w: any, i: number) => {
        const c = C(['blue','green','orange','purple'][i % 4])
        const pct = Math.min(100, w.rate_per_day * 100)
        return (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">{w.label}</span>
              <span className="text-xs" style={{ color: c.text }}>{w.rate_per_day * 100}% per day ({w.days} days alone)</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: c.stroke }} />
            </div>
          </div>
        )
      })}
      {combined_rate > 0 && (
        <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-100">
          <p className="text-xs text-green-700 font-medium">
            Combined rate: {combined_rate * 100}% per day → completes in {Math.round(1 / combined_rate)} days
          </p>
        </div>
      )}
    </div>
  )
}

// ── Pie Chart ─────────────────────────────────────────────────
export function PieChart({ data }: { data: any }) {
  const { total, slices } = data
  if (!slices?.length) return null
  const colorList = ['blue','green','orange','purple','red']
  let cumAngle = -90

  const toRad  = (d: number) => (d * Math.PI) / 180
  const cx = 80, cy = 80, r = 65

  type PathEntry = { path: string; c: { fill: string; stroke: string; text: string }; lx: number; ly: number; pct: number; label: string }
  const paths: PathEntry[] = slices.map((s: any, i: number) => {
    const angle = (s.value / total) * 360
    const startA = cumAngle
    cumAngle += angle
    const endA = cumAngle
    const large = angle > 180 ? 1 : 0
    const x1 = cx + r * Math.cos(toRad(startA))
    const y1 = cy + r * Math.sin(toRad(startA))
    const x2 = cx + r * Math.cos(toRad(endA))
    const y2 = cy + r * Math.sin(toRad(endA))
    const midA = startA + angle / 2
    const lx = cx + (r * 0.65) * Math.cos(toRad(midA))
    const ly = cy + (r * 0.65) * Math.sin(toRad(midA))
    const c = C(s.color || colorList[i % colorList.length])
    return { path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`, c, lx, ly, pct: Math.round((s.value/total)*100), label: s.label }
  })

  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {paths.map((p: PathEntry, i: number) => (
          <g key={i}>
            <path d={p.path} fill={p.c.fill} stroke={p.c.stroke} strokeWidth="1.5" />
            {paths[i] && slices[i].value / total > 0.07 && (
              <text x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle"
                fontSize="10" fontWeight="600" fill={p.c.text}>{p.pct}%</text>
            )}
          </g>
        ))}
      </svg>
      <div className="space-y-1.5">
        {paths.map((p: PathEntry, i: number) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-sm" style={{ background: p.c.stroke }} />
            <span className="text-gray-600">{p.label}</span>
            <span className="font-semibold ml-1" style={{ color: p.c.text }}>{slices[i].value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Venn Diagram ──────────────────────────────────────────────
export function VennDiagram({ data }: { data: any }) {
  const { circles, intersection, union } = data
  if (!circles?.length) return null
  const [a, b] = circles
  return (
    <div className="flex items-center gap-6">
      <svg width="220" height="120" viewBox="0 0 220 120">
        <circle cx="80" cy="60" r="50" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1.5" fillOpacity="0.6" />
        <circle cx="140" cy="60" r="50" fill="#F0FDF4" stroke="#22C55E" strokeWidth="1.5" fillOpacity="0.6" />
        <text x="55" y="58" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1D4ED8">{a?.label}</text>
        <text x="55" y="72" textAnchor="middle" fontSize="10" fill="#1D4ED8">{a?.total - intersection}</text>
        <text x="110" y="58" textAnchor="middle" fontSize="11" fontWeight="600" fill="#6B7280">∩</text>
        <text x="110" y="72" textAnchor="middle" fontSize="10" fill="#374151">{intersection}</text>
        <text x="165" y="58" textAnchor="middle" fontSize="11" fontWeight="600" fill="#15803D">{b?.label}</text>
        <text x="165" y="72" textAnchor="middle" fontSize="10" fill="#15803D">{b?.total - intersection}</text>
      </svg>
      <div className="text-xs space-y-1.5">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-blue-400" /><span className="text-gray-600">Only {a?.label}: <strong>{a?.total - intersection}</strong></span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-green-400" /><span className="text-gray-600">Only {b?.label}: <strong>{b?.total - intersection}</strong></span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-purple-400" /><span className="text-gray-600">Both: <strong>{intersection}</strong></span></div>
        {union && <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-gray-300" /><span className="text-gray-600">Total: <strong>{union}</strong></span></div>}
      </div>
    </div>
  )
}

// ── Geometry ──────────────────────────────────────────────────
export function GeometryVis({ data }: { data: any }) {
  const { shape, dimensions, area_formula } = data
  const shapeEl = () => {
    if (shape === 'circle') return <ellipse cx="80" cy="70" rx="60" ry="60" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1.5" />
    if (shape === 'triangle') return <polygon points="80,10 10,140 150,140" fill="#F0FDF4" stroke="#22C55E" strokeWidth="1.5" />
    return <rect x="10" y="30" width="140" height="80" rx="4" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1.5" />
  }
  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160">{shapeEl()}</svg>
      <div className="space-y-2">
        {dimensions?.map((d: any, i: number) => (
          <div key={i} className="text-sm">
            <span className="text-gray-500">{d.label}: </span>
            <span className="font-semibold text-blue-700">{d.value}</span>
          </div>
        ))}
        {area_formula && (
          <div className="mt-2 px-3 py-1.5 bg-blue-50 rounded-lg text-xs font-mono text-blue-700 border border-blue-100">
            {area_formula}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Area Model ────────────────────────────────────────────────
export function AreaModel({ data }: { data: any }) {
  const { rows, cols, cells } = data
  if (!cells?.length) return null
  const cellMap: Record<string, any> = {}
  cells.forEach((c: any) => { cellMap[`${c.r},${c.c}`] = c })
  const total = cells.reduce((s: number, c: any) => s + c.value, 0)

  return (
    <div>
      <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => {
            const cell = cellMap[`${r},${c}`]
            const col = C(cell?.color || 'blue')
            return (
              <div key={`${r},${c}`} className="w-16 h-12 rounded-lg flex flex-col items-center justify-center text-xs font-semibold border"
                style={{ background: col.fill, borderColor: col.stroke, color: col.text }}>
                <span>{cell?.label || ''}</span>
              </div>
            )
          })
        )}
      </div>
      <p className="text-xs text-gray-400 mt-2">Total: {total}</p>
    </div>
  )
}

// ── Master dispatcher ─────────────────────────────────────────
export function VisualRenderer({ type, data }: { type: string; data: any }) {
  if (!data || type === 'none') return null
  switch (type) {
    case 'percentage_bar': return <PercentageBar data={data} />
    case 'ratio_bar':      return <RatioBar data={data} />
    case 'table':          return <TableVis data={data} />
    case 'equation':       return <EquationVis data={data} />
    case 'number_line':    return <NumberLine data={data} />
    case 'speed_distance': return <SpeedDistance data={data} />
    case 'work_time':      return <WorkTime data={data} />
    case 'pie':            return <PieChart data={data} />
    case 'venn':           return <VennDiagram data={data} />
    case 'geometry':       return <GeometryVis data={data} />
    case 'area_model':     return <AreaModel data={data} />
    default:               return null
  }
}
