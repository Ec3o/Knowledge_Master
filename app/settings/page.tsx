"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { BookOpen, ArrowLeft, Moon, Sun, BellRing, Globe, Key, Palette, Bell, Languages, Lock } from "lucide-react"
import Link from "next/link"
import UserNav from "@/components/user-nav"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

// 示例设置数据
const settingsData = {
  appearance: {
    fontSize: "medium",
    reducedMotion: false,
  },
  notifications: {
    emailNotifications: true,
    knowledgeUpdates: true,
    systemAnnouncements: true,
  },
  language: "zh-CN",
  privacy: {
    publicProfile: true,
    showActivity: true,
  },
}

type SidebarItem = {
  id: string
  icon: React.ReactNode
  label: string
}

const sidebarItems: SidebarItem[] = [
  { id: "appearance", icon: <Palette className="h-5 w-5" />, label: "外观" },
  { id: "notifications", icon: <Bell className="h-5 w-5" />, label: "通知" },
  { id: "language", icon: <Languages className="h-5 w-5" />, label: "语言" },
  { id: "privacy", icon: <Lock className="h-5 w-5" />, label: "隐私" },
]

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState("appearance")
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState(settingsData)

  const handleThemeChange = (value: string) => {
    setTheme(value)
  }

  const handleFontSizeChange = (value: string) => {
    setSettings((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        fontSize: value,
      },
    }))
  }

  const handleSwitchChange = (section: string, key: string, checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: checked,
      },
    }))
  }

  const handleLanguageChange = (value: string) => {
    setSettings((prev) => ({
      ...prev,
      language: value,
    }))
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)

    try {
      // 这里应该是实际的API调用
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "设置已保存",
        description: "您的设置已成功更新",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "保存失败",
        description: "更新设置时出现错误，请重试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetSettings = () => {
    // 重置设置为默认值
    setSettings(settingsData)
    setTheme("system")
    toast({
      title: "设置已重置",
      description: "所有设置已恢复为默认值",
      variant: "default",
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Link href="/knowledge-bases" className="flex items-center">
            <BookOpen className="mr-2 h-6 w-6" />
            <h1 className="text-2xl font-bold">知识树</h1>
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
          <h2 className="text-2xl font-bold">设置</h2>
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
            {activeTab === "appearance" && (
              <Card>
                <CardHeader>
                  <CardTitle>外观设置</CardTitle>
                  <CardDescription>自定义应用的外观和显示方式</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">主题</Label>
                        <p className="text-sm text-muted-foreground">选择应用的显示主题</p>
                      </div>
                      <RadioGroup
                        value={theme || "system"}
                        onValueChange={handleThemeChange}
                        className="flex space-x-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="light" id="theme-light" />
                          <Label htmlFor="theme-light" className="flex items-center">
                            <Sun className="mr-1 h-4 w-4" />
                            浅色
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="dark" id="theme-dark" />
                          <Label htmlFor="theme-dark" className="flex items-center">
                            <Moon className="mr-1 h-4 w-4" />
                            深色
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="system" id="theme-system" />
                          <Label htmlFor="theme-system">跟随系统</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">字体大小</Label>
                        <p className="text-sm text-muted-foreground">调整应用的字体大小</p>
                      </div>
                      <Select defaultValue={settings.appearance.fontSize} onValueChange={handleFontSizeChange}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="选择字体大小" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">小</SelectItem>
                          <SelectItem value="medium">中</SelectItem>
                          <SelectItem value="large">大</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">减少动画</Label>
                        <p className="text-sm text-muted-foreground">减少界面动画效果</p>
                      </div>
                      <Switch
                        checked={settings.appearance.reducedMotion}
                        onCheckedChange={(checked) => handleSwitchChange("appearance", "reducedMotion", checked)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button onClick={handleSaveSettings} disabled={isLoading}>
                    {isLoading ? "保存中..." : "保存设置"}
                  </Button>
                  <Button variant="outline" onClick={handleResetSettings}>
                    重置设置
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* 其他标签页内容保持不变 */}
            {activeTab === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle>通知设置</CardTitle>
                  <CardDescription>管理您接收的通知类型和方式</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base" htmlFor="email-notifications">
                          <BellRing className="mr-2 inline-block h-4 w-4" />
                          电子邮件通知
                        </Label>
                        <p className="text-sm text-muted-foreground">接收重要更新的电子邮件通知</p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={settings.notifications.emailNotifications}
                        onCheckedChange={(checked) =>
                          handleSwitchChange("notifications", "emailNotifications", checked)
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base" htmlFor="knowledge-updates">
                          知识库更新通知
                        </Label>
                        <p className="text-sm text-muted-foreground">当您关注的知识库有更新时接收通知</p>
                      </div>
                      <Switch
                        id="knowledge-updates"
                        checked={settings.notifications.knowledgeUpdates}
                        onCheckedChange={(checked) => handleSwitchChange("notifications", "knowledgeUpdates", checked)}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base" htmlFor="system-announcements">
                          系统公告
                        </Label>
                        <p className="text-sm text-muted-foreground">接收关于系统更新和新功能的通知</p>
                      </div>
                      <Switch
                        id="system-announcements"
                        checked={settings.notifications.systemAnnouncements}
                        onCheckedChange={(checked) =>
                          handleSwitchChange("notifications", "systemAnnouncements", checked)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button onClick={handleSaveSettings} disabled={isLoading}>
                    {isLoading ? "保存中..." : "保存设置"}
                  </Button>
                  <Button variant="outline" onClick={handleResetSettings}>
                    重置设置
                  </Button>
                </CardFooter>
              </Card>
            )}

            {activeTab === "language" && (
              <Card>
                <CardHeader>
                  <CardTitle>语言设置</CardTitle>
                  <CardDescription>选择应用的显示语言</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">
                        <Globe className="mr-2 inline-block h-4 w-4" />
                        界面语言
                      </Label>
                      <p className="text-sm text-muted-foreground">选择应用界面的显示语言</p>
                    </div>
                    <Select defaultValue={settings.language} onValueChange={handleLanguageChange}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="选择语言" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zh-CN">简体中文</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="ja-JP">日本語</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button onClick={handleSaveSettings} disabled={isLoading}>
                    {isLoading ? "保存中..." : "保存设置"}
                  </Button>
                  <Button variant="outline" onClick={handleResetSettings}>
                    重置设置
                  </Button>
                </CardFooter>
              </Card>
            )}

            {activeTab === "privacy" && (
              <Card>
                <CardHeader>
                  <CardTitle>隐私设置</CardTitle>
                  <CardDescription>管理您的隐私和数据共享选项</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base" htmlFor="public-profile">
                          <Key className="mr-2 inline-block h-4 w-4" />
                          公开个人资料
                        </Label>
                        <p className="text-sm text-muted-foreground">允许其他用户查看您的个人资料</p>
                      </div>
                      <Switch
                        id="public-profile"
                        checked={settings.privacy.publicProfile}
                        onCheckedChange={(checked) => handleSwitchChange("privacy", "publicProfile", checked)}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base" htmlFor="show-activity">
                          显示活动状态
                        </Label>
                        <p className="text-sm text-muted-foreground">显示您的在线状态和最近活动</p>
                      </div>
                      <Switch
                        id="show-activity"
                        checked={settings.privacy.showActivity}
                        onCheckedChange={(checked) => handleSwitchChange("privacy", "showActivity", checked)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button onClick={handleSaveSettings} disabled={isLoading}>
                    {isLoading ? "保存中..." : "保存设置"}
                  </Button>
                  <Button variant="outline" onClick={handleResetSettings}>
                    重置设置
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
