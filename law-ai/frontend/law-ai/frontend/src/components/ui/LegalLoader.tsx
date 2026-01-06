'use client'

// Deprecated: Use single loader system
export function LegalLoader() {
  return null
}

// Minimal loader for specific components only
export function SmallLoader() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
}