'use client'

import { useAuth } from '@/context/AuthContext'

export function AdminOverride({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}