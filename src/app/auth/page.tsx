'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && !username)) {
      alert('Please fill all required fields.')
      return
    }

    if (isLogin) {
      const { error } = await supabase().auth.signInWithPassword({ email, password })
      if (error) return alert(error.message)
      router.push('/dashboard/user') // optional: fetch user role to route dynamically
    } else {
      const { data, error } = await supabase().auth.signUp({ email, password })
      if (error) return alert(error.message)

      await supabase().from('profiles').insert({
        id: data.user?.id,
        username,
        role: 'user',
      })

      alert('Signup successful. You can now log in.')
      setIsLogin(true)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md p-6">
        <CardHeader>
          <CardTitle>{isLogin ? 'Login' : 'Sign Up'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isLogin && (
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button className="w-full" onClick={handleAuth}>
            {isLogin ? 'Login' : 'Sign Up'}
          </Button>
          <Button
            variant="ghost"
            className="w-full text-sm text-muted-foreground"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
