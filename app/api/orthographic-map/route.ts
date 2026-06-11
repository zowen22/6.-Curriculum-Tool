import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { word, phonicsSkill } = await request.json()
  if (!word) return NextResponse.json({ error: 'Missing word' }, { status: 400 })

  const systemPrompt = `You are a phonics expert specializing in Science of Reading instruction for English learners. Segment words into grapheme-phoneme pairs accurately.

Rules:
- Grapheme: one or more letters representing a single phoneme (e.g., "ch", "ee", "igh", "tch")
- Phoneme: the sound in simple phonics notation (e.g., /ch/, /ee/, /ie/, /ch/)
- Multi-letter graphemes must be kept together (e.g., "sh", "th", "oa", "igh")
- Silent letters get their own segment with an empty phoneme (e.g., the "e" in "cake" → grapheme "e", phoneme "silent")
- Account for all letters in the word — no letters left over`

  const userPrompt = `Segment the word "${word}" into grapheme-phoneme pairs.${
    phonicsSkill ? ` The target phonics skill is "${phonicsSkill}" — ensure that pattern is segmented correctly.` : ''
  }`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'orthographic_map',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              segments: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    grapheme: { type: 'string' },
                    phoneme: { type: 'string' },
                  },
                  required: ['grapheme', 'phoneme'],
                  additionalProperties: false,
                },
              },
            },
            required: ['segments'],
            additionalProperties: false,
          },
        },
      },
      temperature: 0.1,
    })

    const content = completion.choices[0].message.content
    if (!content) return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
    const { segments } = JSON.parse(content) as { segments: { grapheme: string; phoneme: string }[] }
    return NextResponse.json({ segments })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI request failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
