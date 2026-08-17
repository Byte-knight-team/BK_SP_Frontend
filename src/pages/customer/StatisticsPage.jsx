import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar
} from 'recharts';
import {
  Wallet, BadgePercent, Package2, Award, Clock, Utensils, TrendingUp, AlertCircle, ArrowLeft, Calendar, Sparkles
} from 'lucide-react';
import CustomerPageShell from '../../components/customer/CustomerPageShell';
import CustomerStateCard from '../../components/customer/CustomerStateCard';
import BrandLogo from '../../components/customer/BrandLogo';
import { getCustomerStatistics } from '../../apis/customer/statistics';

// Helper for formatting currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Colors for the Pie Chart
const PIE_COLORS = ['#f97316', '#3b82f6', '#8b5cf6']; // Orange, Blue, Purple

export default function StatisticsPage() {
  const navigate = useNavigate();
  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['customerStatistics'],
    queryFn: async () => {
      const res = await getCustomerStatistics();
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Failed to load statistics');
      return payload.data;
    }
  });

  const error = queryError?.message || '';

  if (loading) {
    return (
      <CustomerPageShell maxWidth="max-w-6xl">
        <CustomerStateCard
          variant="loading"
          title="Loading your insights"
          description="We're crunching the numbers to show your personalized statistics..."
        />
      </CustomerPageShell>
    );
  }

  if (error) {
    return (
      <CustomerPageShell maxWidth="max-w-6xl">
        <CustomerStateCard
          variant="error"
          title="Could not load statistics"
          description={error}
        />
      </CustomerPageShell>
    );
  }

  if (!data) return null;

  // Prepare Pie Chart Data
  const orderTypeData = [
    { name: 'Dine-In', value: data.qrOrderCount || 0 },
    { name: 'Delivery', value: data.deliveryOrderCount || 0 },
    { name: 'Pickup', value: data.pickupOrderCount || 0 }
  ].filter(item => item.value > 0);

  // Prepare Bar Chart Data for Loyalty
  const loyaltyData = [
    { name: 'Earned', points: data.totalPointsEarned || 0, fill: '#10b981' }, // Green
    { name: 'Redeemed', points: data.totalPointsRedeemed || 0, fill: '#ef4444' } // Red
  ];

  const hasSpendingTrend = data.spendingTrend && data.spendingTrend.length > 0 && data.spendingTrend.some(t => t.amount > 0);
  const hasTopItems = data.topItems && data.topItems.length > 0;
  const hasOrderTypes = orderTypeData.length > 0;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0, opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <CustomerPageShell maxWidth="max-w-6xl">
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate('/account')}
          className="mb-2 inline-flex items-center gap-2 text-sm text-slate-700 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Account
        </button>

        {/* Header Section: VIP Member Passport Banner */}
        <motion.div 
          variants={itemVariants} 
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 p-6 sm:p-8 text-white shadow-xl shadow-orange-500/20"
        >
          {/* Subtle Clean Decorative White Glow Overlays (No Yellow/Amber) */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-2xl"></div>
          <div className="pointer-events-none absolute right-1/4 -bottom-12 h-44 w-44 rounded-full bg-white/10 blur-xl"></div>
          <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-black/5 blur-xl"></div>

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Left Side: Brand Logo, Title & Subtitle */}
            <div>
              <div className="flex items-center gap-3.5 mb-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner border border-white/30">
                  <BrandLogo />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-xs">
                    Your Dining Insights
                  </h1>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-orange-100 font-medium max-w-md leading-relaxed ml-0.5">
                Your personal flavor journey, dining trends & rewards activity overview.
              </p>
            </div>

            {/* Right Side: Glassmorphic Passport Badges (Pure Brand Theme) */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-white/20 px-4 py-2 text-xs font-bold text-white backdrop-blur-md border border-white/30 shadow-xs">
                <Sparkles className="w-4 h-4 text-white fill-white" />
                <span>Active Member</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 text-xs font-semibold text-orange-50 backdrop-blur-md border border-white/25 shadow-xs">
                <Calendar className="w-4 h-4 text-orange-100" />
                <span>Member since {new Date(data.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ROW 1: Spending Trend (2 cols) + 3 Summary KPI Cards (1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Columns 1 & 2: Spending Trend Graph */}
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Spending Trend (Last 6 Months)
              </h3>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline-block">Monthly Overview</span>
            </div>

            {hasSpendingTrend ? (
              <div className="h-[260px] w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.spendingTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(value) => `Rs.${value}`}
                      width={70}
                    />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value), 'Spend']}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[260px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl">
                <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                <p>Not enough data to show trend.</p>
              </div>
            )}
          </motion.div>

          {/* Column 3: 3 Summary Cards Stacked Vertically */}
          <div className="lg:col-span-1 flex flex-col justify-between gap-4">
            <motion.div variants={itemVariants} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 flex-1 transition-all hover:border-orange-200 hover:shadow-md">
              <div className="bg-orange-100 p-3.5 rounded-2xl text-orange-600 flex-shrink-0">
                <Wallet className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Total Lifetime Spend</p>
                <h3 className="text-xl font-extrabold text-slate-900 truncate">{formatCurrency(data.totalLifetimeSpend)}</h3>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 flex-1 transition-all hover:border-green-200 hover:shadow-md">
              <div className="bg-green-100 p-3.5 rounded-2xl text-green-600 flex-shrink-0">
                <BadgePercent className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Total Discounts Saved</p>
                <h3 className="text-xl font-extrabold text-slate-900 truncate">{formatCurrency(data.totalDiscountsSaved)}</h3>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 flex-1 transition-all hover:border-blue-200 hover:shadow-md">
              <div className="bg-blue-100 p-3.5 rounded-2xl text-blue-600 flex-shrink-0">
                <Package2 className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Total Items Ordered</p>
                <h3 className="text-xl font-extrabold text-slate-900 truncate">{data.totalItemsOrdered}</h3>
              </div>
            </motion.div>
          </div>

        </div>

        {/* ROW 2: 3 Columns -> 1: Favorite Dishes | 2: How You Order | 3: Loyalty Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Column 1: Your Favorite Dishes */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
            <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-orange-500" />
              Your Favorite Dishes
            </h3>

            {hasTopItems ? (
              <div className="space-y-3 flex-1 flex flex-col justify-between">
                {data.topItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 transition-colors">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Utensils className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-slate-900 truncate">{item.name}</h4>
                      <p className="text-xs text-slate-500">Ordered {item.orderCount} time{item.orderCount > 1 ? 's' : ''}</p>
                    </div>
                    <div className="bg-orange-100 text-orange-600 font-bold px-2.5 py-0.5 rounded-full text-xs">
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[220px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl">
                <Utensils className="w-8 h-8 mb-2 opacity-50" />
                <p>Order some food to see your favorites!</p>
              </div>
            )}
          </motion.div>

          {/* Column 2: How You Order */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
            <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
              <Package2 className="w-5 h-5 text-orange-500" />
              How You Order
            </h3>

            {hasOrderTypes ? (
              <div className="h-[220px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {orderTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} Orders`, name]}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[220px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl">
                <Package2 className="w-8 h-8 mb-2 opacity-50" />
                <p>No order history yet.</p>
              </div>
            )}
          </motion.div>

          {/* Column 3: Loyalty Points */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-500" />
                Loyalty Points
              </h3>
              <div className="text-right">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Current Balance</p>
                <p className="text-xl font-bold text-orange-600">{data.currentLoyaltyPoints}</p>
              </div>
            </div>

            <div className="h-[200px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={loyaltyData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    formatter={(value) => [`${value} Points`, '']}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="points" radius={[0, 8, 8, 0]} barSize={26}>
                    {loyaltyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>

      </motion.div>
    </CustomerPageShell>
  );
}
