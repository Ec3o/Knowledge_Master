import type React from "react"
import { CustomToaster } from "@/components/ui/custom-toaster"
import { ThemeProvider } from "@/components/theme/theme-provider"
import "./globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <CustomToaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
