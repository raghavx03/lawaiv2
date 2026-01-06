import { randomBytes } from 'crypto'

interface APIKey {
  id: string
  key: string
  createdAt: Date
  expiresAt: Date
  isActive: boolean
}

class KeyRotationManager {
  private keys: Map<string, APIKey> = new Map()

  generateAPIKey(): string {
    return `law_${randomBytes(32).toString('hex')}`
  }

  createKey(userId: string, expiryDays = 90): APIKey {
    const key: APIKey = {
      id: randomBytes(16).toString('hex'),
      key: this.generateAPIKey(),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000),
      isActive: true
    }

    this.keys.set(`${userId}_${key.id}`, key)
    return key
  }

  rotateKey(userId: string, oldKeyId: string): APIKey | null {
    const oldKey = this.keys.get(`${userId}_${oldKeyId}`)
    if (!oldKey) return null

    // Deactivate old key
    oldKey.isActive = false
    
    // Create new key
    const newKey = this.createKey(userId)
    
    console.log(`[KEY_ROTATION] Rotated key for user ${userId}`)
    return newKey
  }

  validateKey(userId: string, keyToValidate: string): boolean {
    for (const [keyId, key] of this.keys.entries()) {
      if (keyId.startsWith(userId) && 
          key.key === keyToValidate && 
          key.isActive && 
          key.expiresAt > new Date()) {
        return true
      }
    }
    return false
  }

  getActiveKeys(userId: string): APIKey[] {
    return Array.from(this.keys.entries())
      .filter(([keyId, key]) => 
        keyId.startsWith(userId) && 
        key.isActive && 
        key.expiresAt > new Date()
      )
      .map(([, key]) => key)
  }

  revokeKey(userId: string, keyId: string): boolean {
    const key = this.keys.get(`${userId}_${keyId}`)
    if (key) {
      key.isActive = false
      return true
    }
    return false
  }

  // Cleanup expired keys
  cleanupExpiredKeys(): number {
    let cleaned = 0
    const now = new Date()
    
    for (const [keyId, key] of this.keys.entries()) {
      if (key.expiresAt <= now) {
        this.keys.delete(keyId)
        cleaned++
      }
    }
    
    return cleaned
  }
}

export const keyManager = new KeyRotationManager()

// Auto-cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const cleaned = keyManager.cleanupExpiredKeys()
    if (cleaned > 0) {
      console.log(`[KEY_CLEANUP] Removed ${cleaned} expired keys`)
    }
  }, 60 * 60 * 1000)
}