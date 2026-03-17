'use client'
import { useState } from 'react'
import { Plus, Star, Phone, Mail, MessageCircle } from 'lucide-react'

const teachers: any[] = []  // Will be populated from Supabase

export default function TeachersPage() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Teacher master</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage faculty, assign subjects and batches</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus size={14} /> Add teacher
        </button>
      </div>

      {teachers.length === 0 && !showForm ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <Star size={20} className="text-blue-500" />
          </div>
          <p className="text-gray-700 font-medium mb-1">No teachers yet</p>
          <p className="text-gray-400 text-sm mb-4">Add your first faculty member to get started</p>
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            Add first teacher
          </button>
        </div>
      ) : null}

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Add teacher</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Full name',        name: 'name',             type: 'text',  placeholder: 'e.g. Ramesh Sharma' },
              { label: 'Email',            name: 'email',            type: 'email', placeholder: 'teacher@academy.com' },
              { label: 'Phone',            name: 'phone',            type: 'tel',   placeholder: '+91 9876543210' },
              { label: 'WhatsApp number',  name: 'whatsapp_number',  type: 'tel',   placeholder: '+91 9876543210' },
              { label: 'Experience (yrs)', name: 'experience_yrs',   type: 'number',placeholder: '5' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                <input type={f.type} placeholder={f.placeholder}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Primary subject</label>
              <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select subject</option>
                <option value="MATHS">Quantitative Aptitude</option>
                <option value="REASONING">Reasoning</option>
                <option value="ENGLISH">English Language</option>
                <option value="GK">General Awareness</option>
                <option value="BANKING">Banking & Economy</option>
                <option value="SCIENCE">General Science</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Bio</label>
            <textarea rows={2} placeholder="Brief introduction about the teacher..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="flex gap-2 mt-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Save teacher</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {/* Teacher cards — populated from DB */}
      <div className="grid grid-cols-2 gap-4">
        {teachers.map((t: any) => (
          <div key={t.id} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-semibold text-sm">
                {t.name.split(' ').map((n: string) => n[0]).join('').slice(0,2)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-400">{t.experience_yrs} yrs exp</p>
              </div>
              <div className="flex items-center gap-1 text-amber-500 text-xs">
                <Star size={11} fill="currentColor" /> {t.rating}
              </div>
            </div>
            <div className="mt-3 flex gap-2 flex-wrap">
              <a href={`tel:${t.phone}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600"><Phone size={11}/>{t.phone}</a>
              <a href={`https://wa.me/${t.whatsapp_number}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-600"><MessageCircle size={11}/>WhatsApp</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
