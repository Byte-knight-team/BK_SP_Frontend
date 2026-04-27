import ProgressBar from '../ui/ProgressBar'
import { Target } from 'lucide-react'

export default function SalesTargetCard({ current, goal }) {
  const currentNum = Number(current)
  const goalNum = Number(goal)
  const pct = Math.round((currentNum / goalNum) * 100) || 0
  const remaining = Math.max(0, goalNum - currentNum)

  return (
    <div className="card">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-brand-light rounded-xl p-3">
            <Target className="text-brand h-6 w-6" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">
              Daily Sales Target
            </p>
            <p className="text-sm text-gray-400">
              Goal: Rs.{goalNum.toLocaleString()}
            </p>
          </div>
        </div>
        <span className="text-3xl font-extrabold text-gray-900">
          Rs.{currentNum.toLocaleString()}
        </span>
      </div>
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
  )
}
