import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen" style={{ background: '#fafaf8' }}>
      <nav className="bg-brand-900 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-14">
          <Link href="/dashboard" className="flex items-baseline gap-2">
            <span className="font-serif text-lg font-semibold text-white tracking-tight">
              Emma&apos;s Curriculum Tool
            </span>
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm text-brand-200 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>
    </div>
  )
}
