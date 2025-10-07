import React from 'react'
import { supabaseServer } from '@/lib/supabaseServer'
import { AuthButtons } from '@/components/AuthButtons'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import '@/app/globals.css'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <html lang="en">
      <head>
        <title>Home Controls</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-gray-950 text-gray-100 antialiased">
        <ErrorBoundary>
          <div className="max-w-6xl mx-auto p-4">
            <header className="flex items-center justify-between py-4">
              <h1 className="text-2xl font-semibold">🏠 Home Controls</h1>
              <AuthButtons user={user} />
            </header>
            {children}
          </div>
        </ErrorBoundary>
      </body>
    </html>
  )
}
