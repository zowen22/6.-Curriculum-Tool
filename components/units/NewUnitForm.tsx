'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { NewUnitInput, StudentLevel } from '@/types/curriculum'

const STUDENT_LEVELS: { value: StudentLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export default function NewUnitForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customVocabInput, setCustomVocabInput] = useState('')
  const [form, setForm] = useState<NewUnitInput>({
    title: '',
    phonics_skill: '',
    student_level: 'beginner',
    language_transfer_enabled: true,
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const target = e.target
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value
    setForm((prev) => ({ ...prev, [target.name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Session expired. Please sign in again.')
      setLoading(false)
      return
    }

    const customVocabulary = customVocabInput
      ? customVocabInput.split(',').map((w) => w.trim()).filter(Boolean)
      : null

    const { data, error } = await supabase
      .from('units')
      .insert({
        user_id: user.id,
        title: form.title,
        phonics_skill: form.phonics_skill,
        sequence_position: form.sequence_position ?? null,
        student_level: form.student_level,
        language_transfer_enabled: form.language_transfer_enabled,
        custom_vocabulary: customVocabulary,
        status: 'draft',
      })
      .select()
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(`/units/${data.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Unit Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={form.title}
          onChange={handleChange}
          placeholder="e.g., Short A — Middle School Newcomers"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="phonics_skill" className="block text-sm font-medium text-gray-700 mb-1">
          Target Phonics Skill <span className="text-red-500">*</span>
        </label>
        <input
          id="phonics_skill"
          name="phonics_skill"
          type="text"
          required
          value={form.phonics_skill}
          onChange={handleChange}
          placeholder="e.g., Short A, Long E, Digraph CH"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="student_level" className="block text-sm font-medium text-gray-700 mb-1">
            Student Level <span className="text-red-500">*</span>
          </label>
          <select
            id="student_level"
            name="student_level"
            value={form.student_level}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {STUDENT_LEVELS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sequence_position" className="block text-sm font-medium text-gray-700 mb-1">
            Scope & Sequence Position
          </label>
          <input
            id="sequence_position"
            name="sequence_position"
            type="number"
            min={1}
            value={form.sequence_position ?? ''}
            onChange={handleChange}
            placeholder="e.g., 3"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          id="language_transfer_enabled"
          name="language_transfer_enabled"
          type="checkbox"
          checked={form.language_transfer_enabled}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="language_transfer_enabled" className="text-sm text-gray-700">
          Include language transfer notes (Spanish)
        </label>
      </div>

      <div>
        <label htmlFor="custom_vocabulary" className="block text-sm font-medium text-gray-700 mb-1">
          Custom Vocabulary
          <span className="ml-1 text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          id="custom_vocabulary"
          type="text"
          value={customVocabInput}
          onChange={(e) => setCustomVocabInput(e.target.value)}
          placeholder="cat, map, class, bat"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <p className="mt-1 text-xs text-gray-400">Comma-separated. Leave blank to let AI generate vocabulary.</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating…' : 'Create Unit'}
        </button>
        <a
          href="/dashboard"
          className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
