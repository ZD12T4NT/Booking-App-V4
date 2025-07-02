'use client'

import { ThemeProvider } from 'next-themes'
import { ReactNode, useState } from 'react'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { Toaster } from 'sonner'

export default function Providers({ children }: { children: ReactNode }) {
  const [supabaseClient] = useState(() => supabaseBrowser)

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <SessionContextProvider supabaseClient={supabaseClient}>
        <Toaster />
        {children}
      </SessionContextProvider>
    </ThemeProvider>
  )
}
