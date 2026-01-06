'use client'

import { PremiumChatInterface } from '@/components/chat/PremiumChatInterface'
import { FeatureGuard } from '@/components/auth/FeatureGuard'
import { Toaster } from 'react-hot-toast'

export default function AIAssistantPage() {
  return (
    <FeatureGuard feature="AI_ASSISTANT">
      <div className="ai-chat-dark">
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: 'hsl(222 47% 11%)',
              color: 'hsl(213 31% 91%)',
              border: '1px solid hsl(222 47% 15%)'
            }
          }}
        />
        <PremiumChatInterface />
      </div>
    </FeatureGuard>
  )
}