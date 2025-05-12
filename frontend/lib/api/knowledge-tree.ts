import { KnowledgeNode } from "@/types/knowledge-node"
import { KnowledgeTreeResponse } from "@/types/knowledge-base"
import { API_BASE } from "@/lib/api/utils"
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