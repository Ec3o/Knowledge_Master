"use client"

import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User } from 'lucide-react'
import Link from "next/link"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { getUserInfo } from "@/lib/api/user"
import { logout } from '@/lib/api/login'
import type { UserData } from "@/types/user"

export default function UserNav() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await getUserInfo()
        setUser(userData)
      } catch (error) {
        console.error('获取用户信息失败:', error)
        toast({
          title: "错误",
          description: error instanceof Error ? error.message : "获取用户信息失败",
          variant: "destructive",
        })
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [toast, router])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Button variant="ghost" className="relative h-8 w-8 rounded-full" disabled>
          <Avatar className="h-8 w-8">
            <AvatarFallback>...</AvatarFallback>
          </Avatar>
        </Button>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Button asChild variant="outline">
          <Link href="/login">登录</Link>
        </Button>
      </div>
    )
  }

  const getAvatarFallback = (name: string) => {
    if (name.length >= 2) {
      return name.substring(0, 2).toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  return (
    <div className="flex items-center gap-4">
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt="用户头像" />
              ) : (
                <AvatarImage src={`https://ui-avatars.com/api/?name=${user.username}&background=random`} />
              )}
              <AvatarFallback>{getAvatarFallback(user.username)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.username}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                <span>个人资料</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>设置</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>退出登录</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}