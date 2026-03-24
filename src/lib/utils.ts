import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 生成头像颜色
export function generateAvatar(name: string): string {
  const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]
  return colors[name.charCodeAt(0) % colors.length]
}

// 格式化时间
export function formatTime(date: Date): string {
  const diff = new Date().getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return "刚刚"
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return new Date(date).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })
}

// 生成 6 位房间代码
export function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  return Array.from({ length: 6 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("")
}

// 货币符号映射
export const currencySymbols: Record<string, string> = { CNY: "¥", USD: "$", KRW: "₩" }

// 生成 4 位 PIN 码
export function generatePinCode(): string {
  return Array.from({ length: 4 }, () =>
    String.fromCharCode(48 + Math.floor(Math.random() * 10))
  ).join("")
}
