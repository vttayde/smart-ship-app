import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: ReactNode
}

const Card = ({ className, children }: CardProps) => {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white text-gray-950 shadow-sm',
        className
      )}
    >
      {children}
    </div>
  )
}

const CardHeader = ({ className, children }: CardProps) => {
  return (
    <div className={cn('flex flex-col space-y-1.5 p-6', className)}>
      {children}
    </div>
  )
}

const CardTitle = ({ className, children }: CardProps) => {
  return (
    <h3 className={cn('text-2xl font-semibold leading-none tracking-tight', className)}>
      {children}
    </h3>
  )
}

const CardDescription = ({ className, children }: CardProps) => {
  return (
    <p className={cn('text-sm text-gray-500', className)}>
      {children}
    </p>
  )
}

const CardContent = ({ className, children }: CardProps) => {
  return <div className={cn('p-6 pt-0', className)}>{children}</div>
}

const CardFooter = ({ className, children }: CardProps) => {
  return (
    <div className={cn('flex items-center p-6 pt-0', className)}>
      {children}
    </div>
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
