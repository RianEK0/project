import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={cn(
          'flex h-12 w-full rounded-[20px] border border-app-border bg-white/86 px-4 py-2 text-sm text-app-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.84),0_12px_24px_-22px_rgba(16,24,40,0.32)] transition placeholder:text-app-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(185,123,49,0.28)]',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'

export { Input }
