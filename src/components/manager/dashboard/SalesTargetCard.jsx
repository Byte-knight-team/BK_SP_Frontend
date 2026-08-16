import ProgressBar from '../ui/ProgressBar'
import { Target } from 'lucide-react'

export default function SalesTargetCard({ current, goal }) {
  const currentNum = Number(current)
  const goalNum = Number(goal)
  const pct = Math.round((currentNum / goalNum) * 100) || 0
  const remaining = Math.max(0, goalNum - currentNum)

  return (
    <div className="card flex flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-gray-500">
            Daily Sales Target
          </p>
          <div className="flex items-end gap-3">
            <h3 className="text-2xl font-bold text-gray-900 whitespace-nowrap">
              Rs.{currentNum.toLocaleString()}
            </h3>
            <span className="mb-1 text-sm font-semibold text-gray-400">
              / Rs.{goalNum.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="bg-brand-light shrink-0 rounded-xl p-4">
          <Target className="text-brand h-6 w-6" />
        </div>
      </div>
      <div>
        <ProgressBar value={currentNum} max={goalNum} />
        <div className="mt-3 flex justify-between">
          <span className="text-sm font-medium text-green-500">
            {pct}% Achieved
          </span>
          <span className="text-sm text-gray-400">
            Rs.{remaining.toLocaleString()} more to reach daily goal
          </span>
        </div>
      </div>
    </div>
  )
}
