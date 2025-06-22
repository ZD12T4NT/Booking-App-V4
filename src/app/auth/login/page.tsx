'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    const { error } = await supabase().auth.signInWithPassword({ email, password })
    if (error) return alert(error.message)
    router.push('/dashboard/user')
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl mb-4">Login</h1>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button onClick={handleLogin}>Login</button>
      <p>
        Don’t have an account? <a href="/auth/signup">Sign up</a>
      </p>
    </div>
  )
}
