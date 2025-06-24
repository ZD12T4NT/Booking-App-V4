'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Tab = {
  id: string
  label: string
  content: React.ReactNode
}

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push('/auth')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.push('/dashboard/user')
      } else {
        setIsAdmin(true)
      }

      setLoading(false)
    }

    checkAdmin()
  }, [router, supabase])

  if (loading) return <p>Loading...</p>
  if (!isAdmin) return null

  const tabs: Tab[] = [
    {
      id: 'overview',
      label: 'Overview',
      content: <p>Welcome to the Admin Overview panel.</p>,
    },
    {
      id: 'manage',
      label: 'Manage Users',
      content: <p>Here you can manage users.</p>,
    },
    {
      id: 'reports',
      label: 'Reports',
      content: <p>Admin reports and analytics go here.</p>,
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <nav className="flex space-x-4 border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2 border-b-2 ${
              activeTab === tab.id ? 'border-blue-500 font-semibold' : 'border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section>
        {tabs.map(
          (tab) =>
            tab.id === activeTab && (
              <div key={tab.id} className="p-4 bg-white text-black rounded shadow">
                {tab.content}
              </div>
            )
        )}
      </section>
    </div>
  )
}
