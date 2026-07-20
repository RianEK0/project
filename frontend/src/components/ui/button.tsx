import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:rgba(185,123,49,0.35)]',
  {
    variants: {
      variant: {
        default:
          'bg-app-accent text-app-accent-foreground shadow-[0_24px_40px_-24px_rgba(19,35,60,0.85)] hover:translate-y-[-1px] hover:bg-[#1a2f4d]',
        secondary:
          'border border-app-border bg-white/72 text-app-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] hover:border-[rgba(185,123,49,0.32)] hover:bg-white',
        ghost: 'text-app-foreground hover:bg-black/4',
        danger:
          'bg-app-danger text-white shadow-[0_20px_34px_-24px_rgba(185,28,28,0.9)] hover:bg-red-800',
      },
      size: {
        default: 'h-11 px-5 py-2.5',
        sm: 'h-9 rounded-xl px-4',
        lg: 'h-12 rounded-2xl px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'

export { Button, buttonVariants }
