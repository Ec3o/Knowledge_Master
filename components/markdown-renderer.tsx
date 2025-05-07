"use client"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import "katex/dist/katex.min.css"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={`prose max-w-none dark:prose-invert ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "")
            return !inline && match ? (
              <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
          // 自定义其他元素的渲染
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
          p: ({ node, ...props }) => <p className="my-3" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-3" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-3" {...props} />,
          li: ({ node, ...props }) => <li className="my-1" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic my-3" {...props} />
          ),
          a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" {...props} />,
          img: ({ node, ...props }) => <img className="max-w-full rounded-md my-4" {...props} />,
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full divide-y divide-gray-300" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => <th className="px-3 py-2 bg-gray-100 font-semibold text-left" {...props} />,
          td: ({ node, ...props }) => <td className="px-3 py-2 border-t" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
