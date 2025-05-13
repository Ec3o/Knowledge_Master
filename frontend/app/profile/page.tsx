"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { BookOpen, ArrowLeft, User, Shield, Key } from "lucide-react"
import Link from "next/link"
import UserNav from "@/components/utils/user-nav"
import { cn } from "@/lib/utils"
import AvatarUpload from "@/components/utils/avatar-upload"
import { getUserProfile, updateUserProfile } from "@/lib/api/user"
import type { UserProfile } from "@/types/user"

type SidebarItem = {
  id: string
  icon: React.ReactNode
  label: string
}

const sidebarItems: SidebarItem[] = [
  { id: "profile", icon: <User className="h-5 w-5" />, label: "个人资料" },
  { id: "security", icon: <Shield className="h-5 w-5" />, label: "账号安全" },
  { id: "danger", icon: <Key className="h-5 w-5" />, label: "危险区域" },
]

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [formData, setFormData] = useState<UserProfile | null>(null)
  const [originalData, setOriginalData] = useState<UserProfile | null>(null)
  // 新增状态，用于存储上传但尚未保存的头像URL
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string | null>(null)

  // 加载用户资料
  useEffect(() => {
    async function loadUserProfile() {
      try {
        const profile = await getUserProfile()
        setFormData(profile)
        setOriginalData(profile)
        setIsLoadingProfile(false)
      } catch (error) {
        toast({
          title: "获取用户资料失败",
          description: error instanceof Error ? error.message : "请检查网络连接后重试",
          variant: "destructive",
        })
        setIsLoadingProfile(false)
      }
    }

    loadUserProfile()
  }, [toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return

    const { name, value } = e.target
    setFormData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        [name]: value,
      }
    })
  }

  // 处理头像上传，但不立即更新用户资料
  const handleAvatarUpload = (avatarUrl: string) => {
    setPendingAvatarUrl(avatarUrl)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    setIsLoading(true)

    try {
      // 创建要提交的数据，包括可能的新头像URL
      const dataToSubmit: UserProfile = {
        ...formData,
        // 如果有待处理的头像URL，则使用它
        avatar_uri: pendingAvatarUrl || formData.avatar_uri,
      }

      // 调用API更新用户资料
      await updateUserProfile(dataToSubmit)

      // 更新成功后，将待处理的头像URL应用到实际数据中
      if (pendingAvatarUrl) {
        setFormData((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            avatar_uri: pendingAvatarUrl,
          }
        })
        // 更新原始数据
        setOriginalData((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            avatar_uri: pendingAvatarUrl,
          }
        })
        // 清除待处理的头像URL
        setPendingAvatarUrl(null)
      }

      toast({
        title: "个人资料已更新",
        description: "您的个人资料已成功保存",
        variant: "default",
      })
      setIsEditing(false)
    } catch (error) {
      toast({
        title: "更新失败",
        description: error instanceof Error ? error.message : "保存个人资料时出现错误，请重试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  const handleDeleteAccount = () =>{
    toast({
      title: "别急",
      description: "这个功能还没做...要不你来做？",
      variant: "default",
    })
  }
  // 取消编辑，恢复原始数据
  const handleCancelEdit = () => {
    // 重置表单数据为原始数据
    setFormData(originalData)
    // 清除待处理的头像URL
    setPendingAvatarUrl(null)
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
            <h1 className="text-2xl font-bold">Knowledge Universe</h1>
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

        <div className="flex flex-col gap-6 md:flex-row">
          {/* 侧边栏 */}
          <div className="w-full md:w-64 shrink-0">
            <Card>
              <CardContent className="p-4">
                <nav className="flex flex-col space-y-1">
                  {sidebarItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeTab === item.id ? "secondary" : "ghost"}
                      className={cn("justify-start", activeTab === item.id && "font-medium")}
                      onClick={() => setActiveTab(item.id)}
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </Button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* 内容区域 */}
          <div className="flex-1">
            {activeTab === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle>个人资料</CardTitle>
                  <CardDescription>查看和更新您的个人信息</CardDescription>
                </CardHeader>
                {isLoadingProfile ? (
                  <CardContent className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-800"></div>
                  </CardContent>
                ) : formData ? (
                  <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                      <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0">
                        <AvatarUpload
                          currentAvatar={formData.avatar_uri}
                          previewAvatar={pendingAvatarUrl || undefined}
                          name={formData.username}
                          onAvatarUpload={handleAvatarUpload}
                          disabled={!isEditing}
                        />
                        <div className="flex-1 space-y-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="username">用户名</Label>
                              <Input
                                id="username"
                                name="username"
                                value={formData.username}
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
                            <Label htmlFor="description">个人简介</Label>
                            <Textarea
                              id="description"
                              name="description"
                              rows={4}
                              value={formData.description}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              placeholder="介绍一下自己..."
                            />
                          </div>
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
                ) : (
                  <CardContent>
                    <p className="text-center text-muted-foreground">无法加载用户资料</p>
                  </CardContent>
                )}
              </Card>
            )}

            {activeTab === "security" && (
              <Card>
                <CardHeader>
                  <CardTitle>账号安全</CardTitle>
                  <CardDescription>管理您的账号和安全设置</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">修改密码</h3>
                    <p className="text-sm text-muted-foreground">定期更新您的密码以保护账号安全</p>
                    <Button variant="outline" onClick={handleDeleteAccount}>修改密码</Button>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">账号安全</h3>
                    <p className="text-sm text-muted-foreground">管理账号安全设置和登录历史</p>
                    <Button variant="outline" onClick={handleDeleteAccount}>查看登录历史</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "danger" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-destructive">危险区域</CardTitle>
                  <CardDescription>这些操作可能会导致不可逆的数据丢失</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-destructive">删除账号</h3>
                    <p className="text-sm text-muted-foreground">删除账号将永久移除所有数据，此操作不可撤销</p>
                    <Button variant="destructive" onClick={handleDeleteAccount}>删除账号</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
