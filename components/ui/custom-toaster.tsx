"use client"

import { useToast } from "@/components/ui/use-toast"
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function CustomToaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => {
        const isSuccess = !props.variant || props.variant === "default"

        return (
          <Toast key={id} {...props} className="group relative overflow-hidden">
            <div className="flex">
              <div className="mr-3 flex-shrink-0 self-start">
                {isSuccess ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="flex-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
            <div
              className={cn(
                "absolute bottom-0 left-0 h-1 w-full origin-left animate-progress",
                isSuccess ? "bg-green-500" : "bg-red-500",
              )}
              style={{
                animationDuration: `${props.duration || 5000}ms`,
              }}
            />
          </Toast>
        )
      })}
      <ToastViewport className="right-0" />
    </ToastProvider>
  )
}
