'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/context/AuthContext'

export function UsageTracker() {
  const { user, profile } = useAuth()
  const [usage, setUsage] = useState({ count: 0, limit: 10 })

  useEffect(() => {
    if (user && profile) {
      const limits = {
        free: 10,
        basic: -1,
        plus: -1,
        pro: -1
      }
      
      setUsage({
        count: profile.usageCount || 0,
        limit: limits[profile.plan as keyof typeof limits] || 10
      })
    }
  }, [user, profile])

  const percentage = usage.limit === -1 ? 0 : (usage.count / usage.limit) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Usage This Month</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Requests</span>
            <span>
              {usage.count}{usage.limit === -1 ? '' : ` / ${usage.limit}`}
            </span>
          </div>
          {usage.limit !== -1 && (
            <Progress value={percentage} className="h-2" />
          )}
          <p className="text-xs text-gray-500">
            {profile?.plan === 'FREE' 
              ? 'Upgrade for unlimited usage' 
              : 'Unlimited usage'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}