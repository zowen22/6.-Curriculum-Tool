'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { TeacherContent, SaveStatus } from '@/types/curriculum'
import SaveIndicator from '../SaveIndicator'

interface Props {
  unitId: string
  userId: string
  initialContent: TeacherContent | null
}

type FormState = {
  objective: string
  teaching_guidance: string
  language_transfer_notes: string
  common_errors: string
  example_responses: string
}

function toForm(c: TeacherContent | null): FormState {
  return {
    objective: c?.objective ?? '',
    teaching_guidance: c?.teaching_guidance ?? '',
    language_transfer_notes: c?.language_transfer_notes ?? '',
    common_errors: c?.common_errors ?? '',
    example_responses: c?.example_responses ?? '',
  }
}

const FIELDS: { key: keyof FormState; label: string; rows: number; placeholder: string }[] = [
  { key: 'objective', label: 'Objective', rows: 2, placeholder: 'Learning objective for this lesson' },
  { key: 'teaching_guidance', label: 'Teaching Guidance', rows: 6, placeholder: 'Step-by-step explicit instruction guidance' },
  { key: 'language_transfer_notes', label: 'Language Transfer Notes', rows: 4, placeholder: 'Spanish cognates, transfer opportunities, cross-language connections' },
  { key: 'common_errors', label: 'Common Errors', rows: 3, placeholder: 'Typical mistakes students make and how to address them' },
  { key: 'example_responses', label: 'Example Responses', rows: 3, placeholder: 'Model responses for key activities' },
]

const ta = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors resize-none'

export default function TeacherNotesEditor({ unitId, userId, initialContent }: Props) {
  const [form, setForm] = useState<FormState>(toForm(initialContent))
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const mountedRef = useRef(false)

  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return }
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setSaveStatus('saving')
      const supabase = createClient()
      const { error } = await supabase
        .from('teacher_content')
        .upsert({ unit_id: unitId, user_id: userId, ...form }, { onConflict: 'unit_id' })
      setSaveStatus(error ? 'error' : 'saved')
      if (!error) setTimeout(() => setSaveStatus('idle'), 2000)
    }, 800)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [form]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold text-gray-900">Teacher Manual</h2>
        <SaveIndicator status={saveStatus} />
      </div>

      {FIELDS.map(({ key, label, rows, placeholder }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
          <textarea
            value={form[key]}
            onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
            rows={rows}
            placeholder={placeholder}
            className={ta}
          />
        </div>
      ))}
    </div>
  )
}
