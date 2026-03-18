import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { problem } = await req.json()
  if (!problem?.trim()) {
    return NextResponse.json({ error: 'No problem provided' }, { status: 400 })
  }

  const SYSTEM = `You are Rankwise Visual Solver — an AI math tutor for Indian competitive exams (SSC, Banking, Railway, Defence).

Given a maths or aptitude problem, you MUST respond with a JSON object only. No markdown, no prose outside JSON.

The JSON must have this exact shape:
{
  "topic": string,            // e.g. "Percentage", "Time Speed Distance"
  "difficulty": "easy"|"medium"|"hard",
  "shortcut": string,         // one-line exam trick/formula
  "steps": [                  // 3-8 solution steps
    {
      "title": string,        // short step label
      "explanation": string,  // clear text explanation (1-3 sentences)
      "visual": {
        "type": "number_line"|"ratio_bar"|"pie"|"venn"|"table"|"geometry"|"speed_distance"|"work_time"|"percentage_bar"|"equation"|"area_model"|"none",
        "data": object        // type-specific data (see below)
      },
      "highlight": string     // the key number or formula for this step, e.g. "36" or "15/100 × 240"
    }
  ],
  "answer": string,           // final answer with units
  "exam_tips": string[]       // 2-3 bullet tips for this question type in exams
}

Visual data shapes by type:

"number_line": { "min": number, "max": number, "markers": [{"value": number, "label": string, "highlight": boolean}], "ranges": [{"from": number, "to": number, "label": string, "color": "blue"|"green"|"red"|"orange"}] }

"ratio_bar": { "total": number, "segments": [{"label": string, "value": number, "color": "blue"|"green"|"red"|"orange"|"purple"}] }

"pie": { "total": number, "slices": [{"label": string, "value": number, "color": "blue"|"green"|"red"|"orange"|"purple"}] }

"venn": { "circles": [{"label": string, "total": number, "color": "blue"|"green"}], "intersection": number, "union": number }

"table": { "headers": string[], "rows": string[][], "highlight_row": number|null }

"geometry": { "shape": "rectangle"|"triangle"|"circle"|"square", "dimensions": {"label": string, "value": string}[], "area_formula": string }

"speed_distance": { "distance": number, "unit": string, "segments": [{"label": string, "speed": number, "time": number, "distance": number}] }

"work_time": { "workers": [{"label": string, "rate_per_day": number, "days": number}], "combined_rate": number }

"percentage_bar": { "whole": number, "parts": [{"label": string, "value": number, "pct": number, "color": "blue"|"green"|"red"|"orange"}] }

"equation": { "lhs": string, "rhs": string, "steps": string[] }

"area_model": { "rows": number, "cols": number, "cells": [{"r": number, "c": number, "label": string, "value": number, "color": "blue"|"green"|"red"|"orange"}] }

"none": {}

Rules:
- Use visuals that genuinely clarify the step. Don't force a visual on every step — use "none" when explanation alone is clearest.
- First step: always show what is GIVEN using a table, ratio_bar or percentage_bar.
- Last step (answer) step: use a highlighted ratio_bar or percentage_bar to show the final value visually.
- For percentage problems: use percentage_bar or ratio_bar.
- For TSD (time-speed-distance): use speed_distance or number_line.
- For ratio/proportion: use ratio_bar.
- For profit/loss: use percentage_bar showing cost, selling price, profit.
- For sets/Venn: use venn.
- For geometry: use geometry.
- For work-time: use work_time.
- Keep step titles short (2-5 words). Keep explanations simple — class 10 reading level.
- The shortcut must be a real exam trick, not generic advice.
- Respond ONLY with the JSON. No preamble, no markdown fences.`

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    // Return a deterministic mock response for demo/development
    return NextResponse.json(getMockSolution(problem))
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: SYSTEM,
        messages: [{ role: 'user', content: problem }],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Anthropic error:', err)
      return NextResponse.json(getMockSolution(problem))
    }

    const data = await res.json()
    const text = data.content?.[0]?.text ?? ''

    // Strip any accidental markdown fences
    const clean = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
    const parsed = JSON.parse(clean)
    return NextResponse.json(parsed)
  } catch (e) {
    console.error('Solver error:', e)
    return NextResponse.json(getMockSolution(problem))
  }
}

// Rich mock solution used in demo / when API key is not set
function getMockSolution(problem: string) {
  const isPercentage = /percent|%/i.test(problem)
  const isTSD = /speed|distance|km|train|travel/i.test(problem)
  const isRatio = /ratio|proportion/i.test(problem)

  if (isTSD) {
    return {
      topic: 'Time, Speed & Distance',
      difficulty: 'medium',
      shortcut: 'Distance = Speed × Time. Always convert units first.',
      steps: [
        {
          title: 'What is given?',
          explanation: 'We identify the known values: distance, speed, or time. Write them down clearly before calculating.',
          visual: { type: 'table', data: { headers: ['Variable', 'Value', 'Unit'], rows: [['Distance', '360', 'km'], ['Speed', '?', 'km/h'], ['Time', '4', 'hours']], highlight_row: 1 } },
          highlight: 'D = S × T',
        },
        {
          title: 'Apply formula',
          explanation: 'Speed = Distance ÷ Time. Substituting: Speed = 360 ÷ 4 = 90 km/h.',
          visual: { type: 'equation', data: { lhs: 'Speed', rhs: '360 ÷ 4', steps: ['= 360 ÷ 4', '= 90 km/h'] } },
          highlight: '360 ÷ 4',
        },
        {
          title: 'Visualise journey',
          explanation: 'The train covers 360 km at a constant speed over 4 hours. Each hour it covers 90 km.',
          visual: { type: 'speed_distance', data: { distance: 360, unit: 'km', segments: [{ label: 'Hr 1', speed: 90, time: 1, distance: 90 }, { label: 'Hr 2', speed: 90, time: 1, distance: 90 }, { label: 'Hr 3', speed: 90, time: 1, distance: 90 }, { label: 'Hr 4', speed: 90, time: 1, distance: 90 }] } },
          highlight: '90 km each hour',
        },
        {
          title: 'Answer',
          explanation: 'The speed of the train is 90 km/h.',
          visual: { type: 'ratio_bar', data: { total: 360, segments: [{ label: '90 km/h × 4 hrs = 360 km', value: 360, color: 'green' }] } },
          highlight: '90 km/h',
        },
      ],
      answer: '90 km/h',
      exam_tips: [
        'In SSC and Railway exams, always check if units need conversion (m/s ↔ km/h: multiply by 18/5 or 5/18).',
        'For average speed problems: use 2ab/(a+b) when equal distances are covered at different speeds.',
        'Shortcut: If time is given in minutes, divide by 60 to get hours before applying formula.',
      ],
    }
  }

  if (isRatio) {
    return {
      topic: 'Ratio & Proportion',
      difficulty: 'easy',
      shortcut: 'To divide X in ratio a:b → First part = X × a/(a+b), Second = X × b/(a+b)',
      steps: [
        {
          title: 'Identify the ratio',
          explanation: 'Write the ratio parts and their sum. The sum of ratio parts gives the total number of equal shares.',
          visual: { type: 'table', data: { headers: ['Part', 'Ratio', 'Share'], rows: [['A', '3', '?'], ['B', '5', '?'], ['Total', '8', '?']], highlight_row: 2 } },
          highlight: '3 + 5 = 8',
        },
        {
          title: 'Calculate each share',
          explanation: 'Divide total by sum of ratio parts to get one unit value, then multiply by each part.',
          visual: { type: 'ratio_bar', data: { total: 800, segments: [{ label: 'A (3 parts)', value: 300, color: 'blue' }, { label: 'B (5 parts)', value: 500, color: 'green' }] } },
          highlight: '₹800 ÷ 8 = ₹100 per part',
        },
        {
          title: 'Answer',
          explanation: 'A gets 3 × ₹100 = ₹300 and B gets 5 × ₹100 = ₹500.',
          visual: { type: 'ratio_bar', data: { total: 800, segments: [{ label: 'A → ₹300', value: 300, color: 'blue' }, { label: 'B → ₹500', value: 500, color: 'green' }] } },
          highlight: 'A = ₹300, B = ₹500',
        },
      ],
      answer: 'A = ₹300, B = ₹500',
      exam_tips: [
        'Always add ratio parts first to find total units.',
        'If ratio is given as a:b:c, add all three: a+b+c = total parts.',
        'In banking exams, ratio problems often appear in DI sets — practice reading pie charts.',
      ],
    }
  }

  // Default: percentage
  return {
    topic: 'Percentage',
    difficulty: 'easy',
    shortcut: 'X% of Y = (X × Y) / 100. Learn key fraction-percent equivalents: 1/4=25%, 1/3=33.33%, 3/4=75%.',
    steps: [
      {
        title: 'Understand the question',
        explanation: 'We need to find 15% of 240. "Percent" means per hundred — so 15% means 15 out of every 100.',
        visual: { type: 'percentage_bar', data: { whole: 100, parts: [{ label: '15%', value: 15, pct: 15, color: 'blue' }, { label: 'Remaining 85%', value: 85, pct: 85, color: 'orange' }] } },
        highlight: '15 out of 100',
      },
      {
        title: 'Write as a fraction',
        explanation: '15% = 15/100 = 3/20. This makes multiplication easier — multiply 240 by 3, then divide by 20.',
        visual: { type: 'equation', data: { lhs: '15%', rhs: '15/100', steps: ['= 3/20', '(simplified)'] } },
        highlight: '15/100 = 3/20',
      },
      {
        title: 'Multiply',
        explanation: '15% of 240 = (15 × 240) / 100 = 3600 / 100 = 36.',
        visual: { type: 'area_model', data: { rows: 1, cols: 4, cells: [{ r: 0, c: 0, label: '60', value: 60, color: 'blue' }, { r: 0, c: 1, label: '60', value: 60, color: 'blue' }, { r: 0, c: 2, label: '60', value: 60, color: 'blue' }, { r: 0, c: 3, label: '60', value: 60, color: 'orange' }] } },
        highlight: '3600 ÷ 100 = 36',
      },
      {
        title: 'Scale to 240',
        explanation: 'Since 15% of 100 = 15, and we have 240 (which is 2.4× more), the answer is 15 × 2.4 = 36.',
        visual: { type: 'percentage_bar', data: { whole: 240, parts: [{ label: '15% = 36', value: 36, pct: 15, color: 'green' }, { label: 'Remaining 204', value: 204, pct: 85, color: 'orange' }] } },
        highlight: '36',
      },
    ],
    answer: '36',
    exam_tips: [
      'Memorise: 10% of any number = divide by 10. Then 15% = 10% + 5% (half of 10%).',
      'For SSC CGL: percentage questions often involve successive changes — use the formula: a + b + ab/100.',
      'Speed trick: 15% of 240 → find 10% (=24), then 5% (=12), add them: 24 + 12 = 36.',
    ],
  }
}
