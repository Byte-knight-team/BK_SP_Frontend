import React, { useEffect, useMemo, useState } from 'react';
import { 
  Users, DollarSign, ShoppingBag, 
  TrendingUp, Clock, CheckCircle
} from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import { getAdminDashboardStatsAPI } from '../apis/admin/dashboard';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeUsers: 0,
    activeOrderCount: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      const { data, error } = await getAdminDashboardStatsAPI();

      if (error) {
        console.error('Error fetching admin dashboard stats:', error);
        if (isMounted) {
          setStatsLoading(false);
        }
        return;
      }

      if (isMounted && data) {
        setStats(data);
        setStatsLoading(false);
      }
    };

    loadStats();
    const intervalId = window.setInterval(loadStats, 10000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const formattedRevenue = useMemo(
    () => new Intl.NumberFormat('en-LK', { maximumFractionDigits: 0 }).format(stats.totalRevenue),
    [stats.totalRevenue],
  );

  const formatCount = (value) => new Intl.NumberFormat('en-US').format(value);

  return (
    <div className="flex h-screen bg-[#F8F9FA] font-sans">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FAFAFA]">
        {/* Header */}
        <AdminHeader />

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-10 pb-10">
          {/* Dashboard Header */}
          <div className="flex items-center justify-between mb-8">
             <div>
               <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
               <p className="text-gray-500 text-sm mt-1">Real-time performance metrics for Crave House</p>
             </div>
             <div className="bg-white border border-gray-100 shadow-sm rounded-xl w-32 h-10 border-dashed"></div> 
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Card 1 */}
            <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[160px]">
              <div className="flex justify-between items-start mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                  <DollarSign size={20} />
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 font-medium mb-1 border-b border-gray-50 pb-2">Total Revenue</div>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-lg font-bold text-gray-900">LKR</span>
                  <span className="text-2xl font-extrabold text-gray-900">{formattedRevenue}</span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[160px]">
              <div className="flex justify-between items-start mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                  <ShoppingBag size={20} />
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 font-medium mb-1 border-b border-gray-50 pb-2">Total Orders</div>
                <div className="text-2xl font-extrabold text-gray-900 mt-2">{formatCount(stats.totalOrders)}</div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[160px]">
              <div className="flex justify-between items-start mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                  <Users size={20} />
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 font-medium mb-1 border-b border-gray-50 pb-2">Active Users</div>
                <div className="text-2xl font-extrabold text-gray-900 mt-2">{formatCount(stats.activeUsers)}</div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[160px]">
              <div className="flex justify-between items-start mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 font-medium mb-1 border-b border-gray-50 pb-2">Active Orders</div>
                <div className="text-2xl font-extrabold text-gray-900 mt-2">{formatCount(stats.activeOrderCount)}</div>
              </div>
            </div>
          </div>

          {statsLoading ? (
            <p className="text-xs text-gray-400 mb-6">Loading live dashboard stats...</p>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 mb-6">
            {/* Revenue Chart */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-[1.5rem] p-6 flex flex-col min-h-[360px]">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-base font-bold text-gray-900">Revenue Performance</h2>
                 <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>
                    Revenue
                 </div>
              </div>
              
              <div className="flex-1 w-full flex flex-col mt-4">
                <div className="flex-1 flex relative">
                  {/* Y Axis */}
                  <div className="w-12 flex flex-col justify-between text-[10px] text-gray-400 leading-tight pb-6 pt-2">
                    <div className="-mt-3">LKR<br/>40000</div>
                    <div className="-mt-3">LKR<br/>30000</div>
                    <div className="-mt-3">LKR<br/>20000</div>
                    <div className="-mt-3">LKR<br/>10000</div>
                    <div className="mb-[-4px]">LKR 0</div>
                  </div>
                  
                  {/* Canvas */}
                  <div className="flex-1 relative border-l border-b border-gray-50 ml-2 mb-6">
                     <svg viewBox="0 0 600 200" preserveAspectRatio="none" className="w-full h-full text-orange-500 overflow-visible">
                        <defs>
                           <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="0%" stopColor="#F97316" stopOpacity="0.2" />
                             <stop offset="100%" stopColor="#F97316" stopOpacity="0.0" />
                           </linearGradient>
                        </defs>
                        
                        <g stroke="#f8fafc" strokeWidth="1" strokeDasharray="4 4">
                           <line x1="0" y1="0" x2="600" y2="0" />
                           <line x1="0" y1="50" x2="600" y2="50" />
                           <line x1="0" y1="100" x2="600" y2="100" />
                           <line x1="0" y1="150" x2="600" y2="150" />
                        </g>

                        {/* Area */}
                        <path d="M 0 10 C 100 90, 150 160, 220 160 C 260 160, 280 100, 320 100 C 370 100, 400 160, 450 170 C 500 180, 550 90, 600 40 L 600 200 L 0 200 Z" fill="url(#chartGradient)" />
                        
                        {/* Line */}
                        <path d="M 0 10 C 100 90, 150 160, 220 160 C 260 160, 280 100, 320 100 C 370 100, 400 160, 450 170 C 500 180, 550 90, 600 40" fill="none" stroke="#F97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                     </svg>
                     
                     {/* X Axis Labels */}
                     <div className="absolute -bottom-7 left-0 right-0 flex justify-between text-[11px] text-gray-400 px-2">
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                        <span>Sun</span>
                     </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-[1.5rem] p-6 flex flex-col">
              <h2 className="text-base font-bold text-gray-900 mb-6">Recent Activity</h2>
              
              <div className="flex-1 flex flex-col space-y-6">
                
                {/* Item 1 */}
                <div className="flex gap-4 relative">
                  <div className="w-[9px] h-[9px] bg-blue-500 rounded-full mt-1.5 relative z-10 flex-shrink-0 outline outline-4 outline-white"></div>
                  <div className="absolute left-[4px] top-4 bottom-[-24px] w-[1px] bg-gray-100"></div>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800 leading-tight">New order #ORD-8921 placed</p>
                    <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1.5 font-medium"><Clock size={12}/> 5 mins ago</p>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex gap-4 relative">
                  <div className="w-[9px] h-[9px] bg-gray-400 rounded-full mt-1.5 relative z-10 flex-shrink-0 outline outline-4 outline-white"></div>
                  <div className="absolute left-[4px] top-4 bottom-[-24px] w-[1px] bg-gray-100"></div>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800 leading-tight">New staff member "Amal Sunimal" added</p>
                    <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1.5 font-medium"><Clock size={12}/> 12 mins ago</p>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="flex gap-4 relative">
                  <div className="w-[9px] h-[9px] bg-orange-500 rounded-full mt-1.5 relative z-10 flex-shrink-0 outline outline-4 outline-white"></div>
                  <div className="absolute left-[4px] top-4 bottom-[-24px] w-[1px] bg-gray-100"></div>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800 leading-tight">Inventory alert: Beef Patty low stock</p>
                    <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1.5 font-medium"><Clock size={12}/> 45 mins ago</p>
                  </div>
                </div>

                {/* Item 4 */}
                <div className="flex gap-4 relative">
                  <div className="w-[9px] h-[9px] bg-green-500 rounded-full mt-1.5 relative z-10 flex-shrink-0 outline outline-4 outline-white"></div>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800 leading-tight">Order #ORD-8915 delivered</p>
                    <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1.5 font-medium"><Clock size={12}/> 1 hour ago</p>
                  </div>
                </div>
              </div>

              <button className="mt-8 w-full bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold py-3 rounded-xl transition-colors text-xs active:scale-95">
                View All Notifications
              </button>
            </div>
          </div>

          {/* Quick Status Summary */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-[1.5rem] p-6 mb-8">
            <h2 className="text-base font-bold text-gray-900 mb-6">Quick Status Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#FAFAFA] rounded-2xl p-6 flex flex-col items-center justify-center border border-gray-50">
                 <Clock size={24} className="text-blue-500 mb-3" />
                 <div className="text-3xl font-extrabold text-gray-900 mb-1">12</div>
                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PREPARING</div>
              </div>

              <div className="bg-[#FAFAFA] rounded-2xl p-6 flex flex-col items-center justify-center border border-gray-50">
                 <ShoppingBag size={24} className="text-orange-500 mb-3" />
                 <div className="text-3xl font-extrabold text-gray-900 mb-1">8</div>
                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">READY FOR PICKUP</div>
              </div>

              <div className="bg-[#FAFAFA] rounded-2xl p-6 flex flex-col items-center justify-center border border-gray-50">
                 <TrendingUp size={24} className="text-purple-500 mb-3" />
                 <div className="text-3xl font-extrabold text-gray-900 mb-1">5</div>
                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">IN DELIVERY</div>
              </div>

              <div className="bg-[#FAFAFA] rounded-2xl p-6 flex flex-col items-center justify-center border border-gray-50">
                 <CheckCircle size={24} className="text-green-500 mb-3" />
                 <div className="text-3xl font-extrabold text-gray-900 mb-1">142</div>
                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">COMPLETED TODAY</div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
