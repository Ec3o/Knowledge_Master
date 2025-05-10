import type { UserData } from "@/types/user"
import type { KnowledgeBase, KnowledgeNode, KnowledgeTreeResponse } from "@/types/knowledge-base"
const API_BASE = `http://localhost:8084`
const USER_CACHE_KEY = "user_cache"
const CACHE_EXPIRE_MS = 30 * 60 * 1000

interface UserCache {
  data: UserData
  expiresAt: number // 时间戳
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Login failed")
  }

  return response.json()
}

export async function register(username: string, email: string, password: string) {
  const response = await fetch(`${API_BASE}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, username }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Registration failed")
  }

  return response.json()
}

export async function getUserInfo(): Promise<UserData> {
  const cachedUser = getCachedUser()
  if (cachedUser) {
    return cachedUser
  }
  return await fetchUserInfo()
}

export function logout() {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}
function getCachedUser(): UserData | null {
  const cacheStr = localStorage.getItem(USER_CACHE_KEY)
  if (!cacheStr) return null

  try {
    const cache: UserCache = JSON.parse(cacheStr)
    if (Date.now() < cache.expiresAt) {
      return cache.data
    }
    // 缓存过期，清除
    localStorage.removeItem(USER_CACHE_KEY)
    return null
  } catch (e) {
    console.error("解析用户缓存失败", e)
    localStorage.removeItem(USER_CACHE_KEY)
    return null
  }
}

function cacheUser(user: UserData): void {
  const cache: UserCache = {
    data: user,
    expiresAt: Date.now() + CACHE_EXPIRE_MS,
  }
  localStorage.setItem(USER_CACHE_KEY, JSON.stringify(cache))
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
export async function getKnowledgeBases(): Promise<KnowledgeBase[]> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("未登录")

  const response = await fetch(`${API_BASE}/api/knowledge-bases`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "获取知识库失败")
  }

  const data = await response.json()
  return data.data || []
}

// 创建知识库
export async function createKnowledgeBase(name: string, description = ""): Promise<KnowledgeBase> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("未登录")

  const response = await fetch(`${API_BASE}/api/knowledge-bases`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, description }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "创建知识库失败")
  }

  const data = await response.json()
  return data.data
}

// 获取单个知识库详情
export async function getKnowledgeBase(kbId: string): Promise<KnowledgeBase> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("未登录")

  const response = await fetch(`${API_BASE}/api/knowledge-bases/${kbId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "获取知识库详情失败")
  }

  const data = await response.json()
  return data.data
}

// 获取知识库详情（包含树形结构）
export async function getKnowledgeBaseWithTree(kbId: string): Promise<KnowledgeTreeResponse> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("未登录")

  const response = await fetch(`${API_BASE}/api/knowledge-bases/${kbId}/tree`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "获取知识库详情失败")
  }

  return response.json()
}

// 获取知识库树形结构
export async function getKnowledgeTree(kbId: string): Promise<KnowledgeNode[]> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("未登录")

  const response = await fetch(`${API_BASE}/api/knowledge-bases/${kbId}/tree`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "获取知识树失败")
  }

  const data = await response.json()
  return data.data || []
}

// 创建知识节点
export async function createKnowledgeNode(
  kbId: string,
  node: {
    parent_id?: string | null
    type: "folder" | "file"
    name: string
    content?: string
  },
): Promise<KnowledgeNode> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("未登录")

  const response = await fetch(`${API_BASE}/api/knowledge-bases/${kbId}/tree`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(node),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "创建节点失败")
  }

  return response.json()
}

// 更新知识节点
export async function updateKnowledgeNode(
  kbId: string,
  nodeId: string,
  data: {
    name?: string
    content?: string
  },
): Promise<KnowledgeNode> {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("未登录")

  const response = await fetch(`${API_BASE}/api/knowledge-bases/${kbId}/nodes/${nodeId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "更新节点失败")
  }

  return response.json()
}
