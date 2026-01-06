export const performLogout = async () => {
  try {
    // Call logout API
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    })
    
    // Also try Supabase logout
    if (typeof window !== 'undefined') {
      try {
        const { supabase } = await import('@/lib/supabase')
        await supabase.auth.signOut({ scope: 'global' })
      } catch (e) {
        console.error('Supabase logout error:', e)
      }
    }
  } catch (error) {
    console.error('Logout API error:', error)
  }
  
  // Clear all local storage and session storage
  if (typeof window !== 'undefined') {
    localStorage.clear()
    sessionStorage.clear()
    
    // Clear all cookies more thoroughly
    const cookies = document.cookie.split(";")
    for (let cookie of cookies) {
      const eqPos = cookie.indexOf("=")
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`
    }
    
    // Force redirect to landing page
    setTimeout(() => {
      window.location.replace('/')
    }, 100)
  }
}