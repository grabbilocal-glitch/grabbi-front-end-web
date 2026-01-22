export default function Skeleton({ className = '', variant = 'default' }) {
  const baseClasses = 'skeleton rounded'

  const variantClasses = {
    default: 'h-4 w-full',
    text: 'h-4 w-3/4',
    title: 'h-6 w-1/2',
    card: 'h-48 w-full rounded-2xl',
    circle: 'h-12 w-12 rounded-full',
    button: 'h-10 w-24 rounded-lg',
    input: 'h-12 w-full rounded-xl',
    product: 'aspect-[4/5] w-full rounded-2xl',
  }

  return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
}

export function ProductCardSkeleton() {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/15 glass-card shadow-card">
      <div className="aspect-[4/5] skeleton" />
      <div className="p-3 space-y-2 bg-white/95 dark:bg-brand-graphite/95">
        <Skeleton variant="text" />
        <Skeleton variant="text" className="w-1/2" />
        <div className="flex items-center space-x-2">
          <Skeleton variant="button" />
          <Skeleton variant="button" />
        </div>
      </div>
    </div>
  )
}

export function CategoryCardSkeleton() {
  return (
    <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-4 flex flex-col items-center">
      <Skeleton variant="circle" className="h-12 w-12 mb-3" />
      <Skeleton variant="text" className="w-16" />
    </div>
  )
}
