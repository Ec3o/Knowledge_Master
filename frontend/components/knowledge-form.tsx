"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save } from "lucide-react"
import type { KnowledgeNode } from "@/types/knowledge-base"
import { updateKnowledgeNode } from "@/lib/api"

type KnowledgeFormProps = {
  nodeId: string
  kbId: string
}

export default function KnowledgeForm({ nodeId, kbId }: KnowledgeFormProps) {
  const [node, setNode] = useState<KnowledgeNode | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    content: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    async function fetchNodeData() {
      try {
        setIsLoading(true)
        // 这里应该调用API获取节点详情
        // 目前API中没有提供获取单个节点的方法，需要添加

        // 模拟API调用
        await new Promise((resolve) => setTimeout(resolve, 500))

        // 模拟数据
        const mockNode = {
          id: nodeId,
          kb_id: kbId,
          name: "示例知识点",
          type: "file",
          content: "这是示例知识点的内容。在实际应用中，这里应该显示从API获取的内容。",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        setNode(mockNode)
        setFormData({
          name: mockNode.name,
          content: mockNode.content || "",
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: "无法保存",
        description: "节点名称不能为空",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)

      // 调用API更新节点
      await updateKnowledgeNode(kbId, nodeId, {
        name: formData.name,
        content: formData.content,
      })

      toast({
        title: "保存成功",
        description: "知识点内容已更新",
        variant: "default",
      })

      // 更新本地节点数据
      if (node) {
        setNode({
          ...node,
          name: formData.name,
          content: formData.content,
          updated_at: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error("保存节点失败:", error)
      toast({
        title: "保存失败",
        description: error instanceof Error ? error.message : "请检查网络连接或重新登录",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-32 w-full" />
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
      <form onSubmit={handleSubmit}>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">知识点名称</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="输入知识点名称"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">知识点内容</Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="输入知识点内容"
              rows={12}
              disabled={isSaving}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
