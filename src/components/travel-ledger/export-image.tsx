import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toPng } from "html-to-image"
import type { Expense, Member, Room } from "@/types"
import { currencySymbols } from "@/lib/utils"

interface ExportImageProps {
  room: Room
  expenses: Expense[]
  members: Member[]
}

// XSS 防护：转义 HTML 特殊字符
function escapeHtml(text: string): string {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

export function ExportImageButton({ room, expenses, members }: ExportImageProps) {
  const captureRef = useRef<HTMLDivElement>(null)

  const handleExport = async () => {
    if (!captureRef.current) return

    try {
      // 创建临时容器
      const container = document.createElement("div")
      container.style.width = "375px"
      container.style.padding = "20px"
      container.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      container.style.borderRadius = "16px"
      container.style.fontFamily = "system-ui, -apple-system, sans-serif"

      // 计算总支出
      const totalsByCurrency = expenses.reduce((acc, e) => {
        acc[e.currency] = (acc[e.currency] || 0) + e.amount
        return acc
      }, {} as Record<string, number>)

      // 构建 HTML - 使用 escapeHtml 转义用户输入
      container.innerHTML = `
        <div style="color: white;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h1 style="font-size: 20px; font-weight: bold; margin: 0;">${escapeHtml(room.name)}</h1>
            <span style="font-size: 12px; opacity: 0.9; font-family: monospace;">${escapeHtml(room.code)}</span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
            <div style="background: rgba(255,255,255,0.2); padding: 12px; border-radius: 12px;">
              <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">总支出</div>
              <div style="font-size: 18px; font-weight: bold;">
                ${Object.entries(totalsByCurrency).length > 0
                  ? Object.entries(totalsByCurrency).map(([c, t]) => `${currencySymbols[c]}${t.toLocaleString()}`).join("  ")
                  : "¥0"
                }
              </div>
            </div>
            <div style="background: rgba(255,255,255,0.2); padding: 12px; border-radius: 12px;">
              <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">成员</div>
              <div style="font-size: 18px; font-weight: bold;">${members.length}人</div>
            </div>
          </div>

          <div style="background: rgba(255,255,255,0.95); border-radius: 12px; padding: 16px; color: #1f2937;">
            <h2 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0; color: #1f2937;">支出明细</h2>
            <div style="max-height: 400px; overflow: auto;">
              ${expenses.length === 0
                ? '<div style="text-align: center; padding: 20px; color: #6b7280;">暂无支出记录</div>'
                : expenses.slice(0, 10).map((e) => `
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 13px;">
                      <div style="flex: 1;">
                        <div style="font-weight: 500; color: #1f2937;">${escapeHtml(e.description)}</div>
                        <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">${escapeHtml(e.category)}</div>
                      </div>
                      <div style="text-align: right;">
                        <div style="font-weight: 600; color: #1f2937;">${currencySymbols[e.currency]}${e.amount.toLocaleString()}</div>
                        <div style="font-size: 10px; color: #6b7280;">${new Date(e.createdAt).toLocaleDateString("zh-CN")}</div>
                      </div>
                    </div>
                  `).join("")
              }
            </div>
            ${expenses.length > 10 ? `<div style="text-align: center; padding: 8px; font-size: 12px; color: #6b7280;">... 还有 ${expenses.length - 10} 条记录</div>` : ""}
          </div>

          <div style="text-align: center; margin-top: 16px; font-size: 11px; opacity: 0.7;">
            旅行记账本 · 生成时间：${new Date().toLocaleString("zh-CN")}
          </div>
        </div>
      `

      document.body.appendChild(container)

      // 生成图片
      const dataUrl = await toPng(container, {
        quality: 1.0,
        pixelRatio: 2,
      })

      // 下载
      const link = document.createElement("a")
      link.download = `${room.name}-账单-${new Date().toLocaleDateString("zh-CN")}.png`
      link.href = dataUrl
      link.click()

      // 清理
      document.body.removeChild(container)
    } catch (err) {
      alert("导出失败，请重试")
    }
  }

  return (
    <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
      <Download className="w-4 h-4" />
      导出图片
    </Button>
  )
}
