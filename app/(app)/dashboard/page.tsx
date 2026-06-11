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
        <h1 className="text-2xl font-bold text-gray-900">Curriculum Units</h1>
        <Link
          href="/units/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          + New Unit
        </Link>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <p className="text-sm text-red-700">Error loading units: {error.message}</p>
        </div>
      )}

      {!units || units.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-3">No units yet.</p>
          <Link href="/units/new" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
            Create your first unit →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(units as Unit[]).map((unit) => (
            <Link
              key={unit.id}
              href={`/units/${unit.id}`}
              className="block bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 pr-2">{unit.title}</h3>
                <StatusBadge status={unit.status} />
              </div>
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-700">{unit.phonics_skill}</span>
                {' · '}
                <span className="capitalize">{unit.student_level}</span>
              </p>
              {unit.sequence_position && (
                <p className="text-xs text-gray-400 mt-1">Position {unit.sequence_position}</p>
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
    draft: 'bg-gray-100 text-gray-600',
    review: 'bg-yellow-100 text-yellow-700',
    published: 'bg-green-100 text-green-700',
  }
  return (
    <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium capitalize ${styles[status]}`}>
      {status}
    </span>
  )
}
