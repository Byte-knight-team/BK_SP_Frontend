import { useEffect, useMemo, useState, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  ChefHat,
  Clock,
  CreditCard,
  Home,
  Mail,
  Package,
  MapPin,
  Phone,
  ShoppingBag,
  Truck,
  Utensils,
  XCircle,
  Soup,
  HandCoins,
  Handshake,
  Star
} from 'lucide-react';
import CustomerPageShell from '../../components/customer/CustomerPageShell';
import CustomerStateCard from '../../components/customer/CustomerStateCard';
import ReviewModal from '../../components/customer/modal/ReviewModal';
import { toast } from 'react-toastify';
import CancelOrderModal from '../../components/customer/modal/CancelOrderModal';
import BranchLocationModal from '../../components/customer/modal/BranchLocationModal';
import { cancelCustomerOrder, getCustomerOrder } from '../../apis/customer/orders';
import useOrderStatusWebSocket from '../../hooks/useOrderStatusWebSocket';

const BASE_STATUS_FLOW = [
  { key: 'PLACED', label: 'Order Placed', shortLabel: 'Placed', icon: HandCoins, description: 'Order received' },
  { key: 'PENDING', label: 'Confirmed', shortLabel: 'Confirmed', icon: BadgeCheck, description: 'Order confirmed' },
  { key: 'PREPARING', label: 'Preparing', shortLabel: 'Preparing', icon: ChefHat, description: 'At the kitchen' },
  { key: 'COMPLETED', label: 'Order Prepared', shortLabel: 'Prepared', icon: Soup, description: 'Finished preparing' },
];

const DELIVERY_STATUS_FLOW = [
  ...BASE_STATUS_FLOW,
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', shortLabel: 'Delivery', icon: Truck, description: 'On the way' },
  { key: 'ARRIVED', label: 'Arrived', shortLabel: 'Arrived', icon: MapPin, description: 'Reached location' },
  { key: 'SERVED', label: 'Served', shortLabel: 'Served', icon: Handshake, description: 'Delivered' },
];

const PICKUP_STATUS_FLOW = [
  ...BASE_STATUS_FLOW,
  { key: 'SERVED', label: 'Served', shortLabel: 'Served', icon: Handshake, description: 'Ready for pickup' },
];



function normalizeOrderType(orderType) {
  return String(orderType || '').toUpperCase();
}

function getStatusFlow(orderType) {
  if (orderType === 'DELIVERY' || orderType === 'ONLINE_DELIVERY') {
    return DELIVERY_STATUS_FLOW;
  }

  return PICKUP_STATUS_FLOW;
}

function isTerminalOrderStatus(status) {
  const normalized = String(status || '').toUpperCase();
  return ['SERVED', 'CANCELLED', 'REJECTED'].includes(normalized);
}

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Multi-source fallback resolution for orderId so refreshes/direct navigations never show a blank screen
  const orderId =
    location.state?.orderId ||
    searchParams.get('orderId') ||
    searchParams.get('id') ||
    searchParams.get('order_id') ||
    sessionStorage.getItem('last_viewed_order_id') ||
    localStorage.getItem('last_placed_order_id');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  useEffect(() => {
    if (orderId) {
      sessionStorage.setItem('last_viewed_order_id', String(orderId));
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) {
      setError('No active order session found.');
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Fetch latest order from backend and update local state
    const fetchOrder = async () => {
      try {
        const res = await getCustomerOrder(orderId);
        const payload = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(payload?.message || 'Failed to load order details.');
        }

        if (isMounted) {
          setOrder(payload.data || null);
          setError('');
        }

        return payload.data || null;
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load order details.');
        }
        return null;
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // When user focuses the tab or the page becomes visible, refresh once
    const handleFocusRefresh = () => {
      if (!document.hidden) {
        fetchOrder();
      }
    };

    fetchOrder();

    window.addEventListener('focus', handleFocusRefresh);
    document.addEventListener('visibilitychange', handleFocusRefresh);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleFocusRefresh);
      document.removeEventListener('visibilitychange', handleFocusRefresh);
    };
  }, [orderId]);

  // Keep track of the last known status so we can trigger toasts reliably
  const lastKnownStatus = useRef(null);

  // Subscribe to real-time status updates via WebSocket
  useOrderStatusWebSocket(orderId, (update) => {
    if (update) {
      setOrder((prev) => {
        if (!prev) return prev;

        const next = { ...prev };
        let changed = false;

        if (update.orderStatus && prev.orderStatus !== update.orderStatus) {
          next.orderStatus = update.orderStatus;
          changed = true;
          lastKnownStatus.current = update.orderStatus;
        }

        if (update.paymentStatus && prev.paymentStatus !== update.paymentStatus) {
          next.paymentStatus = update.paymentStatus;
          changed = true;
        }

        return changed ? next : prev;
      });
    }
  });

  // Also update the ref when the initial fetch completes so we don't toast on first load
  useEffect(() => {
    if (order?.orderStatus) {
      lastKnownStatus.current = order.orderStatus;
    }
  }, [order?.orderStatus]);

  const orderType = normalizeOrderType(order?.orderType);
  const isDelivery = orderType === 'DELIVERY' || orderType === 'ONLINE_DELIVERY';
  const isQr = orderType === 'QR';
  const isPickup = orderType === 'ONLINE_PICKUP';
  const isCancelled = order?.orderStatus === 'CANCELLED' || order?.orderStatus === 'REJECTED';
  const isReviewable = order?.orderStatus === 'SERVED' && !order?.isReviewed;
  const isCancellable = !isCancelled && ['PLACED', 'PENDING', 'ON_HOLD'].includes(order?.orderStatus);
  const canRetryPayment = isCancellable && order?.paymentMethod === 'CARD' && (order?.paymentStatus === 'PENDING' || order?.paymentStatus === 'FAILED');

  // Pick the correct timeline for pickup vs delivery orders.
  const statusFlow = useMemo(() => getStatusFlow(orderType), [orderType]);

  // Map the backend status to the current step in the visible timeline.
  const statusIndex = useMemo(() => {
    if (!order?.orderStatus) return 0;
    const normalizedStatus = String(order.orderStatus).toUpperCase();
    const flowStatus = normalizedStatus === 'READY' ? 'COMPLETED' : normalizedStatus;
    const idx = statusFlow.findIndex((step) => step.key === flowStatus);
    return idx === -1 ? 0 : idx;
  }, [order?.orderStatus, statusFlow]);

  // Simple estimated window based on order creation time: +20 and +40 minutes
  const estimatedStart = new Date(order?.createdAt || Date.now());
  estimatedStart.setMinutes(estimatedStart.getMinutes() + 20);
  const estimatedEnd = new Date(order?.createdAt || Date.now());
  estimatedEnd.setMinutes(estimatedEnd.getMinutes() + 40);
  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) return;

    setIsCancelling(true);
    try {
      const res = await cancelCustomerOrder(order.orderId, cancelReason);
      if (res.ok) {
        setCancelModalOpen(false);
        setCancelReason('');
        setOrder((prev) => (prev ? { ...prev, orderStatus: 'CANCELLED' } : prev));
      } else {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.message || payload?.error || 'Failed to cancel order.');
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <CustomerPageShell maxWidth="max-w-6xl">
        <CustomerStateCard
          variant="loading"
          title="Loading order confirmation"
          description="We're pulling together your order summary, status, and payment details."
          className="mx-auto max-w-2xl"
        />
      </CustomerPageShell>
    );
  }

  if (error || !order) {
    return (
      <CustomerPageShell maxWidth="max-w-6xl">
        <CustomerStateCard
          variant="error"
          title="Could not load confirmation"
          description={error || 'We could not find this order.'}
          primaryAction={{
            label: 'View Orders',
            onClick: () => navigate('/orders'),
          }}
          secondaryAction={{
            label: 'Back to Menu',
            onClick: () => navigate('/menu'),
          }}
          className="mx-auto max-w-2xl"
        />
      </CustomerPageShell>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const rawOrderNum = String(order.orderNumber || order.orderId || '');
  const orderDisplayId = rawOrderNum.startsWith('#') ? rawOrderNum : `#${rawOrderNum}`;
  const isDineIn = isQr || orderType === 'DINE_IN';
  const OrderTypeIcon = isDelivery ? Truck : isDineIn ? Utensils : ShoppingBag;
  const orderTypeLabel = isDelivery ? 'Delivery' : isDineIn ? 'Dine-In' : 'Pickup';

  return (
    <CustomerPageShell maxWidth="max-w-6xl" className="pb-32">
      {/* TOP HEADER - Back button, Order Meta & Status Capsule */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Back Navigation & Order Badge */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => navigate('/menu')}
            className="w-fit inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition-all hover:border-orange-200 hover:text-orange-600 active:scale-95"
          >
            <ArrowLeft size={14} />
            Back to Menu
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight">
              Order {orderDisplayId}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-500 text-white text-[11px] font-bold tracking-wider uppercase shadow-xs shadow-orange-500/20">
              <OrderTypeIcon size={13} className="text-white" />
              {orderTypeLabel}
            </span>
          </div>
        </div>

        {/* Right Side: Modern Status Highlight Capsule */}
        <div className="flex items-center gap-3.5 rounded-2xl bg-white border border-slate-100 px-5 py-3.5 shadow-sm">
          <div className={`relative flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0 ${
            isCancelled ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
          }`}>
            {!isCancelled && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-white"></span>
              </span>
            )}
            {isCancelled ? <XCircle size={22} /> : <CheckCircle2 size={22} />}
          </div>
          <div className="text-left">
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
              {isCancelled ? 'Order Cancelled' : 'Order Placed'}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isCancelled ? 'This order has been cancelled' : 'You will be notified as each step updates'}
            </p>
          </div>
        </div>
      </div>

      {/* HORIZONTAL TIMELINE - Full Width */}
      {!isCancelled && (
        <div className="mb-8 rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-sm overflow-x-auto custom-scrollbar">
          <div className="relative min-w-max sm:min-w-0 w-full">

            {/* The Animated Timeline Icons & Connectors */}
            <div className="relative z-10 flex items-start w-full">
              {statusFlow.map((step, index) => {
                const StepIcon = step.icon;
                const isDone = index <= statusIndex;
                const isNextStep = index === statusIndex + 1;
                const isLast = index === statusFlow.length - 1;

                return (
                  <div key={step.key} className="flex flex-1 flex-col items-center text-center relative min-w-[60px] sm:min-w-0 px-1">

                    {/* Connector line to the next step */}
                    {!isLast && (
                      <div className="absolute left-1/2 top-[18px] sm:top-[24px] w-full h-1 bg-slate-100 rounded-full z-[-1] overflow-hidden">
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: isDone ? "100%" : "0%" }}
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                          className="h-full bg-orange-500 rounded-full origin-left"
                        />
                      </div>
                    )}

                    {/* The "Popping" Icon */}
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{
                        scale: isDone ? 1 : isNextStep ? 1.15 : 0.9,
                        opacity: 1
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                        delay: index * 0.1
                      }}
                      className={`flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center shrink-0 rounded-full transition-colors duration-500 ${isDone
                        ? 'bg-orange-500 text-white shadow-md'
                        : isNextStep
                          ? 'bg-white border-2 border-orange-400 text-orange-500 shadow-lg'
                          : 'bg-white border border-slate-200 text-slate-300'
                        }`}
                    >
                      <StepIcon size={14} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                    </motion.div>

                    {/* Label text */}
                    <motion.div
                      className="w-full"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + (index * 0.1) }}
                    >
                      {/* Mobile: slightly larger text, allowed to wrap */}
                      <p className="mt-2 block sm:hidden w-full text-center text-[10px] font-bold text-slate-900 leading-tight break-words">
                        {step.shortLabel || step.label}
                      </p>
                      {/* Desktop: full label, description */}
                      <p className="mt-3 hidden sm:block text-xs font-bold text-slate-900 leading-tight">
                        {step.label}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-500 hidden sm:block">
                        {step.description}
                      </p>
                    </motion.div>

                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* MAIN CONTENT GRID - Order Summary (LEFT) + Right Column (Branch/Payment/Actions) */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* LEFT: Order Summary */}
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-xl font-bold text-slate-900">Order Summary</h3>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="font-semibold text-slate-900">{item.itemName}</p>
                  <p className="text-sm text-slate-500">Qty {item.quantity}</p>
                </div>
                <p className="whitespace-nowrap font-bold text-slate-900">LKR {Number(item.subtotal || 0).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[1rem] bg-slate-50 p-4">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span>LKR {Number(order.subtotal || 0).toLocaleString()}</span>
            </div>
            {Number(order.deliveryFee || 0) > 0 && (
              <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                <span>Delivery fee</span>
                <span>LKR {Number(order.deliveryFee || 0).toLocaleString()}</span>
              </div>
            )}
            {Number(order.taxAmount || 0) > 0 && (
              <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                <span>Tax</span>
                <span>LKR {Number(order.taxAmount || 0).toLocaleString()}</span>
              </div>
            )}
            <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
              <span className="text-sm font-bold text-slate-900">Total</span>
              <span className="text-2xl font-extrabold text-orange-500">LKR {Number(order.finalTotal || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Branch Details (TOP) + Payment (MIDDLE) + Actions (BOTTOM) */}
        <div className="flex flex-col gap-6">
          {/* Branch Details + Delivery Details */}
          <div className="flex flex-col gap-4">
            {/* Branch details show only when the order has a branch attached. */}
            {order.branchDetails && (
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <h4 className="mb-3 font-bold text-slate-900">{isPickup ? 'Pickup Details' : 'Branch Details'}</h4>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{order.branchDetails.name}</p>
                    <p className="mt-1 text-xs text-slate-600">{order.branchDetails.address}</p>
                  </div>
                  {isPickup && (
                    <button
                      type="button"
                      onClick={() => setLocationModalOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3.5 py-2 text-xs font-semibold text-orange-600 transition-colors hover:bg-orange-100 shrink-0"
                    >
                      <MapPin size={14} /> View Map
                    </button>
                  )}
                </div>
                <div className="mt-3 space-y-1 text-xs text-slate-500">
                  <p className="flex items-center gap-2"><Phone size={12} /> {order.branchDetails.contactNumber}</p>
                  <p className="flex items-center gap-2"><Mail size={12} /> {order.branchDetails.email}</p>
                </div>
              </div>
            )}

            {/* Delivery/Personal Details */}
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h4 className="mb-3 font-bold text-slate-900">{isDelivery ? 'Delivery Details' : isQr ? 'Table Details' : 'Customer Details'}</h4>
              <div className="space-y-3 text-sm text-slate-600">
                {isDelivery && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Address</p>
                    <p className="mt-1">{order.deliveryAddress || '—'}</p>
                  </div>
                )}

                {(isQr) && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Table Number</p>
                    <p className="mt-1 font-semibold text-slate-900">{order.tableNumber || order.tableId || '—'}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900">{order.contactName || '—'}</p>
                  <p className="text-slate-500">{order.contactPhone || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="mb-3 font-bold text-slate-900">Payment Info</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Status:</span>
                <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${order.paymentStatus === 'PAID' || order.paymentStatus === 'REFUNDED' ? 'bg-emerald-50 text-emerald-700' : order.paymentStatus === 'REFUND_FAILED' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                  {order.paymentStatus === 'REFUND_FAILED' ? 'REFUND PROCESSING' : order.paymentStatus || 'UNKNOWN'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Method:</span>
                <span className="font-semibold text-slate-900">{order.paymentMethod || '—'}</span>
              </div>
            </div>
            {canRetryPayment && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-100 leading-relaxed">
                <span className="font-bold uppercase tracking-wider block mb-0.5 text-[10px]">Action Required</span>
                Your order will be automatically cancelled if payment is not completed within 15 minutes.
              </div>
            )}
          </div>

          {/* Review is only available after serving; cancel is only available before processing starts. */}
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="space-y-2.5">
              {canRetryPayment && (
                <button
                  type="button"
                  onClick={() => navigate('/payment', {
                    state: {
                      orderId: order.orderId,
                      finalAmount: order.finalTotal,
                      returnUrl: '/order-confirmation'
                    }
                  })}
                  className="w-full rounded-[10px] bg-orange-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-colors"
                >
                  Retry Payment
                </button>
              )}

              {isReviewable ? (
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-[0.98]"
                >
                  <Star size={14} className="fill-white" /> Review Order
                </button>
              ) : order?.isReviewed ? (
                <div className="w-full rounded-xl bg-emerald-50 border border-emerald-200 py-2.5 text-center text-xs font-semibold text-emerald-700">
                  ✓ Order Reviewed
                </div>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-400 border border-slate-200 cursor-not-allowed opacity-70"
                >
                  Review Order
                </button>
              )}

              {isCancellable && (
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(true)}
                  className="w-full rounded-[10px] border border-amber-300 bg-white px-4 py-2.5 text-xs font-bold text-amber-700 transition-all hover:bg-amber-50"
                >
                  Cancel Order
                </button>
              )}

              {!isCancellable && !isReviewable && !canRetryPayment && !order?.isReviewed && (
                <p className="text-xs text-slate-400 text-center pt-1">No actions available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky shortcuts keep the main navigation available */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/96 backdrop-blur-sm shadow-[0_-8px_30px_rgba(15,23,42,0.08)]">
        <div className="mx-auto flex w-full max-w-6xl gap-3 px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate('/menu')}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-[14px] bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-[0.98]"
          >
            Continue Shopping
          </button>
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-[14px] bg-slate-100 px-5 py-3 text-sm font-bold text-slate-900 transition-all hover:bg-slate-200 active:scale-[0.98]"
          >
            View Order History
          </button>
        </div>
      </div>

      {reviewModalOpen && !isCancelled && order?.orderStatus === 'SERVED' && (
        <ReviewModal
          order={order}
          onClose={() => setReviewModalOpen(false)}
          onSuccess={() => {
            setReviewModalOpen(false);
            setOrder((prev) => (prev ? { ...prev, isReviewed: true } : prev));
          }}
        />
      )}

      {cancelModalOpen && !isCancelled && (
        <CancelOrderModal
          order={order}
          cancelReason={cancelReason}
          onCancelReasonChange={setCancelReason}
          onClose={() => {
            setCancelModalOpen(false);
            setCancelReason('');
          }}
          onConfirm={handleCancelOrder}
          isSubmitting={isCancelling}
        />
      )}

      {locationModalOpen && order?.branchDetails && (
        <BranchLocationModal
          branchDetails={order.branchDetails}
          onClose={() => setLocationModalOpen(false)}
        />
      )}
    </CustomerPageShell>
  );
}
