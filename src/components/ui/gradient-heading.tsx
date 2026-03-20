import { cn } from '@/lib/utils'

interface GradientHeadingProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4'
  variant?: 'default' | 'light'
  className?: string
  children: React.ReactNode
}

export function GradientHeading({ 
  as: Component = 'h2', 
  variant = 'default',
  className, 
  children 
}: GradientHeadingProps) {
  return (
    <Component
      className={cn(
        'bg-clip-text text-transparent',
        variant === 'default' 
          ? 'bg-gradient-to-r from-emerald-600 to-teal-600' 
          : 'bg-gradient-to-r from-white to-emerald-100',
        className
      )}
    >
      {children}
    </Component>
  )
}
