import { useState } from "react"
import { Button } from "./button"

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "确认",
  cancelText = "取消",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-background rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 h-11" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            className="flex-1 h-11"
            onClick={() => {
              onConfirm()
              onCancel()
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function useConfirmDialog() {
  const [config, setConfig] = useState<{
    open: boolean
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: "default" | "destructive"
    onConfirm?: () => void
  } | null>(null)

  const confirm = (config: {
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: "default" | "destructive"
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfig({
        ...config,
        open: true,
        onConfirm: () => resolve(true),
      })
    })
  }

  const Dialog = () => {
    if (!config) return null
    return (
      <ConfirmDialog
        {...config}
        onCancel={() => {
          setConfig(null)
        }}
        onConfirm={() => {
          config.onConfirm?.()
          setConfig(null)
        }}
      />
    )
  }

  return { confirm, Dialog }
}
