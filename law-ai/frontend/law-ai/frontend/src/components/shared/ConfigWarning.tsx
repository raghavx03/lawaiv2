'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export function ConfigWarning() {
  const missingVars = []
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  
  if (missingVars.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-orange-800 text-sm">
            <AlertTriangle className="w-4 h-4" />
            Configuration Required
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-orange-700 mb-2">
            Missing environment variables:
          </p>
          <ul className="text-xs text-orange-600 space-y-1">
            {missingVars.map(varName => (
              <li key={varName} className="font-mono">• {varName}</li>
            ))}
          </ul>
          <p className="text-xs text-orange-700 mt-2">
            Check your .env.local file
          </p>
        </CardContent>
      </Card>
    </div>
  )
}