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
    <div className="card flex items-start gap-5">
      <div className={clsx('p-4 rounded-2xl shrink-0', iconBg)}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-base text-gray-500 font-medium">{label}</p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-4xl font-extrabold text-gray-900">{value}</span>
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
    </div>
  )
}
