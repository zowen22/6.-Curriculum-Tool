import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Unit } from '@/types/curriculum'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: units, error } = await supabase
    .from('units')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-gray-900 tracking-tight">
            Curriculum Units
          </h1>
          {units && units.length > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">{units.length} unit{units.length !== 1 ? 's' : ''}</p>
          )}
        </div>
        <Link
          href="/units/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold
                     text-white bg-brand-700 hover:bg-brand-800 active:bg-brand-900
                     shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        >
          <span className="text-base leading-none">+</span>
          New Unit
        </Link>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 mb-6">
          <p className="text-sm text-red-700">Error loading units: {error.message}</p>
        </div>
      )}

      {!units || units.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="font-serif text-4xl mb-3 text-gray-300">✦</div>
          <p className="text-gray-500 mb-4 font-medium">No units yet.</p>
          <Link
            href="/units/new"
            className="inline-flex items-center gap-1 text-brand-700 hover:text-brand-900 text-sm font-semibold transition-colors"
          >
            Create your first unit →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(units as Unit[]).map((unit) => (
            <Link
              key={unit.id}
              href={`/units/${unit.id}`}
              className="group block bg-white rounded-xl border border-gray-100 p-5
                         shadow-sm hover:shadow-md hover:border-brand-200
                         transition-all duration-150"
            >
              <div className="flex justify-between items-start mb-2.5">
                <h3 className="font-semibold text-gray-900 pr-2 group-hover:text-brand-800 transition-colors">
                  {unit.title}
                </h3>
                <StatusBadge status={unit.status} />
              </div>
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-700">{unit.phonics_skill}</span>
                <span className="mx-1.5 text-gray-300">·</span>
                <span className="capitalize">{unit.student_level}</span>
              </p>
              {unit.sequence_position && (
                <p className="text-xs text-gray-400 mt-1.5">Position {unit.sequence_position}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: Unit['status'] }) {
  const styles: Record<Unit['status'], string> = {
    draft:     'bg-gray-100 text-gray-500',
    review:    'bg-amber-50 text-amber-700 border border-amber-100',
    published: 'bg-brand-50 text-brand-700 border border-brand-100',
  }
  return (
    <span className={`shrink-0 px-2 py-0.5 rounded-md text-xs font-medium capitalize ${styles[status]}`}>
      {status}
    </span>
  )
}
