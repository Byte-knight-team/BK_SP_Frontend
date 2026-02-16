const stats = [
  {
    label: "Total Revenue", value: "LKR 24,560", change: "+12.5%", up: true, iconBg: "bg-orange-100", iconColor: "text-orange-500",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  },
  {
    label: "Total Orders", value: "1,284", change: "+8.2%", up: true, iconBg: "bg-orange-100", iconColor: "text-orange-500",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
  },
  {
    label: "Active Users", value: "842", change: "-3.1%", up: false, iconBg: "bg-orange-100", iconColor: "text-orange-500",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  },
  {
    label: "Avg. Order Value", value: "LKR 1,912", change: "+4.3%", up: true, iconBg: "bg-purple-100", iconColor: "text-purple-500",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
  },
];

const activities = [
  { color: "bg-blue-500", text: "New order #ORD-8921 placed", time: "5 mins ago" },
  { color: "bg-gray-400", text: 'New staff member "Amal Sunimal" added', time: "12 mins ago" },
  { color: "bg-orange-500", text: "Inventory alert: Beef Patty low stock", time: "45 mins ago" },
  { color: "bg-green-500", text: "Order #ORD-8915 delivered", time: "1 hour ago" },
];

const statusItems = [
  { value: 12, label: "PREPARING", color: "text-blue-500", icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { value: 8, label: "READY FOR PICKUP", color: "text-orange-500", icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
  { value: 5, label: "IN DELIVERY", color: "text-purple-500", icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
  { value: 142, label: "COMPLETED TODAY", color: "text-green-500", icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
];

/* Revenue chart helpers (Mon–Sun) */
const chartPts = [15000, 38000, 28000, 25000, 27000, 18000, 35000];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CW = 340, CH = 200, CL = 55, CT = 10, MAX = 40000;
const tx = (i) => CL + (i / 6) * CW;
const ty = (v) => CT + CH - (v / MAX) * CH;
const line = chartPts.map((v, i) => `${tx(i)},${ty(v)}`).join(" ");
const area = `${line} ${tx(6)},${CT + CH} ${tx(0)},${CT + CH}`;

export default function Dashboard() {
  return (
    <div className="flex-1 bg-gray-50 p-6 overflow-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500">Real-time performance metrics for Crave House</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-orange-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 ${s.iconBg} rounded-lg flex items-center justify-center ${s.iconColor}`}>{s.icon}</div>
              <span className={`text-xs font-bold flex items-center gap-1 ${s.up ? "text-green-500" : "text-red-500"}`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.up ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
                </svg>
                {s.change}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium">{s.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Performance + Recent Activity */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Revenue Performance</h2>
            <span className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-2.5 h-2.5 bg-orange-500 rounded-full"></span> Revenue
            </span>
          </div>
          <svg viewBox="0 0 420 240" className="w-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {[0, 10000, 20000, 30000, 40000].map((v) => (
              <g key={v}>
                <line x1={CL} y1={ty(v)} x2={CL + CW} y2={ty(v)} stroke="#e5e7eb" strokeDasharray="4 4" />
                <text x={CL - 6} y={ty(v) + 3} textAnchor="end" fontSize="8" fill="#9ca3af">LKR {v.toLocaleString()}</text>
              </g>
            ))}
            <polygon points={area} fill="url(#orangeGrad)" />
            <polyline points={line} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinejoin="round" />
            {chartPts.map((v, i) => (
              <circle key={i} cx={tx(i)} cy={ty(v)} r="4" fill="#f97316" stroke="white" strokeWidth="2" />
            ))}
            {days.map((d, i) => (
              <text key={d} x={tx(i)} y={CT + CH + 20} textAnchor="middle" fontSize="9" fill="#9ca3af">{d}</text>
            ))}
          </svg>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-5">Recent Activity</h2>
          <div className="space-y-5">
            {activities.map((a, i) => (
              <div key={i} className="flex gap-3">
                <span className={`w-2.5 h-2.5 ${a.color} rounded-full mt-1.5 shrink-0`}></span>
                <div>
                  <p className="text-sm font-medium text-gray-800 leading-snug">{a.text}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {a.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 text-orange-500 text-sm font-semibold border border-orange-300 rounded-lg py-2 hover:bg-orange-50 hover:text-orange-600 transition-colors">
            View All Notifications
          </button>
        </div>
      </div>

      {/* Quick Status Summary */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-5">Quick Status Summary</h2>
        <div className="grid grid-cols-4 gap-4">
          {statusItems.map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-5 text-center">
              <div className={`inline-flex mb-2 ${item.color}`}>{item.icon}</div>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
