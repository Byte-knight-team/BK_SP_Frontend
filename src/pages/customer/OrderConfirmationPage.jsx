import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, MessageSquare, Clock, MapPin, Home, CheckCircle2, ChefHat, Truck, CircleCheckBig, Loader2, XCircle, CreditCard
} from 'lucide-react';
import { getCustomerOrder } from '../../apis/customer/orders';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// PROGRESS STEP CONFIGURATIONS
const PROGRESS_STEPS_DELIVERY = [
  { key: 'placed', statusRegex: /^(PLACED|PENDING)$/, icon: CheckCircle2, title: 'Order Placed', desc: 'Your order has been placed and confirmed' },
  { key: 'preparing', statusRegex: /^(PREPARING|COMPLETED)$/, icon: ChefHat, title: 'Preparing Your Food', desc: 'Our chefs are preparing your delicious meal' },
  { key: 'delivery', statusRegex: /^(OUT_FOR_DELIVERY|ARRIVED)$/, icon: Truck, title: 'Out for Delivery', desc: 'Your order is on its way to you' },
  { key: 'served', statusRegex: /^(SERVED)$/, icon: CircleCheckBig, title: 'Served', desc: 'Your order has been completed' },
];

const PROGRESS_STEPS_PICKUP = [
  { key: 'placed', statusRegex: /^(PLACED|PENDING)$/, icon: CheckCircle2, title: 'Order Placed', desc: 'Your order has been placed and confirmed' },
  { key: 'preparing', statusRegex: /^(PREPARING|COMPLETED)$/, icon: ChefHat, title: 'Preparing Your Food', desc: 'Our chefs are preparing your delicious meal' },
  { key: 'served', statusRegex: /^(SERVED)$/, icon: CircleCheckBig, title: 'Served', desc: 'Your order has been completed' },
];

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // Grab the orderId passed securely from the router state
  const { orderId } = location.state || {};

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // FETCH ORDER DATA
  useEffect(() => {
    if (!orderId) {
      setError('No order session found.');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await getCustomerOrder(orderId);
        const json = await res.json();
        if (res.ok && json.data) {
          setOrder(json.data);
        } else {
          setError(json.message || 'Failed to fetch order details.');
        }
      } catch (err) {
        setError('Something went wrong while fetching order.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  //loadig ui
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 size={36} className="animate-spin text-orange mb-4" />
        <p className="text-gray-500 font-medium">Fetching your order details...</p>
      </div>
    );
  }
  //erro ui
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-100">
          <XCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-navy mb-2">Order Not Found</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button onClick={() => navigate('/orders')} className="bg-orange text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-orange-600 transition">
            Go to My Orders
          </button>
        </div>
      </div>
    );
  }
  //destructure all properties with fallback default values
  const {
    orderId: id, orderNumber, orderDate = order?.createdAt, items = [],
    subtotal = 0, deliveryFee = 0, taxAmount = 0, finalTotal = 0,
    orderType, contactName, contactPhone, deliveryAddress, tableId, orderStatus, paymentStatus
  } = order;

  const normalizedOrderType = String(orderType || '').toUpperCase();
  const isDelivery = normalizedOrderType === 'DELIVERY' || normalizedOrderType === 'ONLINE_DELIVERY';
  const isQr = normalizedOrderType === 'QR';
  const isPickup = normalizedOrderType === 'ONLINE_PICKUP';
  const isCancelled = orderStatus === 'CANCELLED' || orderStatus === 'REJECTED';

  const currentSteps = isDelivery ? PROGRESS_STEPS_DELIVERY : PROGRESS_STEPS_PICKUP;

  let currentStep = 0;
  if (!isCancelled) {
    // Find the index of the step whose regex matches the current backend orderStatus
    const stepIndex = currentSteps.findIndex(step => step.statusRegex.test(orderStatus));
    currentStep = stepIndex !== -1 ? stepIndex : 0;
  }

  // Calculate estimated times
  const estimatedStart = new Date(orderDate || Date.now()); estimatedStart.setMinutes(estimatedStart.getMinutes() + 20);
  const estimatedEnd = new Date(orderDate || Date.now()); estimatedEnd.setMinutes(estimatedEnd.getMinutes() + 40);
  const fmt = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase(); //// Helper to format Date objects into standard 12-hour AM/PM strings

  return (
    <div className="min-h-screen bg-[#f3f1ee] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 h-[72px] bg-white border-b border-gray-200 sticky top-0 z-[100] shadow-sm max-md:px-4">
        <div className="flex items-center gap-3.5">
          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-800 transition-colors hover:bg-gray-200" onClick={() => navigate('/menu')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-heading text-[1.15rem] font-bold text-navy leading-[1.2]">Order #{orderNumber || id}</h1>
            <span className="text-[0.78rem] text-gray-500">{new Date(orderDate).toLocaleString()}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 py-6 px-6 pb-8 max-w-[720px] w-full mx-auto max-md:px-4 max-md:py-4 space-y-4">
        {/* Status Banner */}
        {isCancelled ? (
          <div className="bg-red-600 rounded-[18px] p-7 text-white shadow-md max-md:p-[22px]">
            <h2 className="font-heading text-[2rem] font-extrabold leading-[1.15] mb-1.5 max-md:text-[1.6rem]">Order Cancelled</h2>
            <p className="text-[0.9rem] opacity-90 mb-5">This order has been cancelled.</p>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-orange-600 to-[#FF8F40] rounded-[18px] p-7 text-white shadow-md max-md:p-[22px]">
            <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-bold tracking-[1px] uppercase mb-2">
              <span className="w-2 h-2 rounded-full bg-[#4ADE80] inline-block animate-pulse" /> LIVE TRACKING
            </span>
            <h2 className="font-heading text-[2rem] font-extrabold leading-[1.15] mb-1.5 max-md:text-[1.6rem] capitalize">
              {orderStatus === 'ON_HOLD' ? 'Order On Hold' : currentSteps[currentStep]?.title || 'Tracking...'}
            </h2>
            <p className="text-[0.9rem] opacity-90 mb-5">{orderStatus === 'ON_HOLD' ? 'Your order is temporarily on hold' : currentSteps[currentStep]?.desc}</p>
            <div className="inline-flex items-center gap-2.5 px-[18px] py-3 bg-black/15 rounded-md">
              <Clock size={16} />
              <div>
                <span className="block text-[0.7rem] opacity-85 mb-0.5">Estimated Time</span>
                <span className="font-heading text-[0.95rem] font-bold">{fmt(estimatedStart)} - {fmt(estimatedEnd)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Live Map (Only if Delivery and Not Cancelled) */}
        {/* for now turned it off sice that part yet to build */}
        {null && isDelivery && !isCancelled && (
          <div className="bg-white border border-gray-200 rounded-[16px] p-6 shadow-sm max-md:p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={16} className="text-orange" />
              <h3 className="font-heading text-[1.05rem] font-bold text-navy">Live Delivery Map</h3>
            </div>
            <div className="relative w-full h-[220px] rounded-md bg-gradient-to-b from-[#d4e8f7] to-[#f0e6d6] mb-2.5 overflow-hidden max-[480px]:h-[160px]">
              <div className="absolute top-[35%] left-[30%] w-[42px] h-[42px] rounded-full flex items-center justify-center text-white shadow-lg bg-orange"><Home size={18} /></div>
              <div className="absolute top-[55%] left-[60%] w-[42px] h-[42px] rounded-full flex items-center justify-center text-white shadow-lg bg-orange"><MapPin size={18} /></div>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-[5px] px-3 py-[5px] rounded-full text-[0.72rem] font-semibold text-white bg-[#22C55E]"><Home size={12} /> Restaurant</span>
              <span className="inline-flex items-center gap-[5px] px-3 py-[5px] rounded-full text-[0.72rem] font-semibold text-white bg-orange"><MapPin size={12} /> Destination</span>
              <span className="ml-auto text-[0.75rem] text-gray-400">Interactive Map View</span>
            </div>
          </div>
        )}

        {/* Order Progress (Hidden if Cancelled) */}
        {!isCancelled && (
          <div className="bg-white border border-gray-200 rounded-[16px] p-6 shadow-sm max-md:p-5">
            <h3 className="font-heading text-[1.05rem] font-bold text-navy mb-5">Order Progress</h3>
            <div className="flex flex-col">
              {currentSteps.map((step, i) => {
                const isActive = i === currentStep;
                const isDone = i < currentStep;
                const StepIcon = step.icon;
                return (
                  <div className="flex gap-3.5" key={step.key}>
                    {/* Visual Timeline Bar & Icon */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-[1] transition-colors ${isActive || isDone ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <StepIcon size={18} />
                      </div>
                      {/*Connecting Line*/}
                      {i < currentSteps.length - 1 && <div className={`w-[3px] flex-1 min-h-[32px] my-1 ${isDone ? 'bg-orange-500' : 'bg-gray-200'}`} />}
                    </div>
                    <div className={`pb-6 pt-2 ${i === currentSteps.length - 1 ? 'pb-0' : ''}`}>
                      <span className="block font-heading text-[0.95rem] font-bold text-navy mb-0.5">{step.title}</span>
                      <span className="block text-[0.8rem] text-gray-500 leading-snug">{step.desc}</span>
                      {isActive && orderStatus !== 'ON_HOLD' && (
                        <span className="inline-flex items-center gap-1 mt-1.5 text-[0.78rem] text-gray-500">
                          In <span className="inline-block px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-[0.7rem] font-semibold">Progress</span>
                        </span>
                      )}
                      {isActive && orderStatus === 'ON_HOLD' && (
                        <span className="inline-flex items-center gap-1 mt-1.5 text-[0.78rem] text-gray-500">
                          Status <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 text-[0.7rem] font-semibold">On Hold</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Payment Status Summary */}
        <div className="bg-white border border-gray-200 rounded-[16px] p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${paymentStatus === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
              <CreditCard size={18} />
            </div>
            <div>
              <span className="block font-heading text-[0.95rem] font-bold text-navy">Payment Status</span>
              <span className="block text-[0.8rem] text-gray-500">{paymentStatus === 'PAID' ? 'Successfully paid' : 'Pending payment'}</span>
            </div>
          </div>
          <span className={`px-3 py-1 text-[0.75rem] font-bold rounded-full ${paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
            {paymentStatus}
          </span>
        </div>

        {/* Order Details */}
        <div className="bg-white border border-gray-200 rounded-[16px] p-6 shadow-sm max-md:p-5">
          <h3 className="font-heading text-[1.05rem] font-bold text-navy mb-4">Order Summary</h3>
          <div className="flex flex-col gap-3.5 mb-[18px]">
            {items.map((item, idx) => (
              <div className="flex justify-between items-start" key={idx}>
                <div className="flex gap-2.5 items-start">
                  <span className="w-2 h-2 rounded-full bg-orange mt-1.5 shrink-0" />
                  <div>
                    <span className="block text-[0.9rem] font-semibold text-navy">{item.itemName}</span>
                    <span className="block text-[0.78rem] text-gray-500">Qty: {item.quantity}</span>
                  </div>
                </div>
                <span className="font-heading text-[0.95rem] font-bold text-navy whitespace-nowrap">LKR {item.subtotal?.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-3.5 flex flex-col gap-2">
            <div className="flex justify-between text-[0.85rem] text-gray-500"><span>Subtotal</span><span>LKR {subtotal?.toLocaleString()}</span></div>
            {deliveryFee > 0 && <div className="flex justify-between text-[0.85rem] text-gray-500"><span>Delivery Fee</span><span>LKR {deliveryFee?.toLocaleString()}</span></div>}
            {taxAmount > 0 && <div className="flex justify-between text-[0.85rem] text-gray-500"><span>Tax</span><span>LKR {taxAmount?.toLocaleString()}</span></div>}
            <div className="flex justify-between mt-1.5 pt-2.5 border-t border-gray-200 font-heading text-base font-bold text-navy"><span>Total</span><span className="text-orange text-[1.05rem]">LKR {finalTotal?.toLocaleString()}</span></div>
          </div>
        </div>

        {/* Address & Contact */}
        <div className="bg-white border border-gray-200 rounded-[16px] p-6 shadow-sm max-md:p-5">
          <h3 className="font-heading text-[1.05rem] font-bold text-navy mb-3.5">
            {isDelivery ? 'Delivery Details' : isQr ? 'Dine-In Details' : 'Customer Details'}
          </h3>
          <div className="flex gap-3 items-start">
            <div className="w-9 h-9 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0"><MapPin size={18} /></div>
            <div>
              {isDelivery ? (
                <>
                  <span className="block text-[0.85rem] font-semibold text-navy leading-relaxed">{contactName || 'Customer'}</span>
                  <span className="block text-[0.85rem] text-gray-500 leading-relaxed">{deliveryAddress}</span>
                  <span className="block text-[0.85rem] text-gray-500 leading-relaxed">{contactPhone}</span>
                </>
              ) : isQr ? (
                <>
                  <span className="block text-[0.85rem] font-semibold text-navy leading-relaxed">Table {tableId || '-'}</span>
                  <span className="block text-[0.85rem] text-gray-500 leading-relaxed">QR order for dine-in</span>
                  <span className="block text-[0.85rem] text-gray-500 leading-relaxed">{contactPhone}</span>
                </>
              ) : (
                <>
                  <span className="block text-[0.85rem] font-semibold text-navy leading-relaxed">{contactName || 'Customer'}</span>
                  <span className="block text-[0.85rem] text-gray-500 leading-relaxed">Store Pickup</span>
                  <span className="block text-[0.85rem] text-gray-500 leading-relaxed">{contactPhone}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Branch Details */}
        {order?.branchDetails && (
          <div className="bg-white border border-gray-200 rounded-[16px] p-6 shadow-sm max-md:p-5 mt-6">
            <h3 className="font-heading text-[1.05rem] font-bold text-navy mb-3.5">
             { isPickup ? 'Pickup Branch' : 'Handling Branch'}
            </h3>
            <div className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0"><Home size={18} /></div>
              <div>
                <span className="block text-[0.85rem] font-semibold text-navy leading-relaxed">{order.branchDetails.name}</span>
                <span className="block text-[0.85rem] text-gray-500 leading-relaxed">{order.branchDetails.address}</span>
                <span className="block text-[0.85rem] text-gray-500 leading-relaxed">
                  {order.branchDetails.contactNumber} • {order.branchDetails.email}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
