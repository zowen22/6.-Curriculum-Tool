import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { WorkbookPDF } from '@/lib/pdf/workbook'
import type { UnitWithContent } from '@/types/curriculum'

export const maxDuration = 30

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const unitId = searchParams.get('unitId')
  if (!unitId) return NextResponse.json({ error: 'Missing unitId' }, { status: 400 })

  const [unitRes, vocabRes, workbookRes] = await Promise.all([
    supabase.from('units').select('*').eq('id', unitId).eq('user_id', user.id).single(),
    supabase.from('vocabulary').select('*').eq('unit_id', unitId).order('order_index'),
    supabase.from('workbook_content').select('*').eq('unit_id', unitId).maybeSingle(),
  ])

  if (unitRes.error || !unitRes.data) {
    return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
  }

  const data: UnitWithContent = {
    unit: unitRes.data,
    vocabulary: vocabRes.data ?? [],
    workbook: workbookRes.data ?? null,
    teacher: null,
    assessments: [],
  }

  try {
    const buffer = await renderToBuffer(<WorkbookPDF data={data} />)
    const slug = data.unit.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()
    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${slug}-workbook.pdf"`,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'PDF generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
