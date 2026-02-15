import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById } from "../api/qrOrdersApi";
import EditOrderModal from "../components/modals/EditOrderModal";
import CancelOrderConfirmModal from "../components/modals/CancelOrderConfirmModal";

export default function OrderDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const res = await getOrderById(id);
            setOrder(res.data);
        } catch (err) {
            console.error("Error loading order:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return "—";
        const d = new Date(dateStr);
        return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    };

    const statusConfig = {
        OPEN: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-300", label: "Waiting Assignment", iconBg: "bg-orange-400" },
        PAID: { bg: "bg-green-50", text: "text-green-600", border: "border-green-300", label: "Payment Received", iconBg: "bg-green-400" },
        CLOSED: { bg: "bg-gray-50", text: "text-gray-500", border: "border-gray-300", label: "Order Closed", iconBg: "bg-gray-400" },
        CANCELLED: { bg: "bg-red-50", text: "text-red-500", border: "border-red-300", label: "Order Cancelled", iconBg: "bg-red-400" },
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!order) {
        return <div className="text-center py-16 text-gray-400">Order not found.</div>;
    }

    const sc = statusConfig[order.status] || statusConfig.OPEN;
    const subtotal = order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    return (
        <div>
            {/* Top: Back + Order ID */}
            <div className="mb-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/reception/orders")}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order #ORD-{order.id}</h1>
                        <p className="text-sm text-gray-400">Track order status</p>
                    </div>
                </div>
            </div>

            {/* Status Banner */}
            <div className={`rounded-xl ${sc.bg} border ${sc.border} p-5 mb-6 flex items-center gap-4`}>
                <div className={`w-12 h-12 rounded-xl ${sc.iconBg} flex items-center justify-center`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Current Status</p>
                    <p className={`text-xl font-bold ${sc.text}`}>{sc.label}</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Left: Order Items */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Order Items</h2>

                    {/* Items Table Header */}
                    <div className="grid grid-cols-12 text-[11px] font-semibold tracking-wider text-gray-400 uppercase pb-3 border-b border-gray-100">
                        <div className="col-span-5">Item Details</div>
                        <div className="col-span-2 text-center">QTY</div>
                        <div className="col-span-2 text-right">Price</div>
                        <div className="col-span-3 text-right">Total</div>
                    </div>

                    {/* Items */}
                    {order.items.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 items-center py-4 border-b border-gray-50">
                            <div className="col-span-5">
                                <p className="text-sm font-medium text-gray-800">{item.itemName}</p>
                                {item.kitchenNotes && (
                                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                        </svg>
                                        {item.kitchenNotes}
                                    </p>
                                )}
                            </div>
                            <div className="col-span-2 text-center">
                                <span className="inline-flex items-center justify-center w-8 h-8 border border-gray-200 rounded text-sm font-medium text-gray-700">
                                    {item.quantity}
                                </span>
                            </div>
                            <div className="col-span-2 text-right text-sm text-gray-600">
                                LKR {Number(item.unitPrice).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </div>
                            <div className="col-span-3 text-right text-sm font-semibold text-gray-800">
                                LKR {(item.unitPrice * item.quantity).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    ))}

                    {/* Totals */}
                    <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Subtotal</span>
                            <span>LKR {subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Discounts</span>
                            <span>0.00</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                            <span className="text-base font-bold text-gray-800">Grand Total</span>
                            <span className="text-2xl font-bold text-gray-900">
                                LKR {Number(order.total).toLocaleString("en-US", { minimumFractionDigits: 0 })}
                            </span>
                        </div>
                    </div>

                    {/* Edit Order Button */}
                    {order.status === "OPEN" && (
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="flex items-center gap-2 px-8 py-2.5 border-2 border-orange-300 text-orange-500 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Edit Order
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Table Details */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-base font-bold text-gray-900 mb-4">Table Details</h3>
                        <div className="flex items-center gap-6 mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">Table No.</p>
                                    <p className="text-2xl font-bold text-gray-900">{order.tableNumber.replace("Table ", "")}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">Guests</p>
                                    <p className="text-2xl font-bold text-gray-900">{order.guestCount || "—"}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Created</span>
                                <span className="font-medium text-gray-800">{formatTime(order.createdAt)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Last Updated</span>
                                <span className="font-medium text-gray-800">{formatTime(order.updatedAt)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Server</span>
                                <span className="font-medium text-gray-800">Sarah J.</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-base font-bold text-gray-900 mb-4">Actions</h3>
                        <div className="space-y-3">
                            {/* Send to Kitchen — only for OPEN */}
                            {order.status === "OPEN" && (
                                <button className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-yellow-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-yellow-50 transition-colors">
                                    <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                    Send to Kitchen
                                </button>
                            )}

                            {/* Print Receipt — always visible */}
                            <button className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-yellow-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-yellow-50 transition-colors">
                                <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Print Receipt
                            </button>

                            {/* Mark as Paid — only for OPEN */}
                            {order.status === "OPEN" && (
                                <button className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-green-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-green-50 transition-colors">
                                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Mark as Paid
                                </button>
                            )}

                            {/* Close Order — only for PAID */}
                            {order.status === "PAID" && (
                                <button className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-blue-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors">
                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                    Close Order
                                </button>
                            )}

                            {/* Cancel Order — only for OPEN or PAID */}
                            {(order.status === "OPEN" || order.status === "PAID") && (
                                <button
                                    onClick={() => setShowCancelModal(true)}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500 text-white rounded-lg font-medium text-sm hover:bg-red-600 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Cancel Order
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Info */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-4 flex items-center gap-3">
                <svg className="w-5 h-5 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-gray-600">
                    Waiting for chef assignment. The chief chef will assign chefs to prepare this order soon.
                </p>
            </div>

            {/* Modals */}
            {showEditModal && (
                <EditOrderModal
                    order={order}
                    onClose={() => setShowEditModal(false)}
                    onSave={() => {
                        setShowEditModal(false);
                        fetchOrder();
                    }}
                />
            )}

            {showCancelModal && (
                <CancelOrderConfirmModal
                    order={order}
                    onClose={() => setShowCancelModal(false)}
                    onCancelled={() => {
                        setShowCancelModal(false);
                        fetchOrder();
                    }}
                />
            )}
        </div>
    );
}
