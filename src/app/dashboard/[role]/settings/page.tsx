'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { User } from 'lucide-react'
import { useUser } from '@supabase/auth-helpers-react'

const profileSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
})

const passwordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function SettingsPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const user = useUser()

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [authLoaded, setAuthLoaded] = useState(false)

  // Load profile on mount
  useEffect(() => {
    if (!user) return

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, email, avatar_url')
        .eq('id', user.id)
        .single()

      if (error) {
        toast.error('Failed to load profile')
        return
      }

      resetProfile({
        username: data.username ?? '',
        email: data.email ?? '',
      })

      if (data.avatar_url) setAvatarUrl(data.avatar_url)
    }

    loadProfile()
  }, [user, supabase])

  // Auth check
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthLoaded(true)
      if (!session) router.push('/auth')
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthLoaded(true)
      if (!session) router.push('/auth')
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
    reset: resetProfile,
  } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) })

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
    reset: resetPassword,
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })

  // Avatar Upload Logic
  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files || event.target.files.length === 0) {
      toast.error('Please select an image to upload.')
      return
    }

    const file = event.target.files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    setUploading(true)

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      toast.error(`Upload failed: ${uploadError.message}`)
      setUploading(false)
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName) // not `avatars/filename`


    const publicUrl = publicUrlData?.publicUrl
    if (!publicUrl) {
      toast.error('Failed to retrieve public URL')
      setUploading(false)
      return
    }

    setAvatarUrl(publicUrl)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      toast.error('Not authenticated')
      router.push('/auth')
      return
    }

    const userId = session.user.id

    // ✅ Update profiles.avatar_url
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)

    if (updateError) {
      toast.error('Failed to update profile')
      setUploading(false)
      return
    }

      // After upload is complete and you have the publicUrl
        await supabase.auth.updateUser({
          data: { avatar_url: publicUrl },
        })

        await supabase.auth.refreshSession() // ensures updated metadata is loaded into client session

        router.refresh() // optional: revalidates dashboard if needed

    

    // ✅ Update auth.user_metadata.avatar_url
    const { error: metaError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    })

    if (metaError) {
      toast.error('Failed to update auth metadata')
      setUploading(false)
      return
    }

    toast.success('Avatar updated successfully!')
    setUploading(false)
  }

  

  async function onSubmitProfile(data: ProfileForm) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      toast.error('Not authenticated')
      router.push('/auth')
      return
    }

    const userId = session.user.id

    if (data.email !== session.user.email) {
      const { error } = await supabase.auth.updateUser({ email: data.email })
      if (error) {
        toast.error(`Failed to update email: ${error.message}`)
        return
      }
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ username: data.username, email: data.email })
      .eq('id', userId)

    if (profileError) {
      toast.error(`Failed to update profile: ${profileError.message}`)
      return
    }

    toast.success('Profile updated successfully')
  }

  async function onSubmitPassword(data: PasswordForm) {
    if (!data.password) {
      toast.error('Please enter a new password')
      return
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      toast.error('Not authenticated')
      router.push('/auth')
      return
    }

    const { error } = await supabase.auth.updateUser({ password: data.password })

    if (error) {
      toast.error(`Failed to update password: ${error.message}`)
      return
    }

    toast.success('Password updated successfully')
    resetPassword()
  }

  if (!authLoaded) return <div className="p-4">Loading authentication...</div>
  if (!user) return null

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="avatar">Avatar</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" {...registerProfile('username')} />
              {profileErrors.username && (
                <p className="text-red-600 text-sm mt-1">{profileErrors.username.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...registerProfile('email')} />
              {profileErrors.email && (
                <p className="text-red-600 text-sm mt-1">{profileErrors.email.message}</p>
              )}
            </div>

            <Button type="submit" disabled={profileSubmitting}>
              {profileSubmitting ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="avatar" className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt="User Avatar" />
              ) : (
                <AvatarFallback>
                  <User className="h-12 w-12" />
                </AvatarFallback>
              )}
            </Avatar>

            <input
              type="file"
              accept="image/*"
              onChange={uploadAvatar}
              disabled={uploading}
              className="file-input"
            />

            {uploading && <p>Uploading...</p>}
          </div>
        </TabsContent>

        <TabsContent value="password" className="space-y-4">
          <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input id="password" type="password" {...registerPassword('password')} />
              {passwordErrors.password && (
                <p className="text-red-600 text-sm mt-1">{passwordErrors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...registerPassword('confirmPassword')}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-red-600 text-sm mt-1">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" disabled={passwordSubmitting}>
              {passwordSubmitting ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
