"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Plus, Search, BookMarked, Calendar, Users, Loader2 } from 'lucide-react'
import UserNav from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { getKnowledgeBases, createKnowledgeBase } from "@/lib/api"
import { KnowledgeBase } from "@/types/knowledge-base"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"

export default function KnowledgeBasesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newKbName, setNewKbName] = useState("")
  const [newKbDescription, setNewKbDescription] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function fetchKnowledgeBases() {
      try {
        setIsLoading(true)
        const data = await getKnowledgeBases()
        setKnowledgeBases(data)
      } catch (error) {
        console.error("获取知识库失败:", error)
        toast({
          title: "获取知识库失败",
          description: error instanceof Error ? error.message : "请检查网络连接或重新登录",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchKnowledgeBases()
  }, [toast])

  // 过滤知识库
  const filteredKnowledgeBases = knowledgeBases.filter((kb) =>
    kb.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCreateKnowledgeBase = async () => {
    if (!newKbName.trim()) {
      toast({
        title: "无法创建知识库",
        description: "知识库名称不能为空",
        variant: "destructive",
      })
      return
    }

    try {
      setIsCreating(true)
      const newKb = await createKnowledgeBase(newKbName, newKbDescription)
      
      setKnowledgeBases((prev) => [...prev, newKb])
      setIsCreateDialogOpen(false)
      setNewKbName("")
      setNewKbDescription("")
      
      toast({
        title: "创建成功",
        description: `知识库 "${newKb.name}" 已创建`,
        variant: "default",
      })
      console.log("新创建的知识库:", newKb)
      // 可选：直接导航到新创建的知识库
      router.push(`/knowledge-bases/${newKb.kb_id}`)
    } catch (error) {
      console.error("创建知识库失败:", error)
      toast({
        title: "创建知识库失败",
        description: error instanceof Error ? error.message : "请检查网络连接或重新登录",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center">
            <BookOpen className="mr-2 h-6 w-6" />
            <h1 className="text-2xl font-bold">知识树</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </header>

      <div className="container py-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">我的知识库</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜索知识库..."
                className="w-[200px] pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              创建知识库
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredKnowledgeBases.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredKnowledgeBases.map((kb) => (
              <Card key={kb.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle>{kb.name}</CardTitle>
                  <CardDescription>{kb.description || "无描述"}</CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      更新于 {format(new Date(kb.updated_at), "yyyy-MM-dd")}
                    </div>
                    {/* 这里可以添加更多信息，如节点数量和协作者数量，
                        但需要API支持这些数据 */}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/knowledge-bases/${kb.kb_id}`}>打开知识库</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed">
            <BookOpen className="mb-4 h-8 w-8 text-muted-foreground" />
            <p className="text-lg font-medium">暂无知识库</p>
            <p className="text-sm text-muted-foreground">点击"创建知识库"按钮开始使用</p>
          </div>
        )}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建新知识库</DialogTitle>
            <DialogDescription>创建一个新的知识库来组织您的知识</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="kb-name">知识库名称</Label>
              <Input
                id="kb-name"
                value={newKbName}
                onChange={(e) => setNewKbName(e.target.value)}
                placeholder="输入知识库名称"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="kb-description">描述（可选）</Label>
              <Textarea
                id="kb-description"
                value={newKbDescription}
                onChange={(e) => setNewKbDescription(e.target.value)}
                placeholder="简要描述此知识库的内容和用途"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isCreating}>
              取消
            </Button>
            <Button onClick={handleCreateKnowledgeBase} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  创建中...
                </>
              ) : (
                "创建"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
