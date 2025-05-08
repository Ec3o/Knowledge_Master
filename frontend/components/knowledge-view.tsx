"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, BookOpen, FileText, Calculator } from "lucide-react"
import MarkdownRenderer from "@/components/markdown-renderer"

// 示例数据 - 使用Markdown格式
const knowledgeData = {
  concept1: {
    title: "1.1 基本定义",
    content: `
# 基本定义

这里是基本定义的内容，详细解释了这个概念的来源、应用场景以及重要性。

## 重要性

这个定义是后续内容的基础，理解这个定义对于掌握整个章节的内容至关重要。

## 应用场景

- 场景一：在解决问题时
- 场景二：在分析数据时
- 场景三：在设计系统时
    `,
    type: "concept",
    formulas: ["E = mc^2", "F = ma"],
    examples: [
      `
### 示例应用

这是一个例子，展示了如何应用这个概念解决实际问题。

1. 首先，我们需要理解问题的背景和要求
2. 然后应用相关的公式和方法来解决问题
3. 最后验证结果的正确性

\`\`\`python
def example_function():
    # 这是一个示例代码
    result = calculate_something()
    return result
\`\`\`
      `,
    ],
    notes: `
### 学习笔记

这是一些笔记，记录了学习过程中的重点和难点，以及一些容易混淆的地方。

> 重点提示：这些笔记可以帮助你在复习时快速回顾关键内容。

**难点解析**：
- 概念的抽象性可能导致理解困难
- 应用时需要注意边界条件
- 与其他概念的区别需要明确
    `,
  },
  concept2: {
    title: "1.2 基本公式",
    content: `
# 基本公式

这里是基本公式的内容，详细解释了公式的推导过程、适用条件以及使用方法。

## 推导过程

公式的推导基于以下原理：

1. 首先考虑系统的边界条件
2. 然后应用相关的物理定律
3. 最后通过数学变换得到最终公式

## 适用条件

- 条件一：系统处于平衡状态
- 条件二：忽略外部干扰
- 条件三：在特定温度范围内有效
    `,
    type: "formula",
    formulas: ["a^2 + b^2 = c^2", "E = hf"],
    examples: [],
    notes: `
### 公式使用注意事项

这是一些关于公式的笔记，记录了公式的来源、物理意义以及使用注意事项。

\`\`\`
注意：在应用公式时，务必检查单位一致性
\`\`\`

**物理意义**：
- 公式左侧代表系统的能量状态
- 公式右侧代表系统的配置参数
- 等号表示能量守恒原理
    `,
  },
  example1: {
    title: "例题 1.1",
    content: `
# 例题 1.1

这是例题1.1的内容，详细描述了问题的背景、已知条件和求解目标。

## 问题描述

给定一个系统，初始状态为 A，经过一系列变换后达到状态 B，求解过程中的关键参数。

## 已知条件

- 初始状态：A(x₀, y₀)
- 终止状态：B(x₁, y₁)
- 变换规则：f(x, y) = (x², y + 1)

## 求解目标

确定从状态 A 到状态 B 所需的最少变换次数。
    `,
    type: "example",
    formulas: [],
    examples: [
      `
### 解题过程

**步骤1**：分析问题，确定使用的方法

首先，我们需要分析问题，确定使用哪些公式和方法。

**步骤2**：应用公式进行计算

\`\`\`
初始：A(2, 3)
第一次变换：(4, 4)
第二次变换：(16, 5)
第三次变换：(256, 6)
\`\`\`

**步骤3**：验证结果

检查最终状态是否符合要求，并验证是否是最优解。

![解题图示](/placeholder.svg?height=200&width=400)
      `,
    ],
    notes: `
### 解题思路

这个例题的关键在于正确理解问题，选择合适的公式，并正确应用。

**要点提示**：
1. 在解题过程中，需要注意单位的一致性
2. 计算时注意精度问题
3. 结果验证是必不可少的步骤

> 类似问题的通用解法：先分析问题类型，然后套用相应的解题模板，最后检查结果合理性。
    `,
  },
}

type KnowledgeViewProps = {
  nodeId: string
}

export default function KnowledgeView({ nodeId }: KnowledgeViewProps) {
  const [knowledge, setKnowledge] = useState<any>(null)

  useEffect(() => {
    // 在实际应用中，这里会从API获取数据
    if (knowledgeData[nodeId]) {
      setKnowledge(knowledgeData[nodeId])
    } else {
      setKnowledge(null)
    }
  }, [nodeId])

  if (!knowledge) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">未找到知识节点</h3>
          <p className="mt-2 text-sm text-muted-foreground">该节点可能已被删除或尚未创建</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{knowledge.title}</CardTitle>
              <CardDescription>
                {knowledge.type === "concept" && "概念"}
                {knowledge.type === "formula" && "公式"}
                {knowledge.type === "example" && "例题"}
              </CardDescription>
            </div>
            <Badge variant="outline">
              {knowledge.type === "concept" && <BookOpen className="mr-1 h-3 w-3" />}
              {knowledge.type === "formula" && <Calculator className="mr-1 h-3 w-3" />}
              {knowledge.type === "example" && <FileText className="mr-1 h-3 w-3" />}
              {knowledge.type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <MarkdownRenderer content={knowledge.content} />

          <Tabs defaultValue="formulas" className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="formulas">公式</TabsTrigger>
              <TabsTrigger value="examples">例题</TabsTrigger>
              <TabsTrigger value="notes">笔记</TabsTrigger>
            </TabsList>

            <TabsContent value="formulas" className="mt-4">
              {knowledge.formulas && knowledge.formulas.length > 0 ? (
                <div className="space-y-4">
                  {knowledge.formulas.map((formula: string, index: number) => (
                    <div key={index} className="rounded-md bg-muted p-4">
                      <code className="text-lg">{formula}</code>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-24 items-center justify-center rounded-md border border-dashed">
                  <p className="text-sm text-muted-foreground">没有相关公式</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="examples" className="mt-4">
              {knowledge.examples && knowledge.examples.length > 0 ? (
                <div className="space-y-4">
                  {knowledge.examples.map((example: string, index: number) => (
                    <div key={index} className="rounded-md bg-muted p-4">
                      <MarkdownRenderer content={example} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-24 items-center justify-center rounded-md border border-dashed">
                  <p className="text-sm text-muted-foreground">没有相关例题</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              {knowledge.notes ? (
                <div className="rounded-md bg-muted p-4">
                  <MarkdownRenderer content={knowledge.notes} />
                </div>
              ) : (
                <div className="flex h-24 items-center justify-center rounded-md border border-dashed">
                  <p className="text-sm text-muted-foreground">没有相关笔记</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">有问题？问问 AI</span>
        </div>
      </div>
    </div>
  )
}
