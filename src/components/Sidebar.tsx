'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSessionContext } from '@supabase/auth-helpers-react'
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  PanelRightOpen,
  PanelRightClose,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface SidebarProps {
  onNavigate?: () => void
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { supabaseClient, session } = useSessionContext()

  const role = session?.user.user_metadata.role ?? 'user'

  const [collapsed, setCollapsed] = useState(false)

  const commonLinks = [
    {
      href: `/dashboard/${role}`,
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      href: `/dashboard/${role}/settings`,
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
    },
  ]

  const adminLinks = [
    {
      href: `/dashboard/admin/users`,
      label: 'Manage Users',
      icon: <Users className="h-4 w-4" />,
    },
  ]

  const links = [...commonLinks, ...(role === 'admin' ? adminLinks : [])]

  const logout = async () => {
    await supabaseClient.auth.signOut()
    router.push('/auth')
  }

  return (
    <aside
      className={cn(
        'min-h-screen bg-muted border-r transition-all duration-300 flex flex-col justify-between',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="space-y-2 p-4">
        {/* <h2 className="text-lg font-semibold">Navigation</h2> */}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mb-4 cursor-pointer transition"
        >
          {collapsed ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
        </button>

        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center space-x-3 rounded-md hover:underline ',
              pathname === link.href && 'underline font-medium'
            )} 
          >
            {link.icon}
            {!collapsed && <span>{link.label}</span>}
          </Link>
        ))}
      </div>

      <div className="p-4">
        <button
          onClick={logout}
          className={cn(
            'flex items-center space-x-2 text-sm hover:text-destructive',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
