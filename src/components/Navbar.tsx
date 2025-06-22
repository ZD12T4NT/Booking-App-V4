'use client'
import Link from 'next/link'
import DarkToggle from './DarkToggle'
import { useSessionContext, useUser } from '@supabase/auth-helpers-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function Navbar() {
  const supabase = createClientComponentClient()
  const { session } = useSessionContext()
  const user = useUser()

  const logout = async () => await supabase.auth.signOut()

  return (
    <nav className="flex justify-between p-4 bg-white dark:bg-gray-800">
      <Link href="/">Logo</Link>
      <div className="space-x-4">
        <Link href="/services">Services</Link>
        {/* add more links */}
      </div>
      <div className="flex items-center space-x-4">
        <DarkToggle />
        {session ? (
          <>
            <Link href="/dashboard/user">Dashboard</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <Link href="/auth/login">Login</Link>
        )}
      </div>
    </nav>
  )
}
