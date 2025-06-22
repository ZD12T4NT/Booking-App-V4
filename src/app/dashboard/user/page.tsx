import Sidebar from '@/components/Sidebar'

export default function UserDashboard() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="p-4 flex-1">
        <h1 className="text-xl">User Dashboard</h1>
      </main>
    </div>
  )
}
