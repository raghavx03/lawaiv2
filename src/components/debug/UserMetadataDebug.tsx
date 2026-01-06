'use client'

import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'

export function UserMetadataDebug() {
  const { user, profile } = useAuth()
  const [showDebug, setShowDebug] = useState(false)

  if (!user || process.env.NODE_ENV === 'production') return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="bg-red-500 text-white px-3 py-1 rounded text-xs"
      >
        Debug User
      </button>
      
      {showDebug && (
        <div className="absolute bottom-8 right-0 bg-white border shadow-lg p-4 rounded max-w-md max-h-96 overflow-auto text-xs">
          <h3 className="font-bold mb-2">User Metadata Debug</h3>
          
          <div className="mb-3">
            <strong>User ID:</strong> {user.id}
          </div>
          
          <div className="mb-3">
            <strong>Email:</strong> {user.email}
          </div>
          
          <div className="mb-3">
            <strong>User Metadata:</strong>
            <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-auto">
              {JSON.stringify(user.user_metadata, null, 2)}
            </pre>
          </div>
          
          <div className="mb-3">
            <strong>Profile Data:</strong>
            <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-auto">
              {JSON.stringify(profile, null, 2)}
            </pre>
          </div>
          
          <div className="mb-3">
            <strong>Avatar Sources:</strong>
            <ul className="text-xs">
              <li>avatar_url: {user.user_metadata?.avatar_url || 'null'}</li>
              <li>picture: {user.user_metadata?.picture || 'null'}</li>
              <li>profile_picture: {user.user_metadata?.profile_picture || 'null'}</li>
              <li>photo: {user.user_metadata?.photo || 'null'}</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}