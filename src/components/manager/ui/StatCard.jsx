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
    <div className="card flex items-center justify-between p-6">
      <div>
        <p className="mb-1 text-sm font-medium text-gray-500">{label}</p>
        <div className="flex items-center gap-3">
          <h3 className="text-2xl font-bold text-gray-900 whitespace-nowrap">{value}</h3>
          {badge && (
            <span
              className={clsx(
                'text-sm font-semibold px-2.5 py-0.5 rounded',
                badge.className,
              )}
            >
              {badge.text}
            </span>
          )}
        </div>
        {subtitle && <p className="text-sm text-gray-400 mt-1.5">{subtitle}</p>}
      </div>
      <div className={clsx('rounded-xl p-4 shrink-0', iconBg)}>{icon}</div>
    </div>
  )
}
