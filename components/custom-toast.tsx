"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import type { ReactNode } from "react"

interface CustomToastProps {
  title: string
  description?: string
  variant?: "default" | "destructive"
  action?: ReactNode
  duration?: number
}

export function useCustomToast() {
  const { toast } = useToast()

  const showToast = ({ title, description, variant = "default", action, duration = 5000 }: CustomToastProps) => {
    toast({
      title,
      description,
      variant,
      action,
      duration,
    })
  }

  const showSuccessToast = (title: string, description?: string) => {
    showToast({
      title,
      description,
      variant: "default",
    })
  }

  const showErrorToast = (title: string, description?: string) => {
    showToast({
      title,
      description,
      variant: "destructive",
    })
  }

  const showConfirmToast = (title: string, description: string, onConfirm: () => void, onCancel?: () => void) => {
    showToast({
      title,
      description,
      variant: "destructive",
      action: (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (onCancel) {
                onCancel()
              }
              // 关闭当前toast并显示取消消息
              showToast({
                title: "已取消",
                description: "操作已取消",
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
              onConfirm()
            }}
          >
            确认
          </Button>
        </div>
      ),
      duration: 10000, // 确认类Toast显示时间更长
    })
  }

  return {
    showToast,
    showSuccessToast,
    showErrorToast,
    showConfirmToast,
  }
}
