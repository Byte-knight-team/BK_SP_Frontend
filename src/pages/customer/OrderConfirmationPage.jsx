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
  Phone,
  ShoppingBag,
  Truck,
  XCircle,
} from 'lucide-react';
import CustomerPageShell from '../../components/customer/CustomerPageShell';
import CustomerStateCard from '../../components/customer/CustomerStateCard';
import ReviewModal from '../../components/customer/modal/ReviewModal';
import CancelOrderModal from '../../components/customer/modal/CancelOrderModal';
import { cancelCustomerOrder, getCustomerOrder } from '../../apis/customer/orders';

const STATUS_FLOW = [
  { key: 'PLACED', label: 'Placed', icon: BadgeCheck, description: 'Your order is confirmed.' },
  { key: 'PREPARING', label: 'Preparing', icon: ChefHat, description: 'The kitchen is preparing your meal.' },
  { key: 'READY', label: 'Ready', icon: Package, description: 'Your order is ready for the next step.' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck, description: 'Your order is on the way.' },
  { key: 'SERVED', label: 'Completed', icon: CheckCircle2, description: 'Your order has been completed.' },
];

function normalizeOrderType(orderType) {
  return String(orderType || '').toUpperCase();
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

  const statusIndex = useMemo(() => {
    if (!order?.orderStatus) return 0;
    const idx = STATUS_FLOW.findIndex((step) => step.key === order.orderStatus);
    return idx === -1 ? 0 : idx;
  }, [order?.orderStatus]);

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
      }
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <CustomerPageShell maxWidth="max-w-5xl">
        <CustomerStateCard
          variant="loading"
          title="Loading order confirmation"
          description="We’re pulling together your order summary, status, and payment details."
          className="mx-auto max-w-2xl"
        />
      </CustomerPageShell>
    );
  }

  if (error || !order) {
    return (
      <CustomerPageShell maxWidth="max-w-5xl">
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
    <CustomerPageShell maxWidth="max-w-6xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/menu')}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Menu
        </button>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Order</p>
          <p className="text-base font-bold text-slate-900">#{order.orderNumber || order.orderId}</p>
        </div>
      </div>

      <div className={`mb-6 rounded-[2rem] border bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.06)] ${isCancelled ? 'border-rose-200' : 'border-slate-200'}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${isCancelled ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {isCancelled ? <XCircle size={30} /> : <CheckCircle2 size={30} />}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{isCancelled ? 'Order cancelled' : 'Order confirmed'}</h1>
              <p className="mt-1 text-sm text-slate-600">
                {isCancelled ? 'This order has been cancelled.' : 'Your order is in the kitchen and we’ll keep the status updated below.'}
              </p>
            </div>
          </div>

          {!isCancelled && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              <Clock size={16} className="mr-2 inline-block text-orange-500" />
              {formatTime(estimatedStart)} - {formatTime(estimatedEnd)}
            </div>
          )}
        </div>
      </div>

      {!isCancelled && (
        <div className="mb-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Live status</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {order.orderStatus === 'ON_HOLD' ? 'On hold' : STATUS_FLOW[statusIndex]?.label || 'Processing'}
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-700">
              <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              Updated
            </div>
          </div>

          <div className="space-y-5">
            {STATUS_FLOW.map((step, index) => {
              const StepIcon = step.icon;
              const isDone = index < statusIndex;
              const isActive = index === statusIndex;

              return (
                <div key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl border bg-white shadow-sm transition-all ${
                        isDone
                          ? 'border-emerald-200 text-emerald-600'
                          : isActive
                            ? 'border-orange-200 text-orange-600 scale-105'
                            : 'border-slate-200 text-slate-400'
                      }`}
                    >
                      <StepIcon size={22} />
                    </div>
                    {index < STATUS_FLOW.length - 1 && (
                      <div className={`mt-2 h-16 w-1 rounded-full ${isDone ? 'bg-emerald-500' : isActive ? 'bg-orange-300' : 'bg-slate-200'}`} />
                    )}
                  </div>
                  <div className="pt-1 pb-6">
                    <p className="text-base font-bold text-slate-900">{step.label}</p>
                    <p className="mt-1 text-sm text-slate-600">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
          <h3 className="mb-5 text-2xl font-bold text-slate-900">Order summary</h3>
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

          <div className="mt-6 rounded-[1.5rem] bg-slate-50 p-5">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span>LKR {Number(order.subtotal || 0).toLocaleString()}</span>
            </div>
            {Number(order.deliveryFee || 0) > 0 && (
              <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                <span>Delivery fee</span>
                <span>LKR {Number(order.deliveryFee || 0).toLocaleString()}</span>
              </div>
            )}
            {Number(order.taxAmount || 0) > 0 && (
              <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                <span>Tax</span>
                <span>LKR {Number(order.taxAmount || 0).toLocaleString()}</span>
              </div>
            )}
            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
              <span className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Total</span>
              <span className="text-3xl font-extrabold text-orange-500">LKR {Number(order.finalTotal || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
            <div className="mb-4 flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                <CreditCard size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-900">Payment</p>
                <p className="text-sm text-slate-500">{order.paymentStatus || 'UNKNOWN'}</p>
              </div>
            </div>
            <div className={`rounded-2xl px-4 py-3 text-center text-sm font-bold ${order.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>
              {order.paymentStatus === 'PAID' ? 'Paid successfully' : 'Awaiting payment'}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
            <h4 className="mb-4 text-lg font-bold text-slate-900">
              {isDelivery ? 'Delivery details' : isQr ? 'Table details' : 'Pickup details'}
            </h4>
            <div className="space-y-4 text-sm text-slate-600">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Contact</p>
                <p className="font-semibold text-slate-900">{order.contactName || 'Customer'}</p>
                <p className="mt-1 flex items-center gap-2"><Phone size={14} /> {order.contactPhone || '-'}</p>
              </div>
              {isDelivery && (
                <div className="border-t border-slate-100 pt-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Address</p>
                  <p>{order.deliveryAddress || '-'}</p>
                </div>
              )}
              {isQr && (
                <div className="border-t border-slate-100 pt-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Table</p>
                  <p className="font-semibold text-orange-500">Table {order.tableId || '-'}</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
            <h4 className="mb-4 text-lg font-bold text-slate-900">Actions</h4>
            <div className="flex flex-col gap-3">
              {isReviewable && (
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-[0.98]"
                >
                  Leave review
                </button>
              )}
              {isCancellable && (
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3.5 text-sm font-bold text-red-600 transition-all hover:bg-red-50 active:scale-[0.98]"
                >
                  Cancel order
                </button>
              )}
              {!isReviewable && !isCancellable && (
                <p className="text-sm text-slate-500">No additional actions available for this order.</p>
              )}
            </div>
          </div>

          {order.branchDetails && (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
              <h4 className="mb-4 text-lg font-bold text-slate-900">Branch</h4>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                  <Home size={22} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{order.branchDetails.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{order.branchDetails.address}</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-500">
                    <p className="flex items-center gap-2"><Phone size={14} /> {order.branchDetails.contactNumber}</p>
                    <p className="flex items-center gap-2"><Mail size={14} /> {order.branchDetails.email}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/96 backdrop-blur-sm shadow-[0_-8px_30px_rgba(15,23,42,0.08)]">
        <div className="mx-auto flex w-full max-w-6xl gap-3 px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 text-base font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-[0.98]"
          >
            <ShoppingBag size={18} />
            View orders
          </button>
          <button
            type="button"
            onClick={() => navigate('/menu')}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 py-4 text-base font-bold text-slate-900 transition-all hover:bg-slate-200 active:scale-[0.98]"
          >
            <ShoppingBag size={18} />
            Continue shopping
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
