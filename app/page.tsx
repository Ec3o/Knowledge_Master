import { Button } from "@/components/ui/button"
import { LogIn, UserPlus } from "lucide-react"
import { BookOpen, BrainCircuit, PenLine } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-2xl font-bold">💫Knowledge Universe</h1>
          <div className="ml-auto flex items-center space-x-4">
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

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                💫重塑你的知识宇宙
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                在这里，从教科书中汲取灵感，以层次分明的树状结构，搭建概念、公式与示例的知识宫殿
                </p>
              </div>
              <div className="space-x-4">
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
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">层次化组织</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                  如教科书章节般，以树状精巧编排笔记，梳理知识秩序
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <PenLine className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">富文本赋能</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                  多元内容类型汇聚，Markdown 助力，打造丰富知识载体
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <BrainCircuit className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">思维导图可视化</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                  打破知识隔阂，可视化呈现，让思维自由延展
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <p className="text-sm text-gray-500 dark:text-gray-400">©2025杭电创新实践小组. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
              关于
            </Link>
            <Link href="/help" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
              帮助
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

