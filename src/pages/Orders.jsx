import { useState } from 'react';
import {
    ClipboardList,
    ChevronRight,
    MessageSquare,
    AlertCircle,
    CheckCircle2,
    XCircle,
    ChefHat,
    Play,
    Clock,
    X,
    Ban,
    UserPlus,
} from 'lucide-react';
import { allOrders, chefs } from '../data/mockData';

const statusColors = {
    pending: { bg: 'bg-[var(--color-status-pending-bg)]', text: 'text-[var(--color-status-pending)]', border: 'border-[var(--color-status-pending)]', label: 'PENDING' },
    preparing: { bg: 'bg-[var(--color-status-preparing-bg)]', text: 'text-[var(--color-status-preparing)]', border: 'border-[var(--color-status-preparing)]', label: 'PREPARING' },
    completed: { bg: 'bg-[var(--color-status-completed-bg)]', text: 'text-[var(--color-status-completed)]', border: 'border-[var(--color-status-completed)]', label: 'COMPLETED' },
    cancelled: { bg: 'bg-[var(--color-status-cancelled-bg)]', text: 'text-[var(--color-status-cancelled)]', border: 'border-[var(--color-status-cancelled)]', label: 'CANCELLED' },
};

const cancelReasons = [
    'Out of ingredients',
    'Customer request',
    'Kitchen equipment issue',
    'Quality concern',
    'Other',
];

export default function Orders() {
    const [orders, setOrders] = useState(allOrders);
    const [activeTab, setActiveTab] = useState('pending');
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [timeFilter, setTimeFilter] = useState('all');
    const [mealCountFilter, setMealCountFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [cancelModal, setCancelModal] = useState({ open: false, mealId: null, orderId: null });
    const [cancelOrderModal, setCancelOrderModal] = useState({ open: false, orderId: null });
    const [cancelReason, setCancelReason] = useState('');
    const [cancelReasonText, setCancelReasonText] = useState('');
    const [successToast, setSuccessToast] = useState('');
    const [errorModal, setErrorModal] = useState({ open: false, items: [] });
    // Per-meal chef assign dropdown: tracks which meal row has the dropdown open
    const [assigningMealId, setAssigningMealId] = useState(null);

    const availableChefs = chefs.filter(c => c.status === 'available' || c.status === 'busy');

    const tabCounts = {
        pending: orders.filter(o => o.status === 'pending').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
    };

    let filteredOrders = orders.filter(o => o.status === activeTab);
    if (mealCountFilter === '1-2') filteredOrders = filteredOrders.filter(o => o.meals.length <= 2);
    else if (mealCountFilter === '3-5') filteredOrders = filteredOrders.filter(o => o.meals.length >= 3 && o.meals.length <= 5);
    else if (mealCountFilter === '6+') filteredOrders = filteredOrders.filter(o => o.meals.length >= 6);
    if (sortBy === 'oldest') filteredOrders = [...filteredOrders].reverse();

    const selectedOrder = orders.find(o => o.id === selectedOrderId);

    const showToast = (msg) => {
        setSuccessToast(msg);
        setTimeout(() => setSuccessToast(''), 3000);
    };

    // ── Helper: recompute order status after a meal-level change ──
    const recomputeOrderStatus = (order) => {
        const allCancelled = order.meals.every(m => m.status === 'cancelled');
        const nonCancelledMeals = order.meals.filter(m => m.status !== 'cancelled');
        const allDone = nonCancelledMeals.length > 0 && nonCancelledMeals.every(m => m.status === 'completed');
        const noPendingLeft = order.meals.every(m => m.status !== 'pending');

        if (allCancelled) return 'cancelled';
        if (allDone) return 'completed';
        if (noPendingLeft && nonCancelledMeals.length > 0) return 'preparing';
        return order.status;
    };

    const updateOrderAfterMealChange = (updatedOrder) => {
        const newStatus = recomputeOrderStatus(updatedOrder);
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let timeline = { ...updatedOrder.timeline };
        if (newStatus === 'preparing' && !timeline.preparing) timeline.preparing = now;
        if (newStatus === 'completed' && !timeline.completed) timeline.completed = now;
        return { ...updatedOrder, status: newStatus, timeline };
    };

    // ── Actions ──
    const handleAssignChef = (orderId, mealId, chefName) => {
        setOrders(prev => prev.map(o => {
            if (o.id !== orderId) return o;
            const updated = {
                ...o,
                meals: o.meals.map(m => m.id === mealId ? { ...m, assignedChef: chefName } : m),
            };
            return updateOrderAfterMealChange(updated);
        }));
        setAssigningMealId(null);
        showToast(`Chef ${chefName} assigned successfully`);
    };

    const handleStartPrepare = (orderId, mealId) => {
        const shouldFail = Math.random() < 0.15;
        if (shouldFail) {
            setErrorModal({ open: true, items: ['Truffle Oil (need 10ml, have 0ml)', 'Fresh Chicken (need 200g, have 50g)'] });
            return;
        }
        setOrders(prev => prev.map(o => {
            if (o.id !== orderId) return o;
            const updated = {
                ...o,
                meals: o.meals.map(m => m.id === mealId ? { ...m, status: 'preparing' } : m),
            };
            return updateOrderAfterMealChange(updated);
        }));
        showToast('Meal preparation started!');
    };

    const handleMarkCompleted = (orderId, mealId) => {
        setOrders(prev => prev.map(o => {
            if (o.id !== orderId) return o;
            const updated = {
                ...o,
                meals: o.meals.map(m => m.id === mealId ? { ...m, status: 'completed' } : m),
            };
            return updateOrderAfterMealChange(updated);
        }));
        showToast('Meal marked as completed!');
    };

    const handleCancelMeal = () => {
        if (!cancelReason && !cancelReasonText.trim()) return;
        const reason = cancelReasonText.trim() || cancelReason;
        setOrders(prev => prev.map(o => {
            if (o.id !== cancelModal.orderId) return o;
            const updated = {
                ...o,
                meals: o.meals.map(m =>
                    m.id === cancelModal.mealId ? { ...m, status: 'cancelled', cancelReason: reason } : m
                ),
            };
            return updateOrderAfterMealChange(updated);
        }));
        showToast('Meal cancelled. Notification sent to receptionist & customer.');
        setCancelModal({ open: false, mealId: null, orderId: null });
        setCancelReason('');
        setCancelReasonText('');
    };

    const handleCancelOrder = () => {
        if (!cancelReason && !cancelReasonText.trim()) return;
        const reason = cancelReasonText.trim() || cancelReason;
        setOrders(prev => prev.map(o => {
            if (o.id !== cancelOrderModal.orderId) return o;
            return {
                ...o,
                status: 'cancelled',
                meals: o.meals.map(m => m.status !== 'completed' ? { ...m, status: 'cancelled', cancelReason: reason } : m),
            };
        }));
        showToast('Order cancelled. Notification sent to receptionist & customer.');
        setCancelOrderModal({ open: false, orderId: null });
        setCancelReason('');
        setCancelReasonText('');
    };

    return (
        <div className="animate-fade-in h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <ClipboardList className="w-6 h-6 text-[var(--color-primary)]" />
                    <h1 className="text-2xl font-bold text-[var(--color-text-main)]">Orders Management</h1>
                </div>
            </div>

            {/* Tabs — now includes Cancelled */}
            <div className="flex items-center gap-6 mb-4 border-b border-[var(--color-border)] pb-3">
                {['pending', 'preparing', 'completed', 'cancelled'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setSelectedOrderId(null); }}
                        className={`flex items-center gap-2 pb-1 text-sm font-semibold transition-colors border-b-2 -mb-[13px] ${activeTab === tab
                            ? `${statusColors[tab].text} ${statusColors[tab].border}`
                            : 'text-[var(--color-text-muted)] border-transparent hover:text-[var(--color-text-main)]'
                            }`}
                    >
                        <span className="capitalize">{tab}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === tab ? `${statusColors[tab].bg} ${statusColors[tab].text}` : 'bg-slate-100 text-slate-500'
                            }`}>{tabCounts[tab]}</span>
                    </button>
                ))}
            </div>

            {/* Two-column layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 min-h-0">
                {/* Left: Order List */}
                <div className="flex flex-col min-h-0">
                    <div className="flex flex-wrap gap-2 mb-3">
                        <select value={timeFilter} onChange={e => setTimeFilter(e.target.value)} className="text-xs px-3 py-1.5 border border-[var(--color-border)] rounded-lg bg-white text-[var(--color-text-main)] focus:outline-none">
                            <option value="all">All Time</option>
                            <option value="30m">Last 30 mins</option>
                            <option value="1h">Last 1 hour</option>
                            <option value="today">Today</option>
                        </select>
                        <select value={mealCountFilter} onChange={e => setMealCountFilter(e.target.value)} className="text-xs px-3 py-1.5 border border-[var(--color-border)] rounded-lg bg-white text-[var(--color-text-main)] focus:outline-none">
                            <option value="all">All Meals</option>
                            <option value="1-2">1-2 Items</option>
                            <option value="3-5">3-5 Items</option>
                            <option value="6+">High Volume (6+)</option>
                        </select>
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-xs px-3 py-1.5 border border-[var(--color-border)] rounded-lg bg-white text-[var(--color-text-main)] focus:outline-none">
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                        {filteredOrders.length === 0 ? (
                            <div className="text-center py-12 text-[var(--color-text-muted)]">
                                <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p className="font-medium">No {activeTab} orders</p>
                            </div>
                        ) : (
                            filteredOrders.map(order => (
                                <button
                                    key={order.id}
                                    onClick={() => setSelectedOrderId(order.id)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:shadow-sm ${selectedOrderId === order.id
                                        ? `${statusColors[activeTab].border} ${statusColors[activeTab].bg}`
                                        : 'border-[var(--color-border)] bg-white hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-1.5">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${statusColors[order.status].bg} ${statusColors[order.status].text}`}>
                                            {statusColors[order.status].label}
                                        </span>
                                        <span className="text-xs text-[var(--color-text-muted)]">{order.time}</span>
                                    </div>
                                    <p className="text-base font-bold text-[var(--color-text-main)]">#{order.id}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                                            🍽️ {order.meals.length} Items
                                        </span>
                                        <div className="flex items-center gap-1">
                                            {order.customerNotes && <MessageSquare className="w-3.5 h-3.5 text-[var(--color-status-pending)]" />}
                                            <ChevronRight className="w-4 h-4 text-[var(--color-text-light)]" />
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Order Details */}
                <div className="min-h-0 overflow-y-auto">
                    {!selectedOrder ? (
                        <div className="h-full flex items-center justify-center text-[var(--color-text-muted)]">
                            <div className="text-center">
                                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="font-medium">Select an order to view details</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 animate-slide-in space-y-5">
                            {/* Order header */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-[var(--color-text-main)]">Order #{selectedOrder.id}</h2>
                                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                        Placed on {selectedOrder.date} at {selectedOrder.time} • {selectedOrder.type}
                                        {selectedOrder.table && ` • ${selectedOrder.table}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${statusColors[selectedOrder.status].bg} ${statusColors[selectedOrder.status].text}`}>
                                        {selectedOrder.status === 'pending' ? 'Awaiting Preparation' : statusColors[selectedOrder.status].label}
                                    </span>
                                    {/* Cancel Order Button — only for pending orders */}
                                    {selectedOrder.status === 'pending' && (
                                        <button
                                            onClick={() => setCancelOrderModal({ open: true, orderId: selectedOrder.id })}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 border border-red-200 rounded-full text-xs font-semibold hover:bg-red-100 transition-colors"
                                        >
                                            <Ban className="w-3.5 h-3.5" /> Cancel Order
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="bg-[var(--color-bg-light)] rounded-xl p-4">
                                <p className="text-[10px] font-bold uppercase text-[var(--color-text-muted)] tracking-wider mb-3">Preparation Status</p>
                                <div className="flex items-center justify-between">
                                    {['Received', 'Preparing', 'Completed'].map((step, i) => {
                                        const timelineValues = [selectedOrder.timeline.received, selectedOrder.timeline.preparing, selectedOrder.timeline.completed];
                                        const isDone = !!timelineValues[i];
                                        const isCurrent = isDone && !timelineValues[i + 1] && i < 2;
                                        return (
                                            <div key={step} className="flex items-center flex-1">
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${selectedOrder.status === 'cancelled' ? 'bg-red-100 border-red-300' :
                                                        isDone ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'bg-white border-[var(--color-border)]'
                                                        }`}>
                                                        {selectedOrder.status === 'cancelled' ? (
                                                            <XCircle className="w-4 h-4 text-red-500" />
                                                        ) : isDone ? (
                                                            isCurrent ? <ChefHat className="w-4 h-4 text-white" /> : <CheckCircle2 className="w-4 h-4 text-white" />
                                                        ) : (
                                                            <div className="w-2 h-2 rounded-full bg-[var(--color-border)]" />
                                                        )}
                                                    </div>
                                                    <span className={`text-[10px] mt-1 font-semibold ${selectedOrder.status === 'cancelled' ? 'text-red-400' :
                                                        isCurrent ? 'text-[var(--color-primary)]' : isDone ? 'text-[var(--color-text-main)]' : 'text-[var(--color-text-light)]'
                                                        }`}>
                                                        {selectedOrder.status === 'cancelled' && i === 0 ? 'Cancelled' : step}
                                                    </span>
                                                </div>
                                                {i < 2 && (
                                                    <div className={`flex-1 h-0.5 mx-2 rounded ${isDone && timelineValues[i + 1] ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`} />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Customer Notes */}
                            {selectedOrder.customerNotes && (
                                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-[var(--color-text-main)]">Customer Notes</p>
                                        <p className="text-sm text-[var(--color-text-muted)] mt-0.5">"{selectedOrder.customerNotes}"</p>
                                    </div>
                                </div>
                            )}

                            {/* Meals table with per-row actions */}
                            <div>
                                <h3 className="text-sm font-bold text-[var(--color-text-main)] mb-3">
                                    Meal List ({selectedOrder.meals.filter(m => m.status !== 'cancelled').length} active / {selectedOrder.meals.length} total)
                                </h3>
                                <div className="border border-[var(--color-border)] rounded-xl overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-[var(--color-bg-light)]">
                                                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[var(--color-text-muted)]">Meal Item</th>
                                                <th className="text-center px-2 py-2.5 text-xs font-semibold text-[var(--color-text-muted)]">Qty</th>
                                                <th className="text-center px-2 py-2.5 text-xs font-semibold text-[var(--color-text-muted)]">Status</th>
                                                <th className="text-center px-2 py-2.5 text-xs font-semibold text-[var(--color-text-muted)]">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.meals.map(meal => (
                                                <tr key={meal.id} className={`border-t border-[var(--color-border)] ${meal.status === 'cancelled' ? 'opacity-40' : ''}`}>
                                                    <td className="px-4 py-3">
                                                        <div>
                                                            <p className={`font-semibold text-[var(--color-text-main)] ${meal.status === 'cancelled' ? 'line-through' : ''}`}>{meal.name}</p>
                                                            <p className="text-xs text-[var(--color-text-muted)]">{meal.category}</p>
                                                            {meal.assignedChef && (
                                                                <p className="text-xs text-blue-600 mt-0.5">{meal.assignedChef}</p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="text-center font-bold">x{meal.qty}</td>
                                                    <td className="text-center">
                                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusColors[meal.status]?.bg} ${statusColors[meal.status]?.text}`}>
                                                            {meal.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 py-2">
                                                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                                            {/* ── PENDING: Assign Chef + Start + Cancel ── */}
                                                            {meal.status === 'pending' && (
                                                                <>
                                                                    {/* Assign Chef */}
                                                                    {assigningMealId === `${selectedOrder.id}-${meal.id}` ? (
                                                                        <select
                                                                            autoFocus
                                                                            onChange={(e) => {
                                                                                if (e.target.value) handleAssignChef(selectedOrder.id, meal.id, e.target.value);
                                                                                else setAssigningMealId(null);
                                                                            }}
                                                                            onBlur={() => setAssigningMealId(null)}
                                                                            className="text-[11px] px-2 py-1.5 border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 min-w-[120px]"
                                                                        >
                                                                            <option value="">Pick a chef...</option>
                                                                            {availableChefs.map(c => (
                                                                                <option key={c.id} value={c.name}>{c.name}</option>
                                                                            ))}
                                                                        </select>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => setAssigningMealId(`${selectedOrder.id}-${meal.id}`)}
                                                                            className="flex items-center gap-1 px-2 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-[11px] font-semibold hover:bg-blue-100 transition-colors"
                                                                            title="Assign Chef"
                                                                        >
                                                                            <UserPlus className="w-3 h-3" /> Assign
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => handleStartPrepare(selectedOrder.id, meal.id)}
                                                                        className="flex items-center gap-1 px-2 py-1.5 bg-[var(--color-primary)] text-white rounded-lg text-[11px] font-semibold hover:bg-[var(--color-primary-dark)] transition-colors"
                                                                        title="Start Prepare"
                                                                    >
                                                                        <Play className="w-3 h-3" /> Start
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setCancelModal({ open: true, mealId: meal.id, orderId: selectedOrder.id })}
                                                                        className="flex items-center gap-1 px-2 py-1.5 bg-red-50 text-red-500 border border-red-200 rounded-lg text-[11px] font-semibold hover:bg-red-100 transition-colors"
                                                                        title="Cancel Meal"
                                                                    >
                                                                        <XCircle className="w-3 h-3" /> Cancel
                                                                    </button>
                                                                </>
                                                            )}
                                                            {/* ── PREPARING: Complete ── */}
                                                            {meal.status === 'preparing' && (
                                                                <button
                                                                    onClick={() => handleMarkCompleted(selectedOrder.id, meal.id)}
                                                                    className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-600 border border-green-200 rounded-lg text-[11px] font-semibold hover:bg-green-100 transition-colors"
                                                                    title="Mark Completed"
                                                                >
                                                                    <CheckCircle2 className="w-3 h-3" /> Complete
                                                                </button>
                                                            )}
                                                            {/* ── COMPLETED ── */}
                                                            {meal.status === 'completed' && (
                                                                <span className="text-green-500 flex items-center gap-1 text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Done</span>
                                                            )}
                                                            {/* ── CANCELLED ── */}
                                                            {meal.status === 'cancelled' && (
                                                                <span className="text-red-400 text-xs">Cancelled</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Cancel Meal Modal ── */}
            {cancelModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setCancelModal({ open: false, mealId: null, orderId: null })}>
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-[var(--color-text-main)]">Cancel Meal</h3>
                            <button onClick={() => setCancelModal({ open: false, mealId: null, orderId: null })} className="p-1 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5 text-[var(--color-text-muted)]" />
                            </button>
                        </div>
                        <p className="text-sm text-[var(--color-text-muted)] mb-4">Please provide a reason. This will be sent to the receptionist and customer.</p>
                        <select
                            value={cancelReason}
                            onChange={e => setCancelReason(e.target.value)}
                            className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                        >
                            <option value="">Select a reason...</option>
                            {cancelReasons.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <textarea
                            value={cancelReasonText}
                            onChange={e => setCancelReasonText(e.target.value)}
                            placeholder="Additional details (optional)..."
                            className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-xl text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                        />
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setCancelModal({ open: false, mealId: null, orderId: null })} className="flex-1 py-2.5 bg-slate-100 text-[var(--color-text-main)] rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors">
                                Back
                            </button>
                            <button
                                onClick={handleCancelMeal}
                                disabled={!cancelReason && !cancelReasonText.trim()}
                                className="flex-1 py-2.5 bg-[var(--color-status-cancelled)] text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Cancel Meal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Cancel ORDER Modal ── */}
            {cancelOrderModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setCancelOrderModal({ open: false, orderId: null })}>
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                <Ban className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[var(--color-text-main)]">Cancel Entire Order</h3>
                                <p className="text-xs text-[var(--color-text-muted)]">Order #{cancelOrderModal.orderId}</p>
                            </div>
                        </div>
                        <p className="text-sm text-[var(--color-text-muted)] mb-4">This will cancel <strong>all meals</strong> in this order. A notification will be sent to the receptionist and customer.</p>
                        <select
                            value={cancelReason}
                            onChange={e => setCancelReason(e.target.value)}
                            className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                        >
                            <option value="">Select a reason...</option>
                            {cancelReasons.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <textarea
                            value={cancelReasonText}
                            onChange={e => setCancelReasonText(e.target.value)}
                            placeholder="Additional details (optional)..."
                            className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-xl text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                        />
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setCancelOrderModal({ open: false, orderId: null })} className="flex-1 py-2.5 bg-slate-100 text-[var(--color-text-main)] rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors">
                                Back
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                disabled={!cancelReason && !cancelReasonText.trim()}
                                className="flex-1 py-2.5 bg-[var(--color-status-cancelled)] text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Cancel Order
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Error Modal (Not enough ingredients) ── */}
            {errorModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setErrorModal({ open: false, items: [] })}>
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-[var(--color-status-cancelled)]" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--color-text-main)]">Not Enough Ingredients</h3>
                        </div>
                        <p className="text-sm text-[var(--color-text-muted)] mb-3">The following items are insufficient:</p>
                        <ul className="space-y-2 mb-5">
                            {errorModal.items.map((item, i) => (
                                <li key={i} className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">• {item}</li>
                            ))}
                        </ul>
                        <div className="flex gap-3">
                            <button onClick={() => setErrorModal({ open: false, items: [] })} className="flex-1 py-2.5 bg-slate-100 text-[var(--color-text-main)] rounded-xl font-semibold text-sm">Close</button>
                            <button className="flex-1 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-sm">Go to Inventory</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Success Toast ── */}
            {successToast && (
                <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg animate-slide-in text-sm font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {successToast}
                </div>
            )}
        </div>
    );
}
