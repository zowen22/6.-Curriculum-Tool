'use client'

import { useState, useEffect } from 'react'

interface Photo {
  id: number
  thumb: string
  full: string
  photographer: string
}

interface Props {
  initialQuery: string
  onSelect: (url: string) => void
  onClose: () => void
}

export default function ImageSearchModal({ initialQuery, onSelect, onClose }: Props) {
  const [query, setQuery] = useState(initialQuery)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Photo | null>(null)

  useEffect(() => {
    if (initialQuery) doSearch(initialQuery)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function doSearch(q: string) {
    if (!q.trim()) return
    setLoading(true)
    setError(null)
    setPhotos([])
    setSelected(null)
    const res = await fetch(`/api/images/search?q=${encodeURIComponent(q.trim())}`)
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Search failed')
    } else {
      setPhotos(data.photos)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Search Images</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch(query)}
              placeholder="Search Pexels…"
              autoFocus
              className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm
                         focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors"
            />
            <button
              onClick={() => doSearch(query)}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-brand-700 text-white text-sm font-medium
                         hover:bg-brand-800 disabled:opacity-50 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        <div className="p-4 min-h-[220px]">
          {loading && (
            <div className="flex items-center justify-center h-40">
              <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {error && <p className="text-sm text-red-600 text-center py-8">{error}</p>}
          {!loading && !error && photos.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No results — try a different search term</p>
          )}
          {!loading && photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {photos.map(photo => (
                <button
                  key={photo.id}
                  onClick={() => setSelected(photo)}
                  className={`relative rounded-lg overflow-hidden border-2 transition-colors aspect-video ${
                    selected?.id === photo.id
                      ? 'border-brand-600'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={photo.thumb} alt={photo.photographer} className="w-full h-full object-cover" />
                  {selected?.id === photo.id && (
                    <div className="absolute inset-0 bg-brand-600/20 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center">
          <p className="text-xs text-gray-400">Photos by Pexels</p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => selected && onSelect(selected.full)}
              disabled={!selected}
              className="px-4 py-1.5 rounded-lg bg-brand-700 text-white text-sm font-medium
                         hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Use Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
