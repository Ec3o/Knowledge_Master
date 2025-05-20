"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { ChevronDown, ChevronUp, Terminal } from "lucide-react"
import CopyButton from "@/components/copy-button"
import type { KnowledgeNode } from "@/types/knowledge-base"
import { getKnowledgeNode } from "@/lib/api/knowledge-node"
import { nodeTypeMap } from "@/types/knowledge-node"
import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"
import { Button } from "@/components/ui/button"

type KnowledgeViewProps = {
  nodeId: string
  kbId: string
}

export default function KnowledgeView({ nodeId, kbId }: KnowledgeViewProps) {
  const [node, setNode] = useState<KnowledgeNode | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [foldedBlocks, setFoldedBlocks] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  useEffect(() => {
    async function fetchNodeData() {
      try {
        setIsLoading(true)
        const response = await getKnowledgeNode(kbId, nodeId)
        setNode(response)
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

  const toggleCodeFold = (id: string) => {
    setFoldedBlocks((prev) => {
      console.log("Toggling fold for", id, "current state:", prev[id])
      return {
        ...prev,
        [id]: !prev[id],
      }
    })
  }

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
        <h1 className="text-2xl font-bold ">{node.name}</h1>
        <p className="text-muted-foreground mb-2">{nodeTypeMap[node.type].name}</p>
        <div className="prose dark:prose-invert max-w-none">
          {node.content ? (
            <ReactMarkdown
              rehypePlugins={[rehypeHighlight]}
              components={{
                pre: ({ children }) => <pre className="not-prose">{children}</pre>,
                code: ({ node: codeNode, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || "")
                  if (match?.length) {
                    // 直接使用原始的children，不尝试提取内容
                    // 这样可以保留语法高亮和格式

                    // 为了生成稳定ID，我们使用语言和一个随机数
                    // 这不是完美的解决方案，但避免了处理复杂的React元素
                    const id = `code-${match[1]}-${Math.random().toString(36).substring(2, 8)}`
                    const isFolded = foldedBlocks[id]

                    // 获取原始文本用于预览（如果可能）
                    let rawText = ""
                    if (codeNode && typeof codeNode === "object" && "value" in codeNode) {
                      rawText = String(codeNode.value || "")
                    }

                    const lines = rawText.split("\n")
                    const previewLines = lines.slice(0, 3)
                    const hasMoreLines = lines.length > 3

                    return (
                      <div className="not-prose rounded-md border">
                        <div className="flex h-12 items-center justify-between bg-zinc-100 px-4 dark:bg-zinc-900">
                          <div className="flex items-center gap-2">
                            <Terminal size={18} />
                            {match[1]}
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">{codeNode?.data?.meta}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleCodeFold(id)}
                              className="h-8 w-8"
                              title={isFolded ? "展开代码" : "折叠代码"}
                            >
                              {isFolded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                            </Button>
                            <CopyButton id={id} />
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <div id={id} className="p-4">
                            {isFolded ? (
                              <>
                                {/* 折叠状态：显示前几行 */}
                                {previewLines.map((line, i) => (
                                  <div key={i}>{line}</div>
                                ))}
                                {hasMoreLines && <div>// ...</div>}
                              </>
                            ) : (
                              // 展开状态：直接渲染原始children
                              children
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  } else {
                    return (
                      <code {...props} className="not-prose rounded bg-gray-100 px-1 dark:bg-zinc-900">
                        {children}
                      </code>
                    )
                  }
                },
              }}
            >
              {node.content}
            </ReactMarkdown>
          ) : (
            <p className="text-muted-foreground">此知识点暂无内容</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
