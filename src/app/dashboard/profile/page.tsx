'use client'

import { useAuth } from '@/context/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, Crown, Calendar, Mail } from 'lucide-react'
import { useState } from 'react'
import { SettingsModal } from '@/components/dashboard/SettingsModal'

export default function ProfilePage() {
  const { user, profile } = useAuth()
  const [showSettings, setShowSettings] = useState(false)

  const getUserName = () => {
    if (profile?.fullName) return profile.fullName
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name
    if (user?.user_metadata?.name) return user.user_metadata.name
    if (user?.email) return user.email.split('@')[0]
    return 'User'
  }

  const getUserAvatar = () => {
    if (profile?.profilePic) return profile.profilePic
    if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url
    if (user?.user_metadata?.picture) return user.user_metadata.picture
    return null
  }

  const userName = getUserName()
  const userAvatar = getUserAvatar()
  const userEmail = user?.email || ''
  const userPlan = profile?.plan || 'FREE'

  const planColors = {
    FREE: 'bg-gray-100 text-gray-800',
    BASIC: 'bg-blue-100 text-blue-800',
    PLUS: 'bg-purple-100 text-purple-800',
    PRO: 'bg-yellow-100 text-yellow-800'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
        <Button onClick={() => setShowSettings(true)} className="flex items-center space-x-2">
          <Settings className="h-4 w-4" />
          <span>Edit Profile</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your account details and subscription information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-6">
            <Avatar className="h-24 w-24 ring-4 ring-gray-100">
              <AvatarImage src={userAvatar || ''} alt={userName} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl font-semibold">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{userName}</h2>
                <p className="text-gray-600">{userEmail}</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge className={`${planColors[userPlan as keyof typeof planColors]} border font-medium`}>
                  {userPlan === 'PRO' && <Crown className="w-3 h-3 mr-1" />}
                  {userPlan} Plan
                </Badge>
                <span className="text-sm text-gray-500">
                  Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Contact Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Email Address</label>
              <p className="text-gray-900">{userEmail}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone Number</label>
              <p className="text-gray-900">Not provided</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Subscription Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Current Plan</label>
              <p className="text-gray-900 font-medium">{userPlan} Plan</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Usage Count</label>
              <p className="text-gray-900">{profile?.usageCount || 0} queries used</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}