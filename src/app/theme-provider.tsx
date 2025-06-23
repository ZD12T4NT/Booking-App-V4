'use client'

import { ThemeProvider } from 'next-themes'
import { ReactNode } from 'react'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useState } from 'react'

export default function Providers({
  children,
}: {
  children: ReactNode
}) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient())

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <SessionContextProvider supabaseClient={supabaseClient}>
        {children}
      </SessionContextProvider>
    </ThemeProvider>
  )
}
