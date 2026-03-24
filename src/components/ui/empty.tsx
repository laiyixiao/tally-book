import * as React from 'react'
import { cn } from '@/lib/utils'

const Empty = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col items-center justify-center text-center', className)} {...props} />
)

const EmptyMedia = ({ variant = 'default', className, ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'icon' }) => (
  <div
    className={cn(
      'mb-2',
      variant === 'icon' && 'flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted [&_svg]:size-6',
      className
    )}
    {...props}
  />
)

const EmptyTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={cn('text-lg font-medium tracking-tight', className)} {...props} />
)

const EmptyDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-muted-foreground', className)} {...props} />
)

export { Empty, EmptyMedia, EmptyTitle, EmptyDescription }
