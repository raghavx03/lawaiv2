'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { Settings, HelpCircle, CreditCard, LogOut, Crown, ChevronDown, User } from 'lucide-react'
import { UpgradeModal } from '../dashboard/UpgradeModal'
import { SettingsModal } from '../dashboard/SettingsModal'
import { HelpSupportModal } from '../dashboard/HelpSupportModal'
import { performLogout } from '@/lib/logout'
import { getAvatarUrl } from '@/lib/avatar'

const PLANS = {
  FREE: { name: 'Free', price: 0 },
  EXPIRED_FREE: { name: 'Expired', price: 0 },
  BASIC: { name: 'Basic', price: 499 },
  PLUS: { name: 'Plus', price: 999 },
  PRO: { name: 'Pro', price: 1499 }
}

export function ProfileDropdown() {
  const { user, profile, profileLoading, signOut, loading } = useAuth()
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const handleSettings = () => setShowSettings(true)
  const handleHelp = () => setShowHelp(true)
  const handleProfile = () => window.location.href = '/dashboard/profile'

  
  const handleLogout = async () => {
    try {
      // Show loading state (optional)
      console.log('Signing out...')
      
      // Try context signOut first
      await signOut()
    } catch (error) {
      console.error('Context signOut failed, using backup:', error)
      
      // Fallback to direct logout
      try {
        await performLogout()
      } catch (backupError) {
        console.error('Backup logout failed:', backupError)
        
        // Force cleanup as last resort
        localStorage.clear()
        sessionStorage.clear()
        window.location.replace('/')
      }
    }
  }

  const getUserFirstName = () => {
    if (profile?.fullName) return profile.fullName.split(' ')[0]
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name.split(' ')[0]
    if (user?.email) return user.email.split('@')[0]
    return 'User'
  }
  
  const getUserFullName = () => {
    if (profile?.fullName) return profile.fullName
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name
    if (user?.email) return user.email.split('@')[0]
    return 'User'
  }

  const avatarUrl = getAvatarUrl(user, profile)

  // Show loading state only when initially loading
  if (loading && !user) {
    return (
      <Button variant="ghost" className="relative flex items-center space-x-2 h-10 px-2 rounded-lg">
        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
        <div className="hidden sm:flex items-center space-x-1">
          <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </Button>
    )
  }
  
  // Show guest state if no user
  if (!user) {
    return (
      <Button variant="ghost" className="relative flex items-center space-x-2 h-10 px-2 rounded-lg hover:bg-gray-100">
        <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-medium">
            G
          </AvatarFallback>
        </Avatar>
        <div className="hidden sm:flex items-center space-x-1">
          <span className="text-sm font-medium text-gray-700">Guest</span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </Button>
    )
  }

  // Use actual profile data from database
  const isAdmin = user?.email === 'shivangibabbar0211@gmail.com'
  
  // Only use fallback if no profile exists AND user is admin
  const displayProfile = profile || (isAdmin ? {
    plan: 'PRO' as 'FREE' | 'BASIC' | 'PLUS' | 'PRO',
    fullName: getUserFullName(),
    profilePic: avatarUrl,
    usageCount: 0
  } : {
    plan: 'FREE' as 'FREE' | 'BASIC' | 'PLUS' | 'PRO',
    fullName: getUserFullName(),
    profilePic: avatarUrl,
    usageCount: 0
  })
  
  // Only override plan for admin if profile exists but plan is not PRO
  if (isAdmin && profile && profile.plan !== 'PRO') {
    displayProfile.plan = 'PRO'
  }

  const planConfig = PLANS[displayProfile.plan as keyof typeof PLANS] || PLANS.FREE
  const planColors = {
    FREE: 'bg-gray-100 text-gray-800',
    EXPIRED_FREE: 'bg-red-100 text-red-800',
    BASIC: 'bg-blue-100 text-blue-800',
    PLUS: 'bg-purple-100 text-purple-800',
    PRO: 'bg-yellow-100 text-yellow-800'
  }

  const currentPlan = displayProfile.plan || 'FREE'
  const firstName = getUserFirstName()
  const fullName = getUserFullName()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative flex items-center space-x-2 h-10 px-2 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
              <AvatarImage 
                src={avatarUrl || undefined} 
                alt={fullName} 
                className="object-cover"
                onError={(e) => {
                  console.log('Avatar load error:', avatarUrl)
                  e.currentTarget.style.display = 'none'
                }}
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-medium">
                {firstName ? firstName.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex items-center space-x-1">
              <span className="text-sm font-medium text-gray-700 max-w-24 truncate">
                {firstName}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-80 z-[100]" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-3 p-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-14 w-14 ring-2 ring-gray-100">
                  <AvatarImage 
                    src={avatarUrl || undefined} 
                    alt={fullName} 
                    className="object-cover"
                    onError={(e) => {
                      console.log('Large avatar load error:', avatarUrl)
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-lg font-semibold">
                    {firstName ? firstName.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1 flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-none text-gray-900">
                    {fullName}
                  </p>
                  <p className="text-xs leading-none text-gray-500 truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-400">
                    Member since {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                <Badge className={`text-xs font-medium ${planColors[currentPlan as keyof typeof planColors]} border`}>
                  {currentPlan === 'PRO' && <Crown className="w-3 h-3 mr-1" />}
                  {planConfig.name} Plan
                </Badge>
                {currentPlan !== 'PRO' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-7 text-xs px-3 bg-white hover:bg-gray-50 ${
                      currentPlan === 'EXPIRED_FREE' ? 'border-red-300 text-red-600 hover:bg-red-50' : ''
                    }`}
                    onClick={() => setShowUpgrade(true)}
                  >
                    {currentPlan === 'EXPIRED_FREE' ? 'Renew' : 'Upgrade'}
                  </Button>
                )}
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleProfile} className="cursor-pointer">
            <User className="mr-3 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          

          
          <DropdownMenuItem onClick={() => setShowUpgrade(true)} className="cursor-pointer">
            <CreditCard className="mr-3 h-4 w-4" />
            <span>Upgrade Plan</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
            <Settings className="mr-3 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          

          
          <DropdownMenuItem onClick={handleHelp} className="cursor-pointer">
            <HelpCircle className="mr-3 h-4 w-4" />
            <span>Help & Support</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
            <LogOut className="mr-3 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
      <HelpSupportModal open={showHelp} onClose={() => setShowHelp(false)} />
    </>
  )
}