import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]',
  {
    variants: {
      variant: {
        neutral: 'border border-black/5 bg-black/4 text-app-foreground',
        success: 'border border-emerald-200 bg-emerald-50 text-emerald-800',
        warning: 'border border-amber-200 bg-amber-50 text-amber-800',
        danger: 'border border-rose-200 bg-rose-50 text-rose-800',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
)

export function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
