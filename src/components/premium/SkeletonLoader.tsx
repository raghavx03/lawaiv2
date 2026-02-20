'use client'

interface SkeletonLoaderProps {
  count?: number
  height?: string
  width?: string
  circle?: boolean
  className?: string
}

export function SkeletonLoader({
  count = 1,
  height = 'h-4',
  width = 'w-full',
  circle = false,
  className = '',
}: SkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`
            bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200
            dark:from-slate-800 dark:via-slate-700 dark:to-slate-800
            animate-pulse
            ${circle ? 'rounded-full' : 'rounded-lg'}
            ${height}
            ${width}
            ${className}
            ${count > 1 ? 'mb-3' : ''}
          `}
        />
      ))}
    </>
  )
}
