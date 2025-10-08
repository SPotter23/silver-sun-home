import { supabaseServer } from '@/lib/supabaseServer'
import { LoginCard } from '@/components/AuthButtons'
import { EntitiesWithControls } from '@/components/EntitiesWithControls'
import { SectionErrorBoundary } from '@/components/ErrorBoundary'
import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'

export default async function HomePage() {
  const supabase = supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="space-y-6">
      {!user ? (
        <section className="grid gap-3">
          <p className="text-sm text-gray-300">Sign in to see and control your devices.</p>
          <LoginCard />
        </section>
      ) : (
        <>
          <section className="grid gap-2">
            <h2 className="text-xl font-medium">Welcome back{user.email ? `, ${user.email}` : ''}.</h2>
            <p className="text-sm text-gray-300">Your dashboard pulls live entities from Home Assistant via a secure server proxy.</p>
          </section>

          {/* New Dashboard Link */}
          <section>
            <Link
              href="/dashboard"
              className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl p-4 transition-all hover:scale-[1.02] border border-blue-500/50"
            >
              <div className="p-2 bg-white/20 rounded-lg">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Custom Dashboard</h3>
                <p className="text-sm text-blue-100">View your personalized home control center</p>
              </div>
              <svg
                className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </section>

          <section className="grid gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Devices</h3>
            </div>
            <SectionErrorBoundary>
              <EntitiesWithControls defaultAutoRefresh={false} />
            </SectionErrorBoundary>
          </section>
        </>
      )}
    </main>
  )
}
