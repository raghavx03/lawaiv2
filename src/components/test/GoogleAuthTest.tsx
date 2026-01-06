'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export function GoogleAuthTest() {
  const { user, signInWithGoogle, signOut } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Google login error:', error)
      alert('Google login failed: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (process.env.NODE_ENV === 'production') return null

  return (
    <div className="fixed top-4 left-4 z-50 bg-white border shadow-lg p-4 rounded">
      <h3 className="font-bold mb-2">Google Auth Test</h3>
      
      {!user ? (
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login with Google'}
        </button>
      ) : (
        <div>
          <p className="text-sm mb-2">Logged in as: {user.email}</p>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}