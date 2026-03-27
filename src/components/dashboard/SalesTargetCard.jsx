import ProgressBar from '../ui/ProgressBar'
import { Target } from 'lucide-react'

export default function SalesTargetCard({ current, goal }) {
  const pct = Math.round((current / goal) * 100)
  const remaining = goal - current

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-light rounded-lg">
            <Target className="w-4 h-4 text-brand" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Daily Sales Target
            </p>
            <p className="text-xs text-gray-400">
              Goal: ${goal.toLocaleString()}
            </p>
          </div>
        </div>
        <span className="text-xl font-bold text-gray-900">
          ${current.toLocaleString()}
        </span>
      </div>
      <ProgressBar value={current} max={goal} />
      <div className="flex justify-between mt-2">
        <span className="text-xs text-green-500 font-medium">
          {pct}% Achieved
        </span>
        <span className="text-xs text-gray-400">
          ${remaining.toLocaleString()} more to reach daily goal
        </span>
      </div>
    </div>
  )
}
