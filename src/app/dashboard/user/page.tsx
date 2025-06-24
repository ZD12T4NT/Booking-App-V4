'use client'

import { useState } from 'react'

type Tab = {
  id: string
  label: string
  content: React.ReactNode
}

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs: Tab[] = [
    {
      id: 'overview',
      label: 'Overview',
      content: <p>Welcome to your user overview.</p>,
    },
    {
      id: 'settings',
      label: 'Settings',
      content: <p>User specific settings go here.</p>,
    },
  ]

  return (
    <div className="flex flex-col w-full">
      <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>

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
              <div key={tab.id} className="p-4 bg-white text-black  rounded shadow">
                {tab.content}
              </div>
            )
        )}
      </section>
    </div>
  )
}
