"use client"

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  ChevronRight,
  ChevronDown,
  File,
  GripVertical,
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "../ui/use-toast";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getKnowledgeBaseWithTree } from "@/lib/api/knowledge-tree";
import { createKnowledgeNode, updateKnowledgeNode, deleteKnowledgeNode, moveNode } from "@/lib/api/knowledge-node";
import { KnowledgeNode, nodeTypeMap, NodeType } from "@/types/knowledge-node";
import { useDrag, useDrop } from "react-dnd";
import { randomBytes } from "crypto";

const ItemTypes = {
  NODE: "node",
};

interface DragItem {
  id: string;
  type: string;
  node: KnowledgeNode;
  level: number;
}

type TreeNodeProps = {
  node: KnowledgeNode;
  level: number;
  onNodeSelect: (id: string) => void;
  expanded: Record<string, boolean>;
  toggleExpand: (id: string) => void;
  selectedNode: string | null;
  onAddNode: (parentId: string) => void;
  onDeleteNode: (nodeId: string, nodeName: string) => void;
  onRenameNode: (nodeId: string, nodeName: string) => void;
  kbId: string;
  onMoveNode: (dragId: string, hoverId: string, position: "before" | "after" | "inside") => void;
};
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
  onMoveNode,
}: TreeNodeProps) => {
  const dragRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const isExpanded = expanded[node.id];
  const isSelected = selectedNode === node.id;
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(node.name);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.NODE,
    item: () => ({ id: node.id, type: ItemTypes.NODE, node, level }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop, dropPosition }, drop] = useDrop({
    accept: ItemTypes.NODE,
    drop: (item: DragItem, monitor) => {
      if (!dropRef.current || item.id === node.id) return;
  
      // 安全检查：确保能获取到有效的位置数据
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return; // 如果无法获取位置，直接返回
  
      const hoverBoundingRect = dropRef.current.getBoundingClientRect();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
  
      // 动态获取当前节点可视高度（不包括子节点）
      const nodeElement = dropRef.current.querySelector('.node-content');
      const nodeHeight = nodeElement?.getBoundingClientRect().height || 32;
  
      // 安全限制：确保 hoverClientY 在合理范围内
      const safeHoverY = Math.max(0, Math.min(hoverClientY, nodeHeight));
      const hoverRatio = safeHoverY / nodeHeight;
  
      let position: "before" | "after" | "inside" = "inside";
  
      if (hoverRatio < 0.25) {
        position = "before";
      } else if (hoverRatio > 0.75) {
        position = "after";
      }
  
      if (position === "inside" && node.type !== "folder") {
        position = "before";
      }
  
      console.log(`Moving to ${position} | hoverY: ${hoverClientY} → ${safeHoverY} | ratio: ${hoverRatio.toFixed(2)} | node: ${node.name}`);
      onMoveNode(item.id, node.id, position);
    },
    collect: (monitor) => {
      const clientOffset = monitor.getClientOffset();
      let position: "before" | "after" | "inside" | null = null;
      
      if (clientOffset && dropRef.current) {
        const hoverBoundingRect = dropRef.current.getBoundingClientRect();
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;
  
        const nodeElement = dropRef.current.querySelector('.node-content');
        const nodeHeight = nodeElement?.getBoundingClientRect().height || 32;
  
        const safeHoverY = Math.max(0, Math.min(hoverClientY, nodeHeight));
        const hoverRatio = safeHoverY / nodeHeight;
  
        if (hoverRatio < 0.30) {
          position = "before";
        } else if (hoverRatio > 0.70) {
          position = "after";
        } else {
          position = "inside";
        }
      }
  
      return {
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
        dropPosition: position,
      };
    },
  });
  drag(dragRef);
  drop(dropRef);

  const handleClick = () => {
    if (node.type === "folder") {
      toggleExpand(node.id);
    } else {
      onNodeSelect(node.id);
    }
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddNode(node.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteNode(node.id, node.name);
  };

  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRenaming(true);
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (newName.trim() === "") {
      toast({
        title: "重命名失败",
        description: "节点名称不能为空",
        variant: "destructive",
      });
      return;
    }

    if (newName === node.name) {
      setIsRenaming(false);
      return;
    }

    try {
      setIsUpdating(true);
      await updateKnowledgeNode(kbId, node.id, { title: newName });
      onRenameNode(node.id, newName);
      setIsRenaming(false);
    } catch (error) {
      console.error("重命名节点失败:", error);
      toast({
        title: "重命名失败",
        description: error instanceof Error ? error.message : "请检查网络连接或重新登录",
        variant: "destructive",
      });
      setNewName(node.name);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRenameCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNewName(node.name);
    setIsRenaming(false);
  };
  // console.log(node);
  return (
    <div
      ref={dropRef}
      style={{
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isOver ? "hsl(var(--muted) / 0.5)" : "transparent",
        border: isOver && canDrop ? "1px dashed hsl(var(--primary))" : "1px dashed transparent",
        transition: "background-color 0.2s, border 0.2s",
      }}
    >
      {isOver && canDrop && dropPosition && (
      <div className={cn(
        "absolute left-0 right-0 h-0.5 bg-primary transition-all duration-200 z-10",
        {
          "top-0": dropPosition === "before",
          "bottom-0": dropPosition === "after",
          "top-1/2 -translate-y-1/2 bg-primary/20 h-full rounded": dropPosition === "inside",
        }
      )} />
    )}
      <div
      ref={dragRef}
      className={cn(
        "group flex cursor-pointer items-center py-1 text-sm hover:bg-muted/50 rounded-md px-2 node-content",
        isSelected && "bg-muted font-medium",
      )}
      style={{ paddingLeft: `${level * 12}px` }}
      onClick={handleClick}
    >
        <div className="mr-1 cursor-move">
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
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
              const Icon = nodeTypeMap[node.type as NodeType].icon;
              return <Icon className="h-4 w-4 text-muted-foreground" />;
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
      {/* Debugging: console.log(node.children) */}
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
              onMoveNode={onMoveNode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

type KnowledgeTreeProps = {
  onNodeSelect: (id: string) => void;
  treeData: KnowledgeNode[];
  kbId: string;
};

export default function KnowledgeTree({ onNodeSelect, treeData, kbId }: KnowledgeTreeProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [moveDialogConfig, setMoveDialogConfig] = useState<{
    dragId: string;
    hoverId: string;
    position: "before" | "after" | "inside";
    dragName: string;
    hoverName: string;
  } | null>(null);
  const [newNodeParent, setNewNodeParent] = useState<string | null>(null);
  const [newNodeName, setNewNodeName] = useState("");
  const [newNodeType, setNewNodeType] = useState<NodeType>("file");
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const [localTreeData, setLocalTreeData] = useState<KnowledgeNode[]>(treeData || []);

  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    const setInitialExpandedState = (nodes: KnowledgeNode[]) => {
      nodes.forEach((node) => {
        if (node.type === "folder" && Array.isArray(node.children) && node.children.length > 0) {
          initialExpanded[node.id] = true;
          setInitialExpandedState(node.children);
        }
      });
    };
    setInitialExpandedState(treeData || []);
    setExpanded(initialExpanded);
  }, [treeData]);

  const refreshTreeData = async () => {
    try {
      setIsRefreshing(true);
      const response = await getKnowledgeBaseWithTree(kbId);
      if (response?.data) {
        setLocalTreeData(response.data);
        // 保留现有展开状态，只添加新发现的文件夹
        setExpanded(prev => {
          const newExpanded = { ...prev };
          const updateExpandedState = (nodes: KnowledgeNode[]) => {
            nodes.forEach(node => {
              if (node.type === "folder" && node.children?.length) {
                if (newExpanded[node.id] === undefined) {
                  newExpanded[node.id] = true; // 默认展开新发现的文件夹
                }
                updateExpandedState(node.children);
              }
            });
          };
          updateExpandedState(response.data);
          return newExpanded;
        });
      }
      toast({ title: "刷新成功", description: "知识树数据已更新", variant: "default" });
    } catch (error) {
      console.error("刷新知识树失败:", error);
      toast({
        title: "刷新失败",
        description: error instanceof Error ? error.message : "请检查网络连接或重新登录",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNodeSelect = (id: string) => {
    setSelectedNode(id);
    onNodeSelect(id);
  };

  const openAddNodeDialog = (parentId: string) => {
    setNewNodeParent(parentId);
    setNewNodeName("");
    setNewNodeType("file");
    setIsAddDialogOpen(true);
  };

  const findNodeById = (nodes: KnowledgeNode[], id: string): KnowledgeNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const addNodeToTree = (nodes: KnowledgeNode[], parentId: string, newNode: KnowledgeNode): KnowledgeNode[] => {
    return nodes.map((node) => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...(node.children || []), newNode],
          type: "folder",
        };
      }
      if (node.children) {
        return { ...node, children: addNodeToTree(node.children, parentId, newNode) };
      }
      return node;
    });
  };

  const deleteNodeFromTree = (nodes: KnowledgeNode[], nodeId: string): KnowledgeNode[] => {
    return nodes.filter((node) => {
      if (node.id === nodeId) return false;
      if (node.children) {
        node.children = deleteNodeFromTree(node.children, nodeId);
      }
      return true;
    });
  };

  const renameNodeInTree = (nodes: KnowledgeNode[], nodeId: string, newName: string): KnowledgeNode[] => {
    return nodes.map((node) => {
      if (node.id === nodeId) {
        return { ...node, name: newName };
      }
      if (node.children) {
        return { ...node, children: renameNodeInTree(node.children, nodeId, newName) };
      }
      return node;
    });
  };
  let isNodeInserted = false;
  const moveNodeInTree = (nodes: KnowledgeNode[], dragId: string, hoverId: string, position: "before" | "after" | "inside"): KnowledgeNode[] => {
    // 从原位置移除节点
    console.log(dragId, hoverId, position,nodes);
    let draggedNode: KnowledgeNode | null = null;
    const newNodes = nodes.filter((node) => {
      if (node.id === dragId) {
        draggedNode = node;
        return false;
      }
      if (node.children) {
        node.children = moveNodeInTree(node.children, dragId, hoverId, position);
        console.log(`Checking children of ${node.name} for dragged node`); // Debugging log
      }
      return true;
    });

    if (!draggedNode) return nodes;

    // 找到目标位置并插入节点
    const insertNode = (parentNode: KnowledgeNode | null, children: KnowledgeNode[], targetId: string, pos: "before" | "after" | "inside") => {
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.id === targetId) {
          if (pos === "inside" && child.type === "folder" ) {
            child.children = child.children || [];
            if (!isNodeInserted){console.log(isNodeInserted);child.children.push(draggedNode!);}
            console.log(`Inserted ${draggedNode!.name} inside ${child.name}`);
            isNodeInserted = true;
            return true;
          } else if (pos === "before") {
            children.splice(i, 0, draggedNode!);
            return true;
          } else if (pos === "after") {
            children.splice(i + 1, 0, draggedNode!);
            return true;
          }
        }
        if (child.children && insertNode(child, child.children, targetId, pos)) {
          return true;
        }
      }
      return false;
    };

    if (!insertNode(null, newNodes, hoverId, position)) {
      // 如果未找到目标位置，默认添加到根节点
      newNodes.push(draggedNode);
    }

    return newNodes;
  };

  const handleAddNode = async () => {
    if (!newNodeName.trim()) {
      toast({
        title: "无法创建节点",
        description: "节点名称不能为空",
        variant: "destructive",
      });
      return;
    }
  
    try {
      setIsCreating(true);
  
      const nodeData = {
        parent_id: newNodeParent || null,
        type: newNodeType,
        name: newNodeName,
        content: newNodeType === "file" ? "" : undefined,
      };
  
      const newNode = await createKnowledgeNode(kbId, nodeData);
      
      // 优化：直接更新本地状态而不完全刷新
      // setLocalTreeData(prev => addNodeToTree(prev, newNodeParent || "", newNode));
      await refreshTreeData(); // 刷新数据以获取最新状态
      
      // 如果是添加到现有文件夹，保持该文件夹展开
      if (newNodeParent) {
        setExpanded(prev => ({ ...prev, [newNodeParent]: true }));
      }
  
      setIsAddDialogOpen(false);
      toast({
        title: "创建成功",
        description: `已创建${newNodeType} "${newNodeName}"`,
        variant: "default",
      });
  
      if (newNodeType === "file") {
        setSelectedNode(newNode.id);
        onNodeSelect(newNode.id);
      }
    } catch (error) {
      console.error("创建节点失败:", error);
      toast({
        title: "创建节点失败",
        description: error instanceof Error ? error.message : "请检查网络连接或重新登录",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };
  

  const handleDeleteNode = async (nodeId: string, nodeName: string) => {
    if (!window.confirm(`确定要删除 "${nodeName}" 吗？此操作不可撤销。`)) {
      return;
    }

    try {
      await deleteKnowledgeNode(kbId, nodeId);
      setLocalTreeData((prev) => deleteNodeFromTree(prev, nodeId));
      if (selectedNode === nodeId) {
        setSelectedNode(null);
      }
      toast({
        title: "删除成功",
        description: `已删除节点: ${nodeName}`,
        variant: "default",
      });
    } catch (error) {
      console.error("删除节点失败:", error);
      toast({
        title: "删除失败",
        description: error instanceof Error ? error.message : "请检查网络连接或重新登录",
        variant: "destructive",
      });
    }
  };

  const handleRenameNode = (nodeId: string, newName: string) => {
    setLocalTreeData((prev) => renameNodeInTree(prev, nodeId, newName));
  };

  const handleMoveNode = async (dragId: string, hoverId: string, position: "before" | "after" | "inside") => {
    const dragNode = findNodeById(localTreeData, dragId);
    const hoverNode = findNodeById(localTreeData, hoverId);

    if (!dragNode || !hoverNode) return;

    // 检查是否是文件夹内移动
    if (position === "inside" && hoverNode.type !== "folder") {
      toast({
        title: "移动失败",
        description: "只能将节点移动到文件夹内",
        variant: "destructive",
      });
      return;
    }

    // 检查是否是向子节点移动
    const isDescendant = (parentId: string, childId: string): boolean => {
      const parent = findNodeById(localTreeData, parentId);
      if (!parent || !parent.children) return false;
      for (const child of parent.children) {
        if (child.id === childId) return true;
        if (isDescendant(child.id, childId)) return true;
      }
      return false;
    };

    if (isDescendant(dragId, hoverId)) {
      toast({
        title: "移动失败",
        description: "不能将节点移动到自己的子节点中",
        variant: "destructive",
      });
      return;
    }

    // 显示移动确认对话框
    let actionText = "";
    if (position === "inside") {
      actionText = `移动到文件夹 "${hoverNode.name}" 内`;
    } else if (position === "before") {
      actionText = `移动到 "${hoverNode.name}" 之前`;
    } else {
      actionText = `移动到 "${hoverNode.name}" 之后`;
    }

    setMoveDialogConfig({
      dragId,
      hoverId,
      position,
      dragName: dragNode.name,
      hoverName: hoverNode.name,
    });
    setIsMoveDialogOpen(true);
  };

  const confirmMoveNode = async () => {
    if (!moveDialogConfig) return;

    const { dragId, hoverId, position } = moveDialogConfig;

    try {
      // 更新本地状态
      // setLocalTreeData((prev) => moveNodeInTree(prev, dragId, hoverId, position));
      
      // 这里应该调用后端API来保存移动操作
      await moveNode(kbId, dragId, hoverId, position);
      await refreshTreeData();
      setIsMoveDialogOpen(false);
      toast({
        title: "移动成功",
        description: "节点位置已更新",
        variant: "default",
      });
    } catch (error) {
      console.error("移动节点失败:", error);
      toast({
        title: "移动失败",
        description: error instanceof Error ? error.message : "请检查网络连接或重新登录",
        variant: "destructive",
      });
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-full bg-background border-r border-border overflow-hidden">
        <div className="flex items-center justify-between border-b border-border p-3">
          <h2 className="text-sm font-medium">知识架构</h2>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" onClick={refreshTreeData} disabled={isRefreshing}>
              {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => {
              setNewNodeParent(null);
              setNewNodeName("");
              setNewNodeType("folder");
              setIsAddDialogOpen(true);
            }}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {localTreeData.map((node) => (
            <TreeNodeComponent
              key={`${node.id}-${randomBytes(4).toString("hex")}`}
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
              onMoveNode={handleMoveNode}
            />
          ))}
        </div>
      </div>

      {/* 添加节点对话框 */}
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

      {/* 移动节点对话框 */}
      <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>移动节点</DialogTitle>
            {moveDialogConfig && (
              <DialogDescription>
                确定要将节点 {moveDialogConfig.dragName} {(() => {
                  if (moveDialogConfig.position === "inside") {
                    return `移动到文件夹 `+moveDialogConfig.hoverName+` 内？`;
                  } else if (moveDialogConfig.position === "before") {
                    return `移动到 `+moveDialogConfig.hoverName+`之前？`;
                  } else {
                    return `移动到 `+moveDialogConfig.hoverName+`之后？`;
                  }
                })()}
              </DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMoveDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={confirmMoveNode}>确认移动</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DndProvider>
  );
};