import { supabaseServer } from '@/lib/supabaseServer'
import { LoginCard } from '@/components/AuthButtons'
import { EntitiesWithControls } from '@/components/EntitiesWithControls'
import { SectionErrorBoundary } from '@/components/ErrorBoundary'

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
