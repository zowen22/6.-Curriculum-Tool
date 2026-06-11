import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import UnitEditor from '@/components/editor/UnitEditor'
import type { UnitWithContent } from '@/types/curriculum'

export default async function UnitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: unit, error: unitError },
    { data: vocabulary },
    { data: workbook },
    { data: teacher },
    { data: assessments },
  ] = await Promise.all([
    supabase.from('units').select('*').eq('id', id).single(),
    supabase.from('vocabulary').select('*').eq('unit_id', id).order('order_index'),
    supabase.from('workbook_content').select('*').eq('unit_id', id).maybeSingle(),
    supabase.from('teacher_content').select('*').eq('unit_id', id).maybeSingle(),
    supabase.from('assessments').select('*').eq('unit_id', id).order('level'),
  ])

  if (unitError || !unit) notFound()

  const content: UnitWithContent = {
    unit,
    vocabulary: vocabulary ?? [],
    workbook: workbook ?? null,
    teacher: teacher ?? null,
    assessments: assessments ?? [],
  }

  return <UnitEditor initialContent={content} />
}
