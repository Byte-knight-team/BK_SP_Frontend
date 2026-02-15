import React from 'react';
import {
    DollarSign,
    ClipboardList,
    Users,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle2,
    CalendarCheck,
    X,
    Search,
    Bell,
    HelpCircle,
    Settings,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import './AdminDashboard.css';

/* ── Static Data ── */
const statsData = [
    {
        id: 'revenue',
        label: 'Total Revenue',
        value: 'LKR\n24,560',
        change: '+12.5%',
        positive: true,
        icon: DollarSign,
        iconClass: 'revenue',
    },
    {
        id: 'orders',
        label: 'Total Orders',
        value: '1,284',
        change: '+8.2%',
        positive: true,
        icon: ClipboardList,
        iconClass: 'orders',
    },
    {
        id: 'users',
        label: 'Active Users',
        value: '842',
        change: '-3.1%',
        positive: false,
        icon: Users,
        iconClass: 'users',
    },
    {
        id: 'avg',
        label: 'Avg. Order Value',
        value: 'LKR 1,912',
        change: '+4.3%',
        positive: true,
        icon: TrendingUp,
        iconClass: 'avg-order',
    },
];

const revenueData = [
    { day: 'Mon', revenue: 18000 },
    { day: 'Tue', revenue: 22000 },
    { day: 'Wed', revenue: 42000 },
    { day: 'Thu', revenue: 21000 },
    { day: 'Fri', revenue: 28000 },
    { day: 'Sat', revenue: 35000 },
    { day: 'Sun', revenue: 32000 },
];

const activityData = [
    {
        id: 1,
        text: 'New order #ORD-8921 placed',
        time: '5 mins ago',
        dotColor: 'blue',
    },
    {
        id: 2,
        text: 'New staff member "Amal Sunimal" added',
        time: '12 mins ago',
        dotColor: 'gray',
    },
    {
        id: 3,
        text: 'Inventory alert: Beef Patty low stock',
        time: '45 mins ago',
        dotColor: 'orange',
    },
    {
        id: 4,
        text: 'Order #ORD-8915 delivered',
        time: '1 hour ago',
        dotColor: 'green',
    },
];

const statusData = [
    { id: 'preparing', label: 'PREPARING', value: 12, icon: Clock, iconClass: 'preparing' },
    { id: 'ready', label: 'READY FOR PICKUP', value: 8, icon: CalendarCheck, iconClass: 'ready' },
    { id: 'delivery', label: 'IN DELIVERY', value: 5, icon: TrendingUp, iconClass: 'delivery' },
    { id: 'completed', label: 'COMPLETED TODAY', value: 142, icon: CheckCircle2, iconClass: 'completed' },
];

/* ── Custom Tooltip ── */
function CustomTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
        return (
            <div
                style={{
                    background: '#1a1a2e',
                    color: '#fff',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
            >
                <p style={{ margin: 0 }}>{label}: LKR {payload[0].value.toLocaleString()}</p>
            </div>
        );
    }
    return null;
}

/* ── Main Component ── */
export default function AdminDashboard() {
    return (
        <div className="dashboard">
            {/* Top Bar */}
            <div className="top-bar">
                <button className="top-bar-close">
                    <X size={18} />
                </button>
                <div className="top-bar-search">
                    <Search size={16} className="top-bar-search-icon" />
                    <input
                        type="text"
                        placeholder="Quick search across modules..."
                        className="top-bar-search-input"
                    />
                </div>
                <div className="top-bar-actions">
                    <button className="top-bar-icon-btn">
                        <Bell size={20} />
                        <span className="top-bar-notification-dot" />
                    </button>
                    <button className="top-bar-icon-btn">
                        <HelpCircle size={20} />
                    </button>
                    <div className="top-bar-divider" />
                    <button className="top-bar-system-btn">
                        <Settings size={16} />
                        <span>System Panel</span>
                    </button>
                </div>
            </div>

            {/* Header */}
            <div className="dashboard-header">
                <div className="dashboard-header-left">
                    <h1>Dashboard Overview</h1>
                    <p>Real-time performance metrics for Crave House</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="stats-row">
                {statsData.map((stat) => (
                    <div key={stat.id} className="stat-card">
                        <div className="stat-card-top">
                            <div className={`stat-icon ${stat.iconClass}`}>
                                <stat.icon size={20} />
                            </div>
                            <span className={`stat-badge ${stat.positive ? 'positive' : 'negative'}`}>
                                {stat.positive ? (
                                    <ArrowUpRight className="stat-badge-arrow" />
                                ) : (
                                    <ArrowDownRight className="stat-badge-arrow" />
                                )}
                                {stat.change}
                            </span>
                        </div>
                        <p className="stat-label">{stat.label}</p>
                        <p className="stat-value">
                            {stat.value.split('\n').map((line, i) => (
                                <span key={i}>
                                    {line}
                                    {i === 0 && stat.value.includes('\n') && <br />}
                                </span>
                            ))}
                        </p>
                    </div>
                ))}
            </div>

            {/* Middle Row: Chart + Activity */}
            <div className="middle-row">
                {/* Revenue Performance */}
                <div className="revenue-card">
                    <div className="revenue-card-header">
                        <h3>Revenue Performance</h3>
                        <div className="revenue-legend">
                            <span className="revenue-legend-dot" />
                            Revenue
                        </div>
                    </div>
                    <div className="revenue-chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={revenueData}
                                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                            >
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#ff6b00" stopOpacity={0.25} />
                                        <stop offset="100%" stopColor="#ff6b00" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f2" vertical={false} />
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#8e8ea9', fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#8e8ea9', fontWeight: 500 }}
                                    tickFormatter={(val) => `LKR ${(val / 1000).toFixed(0)}${val >= 1000 ? '000' : ''}`}
                                    width={70}
                                    domain={[0, 45000]}
                                    ticks={[0, 10000, 20000, 30000, 40000]}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#ff6b00"
                                    strokeWidth={2.5}
                                    fill="url(#revenueGradient)"
                                    dot={false}
                                    activeDot={{ r: 5, stroke: '#ff6b00', strokeWidth: 2, fill: '#fff' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="activity-card">
                    <h3>Recent Activity</h3>
                    <div className="activity-list">
                        {activityData.map((item) => (
                            <div key={item.id} className="activity-item">
                                <span className={`activity-dot ${item.dotColor}`} />
                                <div className="activity-content">
                                    <p className="activity-text">{item.text}</p>
                                    <span className="activity-time">
                                        <Clock className="activity-time-icon" />
                                        {item.time}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="view-all-btn">View All Notifications</button>
                </div>
            </div>

            {/* Quick Status Summary */}
            <div className="status-card">
                <h3>Quick Status Summary</h3>
                <div className="status-grid">
                    {statusData.map((item) => (
                        <div key={item.id} className="status-item">
                            <div className={`status-icon ${item.iconClass}`}>
                                <item.icon size={24} />
                            </div>
                            <span className="status-number">{item.value}</span>
                            <span className="status-label">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
