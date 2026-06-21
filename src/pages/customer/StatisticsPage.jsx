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
  Wallet, BadgePercent, Package2, Award, Clock, Utensils, TrendingUp, AlertCircle, ArrowLeft
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

        {/* Header Section */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <BrandLogo />
                <h1 className="text-3xl font-bold">
                  Your CraveHouse Statistics
                </h1>
              </div>
              <p className="text-orange-100 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Member since {new Date(data.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <TrendingUp className="w-16 h-16 opacity-80 hidden sm:block" />
          </div>
          {/* Decorative background circle */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-10 rounded-full blur-2xl"></div>
        </motion.div>

        {/* Top KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-orange-100 p-4 rounded-2xl text-orange-600">
              <Wallet className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Lifetime Spend</p>
              <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(data.totalLifetimeSpend)}</h3>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-green-100 p-4 rounded-2xl text-green-600">
              <BadgePercent className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Discounts Saved</p>
              <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(data.totalDiscountsSaved)}</h3>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-2xl text-blue-600">
              <Package2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Items Ordered</p>
              <h3 className="text-2xl font-bold text-slate-900">{data.totalItemsOrdered}</h3>
            </div>
          </motion.div>
        </div>

        {/* Charts Row 1: Spending Trend & Top Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending Trend Chart */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              Spending Trend (Last 6 Months)
            </h3>
            
            {hasSpendingTrend ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.spendingTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
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
              <div className="h-[300px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl">
                <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                <p>Not enough data to show trend.</p>
              </div>
            )}
          </motion.div>

          {/* Top 3 Items */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-orange-500" />
              Your Favorite Dishes
            </h3>
            
            {hasTopItems ? (
              <div className="space-y-4">
                {data.topItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 transition-colors">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Utensils className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 truncate">{item.name}</h4>
                      <p className="text-sm text-slate-500">Ordered {item.orderCount} time{item.orderCount > 1 ? 's' : ''}</p>
                    </div>
                    <div className="bg-orange-100 text-orange-600 font-bold px-3 py-1 rounded-full text-sm">
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl">
                <Utensils className="w-8 h-8 mb-2 opacity-50" />
                <p>Order some food to see your favorites!</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Charts Row 2: Order Types & Loyalty */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Type Breakdown */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-orange-500" /> {/* Using PieChart icon from lucide? No wait, PieChart is recharts. I should use another icon, let's just use Package2 or a custom icon layout, actually let's use the svg or leave it text. Let's use Package2 */}
              How You Order
            </h3>
            
            {hasOrderTypes ? (
              <div className="h-[250px] w-full flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
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
              <div className="h-[250px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl">
                <Package2 className="w-8 h-8 mb-2 opacity-50" />
                <p>No order history yet.</p>
              </div>
            )}
          </motion.div>

          {/* Loyalty Points */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-500" />
                Loyalty Points
              </h3>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-500">Current Balance</p>
                <p className="text-2xl font-bold text-orange-600">{data.currentLoyaltyPoints}</p>
              </div>
            </div>
            
            <div className="h-[200px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={loyaltyData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 14, fontWeight: 500 }} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    formatter={(value) => [`${value} Points`, '']}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="points" radius={[0, 8, 8, 0]} barSize={32}>
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
