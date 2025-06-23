'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DarkToggle from './DarkToggle'
import { useSessionContext, useUser } from '@supabase/auth-helpers-react'

export default function Navbar() {
  const { supabaseClient, session } = useSessionContext()
  const user = useUser()
  const router = useRouter()

  const logout = async () => {
    await supabaseClient.auth.signOut()
    router.push('/auth') // Redirect to login after logout
  }

  return (
    <nav className="flex justify-between p-4 bg-white dark:bg-[#0a0a0a] z-20 relative">
      <Link href="/">BetterBooking.</Link>
      <div className="space-x-4">
        <Link href="/services">Services</Link>
      </div>
      <div className="flex items-center space-x-4">
        <DarkToggle />
        {session ? (
          <>
            <Link href="/dashboard/user">Dashboard</Link>
            <button className="cursor-pointer" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <Link href="/auth">Login</Link>
        )}
      </div>
    </nav>
  )
}
