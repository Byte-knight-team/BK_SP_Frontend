import clsx from 'clsx'

const variants = {
  busy: 'bg-red-50 text-red-600',
  active: 'bg-green-50 text-green-600',
  done: 'bg-gray-100 text-gray-500',
  online: 'bg-blue-50 text-blue-600',
}

export default function Badge({ status }) {
  return (
    <span
      className={clsx(
        'text-xs font-semibold px-2 py-0.5 rounded-full',
        variants[status] ?? variants.active,
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
