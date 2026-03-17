// Parses and validates a CSV file for bulk question upload
// Expected columns:
// question_text, option_a, option_b, option_c, option_d, correct_option,
// topic_name, difficulty, is_pyq, pyq_year, pyq_exam_code, solution_text, tags

export interface ParsedQuestion {
  question_text:  string
  options:        { option_text: string; is_correct: boolean }[]
  topic_name:     string
  difficulty:     'easy' | 'medium' | 'hard'
  is_pyq:         boolean
  pyq_year?:      number | null
  pyq_exam_code?: string | null
  solution_text?: string
  tags?:          string[]
}

export interface ParseResult {
  rows:    ParsedQuestion[]
  errors:  { row: number; message: string }[]
  total:   number
  valid:   number
}

const REQUIRED = ['question_text','option_a','option_b','option_c','option_d','correct_option','topic_name','difficulty']

export function parseCSV(raw: string): ParseResult {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) {
    return { rows: [], errors: [{ row: 0, message: 'File is empty or has no data rows' }], total: 0, valid: 0 }
  }

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
  const missing = REQUIRED.filter(r => !headers.includes(r))
  if (missing.length) {
    return {
      rows: [], valid: 0, total: 0,
      errors: [{ row: 0, message: `Missing required columns: ${missing.join(', ')}` }]
    }
  }

  const rows: ParsedQuestion[] = []
  const errors: { row: number; message: string }[] = []

  for (let i = 1; i < lines.length; i++) {
    const rowNum = i + 1
    const cols = splitCSVLine(lines[i])
    const cell = (col: string) => (cols[headers.indexOf(col)] ?? '').trim().replace(/^"|"$/g, '')

    const question_text = cell('question_text')
    if (!question_text) { errors.push({ row: rowNum, message: 'question_text is empty' }); continue }

    const correctRaw = cell('correct_option').toUpperCase()
    if (!['A','B','C','D'].includes(correctRaw)) {
      errors.push({ row: rowNum, message: `correct_option must be A, B, C or D (got "${correctRaw}")` }); continue
    }

    const optionMap: Record<string, string> = {
      A: cell('option_a'), B: cell('option_b'), C: cell('option_c'), D: cell('option_d')
    }
    const optionErrors = Object.entries(optionMap).filter(([,v]) => !v).map(([k]) => `option_${k.toLowerCase()}`)
    if (optionErrors.length) {
      errors.push({ row: rowNum, message: `Empty options: ${optionErrors.join(', ')}` }); continue
    }

    const difficulty = cell('difficulty').toLowerCase()
    if (!['easy','medium','hard'].includes(difficulty)) {
      errors.push({ row: rowNum, message: `difficulty must be easy/medium/hard (got "${difficulty}")` }); continue
    }

    const is_pyq = ['true','1','yes'].includes(cell('is_pyq').toLowerCase())
    const pyqYearRaw = cell('pyq_year')
    const pyq_year = pyqYearRaw ? parseInt(pyqYearRaw) : null
    if (is_pyq && pyq_year && (pyq_year < 1990 || pyq_year > new Date().getFullYear())) {
      errors.push({ row: rowNum, message: `pyq_year ${pyq_year} seems invalid` })
    }

    const tagsRaw = cell('tags')
    const tags = tagsRaw ? tagsRaw.split('|').map(t => t.trim()).filter(Boolean) : undefined

    rows.push({
      question_text,
      options: ['A','B','C','D'].map(k => ({
        option_text: optionMap[k],
        is_correct: k === correctRaw,
      })),
      topic_name:     cell('topic_name'),
      difficulty:     difficulty as 'easy' | 'medium' | 'hard',
      is_pyq,
      pyq_year:       is_pyq ? pyq_year : null,
      pyq_exam_code:  is_pyq ? (cell('pyq_exam_code') || null) : null,
      solution_text:  cell('solution_text') || undefined,
      tags,
    })
  }

  return { rows, errors, total: lines.length - 1, valid: rows.length }
}

function splitCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

// ── Generate a download template CSV ─────────────────────────
export function generateTemplateCSV(): string {
  const header = 'question_text,option_a,option_b,option_c,option_d,correct_option,topic_name,difficulty,is_pyq,pyq_year,pyq_exam_code,solution_text,tags'
  const rows = [
    '"What is 15% of 240?","32","36","38","42","B","Basic percentage concepts","easy","true","2022","SSC_CGL","15% of 240 = (15/100) × 240 = 36","percentage|arithmetic"',
    '"A train travels 360 km in 4 hours. What is its speed?","80 km/h","90 km/h","95 km/h","100 km/h","B","Time Speed Distance","medium","false","","","Speed = Distance/Time = 360/4 = 90 km/h",""',
  ]
  return [header, ...rows].join('\n')
}
