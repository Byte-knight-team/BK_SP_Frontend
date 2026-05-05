import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, ChevronDown, XCircle, CreditCard, ExternalLink, Loader2, Star, Utensils } from 'lucide-react';
import BrandLogo from '../../components/customer/BrandLogo';
import ReviewModal from '../../components/customer/modal/ReviewModal';
import CancelOrderModal from '../../components/customer/modal/CancelOrderModal';
import CustomerPageShell from '../../components/customer/CustomerPageShell';
import CustomerStateCard from '../../components/customer/CustomerStateCard';
import { cancelCustomerOrder, listCustomerOrders } from '../../apis/customer/orders';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function OrdersPage() {
  const navigate = useNavigate();
  
  // Pagination state: current page, has more pages, loading flags
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [orders, setOrders] = useState([]);
  
  // Filter & UI state
  const [activeTab, setActiveTab] = useState('active');
  const [orderTypeFilter, setOrderTypeFilter] = useState('ALL');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Ref to sentinel element for infinite scroll detection
  const observerTargetRef = useRef(null);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [orderToReview, setOrderToReview] = useState(null);
  
  // Cancellation Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOrdersPage = useCallback(async (nextPage, mode = 'replace') => {
    // Fetch single page of orders
    // mode: 'replace' = new filter/initial load, 'append' = infinite scroll
    
    if (mode === 'replace') {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const res = await listCustomerOrders({
        active: activeTab === 'active',
        type: orderTypeFilter,
        page: nextPage,
        size: PAGE_SIZE,
      });
      
      const json = await res.json().catch(() => ({}));
      const pageData = json?.data || {};
      const nextOrders = Array.isArray(pageData.orders) ? pageData.orders : Array.isArray(json?.data) ? json.data : [];

      if (res.ok) {
        setOrders((currentOrders) => {
          if (mode === 'append') {
            // Append without duplicates
            const knownOrderIds = new Set(currentOrders.map((order) => order.orderId));
            const merged = [...currentOrders];
            nextOrders.forEach((order) => {
              if (!knownOrderIds.has(order.orderId)) {
                merged.push(order);
              }
            });
            return merged;
          }
          return nextOrders;
        });

        // Stop if this is the last page
        const pageLast = typeof pageData.last === 'boolean' ? pageData.last : nextOrders.length < PAGE_SIZE;
        setHasMore(nextOrders.length > 0 && !pageLast);
      } else {
        if (mode === 'replace') {
          setOrders([]);
        }
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      if (mode === 'replace') {
        setOrders([]);
      }
      setHasMore(false);
    } finally {
      if (mode === 'replace') {
        setLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, [activeTab, orderTypeFilter]);

  const refreshOrders = useCallback(() => {
    // Reset pagination and reload first page (called on filter/tab change)
    setOrders([]);
    setExpandedOrder(null);
    setPage(0);
    setHasMore(true);
    fetchOrdersPage(0, 'replace');
  }, [fetchOrdersPage]);

  // Load first page on mount
  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  // When page changes, fetch and append next page
  useEffect(() => {
    if (page === 0) return;
    if (!hasMore) return;
    fetchOrdersPage(page, 'append');
  }, [page, hasMore, fetchOrdersPage]);

  // Infinite scroll: IntersectionObserver on sentinel element
  // When user scrolls near bottom, increment page to fetch next batch
  useEffect(() => {
    const target = observerTargetRef.current;
    if (!target || loading || isLoadingMore || !hasMore) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setPage((currentPage) => currentPage + 1);
        }
      },
      { root: null, rootMargin: '200px 0px', threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loading, isLoadingMore, hasMore]);

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) return;
    setIsCancelling(true);
    try {
      const res = await cancelCustomerOrder(orderToCancel.orderId, cancelReason);
      if (res.ok) {
        // Success: Close modal, clear form, and refresh the list to show the new status
        setCancelModalOpen(false);
        setCancelModalOpen(false);
        setCancelReason('');
        setOrderToCancel(null);
        refreshOrders();
      } else {
        const payload = await res.json().catch(() => ({}));
        alert(payload?.message || payload?.error || 'Failed to cancel order.');
      }
    } catch (err) {
      console.error(err);
      alert(err?.message || 'An error occurred.');
    } finally {
      setIsCancelling(false);
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
    // Default fallback replacing underscores with spaces (e.g., ON_HOLD -> ON HOLD)
    return { label: s.replace(/_/g, ' '), color: 'text-orange-600 bg-orange-50 border-orange-100', icon: Clock };
  };

  const getOrderTypeLabel = (type) => {
    if (type === 'QR') return { label: 'DINE IN', icon: Utensils };
    if (type === 'ONLINE_DELIVERY') return { label: 'DELIVERY', icon: Truck };
    if (type === 'ONLINE_PICKUP') return { label: 'PICKUP', icon: Package };
    return { label: 'ORDER', icon: Package };
  };
  // Defined inside the main component so it has access to parent state (like activeTab)
  const OrderCard = ({ order }) => {
    const config = getStatusBadge(order.orderStatus);
    // Check if this specific card's ID matches the globally
    const StatusIcon = config.icon;
    const isExpanded = expandedOrder === order.orderId;
    const typeInfo = getOrderTypeLabel(order.orderType);
    const TypeIcon = typeInfo.icon;

    // Determines if order is cancellable
    const isCancellable = activeTab === 'active' && ['PLACED', 'PENDING', 'ON_HOLD'].includes(order.orderStatus);

    return (
      <div className="bg-white rounded-3xl p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] mb-5 transition-all hover:shadow-[0_14px_30px_rgba(15,23,42,0.12)]">
        {/* CARD HEADER (Always Visible) */}
        <div 
          className="cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
          onClick={() => setExpandedOrder(isExpanded ? null : order.orderId)}
        >
          {/* Left block: Type, ID, Status, Time */}
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

          {/* Right block: Price, Payment, Expand */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between">
            <div className="text-left md:text-right">
              <p className="text-xl font-extrabold text-slate-900 mb-1">LKR {order.finalTotal?.toLocaleString()}</p>
              <span className={`inline-flex items-center gap-1.5 text-[0.7rem] font-bold px-2 py-0.5 rounded-full ${order.paymentStatus === 'PAID' ? 'text-green-700 bg-green-50 border border-green-200' : 'text-orange-700 bg-orange-50 border border-orange-200'}`}>
                <CreditCard size={12} /> {order.paymentStatus === 'PAID' ? 'PAID' : 'UNPAID'}
              </span>
            </div>
            <div className="ml-4 md:ml-0 md:mt-3 bg-slate-50 p-1.5 rounded-full text-slate-400">
              {/* Rotate the arrow 180 degrees if the card is expanded */}
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
            {/* Cancellation Reason (Only shows if the order was cancelled) */}
            {order.cancellationReason && (
              <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-xl">
                <span className="block text-xs font-bold text-red-800 uppercase tracking-wider mb-1">Cancellation Reason</span>
                <span className="text-sm text-red-600 font-medium">{order.cancellationReason}</span>
              </div>
            )}
            {/* Action Buttons Container */}
            <div className="flex gap-3 flex-wrap">
              {/* Universal Track Details Button */}
              <button 
                onClick={(e) => { e.stopPropagation(); navigate('/order-confirmation', { state: { orderId: order.orderId } }); }}
                className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-colors"
              >
                <ExternalLink size={16} /> Track Details
              </button>
              {/* Conditional Leave Review Button */}
              {activeTab === 'previous' && order.orderStatus === 'SERVED' && !order.isReviewed && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setOrderToReview(order); setReviewModalOpen(true); }}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-bold shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-colors"
                >
                  <Star size={16} /> Leave Review
                </button>
              )}
              {/* Conditional Cancel Order Button */}
              {isCancellable && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setOrderToCancel(order); setCancelModalOpen(true); }}
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
  // MAIN PAGE
  return (
    <CustomerPageShell maxWidth="max-w-4xl">
      <div className="mx-auto w-full max-w-[700px]">
        {/* Back Button */}
        <button
          onClick={() => navigate('/menu')}
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-700 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={16} /> Back to Menu
        </button>

        {/* Top Card: Branding & Filters */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_14px_30px_rgba(15,23,42,0.06)] mb-6">
          {/* Orange Header with Logo */}
          <div className="bg-orange-500 px-6 py-8 text-center text-white flex flex-col items-center">
            <BrandLogo />
            <h1 className="mt-3 text-3xl font-bold">My Orders</h1>
          </div>

          {/* Tab & Filters Container */}
          <div className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center bg-white">
          <div className="flex w-full md:w-auto bg-slate-50 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 md:w-[140px] py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === 'active' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab('previous')}
              className={`flex-1 md:w-[140px] py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === 'previous' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              History
            </button>
          </div>
          {/* Order Type Chips */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 px-2 md:px-0">
            {[
              { id: 'ALL', label: 'All Types' },
              { id: 'QR', label: 'Dine-In' },
              { id: 'ONLINE_DELIVERY', label: 'Delivery' },
              { id: 'ONLINE_PICKUP', label: 'Pickup' }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setOrderTypeFilter(type.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  orderTypeFilter === type.id 
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

        {/* ORDER LISTING (Loading vs Data vs Empty State) */}
        {loading ? (
          <CustomerStateCard
            variant="loading"
            title="Loading your orders"
            description="We’re building your order timeline and status cards."
            className="mx-auto max-w-2xl"
          />
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map(order => (
              <OrderCard key={order.orderId} order={order} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center shadow-[0_14px_30px_rgba(15,23,42,0.06)] flex flex-col items-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
              <Package size={32} className="text-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Orders Found</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">
              {activeTab === 'active'
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
      
      {cancelModalOpen && orderToCancel && (
        <CancelOrderModal
          order={orderToCancel}
          cancelReason={cancelReason}
          onCancelReasonChange={setCancelReason}
          onClose={() => {
            setCancelModalOpen(false);
            setCancelReason('');
            setOrderToCancel(null);
          }}
          onConfirm={handleCancelOrder}
          isSubmitting={isCancelling}
        />
      )}

      {/* Review Modal */}
      {reviewModalOpen && orderToReview && (
        <ReviewModal
          order={orderToReview}
          onClose={() => { setReviewModalOpen(false); setOrderToReview(null); }}
          onSuccess={() => {
            setReviewModalOpen(false);
            setOrderToReview(null);
            refreshOrders();
          }}
        />
      )}

      {/*
          INFINITE SCROLL SENTINEL ELEMENT
          This invisible element is placed at the bottom of the orders list.
          The IntersectionObserver watches this element and triggers
          the next page fetch when it becomes visible in the viewport.
          
          Only render if we have orders.
      */}
      {orders.length > 0 && (
        <div ref={observerTargetRef} className="h-1 w-full" aria-hidden="true" />
      )}

      {/* LOADING MORE INDICATOR
          Shows while fetching the next page.
          Displays at the bottom with a spinner to indicate more orders are loading.
      */}
      {isLoadingMore && (
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
          <Loader2 size={16} className="animate-spin text-orange-500" />
          Loading more orders...
        </div>
      )}

      {orders.length > 0 && !hasMore && (
        <div className="mt-6 text-center text-xs font-bold tracking-[0.3em] text-slate-400">
          END OF LIST
        </div>
      )}
    </CustomerPageShell>
  );
}
