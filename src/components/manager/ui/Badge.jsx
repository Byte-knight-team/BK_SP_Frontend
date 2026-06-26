import clsx from 'clsx'

const variants = {
  // Critical / Failed
  cancelled: 'bg-red-50 text-red-600',
  rejected: 'bg-red-50 text-red-600',
  failed: 'bg-red-50 text-red-600',
  refunded: 'bg-red-50 text-red-600',
  
  // Warning / Holding
  on_hold: 'bg-amber-50 text-amber-600',
  pending: 'bg-amber-50 text-amber-600',
  
  // Info / New
  placed: 'bg-blue-50 text-blue-600',
  approved: 'bg-blue-50 text-blue-600',
  assigned: 'bg-blue-50 text-blue-600',
  
  // Progress
  preparing: 'bg-brand-light text-brand',
  out_for_delivery: 'bg-brand-light text-brand',
  
  // Success
  ready: 'bg-green-50 text-green-600',
  served: 'bg-green-50 text-green-600',
  completed: 'bg-green-50 text-green-600',
  active: 'bg-green-50 text-green-600',
  
  // Neutral
  offline: 'bg-gray-100 text-gray-500',
  done: 'bg-gray-100 text-gray-500',
}

export default function Badge({ status }) {
  const normalizedStatus = status?.toLowerCase().replace(/-/g, '_')
  const variantClass = variants[normalizedStatus] || 'bg-gray-100 text-gray-700'
  
  return (
    <span
      className={clsx(
        'inline-flex items-center text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider',
        variantClass,
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  )
}
