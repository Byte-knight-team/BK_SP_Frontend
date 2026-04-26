import ProgressBar from '../ui/ProgressBar'
import { Target } from 'lucide-react'

export default function SalesTargetCard({ current, goal }) {
  const pct = Math.round((current / goal) * 100)
  const remaining = goal - current

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-light rounded-xl">
            <Target className="w-6 h-6 text-brand" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">
              Daily Sales Target
            </p>
            <p className="text-sm text-gray-400">
              Goal: ${goal.toLocaleString()}
            </p>
          </div>
        </div>
        <span className="text-3xl font-extrabold text-gray-900">
          ${current.toLocaleString()}
        </span>
      </div>
      <ProgressBar value={current} max={goal} />
      <div className="flex justify-between mt-3">
        <span className="text-sm text-green-500 font-medium">
          {pct}% Achieved
        </span>
        <span className="text-sm text-gray-400">
          ${remaining.toLocaleString()} more to reach daily goal
        </span>
      </div>
    </div>
  )
}
