import { UserData } from "@/types/user"

const USER_CACHE_KEY = "user_cache"
const CACHE_EXPIRE_MS = 30 * 60 * 1000

// For client-side, use NEXT_PUBLIC_ prefix in your .env file
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8083"

interface UserCache {
  data: UserData
  expiresAt: number // timestamp
}

export function getCachedUser(): UserData | null {
  if (typeof window === 'undefined') return null
  
  const cacheStr = localStorage.getItem(USER_CACHE_KEY)
  if (!cacheStr) return null

  try {
    const cache: UserCache = JSON.parse(cacheStr)
    if (Date.now() < cache.expiresAt) {
      return cache.data
    }
    // Cache expired, clear it
    localStorage.removeItem(USER_CACHE_KEY)
    return null
  } catch (e) {
    console.error("Failed to parse user cache", e)
    localStorage.removeItem(USER_CACHE_KEY)
    return null
  }
}

export function cacheUser(user: UserData): void {
  if (typeof window === 'undefined') return
  
  const cache: UserCache = {
    data: user,
    expiresAt: Date.now() + CACHE_EXPIRE_MS,
  }
  localStorage.setItem(USER_CACHE_KEY, JSON.stringify(cache))
}