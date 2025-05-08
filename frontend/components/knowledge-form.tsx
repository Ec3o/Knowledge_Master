"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Save, Trash2, Plus, X, Eye } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
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

type KnowledgeFormProps = {
  nodeId: string
}

export default function KnowledgeForm({ nodeId }: KnowledgeFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "concept",
    formulas: [""],
    examples: [""],
    notes: "",
  })
  const [previewMode, setPreviewMode] = useState<Record<string, boolean>>({
    content: false,
    examples: Array(5).fill(false),
    notes: false,
  })

  useEffect(() => {
    // 在实际应用中，这里会从API获取数据
    if (knowledgeData[nodeId]) {
      setFormData(knowledgeData[nodeId])
    } else {
      // 重置表单
      setFormData({
        title: "",
        content: "",
        type: "concept",
        formulas: [""],
        examples: [""],
        notes: "",
      })
    }
  }, [nodeId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleArrayInputChange = (array: string, index: number, value: string) => {
    setFormData((prev) => {
      const newArray = [...prev[array]]
      newArray[index] = value
      return {
        ...prev,
        [array]: newArray,
      }
    })
  }

  const addArrayItem = (array: string) => {
    setFormData((prev) => ({
      ...prev,
      [array]: [...prev[array], ""],
    }))

    if (array === "examples") {
      setPreviewMode((prev) => ({
        ...prev,
        examples: [...prev.examples, false],
      }))
    }
  }

  const removeArrayItem = (array: string, index: number) => {
    setFormData((prev) => {
      const newArray = [...prev[array]]
      newArray.splice(index, 1)
      return {
        ...prev,
        [array]: newArray.length ? newArray : [""],
      }
    })

    if (array === "examples") {
      setPreviewMode((prev) => {
        const newExamplesPreviews = [...prev.examples]
        newExamplesPreviews.splice(index, 1)
        return {
          ...prev,
          examples: newExamplesPreviews.length ? newExamplesPreviews : [false],
        }
      })
    }
  }

  const togglePreview = (field: string, index?: number) => {
    if (field === "content" || field === "notes") {
      setPreviewMode((prev) => ({
        ...prev,
        [field]: !prev[field],
      }))
    } else if (field === "examples" && index !== undefined) {
      setPreviewMode((prev) => {
        const newExamplesPreviews = [...prev.examples]
        newExamplesPreviews[index] = !newExamplesPreviews[index]
        return {
          ...prev,
          examples: newExamplesPreviews,
        }
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 添加表单验证
    if (!formData.title.trim()) {
      toast({
        title: "标题不能为空",
        description: "请输入知识点标题",
        variant: "destructive",
      })
      return
    }

    // 显示加载状态
    toast({
      title: "正在保存",
      description: "正在保存知识点内容...",
    })

    // 在实际应用中，这里会保存到API
    // 模拟API调用
    setTimeout(() => {
      toast({
        title: "保存成功",
        description: `知识节点 "${formData.title}" 已保存`,
        variant: "default",
      })
    }, 1000)
  }

  // 添加删除知识点的Toast通知
  const handleDelete = () => {
    // 在实际应用中，这里会调用删除API
    toast({
      title: "确认删除",
      description: "您确定要删除这个知识点吗？此操作不可撤销。",
      variant: "destructive",
      action: (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // 关闭当前toast
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
              // 执行删除操作
              setTimeout(() => {
                toast({
                  title: "删除成功",
                  description: "知识点已成功删除",
                  variant: "default",
                })
              }, 500)
            }}
          >
            删除
          </Button>
        </div>
      ),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="输入知识点标题"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">内容 (支持Markdown)</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePreview("content")}
                  className="flex items-center gap-1"
                >
                  <Eye className="h-4 w-4" />
                  {previewMode.content ? "编辑" : "预览"}
                </Button>
              </div>
              {previewMode.content ? (
                <div className="min-h-[200px] rounded-md border border-input bg-background p-3">
                  <MarkdownRenderer content={formData.content} />
                </div>
              ) : (
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="输入知识点内容 (支持Markdown格式)"
                  rows={10}
                  className="font-mono"
                />
              )}
            </div>

            <Tabs defaultValue="formulas" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="formulas">公式</TabsTrigger>
                <TabsTrigger value="examples">例题</TabsTrigger>
                <TabsTrigger value="notes">笔记</TabsTrigger>
              </TabsList>

              <TabsContent value="formulas" className="mt-4 space-y-4">
                {formData.formulas.map((formula, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={formula}
                      onChange={(e) => handleArrayInputChange("formulas", index, e.target.value)}
                      placeholder="输入公式"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem("formulas", index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("formulas")}>
                  <Plus className="mr-2 h-4 w-4" />
                  添加公式
                </Button>
              </TabsContent>

              <TabsContent value="examples" className="mt-4 space-y-4">
                {formData.examples.map((example, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>例题 {index + 1} (支持Markdown)</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePreview("examples", index)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          {previewMode.examples[index] ? "编辑" : "预览"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeArrayItem("examples", index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {previewMode.examples[index] ? (
                      <div className="min-h-[150px] rounded-md border border-input bg-background p-3">
                        <MarkdownRenderer content={example} />
                      </div>
                    ) : (
                      <Textarea
                        value={example}
                        onChange={(e) => handleArrayInputChange("examples", index, e.target.value)}
                        placeholder="输入例题 (支持Markdown格式)"
                        rows={6}
                        className="font-mono"
                      />
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("examples")}>
                  <Plus className="mr-2 h-4 w-4" />
                  添加例题
                </Button>
              </TabsContent>

              <TabsContent value="notes" className="mt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notes">笔记 (支持Markdown)</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePreview("notes")}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      {previewMode.notes ? "编辑" : "预览"}
                    </Button>
                  </div>
                  {previewMode.notes ? (
                    <div className="min-h-[200px] rounded-md border border-input bg-background p-3">
                      <MarkdownRenderer content={formData.notes} />
                    </div>
                  ) : (
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="输入笔记 (支持Markdown格式)"
                      rows={8}
                      className="font-mono"
                    />
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={handleDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          删除
        </Button>
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" />
          保存
        </Button>
      </div>
    </form>
  )
}
