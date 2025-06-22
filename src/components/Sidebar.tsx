'use client'
import Link from 'next/link'
import { useUser, useSessionContext } from '@supabase/auth-helpers-react'

export default function Sidebar() {
  const user = useUser()
  const role = 'user' // fetch from profile in real implementation

  const links = role === 'admin'
    ? [{ href: '/dashboard/admin', label: 'Admin Home' }]
    : [{ href: '/dashboard/user', label: 'User Home' }]

  return (
    <aside className="w-64 border-r p-4">
      <ul>
        {links.map(link => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}
