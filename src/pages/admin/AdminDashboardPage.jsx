import React, { useEffect, useMemo, useState } from 'react';
import {
  Users, DollarSign, ShoppingBag,
  TrendingUp, Clock, CheckCircle, LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../../context/AuthContext';
import useWebSocket from '../../hooks/useWebSocket';
import {
  getAdminDashboardOrderFlowAPI,
  getAdminDashboardRevenueTrendAPI,
  getAdminDashboardStatsAPI,
} from '../../apis/admin/dashboard';

// Admin landing page that summarizes key business metrics.
export default function AdminDashboardPage() {
  const { user, hydrated } = useAuth();
  const branchId = user?.branchId;

  // Core dashboard metrics shown in the summary cards.
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeUsers: 0,
    activeOrderCount: 0,
  });
  // Order flow breakdown used by the donut chart and status tiles.
  const [orderFlow, setOrderFlow] = useState({
    preparingCount: 0,
    readyCount: 0,
    inDeliveryCount: 0,
    completedCount: 0,
  });
  // Revenue trend points rendered in the line chart.
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [revenueDays, setRevenueDays] = useState(7);

  const fetchStatsAndFlow = React.useCallback(async () => {
    const [
      { data: statsData, error: statsError },
      { data: flowData, error: flowError },
    ] = await Promise.all([
      getAdminDashboardStatsAPI(),
      getAdminDashboardOrderFlowAPI(),
    ]);

    if (statsError) console.error('Error fetching admin dashboard stats:', statsError);
    if (flowError) console.error('Error fetching admin dashboard order flow:', flowError);

    if (statsData) setStats(statsData);
    if (flowData) setOrderFlow(flowData);
    setStatsLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) fetchStatsAndFlow();
    return () => { isMounted = false; };
  }, [fetchStatsAndFlow]);

  const topic = branchId ? `/topic/branch/${branchId}/admin-notifications` : null;
  useWebSocket(branchId, topic, () => {
    fetchStatsAndFlow();
  });

  useEffect(() => {
    let isMounted = true;

    const loadRevenueData = async () => {
      const { data, error } = await getAdminDashboardRevenueTrendAPI(revenueDays);

      if (error) console.error('Error fetching admin dashboard revenue trend:', error);

      if (!isMounted) return;
      if (data) setRevenueTrend(data);
    };

    loadRevenueData();
    const intervalId = window.setInterval(loadRevenueData, 60000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [revenueDays]);

  const formattedRevenue = useMemo(
    () => new Intl.NumberFormat('en-LK', { maximumFractionDigits: 0 }).format(stats.totalRevenue),
    [stats.totalRevenue],
  );

  // Shared number formatters keep the chart labels and counters consistent.
  const formatCount = (value) => new Intl.NumberFormat('en-US').format(value);
  const formatRevenueTick = (value) => `LKR ${new Intl.NumberFormat('en-LK', { maximumFractionDigits: 0 }).format(value)}`;

  // Build the donut chart segments and CSS gradient from the current order flow.
  const orderDonut = useMemo(() => {
    const preparing = Number(orderFlow.preparingCount) || 0;
    const ready = Number(orderFlow.readyCount) || 0;
    const inDelivery = Number(orderFlow.inDeliveryCount) || 0;
    const completed = Number(orderFlow.completedCount) || 0;
    const totalOrders = Math.max(Number(stats.totalOrders) || 0, 0);
    const knownTotal = preparing + ready + inDelivery + completed;
    const other = Math.max(totalOrders - knownTotal, 0);

    const segments = [
      { label: 'Preparing', value: preparing, color: '#3B82F6' },
      { label: 'Ready', value: ready, color: '#F59E0B' },
      { label: 'In Delivery', value: inDelivery, color: '#8B5CF6' },
      { label: 'Completed', value: completed, color: '#22C55E' },
      { label: 'Other', value: other, color: '#CBD5E1' },
    ];

    if (totalOrders <= 0) {
      return {
        gradient: '#E5E7EB',
        segments,
      };
    }

    let running = 0;
    const stops = segments
      .filter((segment) => segment.value > 0)
      .map((segment) => {
        const start = (running / totalOrders) * 360;
        running += segment.value;
        const end = (running / totalOrders) * 360;
        return `${segment.color} ${start}deg ${end}deg`;
      });

    return {
      gradient: `conic-gradient(${stops.join(', ')})`, //draws donut visually
      segments,
    };
  }, [orderFlow, stats.totalOrders]);

  // Convert the revenue trend into SVG paths and axis labels for the chart.
  const revenueChart = useMemo(() => {
    let points = revenueTrend.length > 0  //ensures chart always renders
      ? revenueTrend
      : [
        { dayLabel: 'Mon', revenue: 0 },
        { dayLabel: 'Tue', revenue: 0 },
        { dayLabel: 'Wed', revenue: 0 },
        { dayLabel: 'Thu', revenue: 0 },
        { dayLabel: 'Fri', revenue: 0 },
        { dayLabel: 'Sat', revenue: 0 },
        { dayLabel: 'Sun', revenue: 0 },
      ];

    if (points.length > 7) {
      const weeks = [];
      let currentWeek = [];

      points.forEach((point, index) => {
        currentWeek.push(point);
        if (currentWeek.length === 7 || index === points.length - 1) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      });

      points = weeks.map((week, index) => {
        const totalRevenue = week.reduce((sum, p) => sum + (Number(p.revenue) || 0), 0);

        const formatShortDate = (dateStr) => {
          if (!dateStr) return '';
          const d = new Date(dateStr);
          return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
        };

        const startDay = week[0].date;
        const endDay = week[week.length - 1].date;

        return {
          dayLabel: `Week ${index + 1}`,
          subLabel: `(${formatShortDate(startDay)} - ${formatShortDate(endDay)})`,
          revenue: totalRevenue
        };
      });
    }

    const width = 600;
    const height = 200;
    const chartTopPadding = 10;
    const chartBottomPadding = 12;
    const chartHeight = height - chartTopPadding - chartBottomPadding;
    const maxRevenue = Math.max(...points.map((p) => Number(p.revenue) || 0), 0); //find max revenue
    const safeMaxRevenue = maxRevenue > 0 ? maxRevenue : 1;

    const mapped = points.map((point, index) => {
      const x = points.length === 1 ? width / 2 : (index * width) / (points.length - 1); //calculate x position
      const normalized = (Number(point.revenue) || 0) / safeMaxRevenue;
      const y = height - chartBottomPadding - normalized * chartHeight; //calculate y position

      return {
        x,
        y,
        dayLabel: point.dayLabel,
        subLabel: point.subLabel,
      };
    });

    const linePath = mapped
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');

    const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

    const yTicks = [1, 0.75, 0.5, 0.25, 0].map((factor) => Math.round(maxRevenue * factor));

    return {
      linePath,
      areaPath,
      yTicks,
      xLabels: mapped.map((point) => ({
        main: point.dayLabel,
        sub: point.subLabel,
      })),
    };
  }, [revenueTrend]);

  return (
    <div className="bg-[#FAFAFA] font-sans px-10 pb-10">
      {/* Page header with the dashboard title and context text */}
      <div className="flex items-center justify-between mb-8 mt-1">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
            <LayoutDashboard size={22} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Dashboard Overview</h3>
            <p className="mt-1 text-sm text-gray-500">Real-time performance metrics for Crave House</p>
          </div>
        </div>
      </div>

      {/* Top-level KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Revenue KPI */}
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

        {/* Total orders KPI */}
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

        {/* Active users KPI */}
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

        {/* Active orders KPI */}
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
        {/* Revenue trend chart */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-[1.5rem] p-6 flex flex-col min-h-[360px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-gray-900">Revenue Performance</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>
                Revenue
              </div>
              <select
                value={revenueDays}
                onChange={(e) => setRevenueDays(Number(e.target.value))}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-1.5 outline-none cursor-pointer"
              >
                <option value={3}>Last 3 Days</option>
                <option value={7}>Last 7 Days</option>
                <option value={31}>Last 31 Days</option>
              </select>
            </div>
          </div>

          <div className="flex-1 w-full flex flex-col mt-4">
            <div className="flex-1 flex relative">
              {/* Y-axis revenue labels */}
              <div className="w-12 flex flex-col justify-between text-[10px] text-gray-400 leading-tight pb-6 pt-2">
                <AnimatePresence mode="popLayout">
                  {revenueChart.yTicks.map((tickValue, index) => (
                    <motion.div
                      key={`y-${tickValue}-${index}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      className={index === revenueChart.yTicks.length - 1 ? 'mb-[-4px]' : '-mt-3'}
                    >
                      {formatRevenueTick(tickValue)}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* SVG chart canvas */}
              <div className="flex-1 relative border-l border-b border-gray-50 ml-2 mb-10">
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

                  {/* Filled area under the revenue line */}
                  <motion.path
                    initial={false}
                    animate={{ d: revenueChart.areaPath }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    fill="url(#chartGradient)"
                  />

                  {/* Revenue line */}
                  <motion.path
                    initial={false}
                    animate={{ d: revenueChart.linePath }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    fill="none"
                    stroke="#F97316"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* X-axis day labels */}
                <div className="absolute -bottom-10 left-0 right-0 flex justify-between text-[11px] text-gray-400 px-2">
                  <AnimatePresence mode="popLayout">
                    {revenueChart.xLabels.map((labelObj, index) => (
                      <motion.div
                        key={`x-${labelObj.main}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className="flex flex-col items-center"
                      >
                        <span className={labelObj.sub ? "font-semibold text-gray-700" : ""}>{labelObj.main}</span>
                        {labelObj.sub && <span className="text-[10px] mt-0.5">{labelObj.sub}</span>}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order distribution donut and legend */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-[1.5rem] p-6 flex flex-col">
          <h2 className="text-base font-bold text-gray-900 mb-6">Order Distribution</h2>

          <div className="flex items-center justify-center mb-6">
            <div
              className="w-48 h-48 rounded-full flex items-center justify-center"
              style={{ background: orderDonut.gradient }}
            >
              <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Orders</span>
                <span className="text-2xl font-extrabold text-gray-900 mt-1">{formatCount(stats.totalOrders)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {orderDonut.segments.map((segment) => (
              <div key={segment.label} className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: segment.color }}></span>
                  <span className="font-medium">{segment.label}</span>
                </div>
                <span className="font-semibold text-gray-800">{formatCount(segment.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Snapshot of the current order states */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-[1.5rem] p-6 mb-8">
        <h2 className="text-base font-bold text-gray-900 mb-6">Quick Status Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#FAFAFA] rounded-2xl p-6 flex flex-col items-center justify-center border border-gray-50">
            <Clock size={24} className="text-blue-500 mb-3" />
            <motion.div
              key={orderFlow.preparingCount}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="text-3xl font-extrabold text-gray-900 mb-1"
            >
              {formatCount(orderFlow.preparingCount)}
            </motion.div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PREPARING</div>
          </div>

          <div className="bg-[#FAFAFA] rounded-2xl p-6 flex flex-col items-center justify-center border border-gray-50">
            <ShoppingBag size={24} className="text-orange-500 mb-3" />
            <motion.div
              key={orderFlow.readyCount}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="text-3xl font-extrabold text-gray-900 mb-1"
            >
              {formatCount(orderFlow.readyCount)}
            </motion.div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">READY FOR PICKUP</div>
          </div>

          <div className="bg-[#FAFAFA] rounded-2xl p-6 flex flex-col items-center justify-center border border-gray-50">
            <TrendingUp size={24} className="text-purple-500 mb-3" />
            <motion.div
              key={orderFlow.inDeliveryCount}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="text-3xl font-extrabold text-gray-900 mb-1"
            >
              {formatCount(orderFlow.inDeliveryCount)}
            </motion.div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">IN DELIVERY</div>
          </div>

          <div className="bg-[#FAFAFA] rounded-2xl p-6 flex flex-col items-center justify-center border border-gray-50">
            <CheckCircle size={24} className="text-green-500 mb-3" />
            <motion.div
              key={orderFlow.completedCount}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="text-3xl font-extrabold text-gray-900 mb-1"
            >
              {formatCount(orderFlow.completedCount)}
            </motion.div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">COMPLETED</div>
          </div>
        </div>
      </div>

    </div>
  );
}
