import React from 'react'
import { Users } from 'lucide-react'

export default function StaffHeader() {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="p-3 bg-brand-light rounded-2xl">
        <Users className="w-8 h-8 text-brand" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">
          Staff Information
        </h1>
        <p className="text-sm text-gray-400 font-medium">Monitor branch team</p>
      </div>
    </div>
  )
}
