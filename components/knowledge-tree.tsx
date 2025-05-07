"use client"

import type React from "react"

import { useState } from "react"
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, Trash2, Edit, Check, X } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type TreeNode = {
  id: string
  name: string
  type: "file" | "folder"
  children?: TreeNode[]
}

type TreeNodeProps = {
  node: TreeNode
  level: number
  onNodeSelect: (id: string) => void
  expanded: Record<string, boolean>
  toggleExpand: (id: string) => void
  selectedNode: string | null
  onAddNode: (parentId: string) => void
  onDeleteNode: (nodeId: string, nodeName: string) => void
  onRenameNode: (nodeId: string, nodeName: string) => void
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
}: TreeNodeProps) => {
  const isExpanded = expanded[node.id]
  const isSelected = selectedNode === node.id
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(node.name)

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

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (newName.trim() !== "") {
      onRenameNode(node.id, newName)
      setIsRenaming(false)
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
            <File className="h-4 w-4 text-muted-foreground" />
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
            />
            <div className="flex ml-1">
              <Button type="submit" size="icon" variant="ghost" className="h-6 w-6">
                <Check className="h-3 w-3" />
              </Button>
              <Button type="button" size="icon" variant="ghost" className="h-6 w-6" onClick={handleRenameCancel}>
                <X className="h-3 w-3" />
              </Button>
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
            />
          ))}
        </div>
      )}
    </div>
  )
}

type KnowledgeTreeProps = {
  onNodeSelect: (id: string) => void
  treeData: TreeNode[]
}

export default function KnowledgeTree({ onNodeSelect, treeData }: KnowledgeTreeProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    chapter1: true,
  })
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newNodeParent, setNewNodeParent] = useState<string | null>(null)
  const [newNodeName, setNewNodeName] = useState("")
  const [newNodeType, setNewNodeType] = useState<"file" | "folder">("file")
  const { toast } = useToast()
  const [localTreeData, setLocalTreeData] = useState<TreeNode[]>(treeData)

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

  const findNodeById = (nodes: TreeNode[], id: string): TreeNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children) {
        const found = findNodeById(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  const addNodeToTree = (nodes: TreeNode[], parentId: string, newNode: TreeNode): TreeNode[] => {
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

  const deleteNodeFromTree = (nodes: TreeNode[], nodeId: string): TreeNode[] => {
    return nodes.filter((node) => {
      if (node.id === nodeId) return false
      if (node.children) {
        node.children = deleteNodeFromTree(node.children, nodeId)
      }
      return true
    })
  }

  const renameNodeInTree = (nodes: TreeNode[], nodeId: string, newName: string): TreeNode[] => {
    return nodes.map((node) => {
      if (node.id === nodeId) {
        return { ...node, name: newName }
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

  const handleAddNode = () => {
    if (!newNodeParent || !newNodeName.trim()) {
      toast({
        title: "无法创建节点",
        description: "节点名称不能为空",
        variant: "destructive",
      })
      return
    }

    const newNodeId = `node_${Date.now()}`
    const newNode: TreeNode = {
      id: newNodeId,
      name: newNodeName,
      type: newNodeType,
      children: newNodeType === "folder" ? [] : undefined,
    }

    // 更新本地树数据
    const updatedTreeData = addNodeToTree(localTreeData, newNodeParent, newNode)
    setLocalTreeData(updatedTreeData)

    // 如果是文件夹，默认展开
    if (newNodeType === "folder") {
      setExpanded((prev) => ({ ...prev, [newNodeId]: true }))
    }

    // 关闭对话框
    setIsAddDialogOpen(false)

    // 显示成功消息
    toast({
      title: "创建成功",
      description: `已创建${newNodeType === "folder" ? "文件夹" : "知识点"} "${newNodeName}"`,
      variant: "default",
    })

    // 如果是文件，自动选中
    if (newNodeType === "file") {
      setSelectedNode(newNodeId)
      onNodeSelect(newNodeId)
    }
  }

  const handleDeleteNode = (nodeId: string, nodeName: string) => {
    toast({
      title: "确认删除",
      description: `您确定要删除${findNodeById(localTreeData, nodeId)?.type === "folder" ? "文件夹" : "知识点"} "${nodeName}" 吗？此操作不可撤销。`,
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
            onClick={() => {
              // 更新本地树数据
              const updatedTreeData = deleteNodeFromTree(localTreeData, nodeId)
              setLocalTreeData(updatedTreeData)

              // 如果删除的是当前选中的节点，清除选中状态
              if (selectedNode === nodeId) {
                setSelectedNode(null)
              }

              toast({
                title: "删除成功",
                description: `已删除 "${nodeName}"`,
                variant: "default",
              })
            }}
          >
            删除
          </Button>
        </div>
      ),
    })
  }

  const handleRenameNode = (nodeId: string, newName: string) => {
    // 更新本地树数据
    const updatedTreeData = renameNodeInTree(localTreeData, nodeId, newName)
    setLocalTreeData(updatedTreeData)

    toast({
      title: "重命名成功",
      description: `已将节点重命名为 "${newName}"`,
      variant: "default",
    })
  }

  const handleAddRootNode = () => {
    // 创建一个虚拟的根节点ID
    setNewNodeParent("root")
    setNewNodeName("")
    setNewNodeType("folder") // 默认为文件夹
    setIsAddDialogOpen(true)
  }

  return (
    <div className="space-y-2">
      <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-2">
        {localTreeData.map((node) => (
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
          />
        ))}
      </div>

      <Button variant="outline" size="sm" className="w-full mt-2" onClick={handleAddRootNode}>
        <Plus className="mr-2 h-4 w-4" />
        添加根节点
      </Button>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{newNodeParent === "root" ? "添加根节点" : "添加子节点"}</DialogTitle>
            <DialogDescription>
              {newNodeParent === "root"
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
              />
            </div>
            <div className="grid gap-2">
              <Label>节点类型</Label>
              <RadioGroup
                value={newNodeType}
                onValueChange={(value) => setNewNodeType(value as "file" | "folder")}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="file" id="node-type-file" />
                  <Label htmlFor="node-type-file" className="flex items-center">
                    <File className="mr-2 h-4 w-4" />
                    知识点
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="folder" id="node-type-folder" />
                  <Label htmlFor="node-type-folder" className="flex items-center">
                    <Folder className="mr-2 h-4 w-4" />
                    文件夹
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddNode}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
