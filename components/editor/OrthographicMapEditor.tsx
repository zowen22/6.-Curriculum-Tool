'use client'

import { useState } from 'react'
import type { Segment } from '@/types/curriculum'

interface Props {
  word: string
  phonicsSkill?: string | null
  value: Segment[] | null
  onChange: (segments: Segment[]) => void
}

export default function OrthographicMapEditor({ word, phonicsSkill, value, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generate() {
    if (!word.trim()) return
    setLoading(true)
    setError(null)
    const res = await fetch('/api/orthographic-map', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word: word.trim(), phonicsSkill }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Generation failed')
    } else {
      onChange(data.segments)
    }
    setLoading(false)
  }

  function updateSegment(index: number, field: keyof Segment, val: string) {
    if (!value) return
    const updated = value.map((seg, i) => i === index ? { ...seg, [field]: val } : seg)
    onChange(updated)
  }

  function addSegment() {
    onChange([...(value ?? []), { grapheme: '', phoneme: '' }])
  }

  function removeSegment(index: number) {
    if (!value) return
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-medium text-gray-600">Orthographic Map</label>
        <button
          type="button"
          onClick={generate}
          disabled={loading || !word.trim()}
          className="text-xs text-brand-700 hover:text-brand-900 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
        >
          {loading ? (
            <>
              <span className="inline-block w-3 h-3 border border-brand-600 border-t-transparent rounded-full animate-spin" />
              Generating…
            </>
          ) : value ? 'Regenerate' : '✦ Generate'}
        </button>
      </div>

      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

      {value && value.length > 0 ? (
        <div className="space-y-2">
          <div className="overflow-x-auto">
            <table className="border-collapse text-sm">
              <tbody>
                <tr>
                  {value.map((seg, i) => (
                    <td key={i} className="border border-gray-300 px-1 py-0.5 text-center min-w-[3rem]">
                      <input
                        value={seg.grapheme}
                        onChange={e => updateSegment(i, 'grapheme', e.target.value)}
                        className="w-full text-center text-sm font-medium text-gray-900 bg-transparent focus:outline-none focus:bg-brand-50 rounded px-1"
                        placeholder="gr"
                      />
                    </td>
                  ))}
                  <td className="pl-1">
                    <button
                      type="button"
                      onClick={addSegment}
                      className="text-gray-400 hover:text-brand-700 text-lg leading-none transition-colors"
                      title="Add segment"
                    >
                      +
                    </button>
                  </td>
                </tr>
                <tr>
                  {value.map((seg, i) => (
                    <td key={i} className="border border-gray-300 px-1 py-0.5 text-center min-w-[3rem] bg-brand-50">
                      <input
                        value={seg.phoneme}
                        onChange={e => updateSegment(i, 'phoneme', e.target.value)}
                        className="w-full text-center text-xs text-brand-700 bg-transparent focus:outline-none focus:bg-brand-100 rounded px-1"
                        placeholder="/p/"
                      />
                    </td>
                  ))}
                  <td className="pl-1" />
                </tr>
                <tr>
                  {value.map((_, i) => (
                    <td key={i} className="text-center pt-0.5">
                      <button
                        type="button"
                        onClick={() => removeSegment(i)}
                        className="text-gray-300 hover:text-red-400 text-xs"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </td>
                  ))}
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400">Edit any cell directly. Changes save with the word.</p>
        </div>
      ) : (
        !loading && (
          <div className="h-16 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-xs text-gray-400">
              {word.trim() ? 'Click ✦ Generate to map graphemes → phonemes' : 'Enter a word first'}
            </p>
          </div>
        )
      )}
    </div>
  )
}
