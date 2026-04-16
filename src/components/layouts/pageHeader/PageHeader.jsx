import React from 'react'

export const PageHeader = ({title, description}) => {
  return (
    <div>
     {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-10 pb-10">
          {/* Dashboard Header */}
          <div className="flex items-center justify-between mb-8">
             <div>
               <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
               <p className="text-gray-500 text-sm mt-1">{description}</p>
             </div>
             <div className="bg-white border border-gray-100 shadow-sm rounded-xl w-32 h-10 border-dashed"></div> 
          </div>
        </div>
   </div>
  )
}
