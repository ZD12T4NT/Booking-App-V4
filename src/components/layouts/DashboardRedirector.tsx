'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function DashboardRedirector() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRole = async () => {
      const {
        data: { session },
        error: sessionError
      } = await supabase.auth.getSession()

      if (!session?.user || sessionError) {
        router.push('/auth')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profileError || !profile?.role) {
        router.push('/auth')
        return
      }

      if (profile.role === 'admin') {
        router.push('/dashboard/admin')
      } else {
        router.push('/dashboard/user')
      }

      setLoading(false)
    }

    fetchRole()
  }, [router, supabase])

  return loading ? <p className="p-4">Redirecting...</p> : null
}
