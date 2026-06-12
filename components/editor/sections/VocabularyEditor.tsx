'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { VocabularyWord, DifficultyLevel, InstructionalCategory } from '@/types/curriculum'
import ImageSearchModal from '../ImageSearchModal'
import OrthographicMapEditor from '../OrthographicMapEditor'

interface Props {
  unitId: string
  userId: string
  phonicsSkill: string
  initialWords: VocabularyWord[]
}

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const CATEGORY_OPTIONS: { value: InstructionalCategory; label: string }[] = [
  { value: 'core', label: 'Core Instructional' },
  { value: 'functional', label: 'Functional' },
  { value: 'teacher_note', label: 'Teacher Note' },
]

const inputClass = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors'

export default function VocabularyEditor({ unitId, userId, phonicsSkill, initialWords }: Props) {
  const [words, setWords] = useState<VocabularyWord[]>(initialWords)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingWord, setEditingWord] = useState<VocabularyWord | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)

  function handleExpand(word: VocabularyWord) {
    if (expandedId === word.id) {
      setExpandedId(null)
      setEditingWord(null)
    } else {
      setExpandedId(word.id)
      setEditingWord({ ...word })
    }
  }

  function handleAddWord() {
    const tempId = `new-${Date.now()}`
    const newWord: VocabularyWord = {
      id: tempId,
      unit_id: unitId,
      user_id: userId,
      word: '',
      definition: null,
      image_url: null,
      phoneme_grapheme_map: null,
      difficulty_level: null,
      instructional_category: 'core',
      language_transfer_notes: null,
      order_index: words.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setWords(prev => [...prev, newWord])
    setExpandedId(tempId)
    setEditingWord(newWord)
  }

  function handleEditField<K extends keyof VocabularyWord>(field: K, value: VocabularyWord[K]) {
    setEditingWord(prev => prev ? { ...prev, [field]: value } : null)
  }

  async function handleSave() {
    if (!editingWord || !editingWord.word.trim()) return
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const isNew = editingWord.id.startsWith('new-')

    if (isNew) {
      const { data, error } = await supabase
        .from('vocabulary')
        .insert({
          unit_id: editingWord.unit_id,
          user_id: editingWord.user_id,
          word: editingWord.word.trim(),
          definition: editingWord.definition || null,
          image_url: editingWord.image_url || null,
          phoneme_grapheme_map: editingWord.phoneme_grapheme_map || null,
          difficulty_level: editingWord.difficulty_level,
          instructional_category: editingWord.instructional_category,
          language_transfer_notes: editingWord.language_transfer_notes || null,
          order_index: editingWord.order_index,
        })
        .select()
        .single()

      if (error) {
        setError(error.message)
      } else if (data) {
        setWords(prev => prev.map(w => w.id === editingWord.id ? data : w))
        setExpandedId(data.id)
        setEditingWord(data)
      }
    } else {
      const { error } = await supabase
        .from('vocabulary')
        .update({
          word: editingWord.word.trim(),
          definition: editingWord.definition || null,
          image_url: editingWord.image_url || null,
          phoneme_grapheme_map: editingWord.phoneme_grapheme_map || null,
          difficulty_level: editingWord.difficulty_level,
          instructional_category: editingWord.instructional_category,
          language_transfer_notes: editingWord.language_transfer_notes || null,
        })
        .eq('id', editingWord.id)

      if (error) {
        setError(error.message)
      } else {
        setWords(prev => prev.map(w => w.id === editingWord.id ? { ...w, ...editingWord } : w))
        setExpandedId(null)
        setEditingWord(null)
      }
    }

    setSaving(false)
  }

  async function handleDelete(wordId: string) {
    if (wordId.startsWith('new-')) {
      setWords(prev => prev.filter(w => w.id !== wordId))
      setExpandedId(null)
      setEditingWord(null)
      return
    }
    const supabase = createClient()
    const { error } = await supabase.from('vocabulary').delete().eq('id', wordId)
    if (!error) {
      setWords(prev => prev.filter(w => w.id !== wordId))
      if (expandedId === wordId) { setExpandedId(null); setEditingWord(null) }
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-gray-900">
          Vocabulary <span className="text-gray-400 font-normal text-sm">({words.length} words)</span>
        </h2>
        <button onClick={handleAddWord} className="text-sm text-brand-700 hover:text-brand-900 font-medium transition-colors">
          + Add Word
        </button>
      </div>

      {words.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <p className="text-sm text-gray-500 mb-2">No vocabulary words yet.</p>
          <button onClick={handleAddWord} className="text-sm text-brand-700 hover:text-brand-900 font-medium transition-colors">
            Add the first word →
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {words.map(word => (
            <div key={word.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => handleExpand(word)}
                className="w-full flex justify-between items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {word.image_url && (
                    <img src={word.image_url} alt={word.word} className="shrink-0 w-8 h-8 rounded object-cover" />
                  )}
                  <span className="font-medium text-gray-900 truncate">
                    {word.word || <span className="text-gray-400 italic font-normal text-sm">New word…</span>}
                  </span>
                  {word.instructional_category !== 'core' && (
                    <span className="shrink-0 text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded capitalize">
                      {word.instructional_category.replace('_', ' ')}
                    </span>
                  )}
                </div>
                <span className="text-gray-400 shrink-0 ml-2 text-xs">
                  {expandedId === word.id ? '▲' : '▼'}
                </span>
              </button>

              {expandedId === word.id && editingWord?.id === word.id && (
                <div className="px-4 pb-4 border-t border-gray-100 space-y-4 pt-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Word *</label>
                    <input
                      type="text"
                      value={editingWord.word}
                      onChange={e => handleEditField('word', e.target.value)}
                      placeholder="e.g., cat"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Definition</label>
                    <textarea
                      value={editingWord.definition ?? ''}
                      onChange={e => handleEditField('definition', e.target.value || null)}
                      placeholder="Simple, age-appropriate definition"
                      rows={2}
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Difficulty</label>
                      <select
                        value={editingWord.difficulty_level ?? ''}
                        onChange={e => handleEditField('difficulty_level', (e.target.value as DifficultyLevel) || null)}
                        className={inputClass}
                      >
                        <option value="">—</option>
                        {DIFFICULTY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                      <select
                        value={editingWord.instructional_category}
                        onChange={e => handleEditField('instructional_category', e.target.value as InstructionalCategory)}
                        className={inputClass}
                      >
                        {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Language Transfer Notes</label>
                    <textarea
                      value={editingWord.language_transfer_notes ?? ''}
                      onChange={e => handleEditField('language_transfer_notes', e.target.value || null)}
                      placeholder="Spanish cognates, transfer notes, or pronunciation tips"
                      rows={2}
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <div>
                    <OrthographicMapEditor
                      word={editingWord.word}
                      phonicsSkill={phonicsSkill}
                      value={editingWord.phoneme_grapheme_map}
                      onChange={map => handleEditField('phoneme_grapheme_map', map)}
                    />
                  </div>

                  <div className="pt-2 border-t border-gray-100 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">Image</label>
                      {editingWord.image_url ? (
                        <div>
                          <img
                            src={editingWord.image_url}
                            alt={editingWord.word}
                            className="w-full h-32 object-cover rounded border border-gray-200"
                          />
                          <div className="flex gap-3 mt-1.5">
                            <button
                              type="button"
                              onClick={() => setShowImageModal(true)}
                              className="text-xs text-brand-700 hover:text-brand-900 transition-colors"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditField('image_url', null)}
                              className="text-xs text-red-500 hover:text-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowImageModal(true)}
                          className="w-full h-20 border-2 border-dashed border-gray-200 rounded flex items-center justify-center text-sm text-gray-400 hover:border-brand-300 hover:text-brand-500 transition-colors"
                        >
                          + Search image
                        </button>
                      )}
                    </div>
                    {error && <p className="text-xs text-red-600">{error}</p>}
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        disabled={saving || !editingWord.word.trim()}
                        className="flex-1 py-2 px-4 rounded text-sm font-medium text-white bg-brand-700 hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={() => handleDelete(word.id)}
                        className="py-2 px-3 rounded border border-red-200 text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showImageModal && editingWord && (
        <ImageSearchModal
          initialQuery={editingWord.word}
          onSelect={url => {
            handleEditField('image_url', url)
            setShowImageModal(false)
          }}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </div>
  )
}
