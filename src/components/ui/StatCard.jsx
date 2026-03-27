import clsx from 'clsx'

export default function StatCard({
  icon,
  label,
  value,
  badge,
  subtitle,
  iconBg = 'bg-brand-light',
}) {
  return (
    <div className="card flex items-start gap-4">
      <div className={clsx('p-3.5 rounded-xl shrink-0', iconBg)}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-3xl font-bold text-gray-900">{value}</span>
          {badge && (
            <span
              className={clsx(
                'text-xs font-semibold px-2 py-0.5 rounded',
                badge.className,
              )}
            >
              {badge.text}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}
