import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { SYSTEM_PROMPT, CURRICULUM_SCHEMA, buildUserPrompt, type GeneratedCurriculum } from '@/lib/prompts/curriculum'

export const maxDuration = 60

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { unitId } = await request.json()

  const { data: unit, error: unitError } = await supabase
    .from('units')
    .select('*')
    .eq('id', unitId)
    .single()

  if (unitError || !unit) return NextResponse.json({ error: 'Unit not found' }, { status: 404 })

  let generated: GeneratedCurriculum
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(unit) },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'curriculum_unit',
          strict: true,
          schema: CURRICULUM_SCHEMA,
        },
      },
      temperature: 0.7,
    })

    const content = completion.choices[0].message.content
    if (!content) return NextResponse.json({ error: 'No content returned from AI' }, { status: 500 })
    generated = JSON.parse(content) as GeneratedCurriculum
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  // Replace vocabulary (delete existing, insert new)
  await supabase.from('vocabulary').delete().eq('unit_id', unitId)
  if (generated.vocabulary.length > 0) {
    await supabase.from('vocabulary').insert(
      generated.vocabulary.map((w, i) => ({
        unit_id: unitId,
        user_id: user.id,
        word: w.word,
        definition: w.definition || null,
        difficulty_level: w.difficulty_level,
        instructional_category: w.instructional_category,
        language_transfer_notes: w.language_transfer_notes || null,
        order_index: i,
      }))
    )
  }

  // Upsert workbook
  await supabase.from('workbook_content').upsert(
    {
      unit_id: unitId,
      user_id: user.id,
      lesson_introduction: generated.workbook.lesson_introduction || null,
      word_practice: generated.workbook.word_practice,
      phrase_practice: generated.workbook.phrase_practice,
      sentence_practice: generated.workbook.sentence_practice,
      decodable_text: generated.workbook.decodable_text || null,
      activities: generated.workbook.activities,
    },
    { onConflict: 'unit_id' }
  )

  // Upsert teacher content
  await supabase.from('teacher_content').upsert(
    {
      unit_id: unitId,
      user_id: user.id,
      objective: generated.teacher.objective || null,
      teaching_guidance: generated.teacher.teaching_guidance || null,
      language_transfer_notes: generated.teacher.language_transfer_notes || null,
      common_errors: generated.teacher.common_errors || null,
      example_responses: generated.teacher.example_responses || null,
    },
    { onConflict: 'unit_id' }
  )

  // Upsert beginner assessment
  await supabase.from('assessments').upsert(
    {
      unit_id: unitId,
      user_id: user.id,
      level: 'beginner',
      word_reading: generated.assessment_beginner.word_reading,
      phrase_reading: generated.assessment_beginner.phrase_reading,
      connected_text: generated.assessment_beginner.connected_text || null,
      spelling_words: generated.assessment_beginner.spelling_words,
    },
    { onConflict: 'unit_id,level' }
  )

  // Upsert intermediate assessment
  await supabase.from('assessments').upsert(
    {
      unit_id: unitId,
      user_id: user.id,
      level: 'intermediate',
      sentence_reading: generated.assessment_intermediate.sentence_reading,
      dictation_sentences: generated.assessment_intermediate.dictation_sentences,
      application_activity: generated.assessment_intermediate.application_activity || null,
    },
    { onConflict: 'unit_id,level' }
  )

  return NextResponse.json({ success: true })
}
