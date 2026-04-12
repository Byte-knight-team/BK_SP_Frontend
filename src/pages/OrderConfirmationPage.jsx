import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, MessageSquare, Clock, MapPin, Home, CheckCircle2, ChefHat, Truck, CircleCheckBig,
} from 'lucide-react';

const PROGRESS_STEPS = [
  { key: 'confirmed', icon: CheckCircle2, title: 'Order Confirmed', desc: 'Your order has been confirmed and sent to the kitchen' },
  { key: 'preparing', icon: ChefHat, title: 'Preparing Your Food', desc: 'Our chefs are preparing your delicious meal' },
  { key: 'delivery', icon: Truck, title: 'Out for Delivery', desc: 'Your order is on its way to you' },
  { key: 'delivered', icon: CircleCheckBig, title: 'Delivered', desc: 'Your order has been delivered' },
];

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state || {};
  const {
    orderId = '229714', orderDate = new Date().toLocaleString(), items = [],
    subtotal = 0, deliveryFee = 0, tax = 0, total = 0,
    orderType = 'delivery', fullName = '', phone = '', address = '', paymentMethod = 'pay-now',
  } = order;

  const currentStep = 0;
  const estimatedStart = new Date(); estimatedStart.setMinutes(estimatedStart.getMinutes() + 15);
  const estimatedEnd = new Date(); estimatedEnd.setMinutes(estimatedEnd.getMinutes() + 35);
  const fmt = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 h-[72px] bg-white border-b border-gray-200 sticky top-0 z-[100] max-md:px-4">
        <div className="flex items-center gap-3.5">
          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-800 transition-colors duration-300 hover:bg-gray-200" onClick={() => navigate('/menu')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-heading text-[1.15rem] font-bold text-navy leading-[1.2]">Order #{orderId}</h1>
            <span className="text-[0.78rem] text-gray-500">{orderDate}</span>
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-transparent text-orange text-[0.88rem] font-semibold transition-colors duration-300 hover:bg-orange-light">
          <MessageSquare size={16} /> Help
        </button>
      </header>

      <div className="flex-1 py-5 px-6 pb-8 max-w-[720px] w-full mx-auto max-md:px-4 max-md:py-4">
        {/* Status Banner */}
        <div className="bg-gradient-to-br from-orange to-[#FF8F40] rounded-[18px] p-7 text-white mb-4 max-md:p-[22px]">
          <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-bold tracking-[1px] uppercase mb-2">
            <span className="w-2 h-2 rounded-full bg-[#4ADE80] inline-block animate-ocp-pulse" /> LIVE TRACKING
          </span>
          <h2 className="font-heading text-[2rem] font-extrabold leading-[1.15] mb-1.5 max-md:text-[1.6rem]">Order Confirmed</h2>
          <p className="text-[0.9rem] opacity-90 mb-5">Your order has been confirmed and sent to the kitchen</p>
          <div className="inline-flex items-center gap-2.5 px-[18px] py-3 bg-black/15 rounded-md">
            <Clock size={16} />
            <div>
              <span className="block text-[0.7rem] opacity-85 mb-0.5">Estimated Time</span>
              <span className="font-heading text-[0.95rem] font-bold">{fmt(estimatedStart)} - {fmt(estimatedEnd)}</span>
            </div>
          </div>
        </div>

        {/* Live Map */}
        {orderType === 'delivery' && (
          <div className="bg-white border border-gray-200 rounded-[16px] p-6 mb-4 max-md:p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={16} className="text-orange" />
              <h3 className="font-heading text-[1.05rem] font-bold text-navy">Live Delivery Map</h3>
            </div>
            <div className="relative w-full h-[220px] rounded-md bg-gradient-to-b from-[#d4e8f7] to-[#f0e6d6] mb-2.5 overflow-hidden max-[480px]:h-[160px]">
              <div className="absolute top-[35%] left-[30%] w-[42px] h-[42px] rounded-full flex items-center justify-center text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] bg-orange"><Home size={18} /></div>
              <div className="absolute top-[55%] left-[60%] w-[42px] h-[42px] rounded-full flex items-center justify-center text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] bg-orange"><MapPin size={18} /></div>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-[5px] px-3 py-[5px] rounded-full text-[0.72rem] font-semibold text-white bg-[#22C55E]"><Home size={12} /> Restaurant</span>
              <span className="inline-flex items-center gap-[5px] px-3 py-[5px] rounded-full text-[0.72rem] font-semibold text-white bg-orange"><MapPin size={12} /> Destination</span>
              <span className="ml-auto text-[0.75rem] text-gray-400">Interactive Map View</span>
            </div>
          </div>
        )}

        {/* Order Progress */}
        <div className="bg-white border border-gray-200 rounded-[16px] p-6 mb-4 max-md:p-5">
          <h3 className="font-heading text-[1.05rem] font-bold text-navy mb-5">Order Progress</h3>
          <div className="flex flex-col">
            {PROGRESS_STEPS.map((step, i) => {
              const isActive = i === currentStep;
              const isDone = i < currentStep;
              const StepIcon = step.icon;
              return (
                <div className="flex gap-3.5" key={step.key}>
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-[1] ${isActive || isDone ? 'bg-orange text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <StepIcon size={18} />
                    </div>
                    {i < PROGRESS_STEPS.length - 1 && <div className={`w-[3px] flex-1 min-h-[32px] my-1 ${isActive || isDone ? 'bg-orange' : 'bg-gray-200'}`} />}
                  </div>
                  <div className={`pb-6 pt-2 ${i === PROGRESS_STEPS.length - 1 ? 'pb-0' : ''}`}>
                    <span className="block font-heading text-[0.95rem] font-bold text-navy mb-0.5">{step.title}</span>
                    <span className="block text-[0.8rem] text-gray-500 leading-snug">{step.desc}</span>
                    {isActive && (
                      <span className="inline-flex items-center gap-1 mt-1.5 text-[0.78rem] text-gray-500">
                        In <span className="inline-block px-2 py-0.5 rounded-full bg-orange-light text-orange text-[0.7rem] font-semibold">Progress</span> • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white border border-gray-200 rounded-[16px] p-6 mb-4 max-md:p-5">
          <h3 className="font-heading text-[1.05rem] font-bold text-navy mb-4">Order Details</h3>
          <div className="flex flex-col gap-3.5 mb-[18px]">
            {items.map((item) => (
              <div className="flex justify-between items-start" key={item.id}>
                <div className="flex gap-2.5 items-start">
                  <span className="w-2 h-2 rounded-full bg-orange mt-1.5 shrink-0" />
                  <div>
                    <span className="block text-[0.9rem] font-semibold text-navy">{item.name}</span>
                    <span className="block text-[0.78rem] text-gray-500">Qty: {item.quantity}</span>
                  </div>
                </div>
                <span className="font-heading text-[0.95rem] font-bold text-navy whitespace-nowrap">LKR {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-3.5 flex flex-col gap-2">
            <div className="flex justify-between text-[0.85rem] text-gray-500"><span>Subtotal</span><span>LKR {subtotal.toLocaleString()}</span></div>
            {orderType === 'delivery' && <div className="flex justify-between text-[0.85rem] text-gray-500"><span>Delivery Fee</span><span>LKR {deliveryFee.toLocaleString()}</span></div>}
            <div className="flex justify-between text-[0.85rem] text-gray-500"><span>Tax</span><span>LKR {tax.toLocaleString()}</span></div>
            <div className="flex justify-between mt-1.5 pt-2.5 border-t border-gray-200 font-heading text-base font-bold text-navy"><span>Total</span><span className="text-orange text-[1.05rem]">LKR {total.toLocaleString()}</span></div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white border border-gray-200 rounded-[16px] p-6 mb-4 max-md:p-5">
          <h3 className="font-heading text-[1.05rem] font-bold text-navy mb-3.5">{orderType === 'delivery' ? 'Delivery Address' : 'Pickup Location'}</h3>
          <div className="flex gap-3 items-start">
            <div className="w-9 h-9 rounded-full bg-blue-light text-blue flex items-center justify-center shrink-0"><MapPin size={18} /></div>
            <div>
              {orderType === 'delivery' ? (
                <>
                  <span className="block text-[0.85rem] font-semibold text-navy leading-relaxed">{fullName || 'Customer'}</span>
                  <span className="block text-[0.85rem] text-gray-500 leading-relaxed">{address || 'Colombo Western Province'}</span>
                  <span className="block text-[0.85rem] text-gray-500 leading-relaxed">{phone || '1234567890'}</span>
                </>
              ) : (
                <>
                  <span className="block text-[0.85rem] font-semibold text-navy leading-relaxed">Crave House Restaurant - Branch</span>
                  <span className="block text-[0.85rem] text-gray-500 leading-relaxed">BRANCH-001</span>
                  <span className="block text-[0.85rem] text-gray-500 leading-relaxed">{phone || '1234567890'}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Support */}
        <button className="flex items-center justify-center gap-2 w-full py-4 rounded-[14px] bg-blue text-white font-heading text-base font-bold transition-colors duration-300 hover:bg-[#2563EB]">
          <MessageSquare size={18} /> Contact Support
        </button>
      </div>
    </div>
  );
}
