import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Package, Home, CreditCard, Banknote, ChevronRight, Loader2, Tag, Gift
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const BRANCHES = [
  { id: 1, name: 'Branch 01', address: '123 Restaurant St, Colombo', code: 'BRANCH-001' }
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, cartCount, clearCart } = useCart();
  
  // 1. Order Configuration
  const [orderType, setOrderType] = useState('ONLINE_PICKUP'); 
  const [paymentMethod, setPaymentMethod] = useState('CASH'); 
  const [selectedBranchId, setSelectedBranchId] = useState(BRANCHES[0].id);
  const [tableId, setTableId] = useState(null);

  // 2. User Contact Details
  const [contact, setContact] = useState({ name: '', phone: '', email: '', address: '' });

  // 3. Modifiers (Coupons & Loyalty)
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loyaltyInput, setLoyaltyInput] = useState('');
  const [appliedPoints, setAppliedPoints] = useState(0);

  // 4. Server-Calculated Receipt
  const [receipt, setReceipt] = useState(null);

  // 5. UI Status
  const [isCalculating, setIsCalculating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // --- 1. SECURITY & INITIALIZATION EFFECT ---
  useEffect(() => {
    const token = localStorage.getItem('customer_jwt'); // Matches your LoginPage
    const qrSessionData = localStorage.getItem('qr_session');

    // AUTH WALL: If no token, kick them out to the correct login screen
    if (!token) {
      if (qrSessionData) {
        navigate('/signup/qr?redirect=/checkout', { replace: true });
      } else {
        navigate('/login?redirect=/checkout', { replace: true });
      }
      return; // Stop execution
    }

    // Check for QR Session (Dine-In)
    if (qrSessionData) {
      setOrderType('DINE_IN');
      try {
        const parsedSession = JSON.parse(qrSessionData);
        if (parsedSession.tableId) setTableId(parsedSession.tableId);
      } catch (e) {
        console.error("Invalid QR session data");
      }
    }

    // Fetch Profile to Auto-Fill
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/customer/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          const profile = json.data || json;
          setContact({
            name: profile.fullName || '',
            phone: profile.phone || '',
            email: profile.email || '',
            address: profile.address || ''
          });
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };
    fetchProfile();
  }, [navigate]);

  // --- 2. THE CALCULATION ENGINE ---
  useEffect(() => {
    const calculateTotals = async () => {
      if (cartItems.length === 0) return;
      setIsCalculating(true);
      setError(null);

      try {
        const token = localStorage.getItem('customer_jwt');
        if (!token) return; // Prevent calculating if token is missing

        const payload = {
          orderType,
          branchId: selectedBranchId,
          couponCode: appliedCoupon,
          redeemLoyaltyPoints: appliedPoints,
          items: cartItems.map(item => ({ menuItemId: item.id, quantity: item.quantity }))
        };

        const res = await fetch(`${API_BASE}/api/v1/checkout/calculate`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        const json = await res.json();
        
        if (!res.ok) {
          setAppliedCoupon(null);
          setAppliedPoints(0);
          throw new Error(json.message || json.error || 'Calculation failed');
        }
        
        setReceipt(json.data); 
      } catch (err) {
        setError(err.message);
      } finally {
        setIsCalculating(false);
      }
    };

    calculateTotals();
  }, [cartItems, orderType, selectedBranchId, appliedCoupon, appliedPoints]);

  // --- 3. ACTION HANDLERS ---
  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    setAppliedCoupon(couponInput.trim());
  };

  const handleApplyPoints = () => {
    const pts = parseInt(loyaltyInput, 10);
    if (isNaN(pts) || pts <= 0) return;
    
    if (receipt && pts < receipt.minPointsToRedeem) {
      setError(`Minimum points to redeem is ${receipt.minPointsToRedeem}`);
      return;
    }
    if (receipt && pts > receipt.availableLoyaltyPoints) {
      setError(`You only have ${receipt.availableLoyaltyPoints} points available.`);
      return;
    }
    setAppliedPoints(pts);
  };

  const handlePlaceOrder = async () => {
    if (!contact.name || !contact.phone) { setError('Name and phone are required.'); return; }
    if (orderType === 'ONLINE_DELIVERY' && !contact.address) { setError('Delivery address is required.'); return; }
    if (cartItems.length === 0) { setError('Your cart is empty.'); return; }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('customer_jwt');
      const payload = {
        orderType,
        branchId: selectedBranchId,
        tableId,
        couponCode: appliedCoupon,
        redeemLoyaltyPoints: appliedPoints,
        items: cartItems.map(item => ({ menuItemId: item.id, quantity: item.quantity })),
        contactName: contact.name,
        contactPhone: contact.phone,
        contactEmail: contact.email,
        deliveryAddress: orderType === 'ONLINE_DELIVERY' ? contact.address : null,
        kitchenNotes: "", 
        paymentMethod
      };

      const res = await fetch(`${API_BASE}/api/v1/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || json.error || 'Failed to place order');

      clearCart();
      
      if (paymentMethod === 'CARD') {
         navigate('/payment', { state: { orderId: json.data.orderId, total: json.data.finalTotal }});
      } else {
         navigate('/order-confirmation', { state: json.data }); 
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 4. UI HELPERS ---
  const inputCls = "w-full py-[13px] px-4 border border-gray-200 rounded-[10px] text-[0.9rem] font-body text-gray-800 bg-gray-50 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-orange focus:bg-white";
  const toggleBtn = (active) => `flex flex-col items-center gap-1.5 py-5 px-3 border-2 rounded-[14px] bg-white cursor-pointer transition-all duration-300 ${active ? 'border-orange bg-[#FFF7F2]' : 'border-gray-200 hover:border-gray-300'}`;
  const isDineIn = orderType === 'DINE_IN';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="flex items-center gap-3.5 px-6 h-[72px] bg-white border-b border-gray-200 sticky top-0 z-[100] max-md:px-4">
        <button className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-800 transition-colors duration-300 hover:bg-gray-200" onClick={() => navigate('/cart')}><ArrowLeft size={20} /></button>
        <div>
          <h1 className="font-heading text-[1.25rem] font-bold text-navy leading-[1.2]">Checkout</h1>
          <span className="text-[0.82rem] text-gray-500">{cartCount} items {receipt ? `• LKR ${receipt.finalTotal.toLocaleString()}` : ''}</span>
        </div>
      </header>

      <div className="flex-1 py-5 px-6 pb-8 max-w-[720px] w-full mx-auto max-md:px-4 max-md:py-4">
        
        {/* Order Type Toggle */}
        {!isDineIn && (
          <div className="bg-white border border-gray-200 rounded-[16px] p-6 mb-4 max-md:p-5">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-orange-light text-orange"><Package size={16} /></span>
              <h2 className="font-heading text-[1.05rem] font-bold text-navy">Order Type</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 max-[480px]:grid-cols-1">
              <button className={toggleBtn(orderType === 'ONLINE_DELIVERY')} onClick={() => setOrderType('ONLINE_DELIVERY')}>
                <MapPin size={24} className={orderType === 'ONLINE_DELIVERY' ? 'text-orange' : 'text-gray-500'} />
                <span className="font-heading text-[0.95rem] font-bold text-navy">Delivery</span>
              </button>
              <button className={toggleBtn(orderType === 'ONLINE_PICKUP')} onClick={() => setOrderType('ONLINE_PICKUP')}>
                <Package size={24} className={orderType === 'ONLINE_PICKUP' ? 'text-orange' : 'text-gray-500'} />
                <span className="font-heading text-[0.95rem] font-bold text-navy">Pickup</span>
              </button>
            </div>
          </div>
        )}

        {/* Contact Details */}
        <div className="bg-white border border-gray-200 rounded-[16px] p-6 mb-4 max-md:p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-blue-light text-blue"><Home size={16} /></span>
            <h2 className="font-heading text-[1.05rem] font-bold text-navy">{isDineIn ? 'Dine-In Details' : 'Your Details'}</h2>
          </div>
          
          <label className="block text-[0.85rem] font-semibold text-navy mb-2">Full Name</label>
          <input type="text" className={inputCls} placeholder="Enter your name" value={contact.name} onChange={(e) => setContact({...contact, name: e.target.value})} />
          
          <label className="block text-[0.85rem] font-semibold text-navy mb-2 mt-4">Phone Number</label>
          <input type="tel" className={`${inputCls} ${isDineIn ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`} placeholder="077XXXXXXX" value={contact.phone} disabled={isDineIn} onChange={(e) => setContact({...contact, phone: e.target.value})} />
          
          {!isDineIn && (
            <>
              <label className="block text-[0.85rem] font-semibold text-navy mb-2 mt-4">Email Address</label>
              <input type="email" className={inputCls} placeholder="your@email.com" value={contact.email} onChange={(e) => setContact({...contact, email: e.target.value})} />
              
              {orderType === 'ONLINE_DELIVERY' ? (
                <>
                  <label className="block text-[0.85rem] font-semibold text-navy mb-2 mt-4">Delivery Address</label>
                  <textarea className={`${inputCls} resize-y min-h-[90px]`} placeholder="Enter your delivery address" value={contact.address} onChange={(e) => setContact({...contact, address: e.target.value})} rows={3} />
                </>
              ) : (
                <div className="mt-5 p-4 border border-blue-200 bg-blue-50 rounded-[10px]">
                  <span className="block text-[0.85rem] font-bold text-navy">Pickup Location:</span>
                  <span className="block text-[0.8rem] text-gray-600 mt-1">{BRANCHES[0].name} - {BRANCHES[0].address}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modifiers: Coupons & Loyalty */}
        <div className="bg-white border border-gray-200 rounded-[16px] p-6 mb-4 max-md:p-5">
           <h2 className="font-heading text-[1.05rem] font-bold text-navy mb-4">Discounts & Rewards</h2>
           
           <div className="mb-4">
             <label className="block text-[0.85rem] font-semibold text-navy mb-2">Promo Code</label>
             <div className="flex gap-2">
               <input type="text" className={`${inputCls} uppercase`} placeholder="ENTER CODE" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} />
               <button onClick={handleApplyCoupon} className="px-5 bg-navy text-white rounded-[10px] font-semibold text-[0.9rem] hover:bg-slate-800 transition-colors">Apply</button>
             </div>
           </div>

           {receipt && receipt.availableLoyaltyPoints > 0 && (
             <div className="pt-4 border-t border-gray-100">
               <label className="block text-[0.85rem] font-semibold text-navy mb-1">Use Loyalty Points</label>
               <span className="block text-[0.75rem] text-gray-500 mb-3">Balance: {receipt.availableLoyaltyPoints} pts (Min {receipt.minPointsToRedeem} to use)</span>
               <div className="flex gap-2">
                 <input type="number" className={inputCls} placeholder="Amount to redeem" value={loyaltyInput} onChange={(e) => setLoyaltyInput(e.target.value)} />
                 <button onClick={handleApplyPoints} className="px-5 bg-orange text-white rounded-[10px] font-semibold text-[0.9rem] hover:bg-orange-600 transition-colors">Redeem</button>
               </div>
             </div>
           )}
        </div>

        {/* Payment */}
        <div className="bg-white border border-gray-200 rounded-[16px] p-6 mb-4 max-md:p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[#ECFDF5] text-[#22C55E]"><CreditCard size={16} /></span>
            <h2 className="font-heading text-[1.05rem] font-bold text-navy">Payment Method</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 max-[480px]:grid-cols-1">
            <button className={toggleBtn(paymentMethod === 'CARD')} onClick={() => setPaymentMethod('CARD')}>
              <CreditCard size={24} className={paymentMethod === 'CARD' ? 'text-orange' : 'text-gray-500'} />
              <span className="font-heading text-[0.95rem] font-bold text-navy">Pay Now</span>
              <span className="text-[0.75rem] text-gray-500">Credit/Debit Card</span>
            </button>
            <button className={toggleBtn(paymentMethod === 'CASH')} onClick={() => setPaymentMethod('CASH')}>
              <Banknote size={24} className={paymentMethod === 'CASH' ? 'text-orange' : 'text-gray-500'} />
              <span className="font-heading text-[0.95rem] font-bold text-navy">Pay Later</span>
              <span className="text-[0.75rem] text-gray-500">{orderType === 'ONLINE_DELIVERY' ? 'Cash on Delivery' : 'Pay at Counter'}</span>
            </button>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 py-3 px-4 rounded-[10px] mb-4 text-[0.85rem] font-semibold">{error}</div>}

        {/* Server-Verified Order Summary */}
        <div className="mb-4 rounded-[16px] bg-slate-900 p-6 text-white shadow-sm">
          <h3 className="font-heading text-[1.05rem] font-bold mb-4">Order Summary</h3>
          
          {isCalculating ? (
            <div className="flex justify-center py-4"><Loader2 className="animate-spin text-orange" size={24}/></div>
          ) : receipt ? (
            <>
              <div className="mb-2.5 flex justify-between text-[0.88rem] text-slate-300">
                <span>Subtotal ({cartCount} items)</span><span>LKR {receipt.subtotal.toLocaleString()}</span>
              </div>
              
              {receipt.deliveryFee > 0 && (
                <div className="mb-2.5 flex justify-between text-[0.88rem] text-slate-300">
                  <span>Delivery Fee</span><span>LKR {receipt.deliveryFee.toLocaleString()}</span>
                </div>
              )}

              {receipt.couponDiscountAmount > 0 && (
                <div className="mb-2.5 flex justify-between text-[0.88rem] text-[#4ADE80]">
                  <span className="flex items-center gap-1.5"><Tag size={14}/> Coupon ({receipt.appliedCouponCode})</span>
                  <span>- LKR {receipt.couponDiscountAmount.toLocaleString()}</span>
                </div>
              )}
              {receipt.loyaltyDiscountAmount > 0 && (
                <div className="mb-2.5 flex justify-between text-[0.88rem] text-[#4ADE80]">
                  <span className="flex items-center gap-1.5"><Gift size={14}/> Points Redeemed ({receipt.loyaltyPointsRedeemed})</span>
                  <span>- LKR {receipt.loyaltyDiscountAmount.toLocaleString()}</span>
                </div>
              )}

              {(receipt.taxAmount > 0 || receipt.serviceCharge > 0) && (
                <div className="mb-2.5 flex justify-between text-[0.88rem] text-slate-300">
                  <span>Taxes & Service</span><span>LKR {(receipt.taxAmount + receipt.serviceCharge).toLocaleString()}</span>
                </div>
              )}
              
              <div className="mt-3.5 flex items-center justify-between border-t border-white/15 pt-3.5 font-heading text-[1.05rem] font-bold">
                <span>Total</span><span className="text-[1.15rem] text-orange-400">LKR {receipt.finalTotal.toLocaleString()}</span>
              </div>

              {receipt.loyaltyPointsEarnedThisOrder > 0 && (
                <div className="mt-3 text-center text-[0.75rem] text-orange-200 bg-orange-500/10 py-1.5 rounded-md">
                  You will earn {receipt.loyaltyPointsEarnedThisOrder} loyalty points from this order!
                </div>
              )}
            </>
          ) : (
             <div className="text-[0.85rem] text-slate-400 text-center py-2">Loading receipt...</div>
          )}
        </div>

        <button 
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-[14px] bg-orange-500 py-[17px] font-heading text-[1.05rem] font-bold text-white shadow-sm transition-colors duration-300 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70" 
          disabled={isSubmitting || isCalculating || !receipt} 
          onClick={handlePlaceOrder}
        >
          {isSubmitting ? (
             <><Loader2 size={18} className="animate-spin" /> Processing...</>
          ) : (
             <>Place Order {receipt && `• LKR ${receipt.finalTotal.toLocaleString()}`} <ChevronRight size={18} /></>
          )}
        </button>
      </div>
    </div>
  );
}