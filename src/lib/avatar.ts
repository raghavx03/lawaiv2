// Simple MD5 hash function for browser
function md5(str: string): string {
  // Simple hash function for demo - in production use a proper crypto library
  let hash = 0
  if (str.length === 0) return hash.toString()
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16)
}

export function generateGravatarUrl(email: string, size: number = 80): string {
  if (!email) return ''
  
  const hash = md5(email.toLowerCase().trim())
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=mp&r=pg`
}

export function getAvatarUrl(user: any, profile: any): string {
  // Try multiple sources for avatar URL
  const sources = [
    profile?.profilePic,
    user?.user_metadata?.avatar_url,
    user?.user_metadata?.picture,
    user?.user_metadata?.profile_picture,
    user?.user_metadata?.photo
  ]
  
  for (const url of sources) {
    if (url && typeof url === 'string' && url.trim() !== '') {
      return url.trim()
    }
  }
  
  // Fallback to Gravatar if email is available
  if (user?.email) {
    return generateGravatarUrl(user.email)
  }
  
  return ''
}