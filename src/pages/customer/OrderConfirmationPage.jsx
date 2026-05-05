import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  XCircle,
  Soup,
  HandCoins,
  Handshake
} from 'lucide-react';
import CustomerPageShell from '../../components/customer/CustomerPageShell';
import CustomerStateCard from '../../components/customer/CustomerStateCard';
import ReviewModal from '../../components/customer/modal/ReviewModal';
import CancelOrderModal from '../../components/customer/modal/CancelOrderModal';
import { cancelCustomerOrder, getCustomerOrder } from '../../apis/customer/orders';

const BASE_STATUS_FLOW = [
  { key: 'PLACED', label: 'Order Placed', icon: HandCoins, description: 'Order received' },
  { key: 'PENDING', label: 'Confirmed', icon: BadgeCheck, description: 'Order confirmed' },
  { key: 'PREPARING', label: 'Preparing', icon: ChefHat, description: 'At the kitchen' },
  { key: 'COMPLETED', label: 'Order Prepared', icon: Soup, description: 'Finished preparing' },
];

const DELIVERY_STATUS_FLOW = [
  ...BASE_STATUS_FLOW,
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck, description: 'On the way' },
  { key: 'ARRIVED', label: 'Arrived', icon: MapPin, description: 'Reached location' },
  { key: 'SERVED', label: 'Served', icon: Handshake, description: 'Delivered' },
];

const PICKUP_STATUS_FLOW = [
  ...BASE_STATUS_FLOW,
  { key: 'SERVED', label: 'Served', icon: Handshake, description: 'Ready for pickup' },
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

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId } = location.state || {};

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setError('No order session found.');
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchOrder = async () => {
      try {
        const res = await getCustomerOrder(orderId);
        const payload = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(payload?.message || 'Failed to load order details.');
        }

        if (isMounted) {
          setOrder(payload.data || null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load order details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const orderType = normalizeOrderType(order?.orderType);
  const isDelivery = orderType === 'DELIVERY' || orderType === 'ONLINE_DELIVERY';
  const isQr = orderType === 'QR';
  const isPickup = orderType === 'ONLINE_PICKUP';
  const isCancelled = order?.orderStatus === 'CANCELLED' || order?.orderStatus === 'REJECTED';
  const isReviewable = order?.orderStatus === 'SERVED' && !order?.isReviewed;
  const isCancellable = !isCancelled && ['PLACED', 'PENDING', 'ON_HOLD'].includes(order?.orderStatus);

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

  return (
    <CustomerPageShell maxWidth="max-w-6xl" className="pb-32">
      {/* TOP HEADER - Back button and Order # on LEFT, Title on RIGHT */}
      <div className="mb-8 flex items-start justify-between gap-8">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => navigate('/menu')}
            className="w-fit inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300"
          >
            <ArrowLeft size={14} />
            Back to Menu
          </button>
          <div>
            <p className="text-sm font-bold text-slate-900">Order #{order.orderNumber || order.orderId}</p>
            {/*!isCancelled && <p className="text-xs text-slate-500">Est. delivery: {formatTime(estimatedStart)} - {formatTime(estimatedEnd)}</p>*/}
          </div>
        </div>
        <div className="text-right">
          <div className="mb-2 flex justify-end">
            <div className={`flex h-14 w-14 items-center justify-center rounded-full ${isCancelled ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {isCancelled ? <XCircle size={32} /> : <CheckCircle2 size={32} />}
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">{isCancelled ? 'Order Cancelled' : 'Order Confirmed'}</h1>
          <p className="mt-1 text-xs text-slate-600">{isCancelled ? 'Cancelled order' : 'You will be notified of each step'}</p>
        </div>
      </div>

      {/* HORIZONTAL TIMELINE - Full Width */}
      {!isCancelled && (
        <div className="mb-8 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="relative">
            {/* Fill each connector segment only after its step is completed. */}
            <div className="absolute left-[10%] right-[10%] top-6 flex h-1 items-center">
              {statusFlow.map((step, index) => {
                if (index === statusFlow.length - 1) return null; // Don't draw a line after the last dot

                const isFilled = index < statusIndex;

                return (
                  <div key={`${step.key}-connector`} className="flex-1">
                    <div className="h-1 rounded-full bg-slate-100">
                      <div
                        className={`h-1 rounded-full transition-all duration-300 ${isFilled ? 'w-full bg-orange-500' : 'w-0 bg-orange-500'}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {/*drawing timeline icons */}
            <div className="relative z-10 flex items-start justify-between">
              {statusFlow.map((step, index) => {
                const StepIcon = step.icon;
                const isDone = index <= statusIndex;
                const isNextStep = index === statusIndex + 1;

                return (
                  <div key={step.key} className="flex w-1/5 flex-col items-center text-center">
                    <div
                      className={`flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-full transition ${
                        isDone ? 'bg-orange-500 text-white shadow-md' : isNextStep ? 'bg-white border-2 border-orange-400 text-orange-500 shadow-lg' : 'bg-white border border-slate-200 text-slate-300'
                      }`}
                    >
                      <StepIcon size={14} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                    </div>
                    <p className="mt-2 text-[10px] sm:mt-3 sm:text-xs font-bold text-slate-900 leading-tight">{step.label}</p>
                    <p className="mt-0.5 text-xs text-slate-500 hidden sm:block">{step.description}</p>
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
                <p className="text-sm font-semibold text-slate-900">{order.branchDetails.name}</p>
                <p className="mt-1 text-xs text-slate-600">{order.branchDetails.address}</p>
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

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Customer</p>
                  <p className="mt-1 text-slate-600">{order.contactName || '—'}</p>
                  <p className="mt-1 text-slate-500">{order.contactPhone || '—'}</p>
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
                <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${order.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>
                  {order.paymentStatus || 'UNKNOWN'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Method:</span>
                <span className="font-semibold text-slate-900">{order.paymentMethod || '—'}</span>
              </div>
            </div>
          </div>

          {/* Review is only available after serving; cancel is only available before processing starts. */}
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="space-y-2">
              <button
                type="button"
                disabled={!isReviewable}
                onClick={() => setReviewModalOpen(true)}
                className="w-full rounded-[10px] bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-500 border border-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Review Order
              </button>
              {isCancellable ? (
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(true)}
                  className="w-full rounded-[10px] border border-amber-300 bg-white px-4 py-2.5 text-xs font-bold text-amber-700 transition-all hover:bg-amber-50"
                >
                  Cancel Order
                </button>
              ) : (
                <p className="text-xs text-slate-500 text-center">No actions available</p>
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
    </CustomerPageShell>
  );
}
