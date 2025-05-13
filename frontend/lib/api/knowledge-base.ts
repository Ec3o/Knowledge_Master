import { KnowledgeBase } from "@/types/knowledge-base"
import { API_BASE } from "@/lib/api/utils"
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

export async function updateKnowledgeBase(kbId: string, name: string, description: string): Promise<KnowledgeBase> {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("未登录")

    const response = await fetch(`${API_BASE}/api/knowledge-bases/${kbId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "更新知识库失败")
    }
    const data = await response.json()
    return data.data
}

export async function deleteKnowledgeBase(kbId: string): Promise<void> {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("未登录")

    const response = await fetch(`${API_BASE}/api/knowledge-bases/${kbId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "删除知识库失败")
    }
    const data = await response.json()
    return data.data
}