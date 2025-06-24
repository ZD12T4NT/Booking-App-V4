// components/DashboardNavbar.tsx

'use client'

import { useRouter } from 'next/navigation'
import { useSessionContext } from '@supabase/auth-helpers-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { LogOut, Settings, User } from 'lucide-react'
import DarkToggle from './DarkToggle'

export default function DashboardNavbar() {
  const { session, supabaseClient } = useSessionContext()
  const router = useRouter()

  const user = session?.user
  const avatarUrl = user?.user_metadata?.avatar_url
  const userInitial = user?.email?.[0].toUpperCase() || 'U'

  const handleLogout = async () => {
    await supabaseClient.auth.signOut()
    router.push('/auth')
  }

  return (
    <nav className="flex justify-between items-center px-6 py-3 border-b bg-background">
      <h1 className="text-xl font-semibold">BetterBooking Dashboard</h1>

      <div className="flex items-center gap-4">
        <DarkToggle />

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className="cursor-pointer">
              <AvatarImage src={avatarUrl} />
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
