'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { Users, Crown, Activity } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface UserData {
  id: string
  email: string
  full_name: string
  plan: string
  expiry_date: string | null
  usage_count: number
  created_at: string
  last_sign_in_at: string | null
}

export default function AdminUsersPage() {
  const { user, profile } = useAuth()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    free: 0,
    paid: 0,
    active: 0
  })

  useEffect(() => {
    // Check if user is admin
    if (!user || !profile) {
      window.location.href = '/auth/login'
      return
    }

    // For demo, check if email is admin (you can set this in DB)
    const isAdmin = user.email === 'admin@law.ai' || user.email === 'raghav@law.ai'
    if (!isAdmin) {
      toast.error('Access denied. Admin only.')
      window.location.href = '/dashboard'
      return
    }

    fetchUsers()
  }, [user, profile])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setStats(data.stats)
      } else {
        toast.error('Failed to fetch users')
      }
    } catch (error) {
      toast.error('Error fetching users')
    } finally {
      setLoading(false)
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-800'
      case 'basic': return 'bg-blue-100 text-blue-800'
      case 'plus': return 'bg-purple-100 text-purple-800'
      case 'pro': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-6 w-6 text-yellow-600" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <p className="text-gray-600">Manage LAW-AI users and monitor platform usage</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Free Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.free}</p>
                </div>
                <Users className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Paid Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.paid}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Today</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium text-gray-900">User</th>
                    <th className="text-left p-4 font-medium text-gray-900">Plan</th>
                    <th className="text-left p-4 font-medium text-gray-900">Usage</th>
                    <th className="text-left p-4 font-medium text-gray-900">Expiry</th>
                    <th className="text-left p-4 font-medium text-gray-900">Joined</th>
                    <th className="text-left p-4 font-medium text-gray-900">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">{user.full_name || 'No name'}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={getPlanColor(user.plan)}>
                          {user.plan.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-900">{user.usage_count}</span>
                      </td>
                      <td className="p-4">
                        {user.expiry_date ? (
                          <span className="text-gray-900">
                            {new Date(user.expiry_date).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-gray-500">No expiry</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-gray-900">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4">
                        {user.last_sign_in_at ? (
                          <span className="text-gray-900">
                            {new Date(user.last_sign_in_at).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-gray-500">Never</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}