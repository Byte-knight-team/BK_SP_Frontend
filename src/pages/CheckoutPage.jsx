import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Package, Home, CreditCard, Banknote, ChevronRight, Loader2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const API_BASE = 'http://localhost:8080';
const DELIVERY_FEE = 300;
const TAX_RATE = 0.08;
const DEFAULT_BRANCH_ID = 1;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, cartCount, cartTotal, clearCart } = useCart();
  const [orderType, setOrderType] = useState('pickup');
  const [paymentMethod, setPaymentMethod] = useState('pay-now');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const subtotal = cartTotal;
  const deliveryFee = orderType === 'delivery' ? DELIVERY_FEE : 0;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + deliveryFee + tax;

  const inputCls = "w-full py-[13px] px-4 border border-gray-200 rounded-[10px] text-[0.9rem] font-body text-gray-800 bg-gray-50 outline-none transition-all duration-300 ease-smooth placeholder:text-gray-400 focus:border-orange focus:shadow-[0_0_0_3px_rgba(255,107,53,0.1)] focus:bg-white";

  const toggleBtn = (active) => `flex flex-col items-center gap-1.5 py-5 px-3 border-2 rounded-[14px] bg-white cursor-pointer transition-all duration-300 ease-smooth ${active ? 'border-orange bg-[#FFF7F2]' : 'border-gray-200 hover:border-gray-300'}`;

  const handlePlaceOrder = async () => {
    if (!fullName.trim() || !phone.trim()) { setError('Please fill in your name and phone number.'); return; }
    if (orderType === 'delivery' && !address.trim()) { setError('Please enter your delivery address.'); return; }
    if (cartItems.length === 0) { setError('Your cart is empty.'); return; }
    setError(null);
    setIsSubmitting(true);
    try {
      const payload = { customerName: fullName, customerPhone: phone, deliveryAddress: orderType === 'delivery' ? address : null, orderType, paymentMethod, branchId: DEFAULT_BRANCH_ID, items: cartItems.map((item) => ({ menuItemId: item.id, quantity: item.quantity })) };
      const res = await fetch(`${API_BASE}/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) { const errData = await res.json(); throw new Error(errData.error || 'Failed to place order'); }
      const data = await res.json();
      clearCart();
      navigate('/order-confirmation', { state: { orderId: data.orderNumber, orderDate: data.createdAt, items: cartItems, subtotal, deliveryFee, tax, total, orderType, fullName, phone, address, paymentMethod, serverOrder: data } });
    } catch (err) { setError(err.message || 'Something went wrong. Please try again.'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="flex items-center gap-3.5 px-6 h-[72px] bg-white border-b border-gray-200 sticky top-0 z-[100] max-md:px-4">
        <button className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-800 transition-colors duration-300 ease-smooth hover:bg-gray-200" onClick={() => navigate('/cart')}><ArrowLeft size={20} /></button>
        <div>
          <h1 className="font-heading text-[1.25rem] font-bold text-navy leading-[1.2]">Checkout</h1>
          <span className="text-[0.82rem] text-gray-500">{cartCount} {cartCount === 1 ? 'item' : 'items'} • LKR {total.toLocaleString()}</span>
        </div>
      </header>

      <div className="flex-1 py-5 px-6 pb-8 max-w-[720px] w-full mx-auto max-md:px-4 max-md:py-4">
        {/* Order Type */}
        <div className="bg-white border border-gray-200 rounded-[16px] p-6 mb-4 max-md:p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-orange-light text-orange"><Package size={16} /></span>
            <h2 className="font-heading text-[1.05rem] font-bold text-navy">Order Type</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 max-[480px]:grid-cols-1">
            <button className={toggleBtn(orderType === 'delivery')} onClick={() => setOrderType('delivery')}>
              <MapPin size={24} className={orderType === 'delivery' ? 'text-orange' : 'text-gray-500'} />
              <span className="font-heading text-[0.95rem] font-bold text-navy">Delivery</span>
              <span className="text-[0.75rem] text-gray-500">30-40 mins • LKR{DELIVERY_FEE}</span>
            </button>
            <button className={toggleBtn(orderType === 'pickup')} onClick={() => setOrderType('pickup')}>
              <Package size={24} className={orderType === 'pickup' ? 'text-orange' : 'text-gray-500'} />
              <span className="font-heading text-[0.95rem] font-bold text-navy">Pickup</span>
              <span className="text-[0.75rem] text-gray-500">15-20 mins • Free</span>
            </button>
          </div>
        </div>

        {/* Your Details */}
        <div className="bg-white border border-gray-200 rounded-[16px] p-6 mb-4 max-md:p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-blue-light text-blue"><Home size={16} /></span>
            <h2 className="font-heading text-[1.05rem] font-bold text-navy">Your Details</h2>
          </div>
          <label className="block text-[0.85rem] font-semibold text-navy mb-2">Full Name</label>
          <input type="text" className={inputCls} placeholder="Enter your name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <label className="block text-[0.85rem] font-semibold text-navy mb-2 mt-4">Phone Number</label>
          <input type="tel" className={inputCls} placeholder="1234567890" value={phone} onChange={(e) => setPhone(e.target.value)} />
          {orderType === 'delivery' ? (
            <>
              <label className="block text-[0.85rem] font-semibold text-navy mb-2 mt-4">Delivery Address</label>
              <textarea className={`${inputCls} resize-y min-h-[90px]`} placeholder="Enter your delivery address" value={address} onChange={(e) => setAddress(e.target.value)} rows={3} />
            </>
          ) : (
            <>
              <div className="flex gap-3 p-4 border-2 border-blue rounded-md bg-blue-light mt-4">
                <div className="w-9 h-9 rounded-full bg-blue text-white flex items-center justify-center shrink-0"><MapPin size={18} /></div>
                <div>
                  <span className="block font-heading text-[0.9rem] font-bold text-navy mb-0.5">Pickup Location</span>
                  <span className="block text-[0.82rem] text-gray-500 leading-snug">Crave House Restaurant - Branch</span>
                  <span className="block text-[0.82rem] text-gray-500 leading-snug">BRANCH-001</span>
                </div>
              </div>
              <p className="text-[0.78rem] text-gray-400 mt-2.5 italic">We'll notify you when ready</p>
            </>
          )}
        </div>

        {/* Payment */}
        <div className="bg-white border border-gray-200 rounded-[16px] p-6 mb-4 max-md:p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[#ECFDF5] text-[#22C55E]"><CreditCard size={16} /></span>
            <h2 className="font-heading text-[1.05rem] font-bold text-navy">Payment Method</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 max-[480px]:grid-cols-1">
            <button className={toggleBtn(paymentMethod === 'pay-now')} onClick={() => setPaymentMethod('pay-now')}>
              <CreditCard size={24} className={paymentMethod === 'pay-now' ? 'text-orange' : 'text-gray-500'} />
              <span className="font-heading text-[0.95rem] font-bold text-navy">Pay Now</span>
              <span className="text-[0.75rem] text-gray-500">Card • UPI • Wallet</span>
            </button>
            <button className={toggleBtn(paymentMethod === 'pay-later')} onClick={() => setPaymentMethod('pay-later')}>
              <Banknote size={24} className={paymentMethod === 'pay-later' ? 'text-orange' : 'text-gray-500'} />
              <span className="font-heading text-[0.95rem] font-bold text-navy">Pay Later</span>
              <span className="text-[0.75rem] text-gray-500">Cash on delivery</span>
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="mb-4 rounded-[16px] bg-slate-900 p-6 text-white shadow-sm">
          <h3 className="font-heading text-[1.05rem] font-bold mb-4">Order Summary</h3>
          <div className="mb-2.5 flex items-center justify-between text-[0.88rem] text-slate-300"><span>Subtotal ({cartCount} items)</span><span>LKR {subtotal.toLocaleString()}</span></div>
          {orderType === 'delivery' && <div className="mb-2.5 flex items-center justify-between text-[0.88rem] text-slate-300"><span>Delivery Fee</span><span>LKR {deliveryFee.toLocaleString()}</span></div>}
          <div className="mb-2.5 flex items-center justify-between text-[0.88rem] text-slate-300"><span>Tax (8%)</span><span>LKR {tax.toLocaleString()}</span></div>
          <div className="mt-3.5 flex items-center justify-between border-t border-white/15 pt-3.5 font-heading text-[1.05rem] font-bold"><span>Total</span><span className="text-[1.15rem] text-orange-400">LKR {total.toLocaleString()}</span></div>
        </div>

        {error && <div className="bg-red-100 text-red-800 py-3 px-4 rounded-[10px] mb-4 text-sm">{error}</div>}

        <button className="mb-3 flex w-full items-center justify-center gap-2 rounded-[14px] bg-orange-500 py-[17px] font-heading text-[1.05rem] font-bold text-white shadow-sm transition-colors duration-300 ease-smooth hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70" disabled={isSubmitting} onClick={handlePlaceOrder}>
          {isSubmitting ? (<>Placing Order… <Loader2 size={18} className="animate-spin-custom" /></>) : (<>Place Order • LKR {total.toLocaleString()} <ChevronRight size={18} /></>)}
        </button>
      </div>
    </div>
  );
}
