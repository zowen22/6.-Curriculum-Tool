'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Assessment, AssessmentLevel, SaveStatus } from '@/types/curriculum'
import SaveIndicator from '../SaveIndicator'
import ListEditor from '../ListEditor'

interface Props {
  unitId: string
  userId: string
  initialAssessments: Assessment[]
}

type BeginnerForm = {
  word_reading: string[]
  phrase_reading: string[]
  connected_text: string
  spelling_words: string[]
}

type IntermediateForm = {
  sentence_reading: string[]
  dictation_sentences: string[]
  application_activity: string
}

function toBeginnerForm(a?: Assessment): BeginnerForm {
  return {
    word_reading: a?.word_reading ?? [],
    phrase_reading: a?.phrase_reading ?? [],
    connected_text: a?.connected_text ?? '',
    spelling_words: a?.spelling_words ?? [],
  }
}

function toIntermediateForm(a?: Assessment): IntermediateForm {
  return {
    sentence_reading: a?.sentence_reading ?? [],
    dictation_sentences: a?.dictation_sentences ?? [],
    application_activity: a?.application_activity ?? '',
  }
}

function useAssessmentSave<T extends object>(
  data: T,
  unitId: string,
  userId: string,
  level: AssessmentLevel
) {
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
        .from('assessments')
        .upsert(
          { unit_id: unitId, user_id: userId, level, ...data },
          { onConflict: 'unit_id,level' }
        )
      setSaveStatus(error ? 'error' : 'saved')
      if (!error) setTimeout(() => setSaveStatus('idle'), 2000)
    }, 800)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  return saveStatus
}

const ta = 'w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none'

export default function AssessmentEditor({ unitId, userId, initialAssessments }: Props) {
  const [activeLevel, setActiveLevel] = useState<AssessmentLevel>('beginner')
  const beginnerInit = initialAssessments.find(a => a.level === 'beginner')
  const intermediateInit = initialAssessments.find(a => a.level === 'intermediate')

  return (
    <div>
      <div className="flex gap-6 border-b border-gray-200 mb-6">
        {(['beginner', 'intermediate'] as AssessmentLevel[]).map(level => (
          <button
            key={level}
            onClick={() => setActiveLevel(level)}
            className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeLevel === level
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {activeLevel === 'beginner'
        ? <BeginnerSection unitId={unitId} userId={userId} initial={toBeginnerForm(beginnerInit)} />
        : <IntermediateSection unitId={unitId} userId={userId} initial={toIntermediateForm(intermediateInit)} />
      }
    </div>
  )
}

function BeginnerSection({ unitId, userId, initial }: { unitId: string; userId: string; initial: BeginnerForm }) {
  const [form, setForm] = useState<BeginnerForm>(initial)
  const saveStatus = useAssessmentSave(form, unitId, userId, 'beginner')

  function set<K extends keyof BeginnerForm>(field: K, value: BeginnerForm[K]) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold text-gray-900">Beginner Assessment</h2>
        <SaveIndicator status={saveStatus} />
      </div>
      <Field label="Word Reading">
        <ListEditor items={form.word_reading} onChange={v => set('word_reading', v)} placeholder="e.g., cat" />
      </Field>
      <Field label="Phrase Reading">
        <ListEditor items={form.phrase_reading} onChange={v => set('phrase_reading', v)} placeholder="e.g., a fat cat" />
      </Field>
      <Field label="Connected Text">
        <textarea value={form.connected_text} onChange={e => set('connected_text', e.target.value)} rows={4} placeholder="Short connected reading passage" className={ta} />
      </Field>
      <Field label="Spelling Words">
        <ListEditor items={form.spelling_words} onChange={v => set('spelling_words', v)} placeholder="e.g., cat" />
      </Field>
    </div>
  )
}

function IntermediateSection({ unitId, userId, initial }: { unitId: string; userId: string; initial: IntermediateForm }) {
  const [form, setForm] = useState<IntermediateForm>(initial)
  const saveStatus = useAssessmentSave(form, unitId, userId, 'intermediate')

  function set<K extends keyof IntermediateForm>(field: K, value: IntermediateForm[K]) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold text-gray-900">Intermediate Assessment</h2>
        <SaveIndicator status={saveStatus} />
      </div>
      <Field label="Sentence Reading">
        <ListEditor items={form.sentence_reading} onChange={v => set('sentence_reading', v)} placeholder="e.g., The cat sat on the mat." />
      </Field>
      <Field label="Dictation Sentences">
        <ListEditor items={form.dictation_sentences} onChange={v => set('dictation_sentences', v)} placeholder="e.g., The fat cat sat." />
      </Field>
      <Field label="Application Activity">
        <textarea value={form.application_activity} onChange={e => set('application_activity', e.target.value)} rows={4} placeholder="Extended writing or application task" className={ta} />
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
