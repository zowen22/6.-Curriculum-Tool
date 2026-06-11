'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { WorkbookContent, SaveStatus } from '@/types/curriculum'
import SaveIndicator from '../SaveIndicator'
import ListEditor from '../ListEditor'

interface Props {
  unitId: string
  userId: string
  initialContent: WorkbookContent | null
}

type FormState = {
  lesson_introduction: string
  word_practice: string[]
  phrase_practice: string[]
  sentence_practice: string[]
  decodable_text: string
  activities: string[]
}

function toForm(c: WorkbookContent | null): FormState {
  return {
    lesson_introduction: c?.lesson_introduction ?? '',
    word_practice: c?.word_practice ?? [],
    phrase_practice: c?.phrase_practice ?? [],
    sentence_practice: c?.sentence_practice ?? [],
    decodable_text: c?.decodable_text ?? '',
    activities: c?.activities ?? [],
  }
}

const ta = 'w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none'

export default function WorkbookEditor({ unitId, userId, initialContent }: Props) {
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
        .from('workbook_content')
        .upsert({ unit_id: unitId, user_id: userId, ...form }, { onConflict: 'unit_id' })
      setSaveStatus(error ? 'error' : 'saved')
      if (!error) setTimeout(() => setSaveStatus('idle'), 2000)
    }, 800)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [form]) // eslint-disable-line react-hooks/exhaustive-deps

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold text-gray-900">Student Workbook</h2>
        <SaveIndicator status={saveStatus} />
      </div>

      <Field label="Lesson Introduction">
        <textarea value={form.lesson_introduction} onChange={e => set('lesson_introduction', e.target.value)} rows={3} placeholder="Opening context or warm-up for students" className={ta} />
      </Field>

      <Field label="Word Practice">
        <ListEditor items={form.word_practice} onChange={v => set('word_practice', v)} placeholder="e.g., cat" />
      </Field>

      <Field label="Phrase Practice">
        <ListEditor items={form.phrase_practice} onChange={v => set('phrase_practice', v)} placeholder="e.g., a fat cat" />
      </Field>

      <Field label="Sentence Practice">
        <ListEditor items={form.sentence_practice} onChange={v => set('sentence_practice', v)} placeholder="e.g., The cat sat on the mat." />
      </Field>

      <Field label="Decodable Text">
        <textarea value={form.decodable_text} onChange={e => set('decodable_text', e.target.value)} rows={7} placeholder="Age-appropriate controlled decodable passage" className={ta} />
      </Field>

      <Field label="Activities">
        <ListEditor items={form.activities} onChange={v => set('activities', v)} placeholder="e.g., Word sort: short a words" />
      </Field>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {children}
    </div>
  )
}
