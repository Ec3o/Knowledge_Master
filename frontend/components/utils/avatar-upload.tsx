"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { uploadAvatar } from "@/lib/api/user"

interface AvatarUploadProps {
  currentAvatar: string
  previewAvatar?: string
  name: string
  onAvatarUpload: (avatarUrl: string) => void
  disabled?: boolean
}

export default function AvatarUpload({
  currentAvatar,
  previewAvatar,
  name,
  onAvatarUpload,
  disabled = false,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // 显示的头像是预览头像（如果有）或当前头像
  const displayAvatar = previewAvatar || currentAvatar

  const handleAvatarClick = () => {
    if (disabled) return
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      toast({
        title: "文件格式错误",
        description: "请上传图片文件",
        variant: "destructive",
      })
      return
    }

    // 验证文件大小 (最大 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "文件太大",
        description: "头像图片大小不能超过5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      const result = await uploadAvatar(file)
      if (result) {
        // 只通知父组件上传了新头像，但不立即更新用户资料
        onAvatarUpload(result)
        toast({
          title: "头像上传成功",
          description: '点击"保存更改"按钮以应用新头像',
          variant: "default",
        })
      }
    } catch (error) {
      toast({
        title: "上传失败",
        description: error instanceof Error ? error.message : "上传头像时出现错误",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // 清除输入，以便可以再次选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="relative">
      <Avatar className="h-32 w-32 cursor-pointer" onClick={handleAvatarClick}>
        <AvatarImage src={displayAvatar || "/placeholder.svg"} alt="头像" className={isUploading ? "opacity-50" : ""} />
        <AvatarFallback className="text-2xl">{name.charAt(0)}</AvatarFallback>
      </Avatar>

      {!disabled && (
        <Button
          size="sm"
          variant="outline"
          className="absolute bottom-0 right-0 rounded-full"
          type="button"
          onClick={handleAvatarClick}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4" />
        </Button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-full">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
        </div>
      )}
    </div>
  )
}
