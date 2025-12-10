import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  )
}

// Product Card Skeleton
function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  )
}

// Cart Item Skeleton
function CartItemSkeleton() {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="w-20 h-20 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-6 w-8" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  )
}

// Header Skeleton
function HeaderSkeleton() {
  return (
    <div className="bg-white shadow-sm border-b border-gray-100 h-16">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="hidden md:flex space-x-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-5 w-16" />
          ))}
        </div>
        <div className="hidden lg:flex max-w-md w-full">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-16 rounded" />
        </div>
      </div>
    </div>
  )
}

export { Skeleton, ProductCardSkeleton, CartItemSkeleton, HeaderSkeleton }
