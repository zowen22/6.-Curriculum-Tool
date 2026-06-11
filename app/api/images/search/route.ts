import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface PexelsPhoto {
  id: number
  src: { medium: string; large: string }
  photographer: string
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  if (!q) return NextResponse.json({ error: 'Missing query' }, { status: 400 })

  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Pexels API key not configured' }, { status: 500 })

  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=9&orientation=landscape`,
    { headers: { Authorization: apiKey } }
  )

  if (!res.ok) return NextResponse.json({ error: 'Pexels request failed' }, { status: 502 })

  const data = await res.json() as { photos: PexelsPhoto[] }
  const photos = data.photos.map(p => ({
    id: p.id,
    thumb: p.src.medium,
    full: p.src.large,
    photographer: p.photographer,
  }))

  return NextResponse.json({ photos })
}
