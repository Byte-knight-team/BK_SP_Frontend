import { useState } from 'react';
import {
    ClipboardList,
    ChefHat,
    CheckCircle2,
    Clock,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { mostWantedMeals, peakHoursData, activityFeed, inventoryItems, allOrders } from '../data/mockData';

export default function DashboardOverview() {
    const pendingCount = allOrders.filter(o => o.status === 'pending').length;
    const preparingCount = allOrders.filter(o => o.status === 'preparing').length;
    const completedCount = allOrders.filter(o => o.status === 'completed').length;
    const lowInventory = inventoryItems.filter(i => i.status === 'critical' || i.status === 'low');

    const kpis = [
        { label: 'Pending Orders', value: pendingCount, icon: ClipboardList, change: '+2.4%', changeType: 'up', color: 'orange', bgColor: 'bg-orange-50', iconBg: 'bg-orange-100', iconColor: 'text-[var(--color-primary)]' },
        { label: 'Preparing', value: preparingCount, icon: ChefHat, badge: 'Active', badgeColor: 'bg-blue-100 text-blue-700', color: 'blue', bgColor: 'bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
        { label: 'Completed Today', value: completedCount, icon: CheckCircle2, change: '88% Target', changeType: 'up', color: 'green', bgColor: 'bg-green-50', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
        { label: 'Avg Prep Time', value: '14m', icon: Clock, change: '-1m vs Avg', changeType: 'down', color: 'purple', bgColor: 'bg-purple-50', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi, i) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={i} className="bg-white rounded-2xl p-5 border border-[var(--color-border)] hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div className={`w-11 h-11 ${kpi.iconBg} rounded-xl flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 ${kpi.iconColor}`} />
                                </div>
                                {kpi.change && (
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${kpi.changeType === 'up' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                                        }`}>
                                        {kpi.change}
                                    </span>
                                )}
                                {kpi.badge && (
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${kpi.badgeColor}`}>
                                        {kpi.badge}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-[var(--color-text-muted)] mb-1">{kpi.label}</p>
                            <p className="text-3xl font-bold text-[var(--color-text-main)]">{kpi.value}</p>
                            {/* Decorative bar */}
                            <div className="mt-3 h-1 rounded-full bg-[var(--color-bg-light)] overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${kpi.color === 'orange' ? 'bg-[var(--color-primary)]' :
                                            kpi.color === 'blue' ? 'bg-blue-500' :
                                                kpi.color === 'green' ? 'bg-green-500' :
                                                    'bg-purple-500'
                                        }`}
                                    style={{ width: `${Math.min(100, (typeof kpi.value === 'number' ? kpi.value * 3 : 65))}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts + Inventory Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Most Wanted Meals */}
                <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-[var(--color-text-main)]">Most Wanted Meals</h3>
                        <span className="text-xs text-[var(--color-text-muted)]">Past 7 Days</span>
                    </div>
                    <div className="space-y-3">
                        {mostWantedMeals.map((meal, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-[var(--color-text-main)] truncate">{meal.name}</span>
                                        <span className="text-sm font-bold text-[var(--color-text-main)] ml-2">{meal.value}</span>
                                    </div>
                                    <div className="h-2 bg-[var(--color-bg-light)] rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{
                                                width: `${(meal.value / mostWantedMeals[0].value) * 100}%`,
                                                backgroundColor: i === 0 ? 'var(--color-primary)' : i === 1 ? '#3b82f6' : i === 2 ? '#f59e0b' : '#10b981'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Peak Hours Chart */}
                <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-[var(--color-text-main)]">Peak Hours</h3>
                        <span className="text-xs text-[var(--color-text-muted)]">Last 24 Hours</span>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={peakHoursData} barSize={16}>
                            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={2} />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px' }}
                            />
                            <Bar dataKey="orders" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Low Inventory Alerts */}
                <div className="bg-red-50/50 rounded-2xl p-5 border border-red-100">
                    <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-[var(--color-status-critical)]" />
                        <h3 className="font-bold text-[var(--color-status-critical)]">Low Inventory Alerts</h3>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mb-4">{lowInventory.length} items require immediate restock</p>
                    <div className="space-y-4">
                        {lowInventory.slice(0, 3).map((item) => (
                            <div key={item.id}>
                                <div className="flex items-center justify-between mb-1">
                                    <div>
                                        <p className="text-sm font-semibold text-[var(--color-text-main)]">{item.name}</p>
                                        <p className="text-xs text-[var(--color-text-muted)] uppercase">Weight: {item.unit}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-[var(--color-text-main)]">{item.currentQty} / {item.threshold}</p>
                                        <span className={`text-[10px] font-bold uppercase ${item.status === 'critical' ? 'text-[var(--color-status-critical)]' : 'text-[var(--color-status-low)]'
                                            }`}>{item.status}</span>
                                    </div>
                                </div>
                                <div className="h-1.5 bg-white rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${item.status === 'critical' ? 'bg-[var(--color-status-critical)]' : 'bg-[var(--color-status-low)]'
                                            }`}
                                        style={{ width: `${(item.currentQty / item.threshold) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 py-2.5 border-2 border-[var(--color-primary)] text-[var(--color-primary)] rounded-xl text-sm font-semibold hover:bg-[var(--color-primary)] hover:text-white transition-colors">
                        Create Restock Order
                    </button>
                </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)]">
                <h3 className="font-bold text-[var(--color-text-main)] text-lg mb-4">Recent Activity Feed</h3>
                <div className="space-y-4">
                    {activityFeed.map((item) => (
                        <div key={item.id} className="flex items-start gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${item.dot === 'orange' ? 'bg-[var(--color-primary)]' :
                                    item.dot === 'green' ? 'bg-green-500' :
                                        item.dot === 'red' ? 'bg-red-500' :
                                            'bg-blue-500'
                                }`} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-[var(--color-text-main)]">
                                    {item.text}{' '}
                                    <span className={`font-bold ${item.highlight === 'PREPARING' ? 'bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs' :
                                            item.dot === 'red' ? 'text-[var(--color-primary)]' :
                                                'text-[var(--color-primary)]'
                                        }`}>{item.highlight}</span>
                                    {item.suffix && <span> {item.suffix}</span>}
                                </p>
                                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{item.time} • {item.source}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
