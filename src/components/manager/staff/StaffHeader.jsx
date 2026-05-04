import { Users } from 'lucide-react'

export default function StaffHeader({ branchName }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-brand-light rounded-xl">
          <Users className="w-7 h-7 text-brand" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Staff Information
          </h1>
          <p className="text-sm text-gray-400 font-medium">Monitor branch team</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gray-100 text-gray-700 text-sm font-bold px-4 py-2.5 rounded-lg border border-gray-200">
          <span className="text-gray-400 font-medium">Branch:</span> {branchName || 'Assigned Branch'}
        </div>
      </div>
    </div>
  )
}
