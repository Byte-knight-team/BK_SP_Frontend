import React from "react";

const branches = [
  {
    id: 1,
    name: "Katubedda",
    address: "123 Main St, City Center",
    status: "OPEN",
    statusColor: "bg-green-500",
    revenue: "1,245,000",
    orders: 142,
    workingHours: "08:00 AM - 08:00 PM",
    // manager: "Nimal Kumara",
    phone: "+94-770404174",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=300&fit=crop",
  },
  {
    id: 2,
    name: "Piliyandala",
    address: "456 Main St, Piliyandala",
    status: "BUSY",
    statusColor: "bg-orange-500",
    revenue: "812,000",
    orders: 89,
    workingHours: "08:00 AM - 08:00 PM",
    // manager: "Sumudu Saman",
    phone: "+94-771548652",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&h=300&fit=crop",
  },
];

export default function BranchManagement({ onPageChange }) {

  return (
    <div className="flex-1 bg-gray-50 p-6 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branch Management</h1>
          <p className="text-sm text-gray-500">Monitor and configure all restaurant locations</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800" onClick={() => onPageChange("create-branch")}
>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Register New Branch
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {branches.map((branch) => (
          <div key={branch.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {/* Image */}
            <div className="relative h-48">
              <img src={branch.image} alt={branch.name} className="w-full h-full object-cover" />
              <button className="absolute top-4 right-4 p-2 bg-white/80 rounded-lg hover:bg-white">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-900">{branch.name}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {branch.address}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 uppercase font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Revenue (Daily)
                  </p>
                  <p className="text-lg font-bold text-gray-900 mt-1">LKR {branch.revenue}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 uppercase font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Orders Today
                  </p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{branch.orders}</p>
                </div>
              </div>

              {/* Details */}
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Working Hours
                  </span>
                  <span className="font-medium text-gray-900">{branch.workingHours}</span>
                </div>
                 {/* className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  {/* <span className="font-medium text-gray-900">{branch.manager}</span> */}
          
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Support Line
                  </span>
                  <span className="font-medium text-gray-900">{branch.phone}</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-5">
                <button className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                  View Live Metrics
                </button>
                <button className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Configure Settings
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

