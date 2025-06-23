'use client'

import Link from 'next/link'
import DarkToggle from './DarkToggle'
import { useSessionContext, useUser } from '@supabase/auth-helpers-react'

export default function Navbar() {
  const { supabaseClient, session } = useSessionContext()
  const user = useUser()

  const logout = async () => {
    await supabaseClient.auth.signOut()
  }

  return (
    <nav className="flex justify-between p-4 bg-white dark:bg-gray-800">
      <Link href="/">BetterBooking.</Link>
      <div className="space-x-4">
        <Link href="/services">Services</Link>
      </div>
      <div className="flex items-center space-x-4">
        <DarkToggle />
        {session ? (
          <>
            <Link href="/dashboard/user">Dashboard</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <Link href="/auth">Login</Link>
        )}
      </div>
    </nav>
  )
}
