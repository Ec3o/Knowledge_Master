"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from 'lucide-react'
import { KnowledgeNode } from "@/types/knowledge-base"

type KnowledgeViewProps = {
  nodeId: string
  kbId: string
}

export default function KnowledgeView({ nodeId, kbId }: KnowledgeViewProps) {
  const [node, setNode] = useState<KnowledgeNode | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchNodeData() {
      try {
        setIsLoading(true)
        // 这里应该调用API获取节点详情
        // 目前API中没有提供获取单个节点的方法，需要添加
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 模拟数据
        setNode({
          id: nodeId,
          kb_id: kbId,
          name: "示例知识点",
          type: "file",
          content: "这是示例知识点的内容。在实际应用中，这里应该显示从API获取的内容。",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      } catch (error) {
        console.error("获取节点详情失败:", error)
        toast({
          title: "获取节点详情失败",
          description: error instanceof Error ? error.message : "请检查网络连接或重新登录",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchNodeData()
  }, [nodeId, kbId, toast])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!node) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="py-8">
            <p className="text-muted-foreground">无法加载节点内容</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">{node.name}</h2>
        <div className="prose dark:prose-invert max-w-none">
          {node.content ? (
            <div dangerouslySetInnerHTML={{ __html: node.content }} />
          ) : (
            <p className="text-muted-foreground">此知识点暂无内容</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
