import { useEffect, useRef, useCallback, useReducer } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, ChevronDown, XCircle, CreditCard, ExternalLink, Loader2, Star, Utensils } from 'lucide-react';
import BrandLogo from '../../components/customer/BrandLogo';
import ReviewModal from '../../components/customer/modal/ReviewModal';
import CancelOrderModal from '../../components/customer/modal/CancelOrderModal';
import CustomerPageShell from '../../components/customer/CustomerPageShell';
import CustomerStateCard from '../../components/customer/CustomerStateCard';
import { cancelCustomerOrder, listCustomerOrders } from '../../apis/customer/orders';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const PAGE_SIZE = 10;

// Centralized state using useReducer
const initialState = {
  page: 0,
  hasMore: true,
  isLoadingMore: false,
  orders: [],
  activeTab: 'active',
  orderTypeFilter: 'ALL',
  expandedOrder: null,
  loading: true,
  reviewModalOpen: false,
  orderToReview: null,
  cancelModalOpen: false,
  orderToCancel: null,
  cancelReason: '',
  isCancelling: false,
};

function ordersReducer(state, action) {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.payload, page: 0, hasMore: true, orders: [], expandedOrder: null };
    case 'SET_FILTER':
      return { ...state, orderTypeFilter: action.payload, page: 0, hasMore: true, orders: [], expandedOrder: null };
    case 'FETCH_START':
      return { ...state, [action.payload.mode === 'replace' ? 'loading' : 'isLoadingMore']: true };
    case 'FETCH_SUCCESS': {
      const { mode, nextOrders, hasMore } = action.payload;
      let merged = nextOrders;
      if (mode === 'append') {
        const knownOrderIds = new Set(state.orders.map((order) => order.orderId));
        merged = [...state.orders];
        nextOrders.forEach((order) => {
          if (!knownOrderIds.has(order.orderId)) merged.push(order);
        });
      }
      return { ...state, orders: merged, hasMore, loading: false, isLoadingMore: false };
    }
    case 'FETCH_ERROR':
      return { ...state, orders: action.payload.mode === 'replace' ? [] : state.orders, hasMore: false, loading: false, isLoadingMore: false };
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    case 'TOGGLE_EXPAND':
      return { ...state, expandedOrder: state.expandedOrder === action.payload ? null : action.payload };
    case 'OPEN_REVIEW_MODAL':
      return { ...state, reviewModalOpen: true, orderToReview: action.payload };
    case 'CLOSE_REVIEW_MODAL':
      return { ...state, reviewModalOpen: false, orderToReview: null };
    case 'OPEN_CANCEL_MODAL':
      return { ...state, cancelModalOpen: true, orderToCancel: action.payload, cancelReason: '' };
    case 'CLOSE_CANCEL_MODAL':
      return { ...state, cancelModalOpen: false, orderToCancel: null, cancelReason: '' };
    case 'SET_CANCEL_REASON':
      return { ...state, cancelReason: action.payload };
    case 'SET_CANCELLING':
      return { ...state, isCancelling: action.payload };
    default:
      return state;
  }
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(ordersReducer, initialState);

  const observerTargetRef = useRef(null);

  const fetchOrdersPage = useCallback(async (nextPage, mode = 'replace') => {
    dispatch({ type: 'FETCH_START', payload: { mode } });

    try {
      const res = await listCustomerOrders({
        active: state.activeTab === 'active',
        type: state.orderTypeFilter,
        page: nextPage,
        size: PAGE_SIZE,
      });
      
      const json = await res.json().catch(() => ({}));
      const pageData = json?.data || {};
      const nextOrders = Array.isArray(pageData.orders) ? pageData.orders : Array.isArray(json?.data) ? json.data : [];

      if (res.ok) {
        const pageLast = typeof pageData.last === 'boolean' ? pageData.last : nextOrders.length < PAGE_SIZE;
        dispatch({ 
          type: 'FETCH_SUCCESS', 
          payload: { mode, nextOrders, hasMore: nextOrders.length > 0 && !pageLast } 
        });
      } else {
        dispatch({ type: 'FETCH_ERROR', payload: { mode } });
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      dispatch({ type: 'FETCH_ERROR', payload: { mode } });
    }
  }, [state.activeTab, state.orderTypeFilter]);

  const refreshOrders = useCallback(() => {
    fetchOrdersPage(0, 'replace');
  }, [fetchOrdersPage]);

  // Load first page on mount
  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  // When page changes, fetch and append next page
  useEffect(() => {
    if (state.page === 0) return;
    if (!state.hasMore) return;
    fetchOrdersPage(state.page, 'append');
  }, [state.page, state.hasMore, fetchOrdersPage]);

  // Infinite scroll: IntersectionObserver on sentinel element
  useEffect(() => {
    const target = observerTargetRef.current;
    if (!target || state.loading || state.isLoadingMore || !state.hasMore) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          dispatch({ type: 'SET_PAGE', payload: state.page + 1 });
        }
      },
      { root: null, rootMargin: '200px 0px', threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [state.loading, state.isLoadingMore, state.hasMore, state.page]);

  const handleCancelOrder = async () => {
    if (!state.cancelReason.trim() || !state.orderToCancel) return;
    dispatch({ type: 'SET_CANCELLING', payload: true });
    
    try {
      const res = await cancelCustomerOrder(state.orderToCancel.orderId, state.cancelReason);
      if (res.ok) {
        dispatch({ type: 'CLOSE_CANCEL_MODAL' });
        refreshOrders();
      } else {
        const payload = await res.json().catch(() => ({}));
        alert(payload?.message || payload?.error || 'Failed to cancel order.');
      }
    } catch (err) {
      console.error(err);
      alert(err?.message || 'An error occurred.');
    } finally {
      dispatch({ type: 'SET_CANCELLING', payload: false });
    }
  };

  // UI HELPER FUNCTIONS
  const getStatusBadge = (status) => {
    const s = status || 'UNKNOWN';
    if (s === 'CANCELLED' || s === 'REJECTED') return { label: 'Cancelled', color: 'text-red-600 bg-red-50 border-red-100', icon: XCircle };
    if (s === 'COMPLETED') return { label: 'Prepared', color: 'text-green-600 bg-green-50 border-green-100', icon: CheckCircle };
    if (s === 'SERVED') return { label: 'Served', color: 'text-green-600 bg-green-50 border-green-100', icon: CheckCircle };
    if (s === 'APPROVED') return { label: 'Confirmed', color: 'text-orange-600 bg-orange-50 border-orange-100', icon: Clock };
    if (s === 'OUT_FOR_DELIVERY') return { label: 'Out for Delivery', color: 'text-orange-600 bg-orange-50 border-orange-100', icon: Truck };
    // Default fallback replacing underscores with spaces
    return { label: s.replace(/_/g, ' '), color: 'text-orange-600 bg-orange-50 border-orange-100', icon: Clock };
  };

  const getOrderTypeLabel = (type) => {
    if (type === 'QR') return { label: 'DINE IN', icon: Utensils };
    if (type === 'ONLINE_DELIVERY') return { label: 'DELIVERY', icon: Truck };
    if (type === 'ONLINE_PICKUP') return { label: 'PICKUP', icon: Package };
    return { label: 'ORDER', icon: Package };
  };

  const OrderCard = ({ order }) => {
    const config = getStatusBadge(order.orderStatus);
    const StatusIcon = config.icon;
    const isExpanded = state.expandedOrder === order.orderId;
    const typeInfo = getOrderTypeLabel(order.orderType);
    const TypeIcon = typeInfo.icon;

    const isCancellable = state.activeTab === 'active' && ['PLACED', 'PENDING', 'ON_HOLD'].includes(order.orderStatus);
    const canRetryPayment = isCancellable && order?.paymentMethod === 'CARD' && (order?.paymentStatus === 'PENDING' || order?.paymentStatus === 'FAILED');

    return (
      <div className="bg-white rounded-3xl p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] mb-5 transition-all hover:shadow-[0_14px_30px_rgba(15,23,42,0.12)]">
        {/* CARD HEADER */}
        <div 
          className="cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
          onClick={() => dispatch({ type: 'TOGGLE_EXPAND', payload: order.orderId })}
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 text-white text-[0.65rem] font-bold rounded-md tracking-wider">
                <TypeIcon size={12} /> {typeInfo.label}
              </span>
              <span className={`flex items-center gap-1.5 px-2.5 py-1 border text-[0.65rem] font-bold rounded-md uppercase tracking-wider ${config.color}`}>
                <StatusIcon size={12} /> {config.label}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Order {order.orderNumber || order.orderId}</h3>
            <p className="text-sm text-slate-500 mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between">
            <div className="text-left md:text-right">
              <p className="text-xl font-extrabold text-slate-900 mb-1">LKR {order.finalTotal?.toLocaleString()}</p>
              <span className={`inline-flex items-center gap-1.5 text-[0.7rem] font-bold px-2 py-0.5 rounded-full ${order.paymentStatus === 'PAID' || order.paymentStatus === 'REFUNDED' ? 'text-green-700 bg-green-50 border border-green-200' : order.paymentStatus === 'REFUND_FAILED' ? 'text-blue-700 bg-blue-50 border border-blue-200' : 'text-orange-700 bg-orange-50 border border-orange-200'}`}>
                <CreditCard size={12} /> {order.paymentStatus === 'PAID' ? 'PAID' : order.paymentStatus === 'REFUNDED' ? 'REFUNDED' : order.paymentStatus === 'REFUND_FAILED' ? 'REFUND PROCESSING' : 'UNPAID'}
              </span>
            </div>
            <div className="ml-4 md:ml-0 md:mt-3 bg-slate-50 p-1.5 rounded-full text-slate-400">
              <ChevronDown size={18} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>

        {/* Expanded View */}
        {isExpanded && (
          <div className="mt-5 pt-5 border-t border-slate-100">
            <div className="mb-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Order Items</p>
              <div className="space-y-2">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-700">
                      {item.itemName} <span className="text-slate-400 font-normal ml-1">× {item.quantity}</span>
                    </span>
                    <span className="font-bold text-slate-900">LKR {item.subtotal?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            {order.cancellationReason && (
              <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-xl">
                <span className="block text-xs font-bold text-red-800 uppercase tracking-wider mb-1">Cancellation Reason</span>
                <span className="text-sm text-red-600 font-medium">{order.cancellationReason}</span>
              </div>
            )}
            <div className="flex gap-3 flex-wrap">
              <button 
                onClick={(e) => { e.stopPropagation(); navigate('/order-confirmation', { state: { orderId: order.orderId } }); }}
                className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-colors"
              >
                <ExternalLink size={16} /> Track Details
              </button>
              {canRetryPayment && (
                <button 
                  onClick={(e) => { e.stopPropagation(); navigate('/payment', { state: { orderId: order.orderId, finalAmount: order.finalTotal, returnUrl: '/orders' } }); }}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-bold shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-colors"
                >
                  <CreditCard size={16} /> Pay Now
                </button>
              )}
              {state.activeTab === 'previous' && order.orderStatus === 'SERVED' && !order.isReviewed && (
                <button 
                  onClick={(e) => { e.stopPropagation(); dispatch({ type: 'OPEN_REVIEW_MODAL', payload: order }); }}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-bold shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-colors"
                >
                  <Star size={16} /> Leave Review
                </button>
              )}
              {isCancellable && (
                <button 
                  onClick={(e) => { e.stopPropagation(); dispatch({ type: 'OPEN_CANCEL_MODAL', payload: order }); }}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-white border-2 border-red-100 text-red-600 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors"
                >
                  <XCircle size={16} /> Cancel Order
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <CustomerPageShell maxWidth="max-w-4xl">
      <div className="mx-auto w-full max-w-[700px]">
        <button
          onClick={() => navigate('/menu')}
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-700 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={16} /> Back to Menu
        </button>

        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_14px_30px_rgba(15,23,42,0.06)] mb-6">
          <div className="bg-orange-500 px-6 py-8 text-center text-white flex flex-col items-center">
            <BrandLogo />
            <h1 className="mt-3 text-3xl font-bold">My Orders</h1>
          </div>

          <div className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center bg-white">
          <div className="flex w-full md:w-auto bg-slate-50 rounded-xl p-1">
            <button
              onClick={() => dispatch({ type: 'SET_TAB', payload: 'active' })}
              className={`flex-1 md:w-[140px] py-2.5 text-sm font-bold rounded-lg transition-all ${
                state.activeTab === 'active' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_TAB', payload: 'previous' })}
              className={`flex-1 md:w-[140px] py-2.5 text-sm font-bold rounded-lg transition-all ${
                state.activeTab === 'previous' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              History
            </button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 px-2 md:px-0">
            {[
              { id: 'ALL', label: 'All Types' },
              { id: 'QR', label: 'Dine-In' },
              { id: 'ONLINE_DELIVERY', label: 'Delivery' },
              { id: 'ONLINE_PICKUP', label: 'Pickup' }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => dispatch({ type: 'SET_FILTER', payload: type.id })}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  state.orderTypeFilter === type.id 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
        </div>

        {state.loading ? (
          <CustomerStateCard
            variant="loading"
            title="Loading your orders"
            description="We’re building your order timeline and status cards."
            className="mx-auto max-w-2xl"
          />
        ) : state.orders.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence>
              {state.orders.map((order, idx) => (
                <motion.div
                  key={order.orderId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, delay: Math.min(0.25, idx * 0.10) }}
                  layout
                >
                  <OrderCard order={order} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center shadow-[0_14px_30px_rgba(15,23,42,0.06)] flex flex-col items-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
              <Package size={32} className="text-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Orders Found</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">
              {state.activeTab === 'active'
                ? "You don't have any active orders matching this filter."
                : "You haven't placed any orders matching this filter yet."}
            </p>
            <button
              onClick={() => navigate('/menu')}
              className="bg-orange-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-colors"
            >
              Browse Full Menu
            </button>
          </div>
        )}
      </div>
      
      {state.cancelModalOpen && state.orderToCancel && (
        <CancelOrderModal
          order={state.orderToCancel}
          cancelReason={state.cancelReason}
          onCancelReasonChange={(reason) => dispatch({ type: 'SET_CANCEL_REASON', payload: reason })}
          onClose={() => dispatch({ type: 'CLOSE_CANCEL_MODAL' })}
          onConfirm={handleCancelOrder}
          isSubmitting={state.isCancelling}
        />
      )}

      {state.reviewModalOpen && state.orderToReview && (
        <ReviewModal
          order={state.orderToReview}
          onClose={() => dispatch({ type: 'CLOSE_REVIEW_MODAL' })}
          onSuccess={() => {
            dispatch({ type: 'CLOSE_REVIEW_MODAL' });
            refreshOrders();
          }}
        />
      )}

      {state.orders.length > 0 && (
        <div ref={observerTargetRef} className="h-1 w-full" aria-hidden="true" />
      )}

      {state.isLoadingMore && (
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
          <Loader2 size={16} className="animate-spin text-orange-500" />
          Loading more orders...
        </div>
      )}

      {state.orders.length > 0 && !state.hasMore && (
        <div className="mt-6 text-center text-xs font-bold tracking-[0.3em] text-slate-400">
          END OF LIST
        </div>
      )}
    </CustomerPageShell>
  );
}
