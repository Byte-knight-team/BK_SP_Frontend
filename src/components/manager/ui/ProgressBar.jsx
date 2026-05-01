export default function ProgressBar({
  value,
  max = 100,
  className = 'bg-brand',
}) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5">
      <div
        className={`h-1.5 rounded-full transition-all duration-500 ${className}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
