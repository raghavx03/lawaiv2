import { useAuth } from '@/context/AuthContext'
import { useCallback } from 'react'

export function useProfileRefresh() {
  const { refreshProfile } = useAuth()

  const refreshAfterPayment = useCallback(async () => {
    // Wait a moment for payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    await refreshProfile()
  }, [refreshProfile])

  return { refreshAfterPayment }
}