'use client'

import { useAuth } from '@/context/AuthContext'

export default function TestAuthPage() {
  const { user, profile } = useAuth()

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-xl mb-4">Not logged in</h1>
        <a href="/auth/login" className="bg-blue-500 text-white px-4 py-2 rounded">
          Login
        </a>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Auth Debug</h1>
      
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-bold mb-2">User Metadata</h2>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
          {JSON.stringify(user.user_metadata, null, 2)}
        </pre>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-bold mb-2">Avatar URLs</h2>
        <div className="text-sm space-y-1">
          <p>avatar_url: {user.user_metadata?.avatar_url || 'null'}</p>
          <p>picture: {user.user_metadata?.picture || 'null'}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-bold mb-2">Profile Data</h2>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
          {JSON.stringify(profile, null, 2)}
        </pre>
      </div>
    </div>
  )
}