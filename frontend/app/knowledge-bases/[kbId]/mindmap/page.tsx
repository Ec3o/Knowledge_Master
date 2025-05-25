// page.tsx
"use client"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import MindMapPage from "@/components/mindmap/mind-map-flow";
import React, { useState,use } from 'react';
import presetData from '@/components/mindmap/presetData';
import { getKnowledgeBaseWithTree } from "@/lib/api/knowledge-tree";
import { getKnowledgeBase } from "@/lib/api/knowledge-base";
import { STRUCTURES } from '@/components/mindmap/layouts/structures/index';
import { IConnectionType } from '@/components/mindmap/layouts/types';
import { KnowledgeTreeResponse } from "@/types/knowledge-base";
import { KnowledgeNode } from "@/types/knowledge-node";

export default function MindMap({
  params,
}: {
  params: { kbId: string }
}) {
    const { kbId } = params;
    const [mindMapData, setMindMapData] = useState(presetData[0]);
    const [structure, setStructure] = useState(STRUCTURES.TREE_BALANCE);
    const [connectionType, setConnectionType] = useState(IConnectionType.CURVE);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // 并行获取知识库基本信息和树形结构
        const [kbInfo, treeData] = await Promise.all([
          getKnowledgeBase(kbId),
          getKnowledgeBaseWithTree(kbId)
        ]);
        
        // 转换API数据为标准格式
        const convertedData = convert2StdFormat(kbInfo.name, treeData);
        console.log('转换后的思维导图数据:', convertedData);
        setMindMapData(JSON.stringify(convertedData));
        
      } catch (err) {
        console.error('获取知识库数据失败:', err);
        setError('获取知识库数据失败，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [kbId]);
  console.log('思维导图数据:', mindMapData);
  return (
    <div className="container mx-auto flex flex-col h-screen py-4">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/knowledge-bases/${kbId}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            返回知识库
          </Link>
        </Button>
        <h1 className="text-2xl font-bold ml-4">知识库思维导图</h1>
      </div>
  
      {/* 添加加载和错误状态显示 */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <p>加载中...</p>
        </div>
      )}
  
      {error && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      )}
  
      {!isLoading && !error && (
        <>
          <div className="flex mb-4">
            {/* 可以保留这些控件，但移除预设数据选择器 */}
            <select
          onChange={(e) => {
            const preset = presetData[parseInt(e.target.value, 10) || 0];
            setMindMapData(preset);
          }}
        >
          {presetData.map((_, i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
            <select
              value={structure}
              onChange={(e) => setStructure(e.target.value)}
            >
              <option value={STRUCTURES.TREE_BALANCE}>TREE BALANCE</option>
              <option value={STRUCTURES.TREE_LEFT}>TREE LEFT</option>
              <option value={STRUCTURES.TREE_RIGHT}>TREE RIGHT</option>
            </select>
            <select
              value={connectionType}
              onChange={(e) => setConnectionType(e.target.value as IConnectionType)}
            >
              <option value={IConnectionType.CURVE}>Curve</option>
              <option value={IConnectionType.STRAIGHT}>Straight</option>
              <option value={IConnectionType.POLYLINE}>Polyline</option>
            </select>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 overflow-auto min-w-full min-h-full">
                <MindMapPage
                mindMapData={mindMapData}
                structure={structure}
                connectionType={connectionType}
                onMindMapDataChange={setMindMapData}
                onStructureChange={setStructure}
                onConnectionTypeChange={setConnectionType}
                presetData={presetData}
                />
            </div>
        </div>
        </>
      )}
    </div>
  );
}

const convert2StdFormat = (root_title: string, apiData: KnowledgeTreeResponse) => {
    // 递归转换每个节点
    const convertNode = (node: KnowledgeNode) => {
      const result: { 
        title: string; 
        children?: any[];
      } = {
        title: node.name,
      };
      
      // 如果有子节点，递归转换
      if (node.children && node.children.length > 0) {
        result.children = node.children.map(convertNode);
      }
      
      return result;
    };
    
    return {
      root: {
        title: root_title,
        children: apiData.data.map(convertNode),
      }
    };
  };