
import * as React from "react"
import { cn } from "@/lib/utils"

interface NeonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glow' | 'border'
  children: React.ReactNode
}

const NeonCard = React.forwardRef<HTMLDivElement, NeonCardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass-card p-6 transition-all duration-300",
          {
            "hover:shadow-glow hover:-translate-y-1": variant === 'glow',
            "neon-border": variant === 'border',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
NeonCard.displayName = "NeonCard"

const NeonCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
))
NeonCardHeader.displayName = "NeonCardHeader"

const NeonCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-bold leading-none tracking-tight gradient-text",
      className
    )}
    {...props}
  />
))
NeonCardTitle.displayName = "NeonCardTitle"

const NeonCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
))
NeonCardContent.displayName = "NeonCardContent"

export { NeonCard, NeonCardHeader, NeonCardTitle, NeonCardContent }
