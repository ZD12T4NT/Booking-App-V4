// components/NavWrapper.tsx

'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import DashboardNavbar from './DashboardNavbar'

export default function NavWrapper() {
  const pathname = usePathname()
  const isDashboard = pathname.startsWith('/dashboard')

  return isDashboard ? <DashboardNavbar /> : <Navbar />
}
