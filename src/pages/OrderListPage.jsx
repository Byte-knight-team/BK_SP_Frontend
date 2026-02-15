import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllOrders } from "../api/qrOrdersApi";

export default function OrderListPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState("OPEN");
    const [loading, setLoading] = useState(true);

    const tabs = [
        { key: "OPEN", label: "Pending Orders", icon: "clock" },
        { key: "PAID", label: "Sent to Kitchen", icon: "send" },
        { key: "CLOSED", label: "Pending Payments", icon: "wallet" },
    ];

    useEffect(() => {
        fetchOrders();
    }, [activeTab]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await getAllOrders(activeTab);
            setOrders(res.data);
        } catch (err) {
            console.error("Error loading orders:", err);
        } finally {
            setLoading(false);
        }
    };

    const today = new Date().toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
    });

    const formatDateTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" })
            + ", " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
    };

    const tabIcons = {
        clock: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        send: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
        ),
        wallet: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
        ),
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {today}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-8 border-b border-gray-200 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
                            ? "text-orange-500 border-orange-500"
                            : "text-gray-400 border-transparent hover:text-gray-600"
                            }`}
                    >
                        {tabIcons[tab.icon]}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex justify-center py-16">
                    <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                </div>
            )}

            {/* Order Cards */}
            {!loading && (
                <div className="flex flex-col gap-4">
                    {orders.length === 0 && (
                        <div className="text-center py-16 text-gray-400">
                            <p className="text-lg font-medium">No orders found</p>
                            <p className="text-sm mt-1">There are no {activeTab.toLowerCase()} orders at the moment.</p>
                        </div>
                    )}
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white rounded-xl border border-gray-200 px-6 py-5 flex items-center justify-between hover:shadow-md transition-shadow"
                        >
                            {/* Left: Order Info */}
                            <div className="flex-1">
                                <p className="text-base font-bold text-gray-900">
                                    Order #ORD-{order.id}
                                </p>
                                <p className="text-sm text-gray-400 mt-0.5">
                                    {order.customerName || "Guest"} • {order.tableNumber}
                                </p>
                            </div>

                            {/* Center: Date/Time */}
                            <div className="flex items-center gap-2 text-sm text-gray-500 flex-1">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formatDateTime(order.createdAt)}
                            </div>

                            {/* Status Badge */}
                            <div className="flex-shrink-0 mx-6">
                                <span className="inline-flex items-center px-3 py-1 rounded text-xs font-semibold border bg-orange-50 text-orange-600 border-orange-200">
                                    {order.status}
                                </span>
                            </div>

                            {/* Total */}
                            <div className="text-right flex-shrink-0 mx-6">
                                <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">Total</p>
                                <p className="text-lg font-bold text-orange-500">
                                    LKR {Number(order.total).toLocaleString("en-US", { minimumFractionDigits: 0 })}
                                </p>
                            </div>

                            {/* Action */}
                            <button
                                onClick={() => navigate(`/reception/orders/${order.id}`)}
                                className="text-sm font-semibold text-blue-500 hover:text-blue-600 hover:underline transition-colors flex-shrink-0"
                            >
                                View Actions
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
