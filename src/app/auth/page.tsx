'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)

const [loading, setLoading] = useState(false)

const handleAuth = async () => {
  setLoading(true)
  try {
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return toast.error(error.message)

      // Get user ID
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Failed to get user after login')
        return
      }

      // Fetch role from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        toast.error('Failed to fetch user role')
        return
      }

      toast.success('Logged in!')

      // Redirect based on role
      if (profile.role === 'admin') {
        router.push('/dashboard/admin')
      } else {
        router.push('/dashboard/user')
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) return toast.error(error.message)

      toast.success('Signup successful. You can now log in.')
      setIsLogin(true)
    }
  } finally {
    setLoading(false)
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
            disabled={loading}
          />

          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {isLogin && (
            <button
              type="button"
              onClick={async () => {
                if (!email) return toast.error('Enter your email first')
                const { error } = await supabase.auth.resetPasswordForEmail(email)
                if (error) toast.error(error.message)
                else toast.success('Password reset link sent!')
              }}
              className="text-sm text-blue-600 hover:underline mt-1"
            >
              Forgot your password?
            </button>
          )}

          {/* ✅ Restore this missing main auth button */}
          <Button
            className="w-full"
            onClick={handleAuth}
            disabled={loading}
          >
            {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
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
