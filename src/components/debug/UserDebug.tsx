'use client'

import { useAuth } from '@/context/AuthContext'

export function UserDebug() {
  const { user, profile } = useAuth()
  
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Debug Info:</h3>
      <div>User Email: {user?.email || 'None'}</div>
      <div>Profile Email: {profile?.email || 'None'}</div>
      <div>Plan: {profile?.plan || 'None'}</div>
      <div>Admin Check: {(user?.email === 'shivangibabbar0211@gmail.com' || profile?.email === 'shivangibabbar0211@gmail.com') ? 'YES' : 'NO'}</div>
      <div>PRO Check: {profile?.plan === 'PRO' ? 'YES' : 'NO'}</div>
    </div>
  )
}