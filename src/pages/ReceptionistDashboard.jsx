import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrderStats, getRecentOrders } from "../api/qrOrdersApi";

export default function ReceptionistDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ openCount: 0, paidCount: 0, closedCount: 0, cancelledCount: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, recentRes] = await Promise.all([
                getOrderStats(),
                getRecentOrders(),
            ]);
            setStats(statsRes.data);
            setRecentOrders(recentRes.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError("Failed to load dashboard data. Make sure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    // Format date for header
    const today = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    // Format order time
    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    };

    // Status badge styling
    const statusConfig = {
        OPEN: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
        PAID: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
        CLOSED: { bg: "bg-gray-50", text: "text-gray-500", border: "border-gray-200" },
        CANCELLED: { bg: "bg-red-50", text: "text-red-500", border: "border-red-200" },
    };

    // Action config per status
    const getAction = (order) => {
        switch (order.status) {
            case "PAID":
                return { label: "View Details", color: "text-orange-500", onClick: () => navigate(`/reception/orders/${order.id}`) };
            case "OPEN":
                return { label: "Edit Order", color: "text-orange-500", onClick: () => navigate(`/reception/orders/${order.id}`) };
            case "CLOSED":
                return { label: "Receipt", color: "text-orange-500", onClick: () => navigate(`/reception/orders/${order.id}`) };
            case "CANCELLED":
                return { label: "Details", color: "text-orange-500", onClick: () => navigate(`/reception/orders/${order.id}`) };
            default:
                return { label: "View", color: "text-orange-500", onClick: () => navigate(`/reception/orders/${order.id}`) };
        }
    };

    // Filtered orders by search
    const filteredOrders = recentOrders.filter((order) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            `#${order.id}`.toLowerCase().includes(term) ||
            order.tableNumber.toLowerCase().includes(term) ||
            order.status.toLowerCase().includes(term)
        );
    });

    // ── Stats cards config ──
    const statCards = [
        {
            label: "REQUIRES ACTION",
            value: stats.openCount,
            subtitle: "Open Orders",
            link: "/reception/orders?tab=OPEN",
            icon: (
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            iconBg: "bg-orange-50",
        },
        {
            label: "READY TO CLOSE",
            value: stats.paidCount,
            subtitle: "Paid Tabs",
            link: "/reception/orders?tab=PAID",
            icon: (
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            iconBg: "bg-green-50",
        },
        {
            label: "COMPLETED",
            value: stats.closedCount,
            subtitle: "Closed Today",
            link: "/reception/orders?tab=CLOSED",
            icon: (
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
            iconBg: "bg-blue-50",
        },
        {
            label: "VOIDED",
            value: stats.cancelledCount,
            subtitle: "Cancelled",
            link: "/reception/orders?tab=CANCELLED",
            icon: (
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            iconBg: "bg-red-50",
        },
    ];

    // ── Loading / Error states ──
    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                    <p className="text-gray-500 text-sm">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md text-center">
                    <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-red-700 font-medium mb-2">Connection Error</p>
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                    <button
                        onClick={fetchDashboardData}
                        className="bg-red-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // ── Render ──
    return (
        <div>
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Receptionist Dashboard</h1>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {today}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((card, i) => (
                    <div
                        key={i}
                        onClick={() => navigate(card.link)}
                        className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                                {card.icon}
                            </div>
                            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                                {card.label}
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                        <p className="text-sm text-gray-400 mt-1">{card.subtitle}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Table Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4">
                    <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 w-52"
                            />
                        </div>
                        <button
                            onClick={() => navigate("/reception/orders")}
                            className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                        >
                            View All
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-t border-gray-100">
                                <th className="text-left text-[11px] font-semibold tracking-wider text-gray-400 uppercase px-6 py-3">Order ID</th>
                                <th className="text-left text-[11px] font-semibold tracking-wider text-gray-400 uppercase px-6 py-3">Table</th>
                                <th className="text-left text-[11px] font-semibold tracking-wider text-gray-400 uppercase px-6 py-3">Time</th>
                                <th className="text-left text-[11px] font-semibold tracking-wider text-gray-400 uppercase px-6 py-3">Status</th>
                                <th className="text-left text-[11px] font-semibold tracking-wider text-gray-400 uppercase px-6 py-3">Total</th>
                                <th className="text-right text-[11px] font-semibold tracking-wider text-gray-400 uppercase px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => {
                                const sc = statusConfig[order.status] || statusConfig.OPEN;
                                const action = getAction(order);
                                return (
                                    <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">#{order.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{order.tableNumber}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{formatTime(order.createdAt)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${sc.bg} ${sc.text} ${sc.border}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                            LKR {Number(order.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={action.onClick}
                                                className={`text-sm font-semibold ${action.color} hover:underline transition-colors`}
                                            >
                                                {action.label}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">
                                        No orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                    <p className="text-xs text-blue-400">
                        Showing {filteredOrders.length} most recent orders
                    </p>
                    <button
                        onClick={() => navigate("/reception/orders")}
                        className="text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1"
                    >
                        Go to Order Registry
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
