"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Loader2,
  RefreshCw,
  HelpCircle,
  SquarePen,
  BookMarked,
  BookOpen,
  Lightbulb,
  Cpu,
  Puzzle,
  Flashlight,
  Code,
  GraduationCap,
  Sigma,
  Fingerprint,
  Workflow,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { NodeType } from "@/types/knowledge-node"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { getKnowledgeBaseWithTree } from "@/lib/api/knowledge-tree"
import { createKnowledgeNode, updateKnowledgeNode,deleteKnowledgeNode } from "@/lib/api/knowledge-node"
import { KnowledgeNode,nodeTypeMap } from "@/types/knowledge-node"
import { KnowledgeTreeResponse } from "@/types/knowledge-tree"

type TreeNodeProps = {
  node: KnowledgeNode
  level: number
  onNodeSelect: (id: string) => void
  expanded: Record<string, boolean>
  toggleExpand: (id: string) => void
  selectedNode: string | null
  onAddNode: (parentId: string) => void
  onDeleteNode: (nodeId: string, nodeName: string) => void
  onRenameNode: (nodeId: string, nodeName: string) => void
  kbId: string
}

const TreeNodeComponent = ({
  node,
  level,
  onNodeSelect,
  expanded,
  toggleExpand,
  selectedNode,
  onAddNode,
  onDeleteNode,
  onRenameNode,
  kbId,
}: TreeNodeProps) => {
  const isExpanded = expanded[node.id]
  const isSelected = selectedNode === node.id
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(node.name)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const handleClick = () => {
    if (node.type === "folder") {
      toggleExpand(node.id)
    } else {
      onNodeSelect(node.id)
    }
  }

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAddNode(node.id)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDeleteNode(node.id, node.name)
  }

  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsRenaming(true)
  }

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (newName.trim() === "") {
      toast({
        title: "重命名失败",
        description: "节点名称不能为空",
        variant: "destructive",
      })
      return
    }

    if (newName === node.name) {
      setIsRenaming(false)
      return
    }

    try {
      setIsUpdating(true)
      await updateKnowledgeNode(kbId, node.id, { title: newName })
      onRenameNode(node.id, newName)
      setIsRenaming(false)
    } catch (error) {
      console.error("重命名节点失败:", error)
      toast({
        title: "重命名失败",
        description: error instanceof Error ? error.message : "请检查网络连接或重新登录",
        variant: "destructive",
      })
      setNewName(node.name)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRenameCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
    setNewName(node.name)
    setIsRenaming(false)
  }
  
  return (
    <div>
      <div
        className={cn(
          "group flex cursor-pointer items-center py-1 text-sm hover:bg-muted/50 rounded-md px-2",
          isSelected && "bg-muted font-medium",
        )}
        style={{ paddingLeft: `${level * 12}px` }}
        onClick={handleClick}
      >
        {node.type === "folder" ? (
          <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        ) : (
          <div className="w-5"></div>
        )}

        <div className="mr-1.5">
          {node.type === "folder" ? (
            isExpanded ? (
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Folder className="h-4 w-4 text-muted-foreground" />
            )
          ) : (
            nodeTypeMap[node.type as NodeType]?.icon && (() => {
              const Icon = nodeTypeMap[node.type as NodeType].icon
              return <Icon className="h-4 w-4 text-muted-foreground" />
            })()
          )}
        </div>

        {isRenaming ? (
          <form onSubmit={handleRenameSubmit} onClick={(e) => e.stopPropagation()} className="flex-1 flex items-center">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="h-7 py-1 text-sm"
              autoFocus
              onClick={(e) => e.stopPropagation()}
              disabled={isUpdating}
            />
            <div className="flex ml-1">
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Button type="submit" size="icon" variant="ghost" className="h-6 w-6">
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" className="h-6 w-6" onClick={handleRenameCancel}>
                    <X className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </form>
        ) : (
          <span className="truncate flex-1">{node.name}</span>
        )}

        {!isRenaming && (
          <div className="ml-auto flex opacity-0 group-hover:opacity-100">
            {node.type === "folder" && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleAddClick}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRenameClick}>
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={handleDeleteClick}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              onNodeSelect={onNodeSelect}
              expanded={expanded}
              toggleExpand={toggleExpand}
              selectedNode={selectedNode}
              onAddNode={onAddNode}
              onDeleteNode={onDeleteNode}
              onRenameNode={onRenameNode}
              kbId={kbId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

type KnowledgeTreeProps = {
  onNodeSelect: (id: string) => void
  treeData: KnowledgeNode[]
  kbId: string
}

export default function KnowledgeTree({ onNodeSelect, treeData, kbId }: KnowledgeTreeProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newNodeParent, setNewNodeParent] = useState<string | null>(null)
  const [newNodeName, setNewNodeName] = useState("")
  const [newNodeType, setNewNodeType] = useState<NodeType>("file")
  const [isCreating, setIsCreating] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()
  const [localTreeData, setLocalTreeData] = useState<KnowledgeNode[]>(treeData || [])

  console.log("KnowledgeTree received treeData:", localTreeData)

  // 初始化展开状态
  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {}

    // 递归函数来设置文件夹的初始展开状态
    const setInitialExpandedState = (nodes: KnowledgeNode[]) => {
      nodes.forEach((node) => {
        if (node.type === "folder" && node.children && node.children.length > 0) {
          initialExpanded[node.id] = true
          setInitialExpandedState(node.children)
        }
      })
    }

    setInitialExpandedState(treeData || [])
    setExpanded(initialExpanded)
  }, [treeData])

  // 刷新知识树数据
  const refreshTreeData = async () => {
    try {
      setIsRefreshing(true)
      console.log("Refreshing tree data for kbId:", kbId)

      const response = await getKnowledgeBaseWithTree(kbId)
      console.log("Refreshed tree data:", response)

      if (response && response.data) {
        setLocalTreeData(response.data)

        // 更新展开状态
        const newExpanded: Record<string, boolean> = { ...expanded }

        // 递归函数来保持文件夹的展开状态
        const updateExpandedState = (nodes: KnowledgeNode[]) => {
          nodes.forEach((node) => {
            if (node.type === "folder" && node.children && node.children.length > 0) {
              // 如果是新添加的节点，默认展开
              if (newExpanded[node.id] === undefined) {
                newExpanded[node.id] = true
              }
              updateExpandedState(node.children)
            }
          })
        }

        updateExpandedState(response.data)
        setExpanded(newExpanded)
      }

      // toast({
      //   title: "刷新成功",
      //   description: "知识树数据已更新",
      //   variant: "default",
      // })
    } catch (error) {
      console.error("刷新知识树失败:", error)
      toast({
        title: "刷新失败",
        description: error instanceof Error ? error.message : "请检查网络连接或重新登录",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleNodeSelect = (id: string) => {
    setSelectedNode(id)
    onNodeSelect(id)
  }

  const openAddNodeDialog = (parentId: string) => {
    setNewNodeParent(parentId)
    setNewNodeName("")
    setNewNodeType("file")
    setIsAddDialogOpen(true)
  }

  const findNodeById = (nodes: KnowledgeNode[], id: string): KnowledgeNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children) {
        const found = findNodeById(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  const addNodeToTree = (nodes: KnowledgeNode[], parentId: string, newNode: KnowledgeNode): KnowledgeNode[] => {
    return nodes.map((node) => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...(node.children || []), newNode],
          type: "folder", // 确保父节点是文件夹类型
        }
      }
      if (node.children) {
        return {
          ...node,
          children: addNodeToTree(node.children, parentId, newNode),
        }
      }
      return node
    })
  }

  const deleteNodeFromTree = (nodes: KnowledgeNode[], nodeId: string): KnowledgeNode[] => {
    return nodes.filter((node) => {
      if (node.id === nodeId) return false
      if (node.children) {
        node.children = deleteNodeFromTree(node.children, nodeId)
      }
      return true
    })
  }

  const renameNodeInTree = (nodes: KnowledgeNode[], nodeId: string, newName: string): KnowledgeNode[] => {
    return nodes.map((node) => {
      if (node.id === nodeId) {
        return { ...node, name: newName, updated_at: new Date().toISOString() }
      }
      if (node.children) {
        return {
          ...node,
          children: renameNodeInTree(node.children, nodeId, newName),
        }
      }
      return node
    })
  }

  const handleAddNode = async () => {
    if (!newNodeName.trim()) {
      toast({
        title: "无法创建节点",
        description: "节点名称不能为空",
        variant: "destructive",
      })
      return
    }

    try {
      setIsCreating(true)

      // 准备节点数据
      const nodeData = {
        parent_id: newNodeParent === null ? null : newNodeParent,
        type: newNodeType,
        name: newNodeName,
        content: newNodeType === "file" ? "" : undefined,
      }

      console.log("Creating node with data:", nodeData)

      // 调用API创建节点
      const newNode = await createKnowledgeNode(kbId, nodeData)
      console.log("API returned new node:", newNode)

      // 关闭对话框
      setIsAddDialogOpen(false)

      // 显示成功消息
      toast({
        title: "创建成功",
        description: `已创建${newNodeType} "${newNodeName}"`,
        variant: "default",
      })

      // 从API获取最新的树数据
      await refreshTreeData()

      // 如果是文件，自动选中
      if (newNodeType === "file") {
        setSelectedNode(newNode.id)
        onNodeSelect(newNode.id)
      }
    } catch (error) {
      console.error("创建节点失败:", error)
      toast({
        title: "创建节点失败",
        description: error instanceof Error ? error.message : "请检查网络连接或重新登录",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteNode = (nodeId: string, nodeName: string) => {
    const nodeToDelete = findNodeById(localTreeData, nodeId)
    const nodeType = nodeToDelete?.type === "folder" ? "文件夹" : "知识点"

    toast({
      title: "确认删除",
      description: `您确定要删除${nodeType} "${nodeName}" 吗？此操作不可撤销。`,
      variant: "destructive",
      action: (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast({
                title: "已取消",
                description: "删除操作已取消",
                variant: "default",
              })
            }}
          >
            取消
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              try {
                const reponse = await deleteKnowledgeNode(kbId, nodeId)
                const updatedTreeData = deleteNodeFromTree(localTreeData, nodeId)
                setLocalTreeData(updatedTreeData)

                if (selectedNode === nodeId) {
                  setSelectedNode(null)
                }

                await refreshTreeData()

                toast({
                  title: "删除成功",
                  description: `已删除 "${nodeName}"`,
                  variant: "default",
                })
              } catch (error) {
                console.error("删除节点失败:", error)
                toast({
                  title: "删除节点失败",
                  description: error instanceof Error ? error.message : "请检查网络连接或重新登录",
                  variant: "destructive",
                })
              }
            }}
          >
            删除
          </Button>
        </div>
      ),
    })
  }

  const handleRenameNode = async (nodeId: string, newName: string) => {
    // 更新本地树数据
    const updatedTreeData = renameNodeInTree(localTreeData, nodeId, newName)
    console.log("Updated tree data after renaming:", updatedTreeData)
    setLocalTreeData(updatedTreeData)

    // 从API获取最新的树数据
    await refreshTreeData()

    toast({
      title: "重命名成功",
      description: `已将节点重命名为 "${newName}"`,
      variant: "default",
    })
  }

  const handleAddRootNode = () => {
    // 创建一个虚拟的根节点ID
    setNewNodeParent(null);
    setNewNodeName("")
    setNewNodeType("folder") // 默认为文件夹
    setIsAddDialogOpen(true)
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleAddRootNode}>
          <Plus className="mr-2 h-4 w-4" />
          添加根节点
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="ml-2 h-8 w-8"
          onClick={refreshTreeData}
          disabled={isRefreshing}
          title="刷新知识树"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
        </Button>
      </div>

      <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-2">
        {isRefreshing && (
          <div className="flex justify-center items-center py-2">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">刷新中...</span>
          </div>
        )}
        
        {localTreeData && localTreeData.length > 0 ? (
          localTreeData.map((node) => (
            <TreeNodeComponent
              key={node.id}
              node={node}
              level={0}
              onNodeSelect={handleNodeSelect}
              expanded={expanded}
              toggleExpand={toggleExpand}
              selectedNode={selectedNode}
              onAddNode={openAddNodeDialog}
              onDeleteNode={handleDeleteNode}
              onRenameNode={handleRenameNode}
              kbId={kbId}
            />
          ))
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <Folder className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p>此知识库还没有内容</p>
            <p className="text-sm">点击上方按钮添加第一个节点</p>
          </div>
        )}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{newNodeParent === null ? "添加根节点" : "添加子节点"}</DialogTitle>
            <DialogDescription>
              {newNodeParent === null
                ? "创建一个新的根级节点"
                : `在 "${findNodeById(localTreeData, newNodeParent || "")?.name || ""}" 下创建新节点`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="node-name">节点名称</Label>
              <Input
                id="node-name"
                value={newNodeName}
                onChange={(e) => setNewNodeName(e.target.value)}
                placeholder="输入节点名称"
                autoFocus
                disabled={isCreating}
              />
            </div>
            <div className="grid gap-2">
          <Label>节点类型</Label>
          <RadioGroup
            value={newNodeType}
            onValueChange={(value) => setNewNodeType(value as NodeType)}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3" // 响应式网格布局
            disabled={isCreating}
          >
            {Object.entries(nodeTypeMap).map(([type, { icon: Icon, name }]) => (
              <div key={type} className="flex items-center space-x-2">
                <RadioGroupItem value={type as NodeType} id={`node-type-${type}`} />
                <Label htmlFor={`node-type-${type}`} className="flex items-center">
                  <Icon className="mr-2 h-4 w-4" />
                  {name}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isCreating}>
              取消
            </Button>
            <Button onClick={handleAddNode} disabled={isCreating}>
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
