"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { BookOpen, Plus, FolderTree, Clock, User2 } from "lucide-react"
import UserNav from "@/components/user-nav"

// 示例数据
const initialKnowledgeBases = [
  {
    id: "kb1",
    name: "数学知识库",
    description: "包含高等数学、线性代数等内容",
    lastUpdated: "2023-05-15T10:30:00Z",
    owner: "我",
  },
  {
    id: "kb2",
    name: "物理知识库",
    description: "包含力学、电磁学等内容",
    lastUpdated: "2023-05-10T14:20:00Z",
    owner: "我",
  },
  {
    id: "kb3",
    name: "计算机科学",
    description: "包含算法、数据结构等内容",
    lastUpdated: "2023-05-05T09:15:00Z",
    owner: "张三（共享）",
  },
]

export default function KnowledgeBasesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [knowledgeBases, setKnowledgeBases] = useState(initialKnowledgeBases)
  const [newKbName, setNewKbName] = useState("")
  const [newKbDescription, setNewKbDescription] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateKnowledgeBase = async () => {
    if (!newKbName.trim()) {
      toast({
        title: "请输入名称",
        description: "知识库名称不能为空",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      // 这里应该是实际的API调用
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newKb = {
        id: `kb${knowledgeBases.length + 1}`,
        name: newKbName,
        description: newKbDescription,
        lastUpdated: new Date().toISOString(),
        owner: "我",
      }

      setKnowledgeBases([...knowledgeBases, newKb])
      setNewKbName("")
      setNewKbDescription("")
      setIsDialogOpen(false)

      toast({
        title: "创建成功",
        description: `知识库 "${newKbName}" 已创建`,
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "创建失败",
        description: "创建知识库时出现错误，请重试",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleSelectKnowledgeBase = (id: string) => {
    // 在实际应用中，这里应该设置当前选中的知识库ID到全局状态或本地存储
    toast({
      title: "已选择知识库",
      description: `正在加载知识库内容`,
      variant: "default",
    })
    router.push(`/dashboard?kb=${id}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Link href="/" className="flex items-center">
            <BookOpen className="mr-2 h-6 w-6" />
            <h1 className="text-2xl font-bold">💫Knowledge Universe</h1>
          </Link>
          <div className="ml-auto">
            <UserNav />
          </div>
        </div>
      </header>

      <div className="container flex-1 py-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">我的知识库</h2>
            <p className="text-muted-foreground">选择一个知识库开始管理您的知识</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                创建知识库
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建新知识库</DialogTitle>
                <DialogDescription>创建一个新的知识库来组织您的知识内容</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">名称</Label>
                  <Input
                    id="name"
                    value={newKbName}
                    onChange={(e) => setNewKbName(e.target.value)}
                    placeholder="输入知识库名称"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">描述</Label>
                  <Input
                    id="description"
                    value={newKbDescription}
                    onChange={(e) => setNewKbDescription(e.target.value)}
                    placeholder="输入知识库描述（可选）"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleCreateKnowledgeBase} disabled={isCreating}>
                  {isCreating ? "创建中..." : "创建"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {knowledgeBases.map((kb) => (
            <Card key={kb.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle>{kb.name}</CardTitle>
                <CardDescription className="line-clamp-2">{kb.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <div className="flex items-center mb-2">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>更新于 {formatDate(kb.lastUpdated)}</span>
                </div>
                <div className="flex items-center">
                  <User2 className="mr-2 h-4 w-4" />
                  <span>{kb.owner}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleSelectKnowledgeBase(kb.id)}>
                  <FolderTree className="mr-2 h-4 w-4" />
                  打开
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
