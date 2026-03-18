'use client'
import { useState, useEffect } from 'react'
import { VisualRenderer } from './VisualRenderers'

interface Step {
  title: string
  explanation: string
  visual: { type: string; data: any }
  highlight: string
}

interface Props {
  step: Step
  index: number
  total: number
  isActive: boolean
  isRevealed: boolean
}

export default function StepCard({ step, index, total, isActive, isRevealed }: Props) {
  const [mounted, setMounted] = useState(false)
  const isFinal = index === total - 1

  useEffect(() => {
    if (isRevealed) {
      const t = setTimeout(() => setMounted(true), index * 80)
      return () => clearTimeout(t)
    }
  }, [isRevealed, index])

  return (
    <div className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className={`rounded-2xl border overflow-hidden ${
        isFinal
          ? 'border-green-200 bg-green-50/30'
          : isActive
          ? 'border-blue-200 bg-blue-50/20'
          : 'border-gray-100 bg-white'
      }`}>
        {/* Step header */}
        <div className={`flex items-center gap-3 px-5 py-4 border-b ${
          isFinal ? 'border-green-100 bg-green-50/50' : isActive ? 'border-blue-100 bg-blue-50/40' : 'border-gray-50'
        }`}>
          {/* Step number */}
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
            isFinal ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'
          }`}>
            {isFinal ? '✓' : index + 1}
          </div>

          <div className="flex-1">
            <p className={`text-sm font-semibold ${isFinal ? 'text-green-800' : 'text-gray-800'}`}>
              {step.title}
            </p>
          </div>

          {/* Highlight badge */}
          {step.highlight && (
            <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
              isFinal ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {step.highlight}
            </div>
          )}
        </div>

        {/* Step body */}
        <div className="px-5 py-4 space-y-4">
          {/* Explanation */}
          <p className="text-sm text-gray-700 leading-relaxed">{step.explanation}</p>

          {/* Visual */}
          {step.visual?.type && step.visual.type !== 'none' && step.visual.data && (
            <div className={`rounded-xl p-4 ${isFinal ? 'bg-green-50/60 border border-green-100' : 'bg-gray-50/80 border border-gray-100'}`}>
              <VisualRenderer type={step.visual.type} data={step.visual.data} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
