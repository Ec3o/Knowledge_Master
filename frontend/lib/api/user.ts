import { UserData } from '@/types/user'
import { API_BASE } from "@/lib/api/utils"
import { getCachedUser,cacheUser } from '@/lib/api/utils'

export async function getUserInfo(): Promise<UserData> {
    const cachedUser = getCachedUser()
    if (cachedUser) {
      return cachedUser
    }
    return await fetchUserInfo()
  }

  export async function fetchUserInfo(): Promise<UserData> {
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("未登录")
    }
  
    const response = await fetch(`${API_BASE}/api/user/info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "获取用户信息失败")
    }
  
    const result = await response.json()
    if (result.status !== "success") {
      throw new Error(result.message || "获取用户信息失败")
    }
  
    // 更新缓存
    cacheUser(result.data)
    return result.data
  }