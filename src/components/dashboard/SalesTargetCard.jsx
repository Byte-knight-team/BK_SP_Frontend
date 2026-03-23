import ProgressBar from '../ui/ProgressBar'

export default function SalesTargetCard({ current, goal }) {
  const pct = Math.round((current / goal) * 100)
  const remaining = goal - current

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Daily Sales Target
          </p>
          <p className="text-xs text-gray-400">
            Goal: Rs.{goal.toLocaleString()}
          </p>
        </div>
        <span className="text-xl font-bold text-gray-900">
          Rs.{current.toLocaleString()}
        </span>
      </div>
      <ProgressBar value={current} max={goal} />
      <div className="flex justify-between mt-2">
        <span className="text-xs text-green-500 font-medium">
          {pct}% Achieved
        </span>
        <span className="text-xs text-gray-400">
          ${remaining.toLocaleString()} more to go
        </span>
      </div>
    </div>
  )
}
