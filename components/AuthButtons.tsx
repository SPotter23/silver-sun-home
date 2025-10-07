'use client'
import { supabaseBrowser } from '@/lib/supabaseBrowser'
import { User } from '@supabase/supabase-js'

interface AuthButtonsProps {
  user: User | null
}

export function AuthButtons({ user }: AuthButtonsProps) {
  const handleSignOut = async () => {
    await supabaseBrowser().auth.signOut()
    window.location.reload()
  }

  const handleSignIn = async () => {
    try {
      const { data, error } = await supabaseBrowser().auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        console.error('Sign in error:', error)
        alert(`Sign in failed: ${error.message}`)
        return
      }

      if (!data?.url) {
        console.error('No redirect URL received from Supabase')
        alert('Sign in failed: No redirect URL received. Check Supabase configuration.')
        return
      }

      window.location.assign(data.url)
    } catch (err) {
      console.error('Unexpected sign in error:', err)
      alert(`Sign in failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="flex gap-2">
      {user ? (
        <button onClick={handleSignOut} className="px-3 py-1.5 rounded-xl bg-gray-700 hover:bg-gray-600">
          Sign out
        </button>
      ) : (
        <button onClick={handleSignIn} className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500">
          Sign in
        </button>
      )}
    </div>
  )
}

export function LoginCard() {
  return (
    <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 max-w-md">
      <h3 className="font-medium mb-2">Sign in</h3>
      <p className="text-sm text-gray-300 mb-3">Use Google SSO via Supabase Auth.
      You can add other providers (Apple, GitHub, email magic links) in Supabase.</p>
      <AuthButtons user={null} />
    </div>
  )
}
