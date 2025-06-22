import Sidebar from '@/components/Sidebar'

export default function AdminDashboard() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="p-4 flex-1">
        <h1 className="text-xl">Admin Dashboard</h1>
      </main>
    </div>
  )
}
