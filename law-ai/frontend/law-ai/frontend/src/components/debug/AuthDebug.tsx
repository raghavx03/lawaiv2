'use client'

import { useAuth } from '@/context/AuthContext'

export function AuthDebug() {
  const { user, profile, loading, profileLoading } = useAuth()
  
  if (process.env.NODE_ENV !== 'development') {
    return null
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <div>Loading: {loading ? 'true' : 'false'}</div>
        <div>Profile Loading: {profileLoading ? 'true' : 'false'}</div>
        <div>User: {user ? 'authenticated' : 'null'}</div>
        <div>User Email: {user?.email || 'none'}</div>
        <div>Profile: {profile ? 'loaded' : 'null'}</div>
        <div>Profile Plan: {profile?.plan || 'none'}</div>
        <div>Profile Name: {profile?.fullName || 'none'}</div>
        <div>User Metadata Name: {user?.user_metadata?.full_name || 'none'}</div>
        <div>User Metadata Avatar: {user?.user_metadata?.avatar_url ? 'yes' : 'no'}</div>
      </div>
    </div>
  )
}