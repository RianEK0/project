import * as React from 'react'
import { cn } from '@/lib/utils'

export function Card({
  className,
  ...props
}: React.ComponentProps<'section'>) {
  return (
    <section
      className={cn('panel mesh-card p-6 md:p-7', className)}
      {...props}
    />
  )
}

export function CardHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return <div className={cn('space-y-2.5', className)} {...props} />
}

export function CardTitle({
  className,
  ...props
}: React.ComponentProps<'h3'>) {
  return (
    <h3
      className={cn('text-lg font-bold tracking-[-0.03em] text-app-foreground', className)}
      {...props}
    />
  )
}

export function CardDescription({
  className,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <p className={cn('text-sm leading-6 text-app-muted-foreground', className)} {...props} />
  )
}

export function CardContent({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return <div className={cn('mt-5', className)} {...props} />
}
