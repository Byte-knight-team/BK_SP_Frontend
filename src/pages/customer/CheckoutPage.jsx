import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {ArrowLeft,Banknote,ChevronRight,CreditCard,Gift,Home,Loader2,Lock,Mail,MapPin,Package,Phone,ReceiptText,Tag,User,AlertCircle, } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const CHECKOUT_STORAGE_KEY = 'bk_checkout_state';
const ONLINE_BRANCH = { id: 1, name: 'Branch 01', address: '123 Restaurant St, Colombo' };

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function readCheckoutSeed() {
  const saved = safeParse(localStorage.getItem(CHECKOUT_STORAGE_KEY), {});
  const qrSession = safeParse(localStorage.getItem('qr_session'), {});
  const isQrCustomer = Boolean(qrSession?.sessionId || qrSession?.sessionToken);

  return {
    isQrCustomer,
    orderType: isQrCustomer ? 'QR' : saved.orderType || 'ONLINE_PICKUP',
    paymentMethod: saved.paymentMethod || 'CASH',
    branchId: Number(qrSession?.branchId || saved.branchId || ONLINE_BRANCH.id),
    tableId: qrSession?.tableId || saved.tableId || null,
    contact: {
      username: saved.contact?.username || '',
      email: saved.contact?.email || '',
      phone: saved.contact?.phone || '',
      address: saved.contact?.address || '',
    },
    couponDraft: saved.couponDraft || '',
    appliedCouponCode: saved.appliedCouponCode || '',
    loyaltyDraft: saved.loyaltyDraft || '',
    appliedLoyaltyPoints: Number(saved.appliedLoyaltyPoints || 0),
  };
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, cartCount, clearCart } = useCart();
  const seed = readCheckoutSeed();

  const [isQrCustomer] = useState(seed.isQrCustomer);
  const [orderType, setOrderType] = useState(seed.orderType);
  const [paymentMethod, setPaymentMethod] = useState(seed.paymentMethod);
  const [branchId] = useState(seed.branchId);
  const [tableId] = useState(seed.tableId);
  const [contact, setContact] = useState(seed.contact);
  const [couponDraft, setCouponDraft] = useState(seed.couponDraft);
  const [appliedCouponCode, setAppliedCouponCode] = useState(seed.appliedCouponCode);
  const [loyaltyDraft, setLoyaltyDraft] = useState(seed.loyaltyDraft);
  const [appliedLoyaltyPoints, setAppliedLoyaltyPoints] = useState(seed.appliedLoyaltyPoints);
  const [receipt, setReceipt] = useState(null);

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isCalculating, setIsCalculating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isDelivery = orderType === 'ONLINE_DELIVERY';
  const isPickup = orderType === 'ONLINE_PICKUP';
  const branch = ONLINE_BRANCH;
  const authToken = localStorage.getItem('customer_jwt');

  useEffect(() => {
    if (!authToken) {
      if (isQrCustomer) {
        navigate('/signup/qr?redirect=/checkout', { replace: true });
      } else {
        navigate('/login?redirect=/checkout', { replace: true });
      }
    }
  }, [authToken, isQrCustomer, navigate]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!authToken) {
        return;
      }

      setIsLoadingProfile(true);
      try {
        const res = await fetch(`${API_BASE}/api/v1/customer/profile`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (!res.ok) {
          return;
        }

        const payload = await res.json().catch(() => ({}));
        const profile = payload?.data || payload || {};

        setContact((current) => ({
          username: current.username || profile.username || '',
          email: current.email || profile.email || '',
          phone: current.phone || profile.phone || '',
          address: current.address || profile.address || '',
        }));
      } catch (fetchError) {
        console.error('Failed to load profile', fetchError);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [authToken]);

  useEffect(() => {
    const state = {
      orderType,
      paymentMethod,
      branchId,
      tableId,
      contact,
      couponDraft,
      appliedCouponCode,
      loyaltyDraft,
      appliedLoyaltyPoints,
    };
    localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(state));
  }, [orderType, paymentMethod, branchId, tableId, contact, couponDraft, appliedCouponCode, loyaltyDraft, appliedLoyaltyPoints]);

  const calculateTotals = useCallback(async (overrides = {}) => {
    if (!authToken) {
      throw new Error('Missing customer session.');
    }

    if (cartItems.length === 0) {
      throw new Error('Your cart is empty.');
    }

    const couponCode = Object.prototype.hasOwnProperty.call(overrides, 'couponCode')
      ? overrides.couponCode
      : appliedCouponCode;
    const redeemLoyaltyPoints = Object.prototype.hasOwnProperty.call(overrides, 'redeemLoyaltyPoints')
      ? overrides.redeemLoyaltyPoints
      : appliedLoyaltyPoints;

    const payload = {
      orderType: overrides.orderType || orderType,
      branchId,
      couponCode: couponCode || undefined,
      redeemLoyaltyPoints: redeemLoyaltyPoints || undefined,
      items: cartItems.map((item) => ({
        menuItemId: item.id,
        quantity: item.quantity,
      })),
    };

    const res = await fetch(`${API_BASE}/api/v1/checkout/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    const payloadJson = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(payloadJson?.message || payloadJson?.error || 'Unable to calculate checkout totals.');
    }

    return payloadJson.data;
  }, [authToken, cartItems, orderType, branchId, appliedCouponCode, appliedLoyaltyPoints]);

  useEffect(() => {
    let active = true;

    const refreshReceipt = async () => {
      if (!authToken || cartItems.length === 0 || isLoadingProfile) {
        setReceipt(null);
        setIsCalculating(false);
        return;
      }

      setIsCalculating(true);
      try {
        const nextReceipt = await calculateTotals();
        if (!active) {
          return;
        }
        setReceipt(nextReceipt);
        setError('');
      } catch (calcError) {
        if (active) {
          setError(calcError.message || 'Unable to calculate checkout totals.');
        }
      } finally {
        if (active) {
          setIsCalculating(false);
        }
      }
    };

    refreshReceipt();

    return () => {
      active = false;
    };
  }, [authToken, cartItems, orderType, branchId, appliedCouponCode, appliedLoyaltyPoints, isLoadingProfile]);

  // maxRedeemablePoints is now calculated by the backend
  const maxRedeemablePoints = receipt?.maxRedeemablePoints || 0;

  const handleApplyCoupon = async () => {
    const code = couponDraft.trim().toUpperCase();
    if (!code) {
      setError('Enter a coupon code first.');
      return;
    }

    setError('');
    setIsCalculating(true);

    try {
      const nextReceipt = await calculateTotals({ couponCode: code, redeemLoyaltyPoints: appliedLoyaltyPoints });
      setAppliedCouponCode(code);
      setReceipt(nextReceipt);

    } catch (couponError) {
      setError(couponError.message || 'Invalid coupon code.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleClearCoupon = async () => {
    setCouponDraft('');
    setAppliedCouponCode('');
    setError('');
    setIsCalculating(true);

    try {
      const nextReceipt = await calculateTotals({ couponCode: null, redeemLoyaltyPoints: appliedLoyaltyPoints });
      setReceipt(nextReceipt);

    } catch (clearError) {
      setError(clearError.message || 'Unable to refresh totals.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleApplyPoints = async () => {
    const points = Number.parseInt(loyaltyDraft, 10);

    if (!Number.isInteger(points) || points <= 0) {
      setError('Enter a valid loyalty points amount.');
      return;
    }

    if (!receipt) {
      setError('Please wait for totals to load.');
      return;
    }

    if (points < receipt.minPointsToRedeem) {
      setError(`Minimum points required to redeem is ${receipt.minPointsToRedeem}.`);
      return;
    }

    if (points > receipt.availableLoyaltyPoints) {
      setError(`You only have ${receipt.availableLoyaltyPoints} loyalty points available.`);
      return;
    }

    if (maxRedeemablePoints > 0 && points > maxRedeemablePoints) {
      setError(`Maximum redeemable points for this order is ${maxRedeemablePoints}.`);
      return;
    }

    setError('');
    setIsCalculating(true);

    try {
      const nextReceipt = await calculateTotals({ couponCode: appliedCouponCode, redeemLoyaltyPoints: points });
      setAppliedLoyaltyPoints(points);
      setReceipt(nextReceipt);

    } catch (loyaltyError) {
      setError(loyaltyError.message || 'Unable to apply loyalty points.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleClearPoints = async () => {
    setLoyaltyDraft('');
    setAppliedLoyaltyPoints(0);
    setError('');
    setIsCalculating(true);

    try {
      const nextReceipt = await calculateTotals({ couponCode: appliedCouponCode, redeemLoyaltyPoints: null });
      setReceipt(nextReceipt);

    } catch (clearError) {
      setError(clearError.message || 'Unable to refresh totals.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!contact.username.trim()) {
      setError('Username is required.');
      return;
    }

    if (!contact.phone.trim()) {
      setError('Mobile number is required.');
      return;
    }

    if (!isQrCustomer && isDelivery && !contact.address.trim()) {
      setError('Delivery address is required.');
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    if (!receipt) {
      setError('Please wait for totals to load.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const orderModeValue = isQrCustomer ? 'QR' : orderType;
      const payload = {
        orderType: orderModeValue,
        branchId,
        tableId: isQrCustomer ? tableId : null,
        couponCode: appliedCouponCode || undefined,
        redeemLoyaltyPoints: appliedLoyaltyPoints || undefined,
        items: cartItems.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
        })),
        contactName: contact.username.trim(),
        contactPhone: contact.phone.trim(),
        contactEmail: isQrCustomer ? null : contact.email.trim(),
        deliveryAddress: !isQrCustomer && isDelivery ? contact.address.trim() : null,
        kitchenNotes: '',
        paymentMethod,
      };

      const res = await fetch(`${API_BASE}/api/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      const responseJson = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(responseJson?.message || responseJson?.error || 'Failed to place order.');
      }

      const orderData = responseJson?.data || {};
      const confirmationState = {
        orderId: orderData.orderNumber || orderData.orderId,
        orderDate: orderData.createdAt || new Date().toISOString(),
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        subtotal: Number(receipt.subtotal || 0),
        deliveryFee: Number(receipt.deliveryFee || 0),
        tax: Number(receipt.taxAmount || 0) + Number(receipt.serviceCharge || 0),
        total: Number(receipt.finalTotal || 0),
        orderType: isQrCustomer ? 'QR' : (isDelivery ? 'delivery' : 'pickup'),
        fullName: contact.username.trim(),
        phone: contact.phone.trim(),
        address: isQrCustomer ? `Table ${tableId || '-'}` : (isDelivery ? contact.address.trim() : branch.address),
        paymentMethod,
        serverOrder: orderData,
      };

      clearCart();
      localStorage.removeItem(CHECKOUT_STORAGE_KEY);

      if (paymentMethod === 'CARD') {
        navigate('/payment', {
          replace: true,
          state: {
            order: orderData,
            receipt,
            confirmationState,
            contact,
            orderType: confirmationState.orderType,
          },
        });
        return;
      }

      navigate('/order-confirmation', {
        replace: true,
        state: confirmationState,
      });
    } catch (submitError) {
      setError(submitError.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const inputCls = 'w-full rounded-[12px] border border-gray-200 bg-gray-50 px-4 py-3 text-[0.95rem] text-gray-800 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-orange focus:bg-white';
  const selectBtnCls = (active) => `flex h-full flex-col items-center gap-2 rounded-[16px] border-2 px-4 py-5 text-left transition-all duration-300 ${active ? 'border-orange bg-[#FFF7F2]' : 'border-gray-200 bg-white hover:border-gray-300'}`;
  const panelCls = 'rounded-[18px] border border-gray-200 bg-white p-6 shadow-sm max-md:p-5';

  const summaryTotal = receipt ? Number(receipt.finalTotal || 0) : 0;
  const loyaltyHint = receipt && receipt.availableLoyaltyPoints > 0 && receipt.minPointsToRedeem > 0
    ? `Balance ${receipt.availableLoyaltyPoints} pts. Minimum ${receipt.minPointsToRedeem}.`
    : receipt && receipt.availableLoyaltyPoints > 0
      ? `Balance ${receipt.availableLoyaltyPoints} pts.`
      : 'No loyalty points available for this account.';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f7f4] to-[#f2efe9]">
      <header className="sticky top-0 z-[100] border-b border-black/5 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-[74px] w-full max-w-[1120px] items-center px-6 max-md:px-4">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-800 transition-colors hover:bg-gray-100"
              onClick={() => navigate('/cart')}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="font-heading text-[1.3rem] font-bold leading-[1.15] text-navy">Checkout</h1>
              <p className="text-[0.82rem] text-gray-500">
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
                {receipt ? ` • LKR ${summaryTotal.toLocaleString()}` : ''}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="sticky top-[74px] z-[90] border-b border-black/5 bg-white/95 px-4 py-2 backdrop-blur lg:hidden">
        <div className="mx-auto flex w-full max-w-[1120px] gap-2">
          <button
            type="button"
            onClick={() => scrollToSection('discounts-section')}
            className="flex-1 rounded-[10px] border border-gray-200 bg-white py-2 text-[0.8rem] font-semibold text-gray-700"
          >
            Discounts
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('payment-section')}
            className="flex-1 rounded-[10px] border border-gray-200 bg-white py-2 text-[0.8rem] font-semibold text-gray-700"
          >
            Payment
          </button>
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={isSubmitting || isCalculating || !receipt}
            className="flex-1 rounded-[10px] bg-orange-500 py-2 text-[0.8rem] font-semibold text-white disabled:opacity-70"
          >
            Order
          </button>
        </div>
      </div>

      <main className="mx-auto grid w-full max-w-[1120px] gap-6 px-6 py-6 pb-28 lg:grid-cols-[1.4fr_1fr] lg:pb-6 max-md:px-4">
        <section className="space-y-6">
          {!isQrCustomer && (
            <section className={panelCls}>
              <div className="mb-5 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-light text-orange">
                  <Package size={16} />
                </span>
                <h2 className="font-heading text-[1.05rem] font-bold text-navy">Order Type</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 max-[520px]:grid-cols-1">
                <button type="button" className={selectBtnCls(isDelivery)} onClick={() => setOrderType('ONLINE_DELIVERY')}>
                  <MapPin size={24} className={isDelivery ? 'text-orange' : 'text-gray-500'} />
                  <div>
                    <div className="font-heading text-[0.95rem] font-bold text-navy">Delivery</div>
                  </div>
                </button>

                <button type="button" className={selectBtnCls(isPickup)} onClick={() => setOrderType('ONLINE_PICKUP')}>
                  <Package size={24} className={isPickup ? 'text-orange' : 'text-gray-500'} />
                  <div>
                    <div className="font-heading text-[0.95rem] font-bold text-navy">Pickup</div>
                  </div>
                </button>
              </div>
            </section>
          )}

          <section id="payment-section" className={panelCls}>
            <div className="mb-5 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ECFDF5] text-[#16A34A]">
                <CreditCard size={16} />
              </span>
              <h2 className="font-heading text-[1.05rem] font-bold text-navy">Payment Method</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 max-[520px]:grid-cols-1">
              <button type="button" className={selectBtnCls(paymentMethod === 'CARD')} onClick={() => setPaymentMethod('CARD')}>
                <CreditCard size={24} className={paymentMethod === 'CARD' ? 'text-orange' : 'text-gray-500'} />
                <div>
                  <div className="font-heading text-[0.95rem] font-bold text-navy">Card</div>
                </div>
              </button>

              <button type="button" className={selectBtnCls(paymentMethod === 'CASH')} onClick={() => setPaymentMethod('CASH')}>
                <Banknote size={24} className={paymentMethod === 'CASH' ? 'text-orange' : 'text-gray-500'} />
                <div>
                  <div className="font-heading text-[0.95rem] font-bold text-navy">Cash</div>
                </div>
              </button>
            </div>
          </section>

          <section className={panelCls}>
            <div className="mb-5 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <User size={16} />
              </span>
              <h2 className="font-heading text-[1.05rem] font-bold text-navy">{isQrCustomer ? 'QR Guest Details' : 'Customer Details'}</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[0.85rem] font-semibold text-navy">Username</label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="Enter username"
                  value={contact.username}
                  onChange={(event) => setContact((current) => ({ ...current, username: event.target.value }))}
                />
              </div>

              {!isQrCustomer && (
                <div>
                  <label className="mb-2 block text-[0.85rem] font-semibold text-navy">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      className={`${inputCls} pl-10`}
                      placeholder="your@email.com"
                      value={contact.email}
                      onChange={(event) => setContact((current) => ({ ...current, email: event.target.value }))}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-[0.85rem] font-semibold text-navy">Mobile Number</label>
                <div className="relative">
                  <Phone size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    className={`${inputCls} pl-10 ${isQrCustomer ? 'cursor-not-allowed bg-gray-100 text-gray-500' : ''}`}
                    placeholder="077XXXXXXX"
                    value={contact.phone}
                    disabled={isQrCustomer}
                    onChange={(event) => setContact((current) => ({ ...current, phone: event.target.value }))}
                  />
                </div>
                {isQrCustomer && (
                  <p className="mt-2 flex items-center gap-1.5 text-[0.78rem] text-gray-500">
                    <Lock size={12} /> OTP confirmed mobile is locked
                  </p>
                )}
              </div>

              {!isQrCustomer && isDelivery && (
                <div className="md:col-span-2">
                  <label className="mb-2 block text-[0.85rem] font-semibold text-navy">Delivery Address</label>
                  <textarea
                    className={`${inputCls} min-h-[104px] resize-y`}
                    placeholder="Enter your delivery address"
                    value={contact.address}
                    onChange={(event) => setContact((current) => ({ ...current, address: event.target.value }))}
                    rows={4}
                  />
                </div>
              )}

              {!isQrCustomer && isPickup && (
                <div className="md:col-span-2 rounded-[14px] border border-blue-200 bg-blue-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-navy">
                    <Home size={16} />
                    <span className="font-semibold">Pickup Location</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <div className="font-semibold text-navy">{branch.name}</div>
                    <div>{branch.address}</div>
                    <div className="mt-1 text-[0.8rem] text-gray-500">Branch ID {branch.id}</div>
                  </div>
                </div>
              )}

              {isQrCustomer && (
                <div className="md:col-span-2 rounded-[14px] border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                  Table ID: {tableId || 'Not assigned'} • Branch ID: {branchId}
                </div>
              )}
            </div>
          </section>

        </section>

        <aside className="space-y-6">
          <section id="discounts-section" className={panelCls}>
            <div className="mb-5 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF4E8] text-[#EA580C]">
                <ReceiptText size={16} />
              </span>
              <h2 className="font-heading text-[1.05rem] font-bold text-navy">Discounts & Rewards</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-[0.85rem] font-semibold text-navy">Coupon Code</label>
                <div className="flex gap-2 max-md:flex-col">
                  <input
                    type="text"
                    className={`${inputCls} uppercase`}
                    placeholder="ENTER CODE"
                    value={couponDraft}
                    onChange={(event) => setCouponDraft(event.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="rounded-[12px] bg-slate-900 px-5 py-3 text-[0.9rem] font-semibold text-white transition-colors hover:bg-black disabled:opacity-70"
                      disabled={isCalculating || isSubmitting}
                    >
                      Apply
                    </button>
                    {appliedCouponCode && (
                      <button
                        type="button"
                        onClick={handleClearCoupon}
                        className="rounded-[12px] border border-gray-200 bg-white px-4 py-3 text-[0.9rem] font-semibold text-gray-700 transition-colors hover:border-gray-300"
                        disabled={isCalculating || isSubmitting}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {appliedCouponCode && receipt && receipt.couponDiscountAmount > 0 && (
                  <div className="mt-3 rounded-[12px] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                    <div className="flex items-center gap-2 font-semibold">
                      <Tag size={14} /> Applied coupon {appliedCouponCode}
                    </div>
                    <div className="mt-1">Discount: LKR {Number(receipt.couponDiscountAmount || 0).toLocaleString()}</div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-5">
                <label className="mb-1 block text-[0.85rem] font-semibold text-navy">Loyalty Points</label>
                <div className="mb-3 flex flex-wrap items-center gap-2 text-[0.8rem] text-gray-500">
                  <span>{loyaltyHint}</span>
                  {maxRedeemablePoints > 0 && receipt?.availableLoyaltyPoints >= receipt?.minPointsToRedeem && (
                    <span className="rounded-full bg-orange-light px-2.5 py-1 text-orange">Max redeemable now: {maxRedeemablePoints}</span>
                  )}
                </div>

                <div className="flex gap-2 max-md:flex-col">
                  <input
                    type="number"
                    className={`${inputCls} ${receipt && receipt.availableLoyaltyPoints < receipt.minPointsToRedeem ? 'cursor-not-allowed bg-gray-100 text-gray-400' : ''}`}
                    placeholder={receipt && receipt.availableLoyaltyPoints < receipt.minPointsToRedeem ? 'Locked' : 'Amount to redeem'}
                    value={loyaltyDraft}
                    onChange={(event) => setLoyaltyDraft(event.target.value)}
                    disabled={receipt ? receipt.availableLoyaltyPoints < receipt.minPointsToRedeem : false}
                    min={receipt?.minPointsToRedeem || 0}
                    max={receipt?.availableLoyaltyPoints || undefined}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleApplyPoints}
                      className="rounded-[12px] bg-orange-500 px-5 py-3 text-[0.9rem] font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-70"
                      disabled={isCalculating || isSubmitting || (receipt && receipt.availableLoyaltyPoints < receipt.minPointsToRedeem)}
                    >
                      Redeem
                    </button>
                    {appliedLoyaltyPoints > 0 && (
                      <button
                        type="button"
                        onClick={handleClearPoints}
                        className="rounded-[12px] border border-gray-200 bg-white px-4 py-3 text-[0.9rem] font-semibold text-gray-700 transition-colors hover:border-gray-300"
                        disabled={isCalculating || isSubmitting}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {appliedLoyaltyPoints > 0 && receipt && (
                  <div className="mt-3 rounded-[12px] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                    <div className="flex items-center gap-2 font-semibold">
                      <Gift size={14} /> Applied loyalty points: {appliedLoyaltyPoints}
                    </div>
                    <div className="mt-1">Discount: LKR {Number(receipt.loyaltyDiscountAmount || 0).toLocaleString()}</div>
                  </div>
                )}

                {receipt && receipt.availableLoyaltyPoints < receipt.minPointsToRedeem && (
                  <div className="mt-3 flex items-center gap-2 rounded-[12px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <AlertCircle size={16} />
                    Loyalty redemption is locked until the balance reaches {receipt.minPointsToRedeem} points.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-[22px] bg-slate-900 p-6 text-white shadow-[0_16px_30px_rgba(15,23,42,0.14)]">
            <div className="mb-4">
              <div>
                <h3 className="font-heading text-[1.05rem] font-bold">Order Summary</h3>
              </div>
            </div>

            {isCalculating ? (
              <div className="flex justify-center py-8">
                <Loader2 size={26} className="animate-spin text-orange" />
              </div>
            ) : receipt ? (
              <div className="space-y-3 text-[0.88rem]">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>LKR {Number(receipt.subtotal || 0).toLocaleString()}</span>
                </div>

                {receipt.deliveryFee > 0 && (
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Delivery Fee</span>
                    <span>LKR {Number(receipt.deliveryFee || 0).toLocaleString()}</span>
                  </div>
                )}

                {receipt.serviceCharge > 0 && (
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Service Charge</span>
                    <span>LKR {Number(receipt.serviceCharge || 0).toLocaleString()}</span>
                  </div>
                )}

                {receipt.taxAmount > 0 && (
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Tax</span>
                    <span>LKR {Number(receipt.taxAmount || 0).toLocaleString()}</span>
                  </div>
                )}

                {receipt.couponDiscountAmount > 0 && (
                  <div className="flex items-center justify-between text-[#4ADE80]">
                    <span className="flex items-center gap-1.5"><Tag size={14} /> Coupon {receipt.appliedCouponCode}</span>
                    <span>- LKR {Number(receipt.couponDiscountAmount || 0).toLocaleString()}</span>
                  </div>
                )}

                {receipt.loyaltyDiscountAmount > 0 && (
                  <div className="flex items-center justify-between text-[#4ADE80]">
                    <span className="flex items-center gap-1.5"><Gift size={14} /> Loyalty {receipt.loyaltyPointsRedeemed}</span>
                    <span>- LKR {Number(receipt.loyaltyDiscountAmount || 0).toLocaleString()}</span>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-white/15 pt-4 font-heading text-[1.05rem] font-bold">
                  <span>Total</span>
                  <span className="text-[1.15rem] text-orange-400">LKR {Number(receipt.finalTotal || 0).toLocaleString()}</span>
                </div>

                {receipt.loyaltyPointsEarnedThisOrder > 0 && (
                  <div className="rounded-[12px] border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-[0.8rem] text-orange-100">
                    You will earn {receipt.loyaltyPointsEarnedThisOrder} loyalty points from this order.
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-[0.85rem] text-slate-400">
                Waiting for backend pricing.
              </div>
            )}
          </section>

          {error && (
            <section className="rounded-[18px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            </section>
          )}

          <button
            type="button"
            className="hidden w-full items-center justify-center gap-2 rounded-[16px] bg-orange-500 px-5 py-[17px] font-heading text-[1.02rem] font-bold text-white shadow-sm transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70 lg:flex"
            disabled={isSubmitting || isCalculating || !receipt}
            onClick={handlePlaceOrder}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Processing...
              </>
            ) : paymentMethod === 'CARD' ? (
              <>
                Continue to Card Details <ChevronRight size={18} />
              </>
            ) : (
              <>
                Place Order {receipt ? `• LKR ${Number(receipt.finalTotal || 0).toLocaleString()}` : ''} <ChevronRight size={18} />
              </>
            )}
          </button>
        </aside>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-[110] border-t border-black/5 bg-white/95 p-3 backdrop-blur lg:hidden">
        <button
          type="button"
          className="mx-auto flex w-full max-w-[1120px] items-center justify-center gap-2 rounded-[14px] bg-orange-500 px-5 py-3.5 font-heading text-[0.98rem] font-bold text-white shadow-sm transition-colors hover:bg-orange-600 disabled:opacity-70"
          disabled={isSubmitting || isCalculating || !receipt}
          onClick={handlePlaceOrder}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Processing...
            </>
          ) : paymentMethod === 'CARD' ? (
            <>
              Continue to Card Details <ChevronRight size={18} />
            </>
          ) : (
            <>
              Place Order {receipt ? `• LKR ${Number(receipt.finalTotal || 0).toLocaleString()}` : ''} <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}