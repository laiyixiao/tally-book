import * as React from 'react'
import { cn } from '@/lib/utils'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

function Sheet({ open, onOpenChange, children }: SheetProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/80" onClick={() => onOpenChange(false)} />
      )}
      {open && (
        <div className="fixed inset-x-0 bottom-0 z-50 h-[85vh] rounded-t-3xl bg-background">
          {children}
        </div>
      )}
    </>
  )
}

function SheetContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex h-full flex-col overflow-y-auto p-6', className)}>
      {children}
    </div>
  )
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
}

function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-lg font-semibold text-foreground', className)} {...props} />
}

export { Sheet, SheetContent, SheetHeader, SheetTitle }
