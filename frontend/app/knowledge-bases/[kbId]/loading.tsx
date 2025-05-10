import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Loading() {
  return (
    <div className="flex h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Button asChild variant="ghost" size="sm" className="mr-4">
            <Link href="/knowledge-bases">
              <ChevronLeft className="mr-2 h-4 w-4" />
              返回知识库列表
            </Link>
          </Button>
          <div className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            <Skeleton className="h-6 w-40" />
          </div>
        </div>
      </header>

      <div className="container flex-1 items-start py-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-3">
            <div className="rounded-lg border p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <Skeleton className="h-4 w-4 mr-2" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-9">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-9 w-36" />
            </div>
            <Skeleton className="h-[500px] w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
