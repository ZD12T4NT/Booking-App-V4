'use client'

import { ThemeProvider } from 'next-themes'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ReactNode } from 'react'

export default function Providers({ children }: { children: ReactNode }) {
  const supabase = createClientComponentClient()

  return (
    <SessionContextProvider supabaseClient={supabase}>
      <ThemeProvider attribute="class" defaultTheme="light">
        {children}
      </ThemeProvider>
    </SessionContextProvider>
  )
}
