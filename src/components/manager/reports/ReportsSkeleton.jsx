import React from 'react'

/**
 * Loading skeleton for the Reports Page.
 */
export default function ReportsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-pulse pb-12">
      {/* Header Skeleton */}
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="space-y-2">
          <div className="h-10 w-64 rounded-xl bg-gray-200" />
          <div className="h-4 w-96 rounded-lg bg-gray-100" />
        </div>
        <div className="h-12 w-80 rounded-xl bg-gray-100" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-gray-100 border border-gray-50" />
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 h-[400px] rounded-2xl bg-gray-100 border border-gray-50" />
        <div className="h-[400px] rounded-2xl bg-gray-100 border border-gray-50" />
        
        <div className="lg:col-span-2 h-[350px] rounded-2xl bg-gray-100 border border-gray-50" />
        <div className="h-[350px] rounded-2xl bg-gray-100 border border-gray-50" />
        
        <div className="lg:col-span-3 h-[350px] rounded-2xl bg-gray-100 border border-gray-50" />
      </div>
    </div>
  )
}
