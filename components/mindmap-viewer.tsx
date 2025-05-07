"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"

// 示例数据
const mindMapData = {
  all: {
    id: "root",
    name: "知识体系",
    children: [
      {
        id: "chapter1",
        name: "第一章：基础概念",
        children: [
          {
            id: "concept1",
            name: "1.1 基本定义",
            children: [],
          },
          {
            id: "concept2",
            name: "1.2 基本公式",
            children: [],
          },
          {
            id: "examples1",
            name: "1.3 例题",
            children: [
              {
                id: "example1",
                name: "例题 1.1",
                children: [],
              },
              {
                id: "example2",
                name: "例题 1.2",
                children: [],
              },
            ],
          },
        ],
      },
      {
        id: "chapter2",
        name: "第二章：进阶内容",
        children: [
          {
            id: "concept3",
            name: "2.1 进阶概念",
            children: [],
          },
          {
            id: "concept4",
            name: "2.2 进阶公式",
            children: [],
          },
        ],
      },
    ],
  },
  chapter1: {
    id: "chapter1",
    name: "第一章：基础概念",
    children: [
      {
        id: "concept1",
        name: "1.1 基本定义",
        children: [],
      },
      {
        id: "concept2",
        name: "1.2 基本公式",
        children: [],
      },
      {
        id: "examples1",
        name: "1.3 例题",
        children: [
          {
            id: "example1",
            name: "例题 1.1",
            children: [],
          },
          {
            id: "example2",
            name: "例题 1.2",
            children: [],
          },
        ],
      },
    ],
  },
  chapter2: {
    id: "chapter2",
    name: "第二章：进阶内容",
    children: [
      {
        id: "concept3",
        name: "2.1 进阶概念",
        children: [],
      },
      {
        id: "concept4",
        name: "2.2 进阶公式",
        children: [],
      },
    ],
  },
}

type MindMapNode = {
  id: string
  name: string
  children: MindMapNode[]
}

type MindMapViewerProps = {
  chapter: string
}

export default function MindMapViewer({ chapter }: MindMapViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [data, setData] = useState<MindMapNode | null>(null)

  useEffect(() => {
    // 在实际应用中，这里会从API获取数据
    if (mindMapData[chapter]) {
      setData(mindMapData[chapter])
    } else {
      setData(null)
    }
  }, [chapter])

  useEffect(() => {
    if (!canvasRef.current || !data) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 设置画布大小
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 绘制思维导图
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // 绘制根节点
    ctx.fillStyle = "#f97316"
    ctx.strokeStyle = "#f97316"
    drawNode(ctx, data, centerX, centerY, 0, 200, 0)
  }, [data, canvasRef])

  const drawNode = (
    ctx: CanvasRenderingContext2D,
    node: MindMapNode,
    x: number,
    y: number,
    angle: number,
    radius: number,
    level: number,
  ) => {
    // 绘制节点
    ctx.beginPath()
    const nodeRadius = 30 - level * 5
    ctx.arc(x, y, nodeRadius, 0, Math.PI * 2)

    // 根据层级设置不同的颜色
    if (level === 0) {
      ctx.fillStyle = "#f97316"
    } else if (level === 1) {
      ctx.fillStyle = "#3b82f6"
    } else {
      ctx.fillStyle = "#10b981"
    }

    ctx.fill()

    // 绘制节点文本
    ctx.fillStyle = "white"
    ctx.font = "12px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    // 截断长文本
    let displayName = node.name
    if (displayName.length > 10) {
      displayName = displayName.substring(0, 10) + "..."
    }

    ctx.fillText(displayName, x, y)

    // 如果有子节点，绘制子节点
    if (node.children && node.children.length > 0) {
      const angleStep = (Math.PI * 2) / node.children.length
      const newRadius = radius * 0.6

      node.children.forEach((child, index) => {
        const childAngle = angle + angleStep * index
        const childX = x + Math.cos(childAngle) * radius
        const childY = y + Math.sin(childAngle) * radius

        // 绘制连接线
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(childX, childY)
        ctx.stroke()

        // 递归绘制子节点
        drawNode(ctx, child, childX, childY, childAngle, newRadius, level + 1)
      })
    }
  }

  return (
    <div className="relative h-full w-full">
      {data ? (
        <canvas ref={canvasRef} className="h-full w-full" />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Card className="p-6">
            <p>没有找到思维导图数据</p>
          </Card>
        </div>
      )}

      {selectedNode && (
        <div className="absolute bottom-4 right-4 rounded-lg bg-white p-4 shadow-lg">
          <h3 className="text-lg font-medium">节点详情</h3>
          <p className="text-sm text-muted-foreground">ID: {selectedNode}</p>
        </div>
      )}
    </div>
  )
}
