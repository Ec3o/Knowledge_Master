"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, BookOpen, BrainCircuit, Search, MessageSquare, ChevronLeft, Database, Loader2 } from "lucide-react"
import KnowledgeTree from "@/components/knowledge/knowledge-tree"
import KnowledgeForm from "@/components/knowledge/knowledge-form"
import KnowledgeView from "@/components/knowledge/knowledge-view"
import { useToast } from "@/components/ui/use-toast"
import UserNav from "@/components/utils/user-nav"
import { getKnowledgeBase } from "@/lib/api/knowledge-base"
import { getKnowledgeBaseWithTree } from "@/lib/api/knowledge-tree"
import type { KnowledgeTreeResponse } from "@/types/knowledge-base"

export default function KnowledgeBasePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const kbId = params.kbId as string
  console.log("KnowledgeBasePage kbId:", kbId)
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeTreeResponse | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [kbname, setKbName] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchKnowledgeBase() {
      try {
        setIsLoading(true)
        const response = await getKnowledgeBaseWithTree(kbId)
        const fetch_name_response = await getKnowledgeBase(kbId)
        console.log("KnowledgeBasePage data:", response) // 
        console.log("KnowledgeBasePage treeData:", ) //null
  
        setKnowledgeBase(response);
        setKbName(fetch_name_response.name)
        console.log("KnowledgeBasePage knowledgeBase:", knowledgeBase)//null
      } catch (error) {
        console.error("获取知识库失败:", error)
        toast({
          title: "获取知识库失败",
          description: error instanceof Error ? error.message : "请检查网络连接或重新登录",
          variant: "destructive",
        })
        router.push("/knowledge-bases")
      } finally {
        setIsLoading(false)
      }
    }

    fetchKnowledgeBase()
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

  if (isLoading) {
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
              <div className="h-6 w-40 animate-pulse rounded-md bg-muted"></div>
            </div>
          </div>
        </header>
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!knowledgeBase) {
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
          </div>
        </header>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-medium">知识库不存在或无法访问</h2>
            <p className="mt-2 text-muted-foreground">请检查知识库ID或返回知识库列表</p>
            <Button asChild className="mt-4">
              <Link href="/knowledge-bases">返回知识库列表</Link>
            </Button>
          </div>
        </div>
      </div>
    )
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
          <div className="flex items-center max-w-[180px] sm:max-w-[240px] md:max-w-[300px]">
            <BookOpen className="flex-shrink-0 mr-2 h-5 w-5" />
            <h1 
              className="text-sm font-bold sm:text-xl md:text-2xl truncate hover:text-clip"
              title={kbname || ""}
            >
              {kbname || <span className="inline-block h-6 w-40 animate-pulse rounded-md bg-muted" />}
            </h1>
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
              <KnowledgeTree onNodeSelect={handleNodeSelect} treeData={knowledgeBase.data || []} kbId={kbId} />
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
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/knowledge-bases/${kbId}/mindmap`}>
                      <BrainCircuit className="mr-2 h-4 w-4" />
                      转为思维导图
                    </Link>
                  </Button>
                </div>
              </div>

              <TabsContent value="view" className="mt-4">
                {selectedNode ? (
                  <KnowledgeView nodeId={selectedNode} kbId={kbId} />
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
                  <KnowledgeForm nodeId={selectedNode} kbId={kbId} />
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
