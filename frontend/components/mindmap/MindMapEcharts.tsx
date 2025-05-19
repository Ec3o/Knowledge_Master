"use client"

import { useState, useEffect, useRef } from "react"
import ReactECharts from "echarts-for-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import type { KnowledgeNode } from "@/types/knowledge-base"
import { getKnowledgeTree } from "@/lib/api/knowledge-tree"

type MindMapProps = {
  kbId: string
  initialData?: KnowledgeNode[]
}

// Define node type colors and icons
const NODE_TYPE_CONFIG = {
  root: {
    color: "#7c3aed", // 紫色，特殊的根节点颜色
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/><path d="m19.1 4.9-14.2 14.2"/></svg>`,
    shape: "roundRect",
    symbolSize: [140, 50], // 根节点尺寸更大
  },
  folder: {
    color: "#3b82f6", // blue
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2z"/></svg>`,
    shape: "roundRect",
    symbolSize: [120, 40],
  },
  file: {
    color: "#64748b", // slate
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>`,
    shape: "roundRect",
    symbolSize: [120, 40],
  },
  concept: {
    color: "#8b5cf6", // violet
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
    shape: "roundRect",
    symbolSize: [120, 40],
  },
  formula: {
    color: "#ec4899", // pink
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><path d="M14 2v6h6"/><path d="m9 18 3-3-3-3"/><path d="m5 12-3 3 3 3"/></svg>`,
    shape: "roundRect",
    symbolSize: [120, 40],
  },
  algorithm: {
    color: "#0ea5e9", // sky
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h10"/></svg>`,
    shape: "roundRect",
    symbolSize: [120, 40],
  },
  theorem: {
    color: "#f59e0b", // amber
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>`,
    shape: "roundRect",
    symbolSize: [120, 40],
  },
  example: {
    color: "#10b981", // emerald
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
    shape: "roundRect",
    symbolSize: [120, 40],
  },
  code_snippet: {
    color: "#6366f1", // indigo
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    shape: "roundRect",
    symbolSize: [120, 40],
  },
  pseudo_code: {
    color: "#8b5cf6", // violet
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 9V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"/><path d="M9 18h12"/><path d="M9 14h12"/><path d="M9 10h12"/><path d="M9 6h12"/></svg>`,
    shape: "roundRect",
    symbolSize: [120, 40],
  },
  code_explanation: {
    color: "#0891b2", // cyan
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>`,
    shape: "roundRect",
    symbolSize: [120, 40],
  },
  reference: {
    color: "#f43f5e", // rose
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    shape: "roundRect",
    symbolSize: [120, 40],
  },
  video: {
    color: "#ef4444", // red
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>`,
    shape: "roundRect",
    symbolSize: [120, 40],
  },
  slide: {
    color: "#f97316", // orange
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6H9a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1Z"/><path d="M9 6V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1"/><path d="M9 18v1a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-1"/></svg>`,
    shape: "roundRect",
    symbolSize: [120, 40],
  },
  note: {
    color: "#eab308", // yellow
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 11h4"/><path d="M12 15h4"/><path d="M8 11v.01"/><path d="M8 15v.01"/><path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"/></svg>`,
    shape: "roundRect",
    symbolSize: [120, 40],
  },
  question: {
    color: "#a855f7", // purple
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>`,
    shape: "roundRect",
    symbolSize: [120, 40],
  },
  custom: {
    color: "#94a3b8", // slate
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
    shape: "roundRect",
    symbolSize: [120, 40],
  },
}

// 用于存储节点位置的接口
interface NodePosition {
  [key: string]: [number, number] // [x, y] 坐标
}

export default function MindMapEcharts({ kbId, initialData }: MindMapProps) {
  const [nodes, setNodes] = useState<KnowledgeNode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [nodePositions, setNodePositions] = useState<NodePosition>({})
  const [layoutType, setLayoutType] = useState<"tree" | "radial" | "force">("tree")
  const { toast } = useToast()
  const chartRef = useRef<ReactECharts>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const response = await getKnowledgeTree(kbId)
        const data = response || []
        setNodes(data)
      } catch (error) {
        console.error("获取知识树失败:", error)
        toast({
          title: "获取知识树失败",
          description: error instanceof Error ? error.message : "请检查网络连接",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (initialData) {
      setNodes(initialData)
      setIsLoading(false)
    } else {
      fetchData()
    }
  }, [kbId, initialData, toast])

  const getNodeConfig = (type: string, isRoot = false) => {
    if (isRoot) {
      return NODE_TYPE_CONFIG.root
    }
    return NODE_TYPE_CONFIG[type as keyof typeof NODE_TYPE_CONFIG] || NODE_TYPE_CONFIG.custom
  }

  // 计算树形布局的节点位置
  const calculateTreeLayout = (nodes: KnowledgeNode[]) => {
    const positions: NodePosition = {}
    const horizontalSpacing = 200
    const verticalSpacing = 120

    // 计算每个节点的子树宽度
    const calculateSubtreeWidth = (node: KnowledgeNode): number => {
      if (!node.children || node.children.length === 0) {
        return 1 // 叶子节点宽度为1单位
      }

      let totalWidth = 0
      node.children.forEach(child => {
        totalWidth += calculateSubtreeWidth(child)
      })
      return totalWidth
    }

    // 计算每个节点的位置
    const assignPositions = (
        node: KnowledgeNode,
        depth = 0,
        startX = 0,
        parentX = 0,
        parentY = 0
    ) => {
      const subtreeWidth = calculateSubtreeWidth(node)
      const x = startX + (subtreeWidth * horizontalSpacing) / 2 - horizontalSpacing / 2
      const y = depth * verticalSpacing

      positions[node.id] = [x, y]

      // 递归处理子节点
      if (node.children && node.children.length > 0) {
        let childStartX = startX
        node.children.forEach(child => {
          const childWidth = calculateSubtreeWidth(child)
          assignPositions(child, depth + 1, childStartX, x, y)
          childStartX += childWidth * horizontalSpacing
        })
      }
    }

    // 为所有根节点分配位置
    if (nodes.length > 1) {
      // 多个根节点时，计算总宽度
      let totalWidth = 0
      nodes.forEach(node => {
        totalWidth += calculateSubtreeWidth(node)
      })

      // 从中心开始布局
      let startX = -totalWidth * horizontalSpacing / 2
      nodes.forEach(node => {
        const nodeWidth = calculateSubtreeWidth(node)
        assignPositions(node, 0, startX)
        startX += nodeWidth * horizontalSpacing
      })
    } else if (nodes.length === 1) {
      assignPositions(nodes[0])
    }

    return positions
  }

  // 检查节点位置是否重叠
  const checkOverlap = (positions: NodePosition) => {
  const positionArray = Object.entries(positions)
  for (let i = 0; i < positionArray.length; i++) {
    for (let j = i + 1; j < positionArray.length; j++) {
      const [id1, [x1, y1]] = positionArray[i]
      const [id2, [x2, y2]] = positionArray[j]
      const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
      if (distance < 80) { // 最小间距
        return true
      }
    }
  }
  return false
}

  // 计算放射状布局的节点位置
  const calculateRadialLayout = (nodes: KnowledgeNode[]) => {
    const positions: NodePosition = {}

    const assignPositions = (node: KnowledgeNode, angle = 0, radius = 0, parentAngle = 0) => {
      // 根节点在中心
      if (radius === 0) {
        positions[node.id] = [0, 0]
      } else {
        // 子节点在圆周上
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        positions[node.id] = [x, y]
      }

      // 递归处理子节点
      if (node.children && node.children.length > 0) {
        const childCount = node.children.length
        const angleStep = (2 * Math.PI) / childCount
        const newRadius = radius + 200

        node.children.forEach((child, index) => {
          const childAngle = angle + (index - childCount / 2) * angleStep
          assignPositions(child, childAngle, newRadius, angle)
        })
      }
    }

    // 为所有根节点分配位置
    if (nodes.length > 1) {
      // 多个根节点时，创建虚拟根节点
      assignPositions({ id: "virtual-root", name: "知识库", type: "root", children: nodes })
    } else if (nodes.length === 1) {
      assignPositions(nodes[0])
    }

    return positions
  }

  // 将树结构转换为图结构（节点和边）
  const convertToGraphData = (nodes: KnowledgeNode[]) => {
    if (nodes.length === 0) {
      return { nodes: [], links: [] }
    }

    // 根据布局类型计算初始位置
    let initialPositions: NodePosition = {}
    if (Object.keys(nodePositions).length === 0) {
      // 只有在没有保存的位置时才计算新的布局
      if (layoutType === "tree") {
        initialPositions = calculateTreeLayout(nodes)
      } else if (layoutType === "radial") {
        initialPositions = calculateRadialLayout(nodes)
      }
      // force布局由ECharts自动处理
    } else {
      initialPositions = nodePositions
    }

    const graphNodes: any[] = []
    const graphLinks: any[] = []
    const nodeMap = new Map<string, boolean>() // 用于跟踪已处理的节点

    // 创建一个虚拟根节点（如果有多个根节点）
    const rootId = "virtual-root"
    let hasVirtualRoot = false

    if (nodes.length > 1) {
      hasVirtualRoot = true
      const rootPosition = initialPositions[rootId] || [0, 0]

      graphNodes.push({
        id: rootId,
        name: "知识库",
        symbolSize: NODE_TYPE_CONFIG.root.symbolSize,
        symbol: NODE_TYPE_CONFIG.root.shape,
        itemStyle: {
          color: NODE_TYPE_CONFIG.root.color,
          borderRadius: 6,
        },
        label: {
          show: true,
          formatter: (params: any) => {
            return `{rootIcon|} ${params.name}`
          },
          rich: {
            rootIcon: {
              height: 16,
              width: 16,
              align: "center",
              backgroundColor: {
                image: "data:image/svg+xml;base64," + btoa(NODE_TYPE_CONFIG.root.icon),
              },
            },
          },
          color: "#fff",
          fontSize: 14,
          fontWeight: "bold",
        },
        x: rootPosition[0],
        y: rootPosition[1],
        fixed: true, // 固定根节点位置
        category: 0,
        draggable: true,
      })
    }

    const processNode = (node: KnowledgeNode, parentId?: string, level = 0, isRoot = false) => {
      if (nodeMap.has(node.id)) {
        return // 避免重复处理
      }
      nodeMap.set(node.id, true)

      const nodeConfig = getNodeConfig(node.type, isRoot && level === 0)
      const savedPosition = initialPositions[node.id] || [(Math.random() - 0.5) * 500, (Math.random() - 0.5) * 500]

      // 创建节点
      graphNodes.push({
        id: node.id,
        name: node.name || "未命名节点",
        value: node.type,
        symbolSize: nodeConfig.symbolSize,
        symbol: nodeConfig.shape,
        itemStyle: {
          color: nodeConfig.color,
          borderRadius: 6,
        },
        label: {
          show: true,
          formatter: (params: any) => {
            const iconKey = isRoot && level === 0 ? "rootIcon" : `${node.type}Icon`
            return `{${iconKey}|} ${params.name}`
          },
          rich: {
            rootIcon: {
              height: 16,
              width: 16,
              align: "center",
              backgroundColor: {
                image: "data:image/svg+xml;base64," + btoa(NODE_TYPE_CONFIG.root.icon),
              },
            },
            [`${node.type}Icon`]: {
              height: 16,
              width: 16,
              align: "center",
              backgroundColor: {
                image: "data:image/svg+xml;base64," + btoa(nodeConfig.icon),
              },
            },
          },
          color: "#fff",
          fontSize: isRoot && level === 0 ? 14 : 12,
          fontWeight: isRoot && level === 0 ? "bold" : "normal",
        },
        tooltip: {
          formatter: (params: any) => {
            let content = `<div style="font-weight:bold">${params.name}</div>`
            content += `<div style="margin-top:4px">类型: ${node.type}</div>`

            if (node.content) {
              content += `
                <div style="max-width:300px;word-wrap:break-word;margin-top:8px">
                  ${node.content.length > 100 ? node.content.substring(0, 100) + "..." : node.content}
                </div>
              `
            }
            return content
          },
        },
        x: savedPosition[0],
        y: savedPosition[1],
        category: level,
        draggable: true, // 允许拖动
      })

      // 创建与父节点的连接
      if (parentId) {
        graphLinks.push({
          source: parentId,
          target: node.id,
          lineStyle: {
            color: "#94a3b8",
            width: 1.5,
            curveness: 0.2,
          },
        })
      } else if (hasVirtualRoot) {
        // 如果有虚拟根节点，将顶级节点连接到虚拟根节点
        graphLinks.push({
          source: rootId,
          target: node.id,
          lineStyle: {
            color: "#94a3b8",
            width: 1.5,
            curveness: 0.2,
          },
        })
      }

      // 处理子节点
      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => {
          processNode(child, node.id, level + 1)
        })
      }
    }

    // 处理所有根节点
    nodes.forEach((node, index) => {
      processNode(node, undefined, 0, true)
    })

    return { nodes: graphNodes, links: graphLinks }
  }

  const getOption = () => {
    const { nodes: graphNodes, links: graphLinks } = convertToGraphData(nodes)

    // 创建所有节点类型的富文本格式
    const rich: Record<string, any> = {
      rootIcon: {
        height: 16,
        width: 16,
        align: "center",
        backgroundColor: {
          image: "data:image/svg+xml;base64," + btoa(NODE_TYPE_CONFIG.root.icon),
        },
      },
    }

    Object.entries(NODE_TYPE_CONFIG).forEach(([type, config]) => {
      rich[`${type}Icon`] = {
        height: 16,
        width: 16,
        align: "center",
        backgroundColor: {
          image: "data:image/svg+xml;base64," + btoa(config.icon),
        },
      }
    })

    const option = {
      tooltip: {
        trigger: "item",
        triggerOn: "mousemove",
        enterable: true,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        textStyle: {
          color: "#334155",
        },
        extraCssText: "box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); border-radius: 4px; padding: 8px 12px;",
      },
      series: [
        {
          type: "graph",
          layout: layoutType === "force" ? "force" : "none", // 使用自定义布局或力导向布局
          data: graphNodes,
          links: graphLinks,
          roam: true, // 允许缩放和平移
          draggable: true, // 允许拖动节点
          label: {
            show: true,
            position: "inside",
            formatter: "{b}",
            color: "#fff",
            rich: rich,
          },
          edgeSymbol: ["none", "none"],
          edgeLabel: {
            show: false,
          },
          emphasis: {
            focus: "adjacency",
            lineStyle: {
              width: 2,
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
          lineStyle: {
            color: "#94a3b8",
            width: 1.5,
            curveness: 0.2,
          },
          // 力导向布局配置
          force:
              layoutType === "force"
                  ? {
                    repulsion: 300,
                    gravity: 0.1,
                    edgeLength: 150,
                    layoutAnimation: true,
                  }
                  : undefined,
          animation: true,
          animationDuration: 550,
          animationDurationUpdate: 750,
        },
      ],
    }

    return option
  }

  const onChartClick = (params: any) => {
    if (params.dataType === "node" && params.data && params.data.id) {
      console.log("点击节点:", params.data)
      // 这里可以添加节点点击后的逻辑，比如打开编辑表单
    }
  }

  // 处理节点拖动结束事件
  const onNodeDragEnd = (params: any) => {
    if (params.dataType === "node" && params.data && params.data.id) {
      const nodeId = params.data.id
      const newX = params.data.x
      const newY = params.data.y

      // 更新节点位置状态
      setNodePositions((prev) => ({
        ...prev,
        [nodeId]: [newX, newY],
      }))

      console.log(`节点 ${nodeId} 移动到位置 [${newX}, ${newY}]`)
    }
  }

  // 重置所有节点位置
  const resetNodePositions = () => {
    setNodePositions({})
    if (chartRef.current) {
      const echartsInstance = chartRef.current.getEchartsInstance()
      echartsInstance.setOption(getOption(), true)
    }
  }

  // 切换布局类型
  const changeLayout = (type: "tree" | "radial" | "force") => {
    setLayoutType(type)
    setNodePositions({}) // 清除保存的位置
  }

  if (isLoading) {
    return (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        </Card>
    )
  }

  return (
      <Card className="border shadow-sm">
        <CardContent className="p-6 h-[700px] relative">
          <div className="absolute top-2 right-2 z-10 flex gap-2">
            <button
                onClick={() => changeLayout("tree")}
                className={`text-xs px-2 py-1 rounded-md shadow-sm ${
                    layoutType === "tree" ? "bg-slate-700 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
            >
              树形布局
            </button>
            <button
                onClick={() => changeLayout("radial")}
                className={`text-xs px-2 py-1 rounded-md shadow-sm ${
                    layoutType === "radial" ? "bg-slate-700 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
            >
              放射布局
            </button>
            <button
                onClick={() => changeLayout("force")}
                className={`text-xs px-2 py-1 rounded-md shadow-sm ${
                    layoutType === "force" ? "bg-slate-700 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
            >
              力导向布局
            </button>
            <button
                onClick={resetNodePositions}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2 py-1 rounded-md shadow-sm"
            >
              重置布局
            </button>
          </div>
          <ReactECharts
              ref={chartRef}
              option={getOption()}
              style={{ height: "100%", width: "100%" }}
              onEvents={{
                click: onChartClick,
                // draggable: true,
                dragend: onNodeDragEnd,
              }}
              theme="light"
              opts={{ renderer: "canvas" }}
          />
        </CardContent>
      </Card>
  )
}
