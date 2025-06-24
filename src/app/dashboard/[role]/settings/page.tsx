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

  // State for avatar upload
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  // Load user profile on mount
  useEffect(() => {
    async function loadProfile() {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session?.user) {
        toast.error('Not authenticated')
        router.push('/auth')
        return
      }

      // Fetch profile info
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('username, email, avatar_url')
        .eq('id', session.user.id)
        .single()

      if (error) {
        toast.error('Failed to load profile')
        return
      }

      if (profile) {
        resetProfile({
          username: profile.username || '',
          email: profile.email || session.user.email || '',
        })
        setAvatarUrl(profile.avatar_url)
      }
    }

    loadProfile()
  }, [router, supabase])

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
    reset: resetProfile,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  })

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
    reset: resetPassword,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
  if (!event.target.files || event.target.files.length === 0) {
    toast.error('Please select an image to upload.')
    return
  }

  const file = event.target.files[0]
  const fileExt = file.name.split('.').pop()
  const fileName = `${crypto.randomUUID()}.${fileExt}`
  const filePath = `${fileName}` // No prefix here; Supabase will use the bucket root

  // If you want a consistent upload path like avatars/user_id/avatar.jpg
  // const filePath = `public/${userId}/avatar.${fileExt}`


  setUploading(true)

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('avatars') // ✅ Must match your actual bucket
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) {
    toast.error(`Upload failed: ${uploadError.message}`)
    setUploading(false)
    return
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  const publicUrl = publicUrlData.publicUrl

  if (!publicUrl) {
    toast.error('Failed to retrieve public URL')
    setUploading(false)
    return
  }

  setAvatarUrl(publicUrl)

  // Get the current user session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (!session?.user) {
    toast.error('Not authenticated')
    setUploading(false)
    router.push('/auth')
    return
  }

  // Update avatar in profile table
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', session.user.id)

  if (updateError) {
    toast.error('Failed to update profile')
  } else {
    toast.success('Avatar updated successfully!')
  }

  setUploading(false)
}

  // Submit profile info (username + email)
  async function onSubmitProfile(data: ProfileForm) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      toast.error('Not authenticated')
      router.push('/auth')
      return
    }

    // Update email if changed
    if (data.email !== session.user.email) {
      const { error } = await supabase.auth.updateUser({ email: data.email })
      if (error) {
        toast.error(`Failed to update email: ${error.message}`)
        return
      }
    }

    // Update profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ username: data.username, email: data.email })
      .eq('id', session.user.id)

    if (profileError) {
      toast.error(`Failed to update profile: ${profileError.message}`)
      return
    }

    toast.success('Profile updated successfully')
  }

  // Submit password change
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

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="profile" className="space-y-6">
        {/* Tabs navigation */}
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="avatar">Avatar</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
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

        {/* Avatar Tab */}
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

        {/* Password Tab */}
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
