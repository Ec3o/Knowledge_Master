"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { BookOpen, ArrowLeft, Upload } from "lucide-react"
import Link from "next/link"
import UserNav from "@/components/user-nav"

// 示例用户数据
const userData = {
  name: "张三",
  email: "zhangsan@example.com",
  avatar: "/placeholder.svg?height=128&width=128",
  bio: "知识管理爱好者，热衷于学习和分享各类知识。",
  organization: "某大学",
  location: "北京",
  website: "https://example.com",
}

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState(userData)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 这里应该是实际的API调用
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "个人资料已更新",
        description: "您的个人资料已成功保存",
        variant: "default",
      })
      setIsEditing(false)
    } catch (error) {
      toast({
        title: "更新失败",
        description: "保存个人资料时出现错误，请重试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 添加取消编辑的Toast通知
  const handleCancelEdit = () => {
    // 重置表单数据为原始数据
    setFormData(userData)
    setIsEditing(false)
    toast({
      title: "已取消编辑",
      description: "您的更改未保存",
      variant: "default",
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Link href="/knowledge-bases" className="flex items-center">
            <BookOpen className="mr-2 h-6 w-6" />
            <h1 className="text-2xl font-bold">💫Knowledge Universe</h1>
          </Link>
          <div className="ml-auto">
            <UserNav />
          </div>
        </div>
      </header>

      <div className="container py-6">
        <div className="mb-6 flex items-center">
          <Button asChild variant="ghost" size="sm" className="mr-2">
            <Link href="/knowledge-bases">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回知识库
            </Link>
          </Button>
          <h2 className="text-2xl font-bold">个人资料</h2>
        </div>

        <Tabs defaultValue="profile" className="max-w-4xl">
          <TabsList>
            <TabsTrigger value="profile">个人资料</TabsTrigger>
            <TabsTrigger value="account">账号设置</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>个人资料</CardTitle>
                <CardDescription>查看和更新您的个人信息</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0">
                    <div className="relative">
                      <Avatar className="h-32 w-32">
                        <AvatarImage src={formData.avatar || "/placeholder.svg"} alt="头像" />
                        <AvatarFallback className="text-2xl">{formData.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute bottom-0 right-0 rounded-full"
                          type="button"
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">姓名</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">邮箱</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={true} // 邮箱通常不允许直接修改
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">个人简介</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          rows={4}
                          value={formData.bio}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="介绍一下自己..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="organization">组织/学校</Label>
                      <Input
                        id="organization"
                        name="organization"
                        value={formData.organization}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">所在地</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">个人网站</Label>
                    <Input
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  {isEditing ? (
                    <>
                      <Button variant="outline" type="button" onClick={handleCancelEdit}>
                        取消
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "保存中..." : "保存更改"}
                      </Button>
                    </>
                  ) : (
                    <Button type="button" onClick={() => setIsEditing(true)}>
                      编辑资料
                    </Button>
                  )}
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          <TabsContent value="account" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>账号设置</CardTitle>
                <CardDescription>管理您的账号和安全设置</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">修改密码</h3>
                  <p className="text-sm text-muted-foreground">定期更新您的密码以保护账号安全</p>
                  <Button variant="outline">修改密码</Button>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">账号安全</h3>
                  <p className="text-sm text-muted-foreground">管理账号安全设置和登录历史</p>
                  <Button variant="outline">查看登录历史</Button>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-destructive">危险操作</h3>
                  <p className="text-sm text-muted-foreground">删除账号将永久移除所有数据，此操作不可撤销</p>
                  <Button variant="destructive">删除账号</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
