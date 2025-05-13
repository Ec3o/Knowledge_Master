"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { BookOpen } from "lucide-react"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { login,logout } from "@/lib/api/login"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const reponse = await login(formData.email, formData.password);
      console.log("Submitting login", formData)
      localStorage.removeItem('user_cache');
      localStorage.setItem('token', reponse.data.token);
  
      toast({
        title: "登录成功",
        description: `欢迎回来，${reponse.data.user.username}!`,
      });
      router.push("/knowledge-bases");
    } catch (error) {
      toast({
        title: "登录失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center grid-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="mb-8 flex items-center text-2xl font-bold">
        <BookOpen className="mr-2 h-6 w-6" />
        <Link href={"/"} ><strong>💫Knowledge Universe </strong></Link>
      </div>
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl">登录</CardTitle>
          <CardDescription className="text-center">输入您的账号信息登录系统</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">密码</Label>
                <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">
                  忘记密码?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "登录中..." : "登录"}
            </Button>
            <div className="text-center text-sm">
              还没有账号?{" "}
              <Link href="/register" className="text-primary hover:underline">
                注册
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary hover:underline">
          返回首页
        </Link>
      </div>
    </div>
  )
}
