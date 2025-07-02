'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSessionContext } from '@supabase/auth-helpers-react'
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  PanelRightOpen,
  PanelRightClose,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState, useCallback, useMemo } from 'react'

interface SidebarProps {
  onNavigate?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const pathname = usePathname()
  const router = useRouter()
  const { supabaseClient } = useSessionContext()
  const [collapsed, setCollapsed] = useState(false)
 const [role, setRole] = useState<'admin' | 'user' | null>(null);


  // Fetch latest user info instead of relying on session
 useEffect(() => {
  const fetchRole = async () => {
    const { data: authData } = await supabaseClient.auth.getUser()
    const user = authData?.user
    if (!user) return

    // 1. Check metadata
    let role = user.user_metadata?.role

    // 2. If missing, fetch from `profiles` table
    
    // Fallback to profiles table if role is missing
            if (!role) {
              const { data: profileData, error } = await supabaseClient
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

              if (error) {
                console.error('Error fetching role from profiles:', error.message)
                return
              }

              role = profileData?.role

              // Optional: sync role back to metadata so next login is faster
              if (role) {
                await supabaseClient.auth.updateUser({
                  data: { role },
                })
              }
            }

            if (role === 'admin' || role === 'user') {
              setRole(role)
            }

            if (!role) return null // or show a spinner


        }

        fetchRole()

  const { data: listener } = supabaseClient.auth.onAuthStateChange(() => {
    fetchRole()
  })

  return () => {
    listener?.subscription.unsubscribe()
  }
}, [supabaseClient])

  const commonLinks = useMemo(() => [
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
  ], [role])

  const adminLinks = useMemo(() => [
    {
      href: `/dashboard/admin/users`,
      label: 'Manage Users',
      icon: <Users className="h-4 w-4" />,
    },
  ], [])

  const links = role === 'admin' ? [...commonLinks, ...adminLinks] : commonLinks

  const logout = useCallback(async () => {
    await supabaseClient.auth.signOut()
    router.push('/auth')
  }, [supabaseClient, router])

  return (
    <aside
      className={cn(
        'min-h-screen bg-muted border-r transition-all duration-300 flex flex-col justify-between',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="space-y-2 p-4">
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="mb-4 p-2 rounded hover:bg-muted-foreground/10 transition"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
        </button>

        {links.map(({ href, label, icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                'flex items-center space-x-3 rounded-md py-2 px-3 transition-colors hover:bg-muted-foreground/10',
                isActive && 'bg-muted-foreground/10 font-medium'
              )}
            >
              {icon}
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </div>

      <div className="p-4">
        <button
          onClick={logout}
          aria-label="Logout"
          className={cn(
            'flex items-center space-x-2 text-sm text-destructive hover:underline',
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

export default Sidebar
