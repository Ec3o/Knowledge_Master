import { Button } from "@/components/ui/button"
import { LogIn, UserPlus, BookOpen, BrainCircuit, Database, Share2 } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme/theme-toggle"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center">
            <BookOpen className="mr-2 h-6 w-6" />
            <h1 className="text-2xl font-bold">Knowledge Universe</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <ThemeToggle />
            <Button asChild variant="ghost">
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                登录
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register">
                <UserPlus className="mr-2 h-4 w-4" />
                注册
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 grid-background">
        <div className="container flex-1 items-center justify-center py-12 md:py-24 lg:py-32">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">智能知识管理系统</h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              按照树形结构组织您的知识，轻松录入概念、公式和例题，一键转换为思维导图
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/register">
                  <UserPlus className="mr-2 h-5 w-5" />
                  开始使用
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">
                  <LogIn className="mr-2 h-5 w-5" />
                  已有账号
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">结构化知识管理</h3>
                <p className="text-muted-foreground">以树形结构组织知识点，清晰展示知识间的层级关系和联系</p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <BrainCircuit className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">思维导图可视化</h3>
                <p className="text-muted-foreground">一键将知识树转换为思维导图，帮助理解和记忆复杂知识体系</p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <Share2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">知识共享协作</h3>
                <p className="text-muted-foreground">与团队成员共享知识库，共同编辑和完善知识内容</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <footer className="border-t bg-background">
        <div className="container flex h-16 items-center px-4 justify-between">
          <div className="text-sm text-muted-foreground">© 2025 Knowledge Universe Team | 杭电 创新实践小组 保留所有权利.</div>
          <div className="flex space-x-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              关于我们
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              使用条款
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              隐私政策
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
