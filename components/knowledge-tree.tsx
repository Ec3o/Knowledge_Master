"use client"

import type React from "react"

import { useState } from "react"
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useCustomToast } from "@/components/custom-toast"

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
}: TreeNodeProps) => {
  const isExpanded = expanded[node.id]
  const isSelected = selectedNode === node.id

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

  return (
    <div>
      <div
        className={cn("flex cursor-pointer items-center py-1 text-sm", isSelected && "bg-muted rounded-md font-medium")}
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

        <span className="truncate">{node.name}</span>

        <div className="ml-auto flex opacity-0 group-hover:opacity-100">
          {node.type === "folder" && (
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleAddClick}>
              <Plus className="h-3 w-3" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={handleDeleteClick}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
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
  const { showSuccessToast, showErrorToast, showConfirmToast } = useCustomToast()

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

  const handleAddNode = (parentId: string) => {
    showSuccessToast("创建节点", "新节点已创建")
  }

  const handleDeleteNode = (nodeId: string, nodeName: string) => {
    showConfirmToast("确认删除", `您确定要删除节点 "${nodeName}" 吗？此操作不可撤销。`, () => {
      setTimeout(() => {
        showSuccessToast("删除成功", `节点 "${nodeName}" 已成功删除`)
      }, 500)
    })
  }

  return (
    <div className="max-h-[calc(100vh-180px)] overflow-y-auto pr-2">
      {treeData.map((node) => (
        <TreeNodeComponent
          key={node.id}
          node={node}
          level={0}
          onNodeSelect={handleNodeSelect}
          expanded={expanded}
          toggleExpand={toggleExpand}
          selectedNode={selectedNode}
          onAddNode={handleAddNode}
          onDeleteNode={handleDeleteNode}
        />
      ))}
    </div>
  )
}
