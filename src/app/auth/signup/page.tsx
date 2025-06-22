'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleSignup = async () => {
    const { data, error } = await supabase().auth.signUp({ email, password })
    if (error) return alert(error.message)
    await supabase().from('profiles').insert({ id: data.user?.id, username, role: 'user' })
    router.push('/auth/login')
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl mb-4">Sign Up</h1>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button onClick={handleSignup}>Sign Up</button>
    </div>
  )
}
