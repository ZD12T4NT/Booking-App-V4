'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionContext } from '@supabase/auth-helpers-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { LogOut, Settings, User } from 'lucide-react'
import DarkToggle from './DarkToggle'
import Link from 'next/link'

export default function DashboardNavbar() {
  const { session, supabaseClient } = useSessionContext()
  const router = useRouter()
  const userInitial = session?.user?.email?.[0].toUpperCase() || 'U'

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabaseClient.auth.getUser()
      if (data?.user) {
        setAvatarUrl(data.user.user_metadata?.avatar_url ?? null)
      }
    }

    getUser()

    // Optional: subscribe to auth changes so it updates on reauth too
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(() => {
      getUser()
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [supabaseClient])

  const handleLogout = async () => {
    await supabaseClient.auth.signOut()
    router.push('/auth')
  }

  return (
    <nav className="flex justify-between items-center px-6 py-3 border-b bg-background">
      <Link href="/" className="text-xl font-semibold">BetterBooking.</Link>

      <div className="flex items-center gap-4">
        <DarkToggle />

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className="cursor-pointer">
              <AvatarImage src={avatarUrl ? `${avatarUrl}?v=${Date.now()}` : undefined} />
              <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push('/dashboard/user/settings')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/dashboard/user/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
