"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ZoomIn, ZoomOut, RotateCw, Download, Share2 } from "lucide-react"
import Link from "next/link"
import MindMapViewer from "@/components/mindmap-viewer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function MindMapPage() {
  const [zoomLevel, setZoomLevel] = useState(1)
  const [selectedChapter, setSelectedChapter] = useState("all")

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5))
  }

  const handleReset = () => {
    setZoomLevel(1)
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回知识库
            </Link>
          </Button>
          <h1 className="ml-4 text-2xl font-bold">思维导图视图</h1>
          <div className="ml-auto flex items-center space-x-2">
            <Select value={selectedChapter} onValueChange={setSelectedChapter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择章节" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部知识</SelectItem>
                <SelectItem value="chapter1">第一章</SelectItem>
                <SelectItem value="chapter2">第二章</SelectItem>
                <SelectItem value="chapter3">第三章</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-1 rounded-md border px-2 py-1">
              <Button variant="ghost" size="icon" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center text-sm">{Math.round(zoomLevel * 100)}%</span>
              <Button variant="ghost" size="icon" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleReset}>
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              导出
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              分享
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden bg-gray-50">
        <div
          className="h-full w-full transition-transform duration-200 ease-in-out"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: "center center",
          }}
        >
          <MindMapViewer chapter={selectedChapter} />
        </div>
      </div>
    </div>
  )
}
