'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const steps = ['Academy details', 'Admin account', 'Select exams']

const examOptions = [
  { code: 'SSC',     label: 'SSC',     sub: 'CGL, CHSL, MTS, GD',               color: 'border-blue-200 bg-blue-50' },
  { code: 'BANKING', label: 'Banking', sub: 'SBI PO, IBPS PO, RBI Grade B',      color: 'border-green-200 bg-green-50' },
  { code: 'RAILWAY', label: 'Railway', sub: 'RRB NTPC, Group D, ALP',             color: 'border-amber-200 bg-amber-50' },
  { code: 'DEFENCE', label: 'Defence', sub: 'NDA, CDS, AFCAT, Agniveer',          color: 'border-pink-200 bg-pink-50' },
]

export default function SignupPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any

  const [academy, setAcademy] = useState({ name: '', slug: '', city: '', state: '', phone: '', email: '' })
  const [admin, setAdmin] = useState({ full_name: '', email: '', password: '' })
  const [selectedExams, setSelectedExams] = useState<string[]>([])

  function toggleExam(code: string) {
    setSelectedExams(prev => prev.includes(code) ? prev.filter(e => e !== code) : [...prev, code])
  }

  async function handleSubmit() {
    setLoading(true); setError('')
    try {
      // 1. Create auth user
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: admin.email, password: admin.password,
        options: { data: { full_name: admin.full_name } }
      })
      if (authErr) throw authErr

      // 2. Create academy row
      const { data: academyData, error: acErr } = await supabase
        .from('academies')
        .insert({ ...academy, plan: 'trial' })
        .select().single()
      if (acErr) throw acErr

      // 3. Create user_profile as academy_admin
      if (authData.user) {
        await supabase.from('user_profiles').insert({
          id: authData.user.id,
          academy_id: academyData.id,
          role: 'academy_admin',
          full_name: admin.full_name,
        })
      }

      router.push('/overview')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <span className="text-2xl font-semibold text-gray-900">Rankwise</span>
          <p className="text-sm text-gray-500 mt-1">Set up your academy in 3 steps</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                i < step ? 'bg-green-500 text-white' : i === step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs ${i === step ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>{s}</span>
              {i < steps.length - 1 && <div className="flex-1 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          {/* Step 0: Academy details */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-gray-800">Your academy</h2>
              {[
                { label:'Academy name', key:'name', placeholder:'e.g. Vidya IAS Academy', type:'text' },
                { label:'Slug (URL)',   key:'slug', placeholder:'vidya-academy', type:'text' },
                { label:'Email',       key:'email', placeholder:'contact@academy.com', type:'email' },
                { label:'Phone',       key:'phone', placeholder:'+91 9876543210', type:'tel' },
                { label:'City',        key:'city', placeholder:'Nagpur', type:'text' },
                { label:'State',       key:'state', placeholder:'Maharashtra', type:'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder}
                    value={(academy as any)[f.key]}
                    onChange={e => setAcademy(a => ({ ...a, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <button onClick={() => setStep(1)} disabled={!academy.name || !academy.email}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                Continue →
              </button>
            </div>
          )}

          {/* Step 1: Admin account */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-gray-800">Admin account</h2>
              {[
                { label:'Your full name', key:'full_name', type:'text',     placeholder:'e.g. Rajiv Sharma' },
                { label:'Email',          key:'email',     type:'email',    placeholder:'you@academy.com' },
                { label:'Password',       key:'password',  type:'password', placeholder:'min. 8 characters' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder}
                    value={(admin as any)[f.key]}
                    onChange={e => setAdmin(a => ({ ...a, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep(0)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm hover:bg-gray-50">← Back</button>
                <button onClick={() => setStep(2)} disabled={!admin.full_name || !admin.email || admin.password.length < 8}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select exams */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-gray-800">Which exams does your academy teach?</h2>
              <div className="grid grid-cols-2 gap-3">
                {examOptions.map(e => (
                  <button key={e.code} onClick={() => toggleExam(e.code)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      selectedExams.includes(e.code) ? e.color + ' border-opacity-100' : 'border-gray-100 hover:border-gray-200'
                    }`}>
                    <p className="font-semibold text-sm text-gray-900">{e.label}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{e.sub}</p>
                    {selectedExams.includes(e.code) && <span className="text-xs text-green-600 font-medium">✓ Selected</span>}
                  </button>
                ))}
              </div>
              {error && <div className="px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">{error}</div>}
              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep(1)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm hover:bg-gray-50">← Back</button>
                <button onClick={handleSubmit} disabled={selectedExams.length === 0 || loading}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {loading ? 'Setting up…' : 'Launch academy →'}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Already registered? <a href="/login" className="text-blue-600 hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  )
}
export const dynamic = 'force-dynamic'
