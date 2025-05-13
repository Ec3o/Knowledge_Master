import { UserData,UserProfile } from '@/types/user'
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

export async function uploadAvatar(file: File): Promise<string> {
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("未登录")
    }
  
    const formData = new FormData()
    formData.append("avatar", file)
  
    const response = await fetch(`${API_BASE}/api/user/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.message || "上传头像失败")
    }
    return result.data
}

export async function updateUserProfile(Profile:UserProfile):Promise<any>{
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("未登录")
    }
  
    const response = await fetch(`${API_BASE}/api/user/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(Profile),
    })
  
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "更新用户信息失败")
    }
    localStorage.removeItem("user_cache")
    return response.json()
}

export async function getUserProfile(): Promise<UserProfile> {
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("未登录")
    }

    const response = await fetch(`${API_BASE}/api/user/profile`, {
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

    return result.data
  }