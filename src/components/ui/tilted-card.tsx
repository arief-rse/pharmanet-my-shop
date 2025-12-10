import * as React from "react"
import { cn } from "@/lib/utils"

interface TiltedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  tiltAmount?: number
  hoverEffect?: boolean
  glowEffect?: boolean
}

const TiltedCard = React.forwardRef<HTMLDivElement, TiltedCardProps>(
  ({ className, children, tiltAmount = 15, hoverEffect = true, glowEffect = false, ...props }, ref) => {
    const [transform, setTransform] = React.useState('')
    const cardRef = React.useRef<HTMLDivElement>(null)

    React.useImperativeHandle(ref, () => cardRef.current!)

    const handleMouseMove = React.useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!hoverEffect || !cardRef.current) return

        const card = cardRef.current
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const rotateX = ((y - centerY) / centerY) * -tiltAmount
        const rotateY = ((x - centerX) / centerX) * tiltAmount

        setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`)
      },
      [hoverEffect, tiltAmount]
    )

    const handleMouseLeave = React.useCallback(() => {
      if (!hoverEffect) return
      setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)')
    }, [hoverEffect])

    return (
      <div
        ref={cardRef}
        className={cn(
          "relative transition-all duration-300 ease-out",
          hoverEffect && "cursor-pointer",
          glowEffect && "hover:shadow-2xl hover:shadow-blue-500/20",
          className
        )}
        style={{
          transform,
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <div className="relative bg-card text-card-foreground rounded-lg border shadow-sm overflow-hidden">
          {children}
        </div>
        {glowEffect && (
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-0 hover:opacity-20 transition-opacity duration-300 -z-10 blur-xl" />
        )}
      </div>
    )
  }
)

TiltedCard.displayName = "TiltedCard"

const TiltedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
TiltedCardHeader.displayName = "TiltedCardHeader"

const TiltedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
TiltedCardTitle.displayName = "TiltedCardTitle"

const TiltedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
TiltedCardDescription.displayName = "TiltedCardDescription"

const TiltedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("p-6 pt-0", className)} 
    style={{ transform: 'translateZ(50px)' }}
    {...props} 
  />
))
TiltedCardContent.displayName = "TiltedCardContent"

const TiltedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    style={{ transform: 'translateZ(50px)' }}
    {...props}
  />
))
TiltedCardFooter.displayName = "TiltedCardFooter"

export { 
  TiltedCard, 
  TiltedCardHeader, 
  TiltedCardFooter, 
  TiltedCardTitle, 
  TiltedCardDescription, 
  TiltedCardContent 
} 