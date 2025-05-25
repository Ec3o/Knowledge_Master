import { KnowledgeNode, NodeType } from "@/types/knowledge-node"
import { API_BASE } from "@/lib/api/utils"
export async function getKnowledgeNode(kbId: string, nodeId: string): Promise<KnowledgeNode> {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("未登录")
    const response = await fetch(`${API_BASE}/api/knowledge-bases/${kbId}/nodes/${nodeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "获取知识节点失败")
    }
    const data = await response.json()
    return data.data
  }
export async function updateKnowledgeNode(
    kbId: string,
    nodeId: string,
    data: {
      title?: string
      content?: string
    },
  ): Promise<KnowledgeNode> {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("未登录")
  
    const response = await fetch(`${API_BASE}/api/knowledge-bases/${kbId}/nodes/${nodeId}`, {
      method: "PUT",
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

export async function createKnowledgeNode(
    kbId: string,
    node: {
      parent_id?: string | null
      type: NodeType
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

export async function deleteKnowledgeNode(kbId: string, nodeId: string): Promise<void> {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("未登录")

    const response = await fetch(`${API_BASE}/api/knowledge-bases/${kbId}/nodes/${nodeId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "删除节点失败")
    }
    return response.json()
}

interface MoveNodeRequest {
  target_id: string;
  position: 'before' | 'after' | 'inside';
}

export async function moveNode(kbId: string, dragId: string, targetId: string, position: 'before' | 'after' | 'inside') {
  const response = await fetch(`${API_BASE}/api/knowledge-bases/${kbId}/nodes/${dragId}/move`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      target_id: targetId,
      position: position
    } as MoveNodeRequest)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '移动节点失败');
  }

  return await response.json();
}