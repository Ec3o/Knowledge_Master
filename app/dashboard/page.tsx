"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, BookOpen, BrainCircuit, Search, MessageSquare, ChevronLeft, Database } from "lucide-react"
import KnowledgeTree from "@/components/knowledge-tree"
import KnowledgeForm from "@/components/knowledge-form"
import KnowledgeView from "@/components/knowledge-view"
import { useToast } from "@/components/ui/use-toast"
import UserNav from "@/components/user-nav"
import Link from "next/link"

// 示例知识库数据
const knowledgeBasesData = {
  kb1: {
    id: "kb1",
    name: "数学知识库",
    description: "包含高等数学、线性代数等内容",
    treeData: [
      {
        id: "chapter1",
        name: "第一章：微积分",
        type: "folder",
        children: [
          {
            id: "concept1",
            name: "1.1 导数定义",
            type: "file",
          },
          {
            id: "concept2",
            name: "1.2 积分公式",
            type: "file",
          },
        ],
      },
      {
        id: "chapter2",
        name: "第二章：线性代数",
        type: "folder",
        children: [
          {
            id: "concept3",
            name: "2.1 矩阵运算",
            type: "file",
          },
        ],
      },
    ],
  },
  kb2: {
    id: "kb2",
    name: "物理知识库",
    description: "包含力学、电磁学等内容",
    treeData: [
      {
        id: "chapter1",
        name: "第一章：力学",
        type: "folder",
        children: [
          {
            id: "concept1",
            name: "1.1 牛顿定律",
            type: "file",
          },
        ],
      },
      {
        id: "chapter2",
        name: "第二章：电磁学",
        type: "folder",
        children: [
          {
            id: "concept2",
            name: "2.1 麦克斯韦方程组",
            type: "file",
          },
        ],
      },
    ],
  },
  kb3: {
    id: "kb3",
    name: "计算机科学",
    description: "包含算法、数据结构等内容",
    treeData: [
      {
        id: "chapter1",
        name: "第一章：算法",
        type: "folder",
        children: [
          {
            id: "concept1",
            name: "1.1 排序算法",
            type: "file",
          },
        ],
      },
      {
        id: "chapter2",
        name: "第二章：数据结构",
        type: "folder",
        children: [
          {
            id: "concept2",
            name: "2.1 链表",
            type: "file",
          },
          {
            id: "concept3",
            name: "2.2 树",
            type: "file",
          },
        ],
      },
    ],
  },
}

export default function Dashboard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const kbId = searchParams.get("kb") || "kb1"
  const [currentKnowledgeBase, setCurrentKnowledgeBase] = useState<any>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // 在实际应用中，这里应该从API获取知识库数据
    if (knowledgeBasesData[kbId]) {
      setCurrentKnowledgeBase(knowledgeBasesData[kbId])
    } else {
      toast({
        title: "知识库不存在",
        description: "请选择一个有效的知识库",
        variant: "destructive",
      })
      router.push("/knowledge-bases")
    }
  }, [kbId, router, toast])

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNode(nodeId)
    toast({
      title: "已选择节点",
      description: `已加载节点 ${nodeId} 的内容`,
      variant: "default",
    })
  }

  const handleAskAI = () => {
    toast({
      title: "AI 功能",
      description: "需要配置 FastGPT API 密钥才能使用此功能",
      variant: "default",
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            router.push("/settings")
          }}
        >
          前往设置
        </Button>
      ),
    })
  }

  if (!currentKnowledgeBase) {
    return <div>加载中...</div>
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Button asChild variant="ghost" size="sm" className="mr-4">
            <Link href="/knowledge-bases">
              <ChevronLeft className="mr-2 h-4 w-4" />
              返回知识库列表
            </Link>
          </Button>
          <div className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            <h1 className="text-xl font-bold">{currentKnowledgeBase.name}</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜索知识..."
                className="w-[200px] pl-8 md:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={handleAskAI} variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />问 AI
            </Button>
            <UserNav />
          </div>
        </div>
      </header>

      <div className="container flex-1 items-start py-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-3">
            <div className="rounded-lg border p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <Database className="mr-2 h-4 w-4 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">知识结构</h2>
                </div>
              </div>
              <KnowledgeTree onNodeSelect={handleNodeSelect} treeData={currentKnowledgeBase.treeData} />
            </div>
          </div>

          <div className="col-span-12 lg:col-span-9">
            <Tabs defaultValue="view">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="view">查看</TabsTrigger>
                  <TabsTrigger value="edit">编辑</TabsTrigger>
                </TabsList>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <BrainCircuit className="mr-2 h-4 w-4" />
                    转为思维导图
                  </Button>
                </div>
              </div>

              <TabsContent value="view" className="mt-4">
                {selectedNode ? (
                  <KnowledgeView nodeId={selectedNode} />
                ) : (
                  <div className="flex h-[500px] items-center justify-center rounded-lg border border-dashed">
                    <div className="text-center">
                      <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">没有选择知识节点</h3>
                      <p className="mt-2 text-sm text-muted-foreground">从左侧选择一个知识节点或创建新的节点</p>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="edit" className="mt-4">
                {selectedNode ? (
                  <KnowledgeForm nodeId={selectedNode} />
                ) : (
                  <div className="flex h-[500px] items-center justify-center rounded-lg border border-dashed">
                    <div className="text-center">
                      <PlusCircle className="mx-auto h-8 w-8 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">创建新知识节点</h3>
                      <p className="mt-2 text-sm text-muted-foreground">从左侧选择一个父节点，然后在这里添加新的知识</p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
