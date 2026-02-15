import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Package,
  Home,
  CreditCard,
  Banknote,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const API_BASE = 'http://localhost:8080';
const DELIVERY_FEE = 300;
const TAX_RATE = 0.08;
const DEFAULT_BRANCH_ID = 1; // seeded main branch

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

  return (
    <div className="checkout-page">
      {/* ───── Header ───── */}
      <header className="checkout-header">
        <button className="checkout-header__back" onClick={() => navigate('/cart')}>
          <ArrowLeft size={20} />
        </button>
        <div className="checkout-header__text">
          <h1 className="checkout-header__title">Checkout</h1>
          <span className="checkout-header__count">
            {cartCount} {cartCount === 1 ? 'item' : 'items'} • LKR {total.toLocaleString()}
          </span>
        </div>
      </header>

      <div className="checkout-body">
        {/* ───── Order Type ───── */}
        <div className="checkout-card">
          <div className="checkout-card__heading">
            <span className="checkout-card__icon checkout-card__icon--orange">
              <Package size={16} />
            </span>
            <h2 className="checkout-card__title">Order Type</h2>
          </div>
          <div className="checkout-type-grid">
            <button
              className={`checkout-type${orderType === 'delivery' ? ' checkout-type--active' : ''}`}
              onClick={() => setOrderType('delivery')}
            >
              <MapPin size={24} className="checkout-type__icon" />
              <span className="checkout-type__label">Delivery</span>
              <span className="checkout-type__sub">30-40 mins • LKR{DELIVERY_FEE}</span>
            </button>
            <button
              className={`checkout-type${orderType === 'pickup' ? ' checkout-type--active' : ''}`}
              onClick={() => setOrderType('pickup')}
            >
              <Package size={24} className="checkout-type__icon" />
              <span className="checkout-type__label">Pickup</span>
              <span className="checkout-type__sub">15-20 mins • Free</span>
            </button>
          </div>
        </div>

        {/* ───── Your Details ───── */}
        <div className="checkout-card">
          <div className="checkout-card__heading">
            <span className="checkout-card__icon checkout-card__icon--blue">
              <Home size={16} />
            </span>
            <h2 className="checkout-card__title">Your Details</h2>
          </div>

          <label className="checkout-label">Full Name</label>
          <input
            type="text"
            className="checkout-input"
            placeholder="Enter your name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <label className="checkout-label">Phone Number</label>
          <input
            type="tel"
            className="checkout-input"
            placeholder="1234567890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {orderType === 'delivery' ? (
            <>
              <label className="checkout-label">Delivery Address</label>
              <textarea
                className="checkout-input checkout-textarea"
                placeholder="Enter your delivery address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
              />
            </>
          ) : (
            <>
              <div className="checkout-pickup-box">
                <div className="checkout-pickup-box__icon">
                  <MapPin size={18} />
                </div>
                <div>
                  <span className="checkout-pickup-box__heading">Pickup Location</span>
                  <span className="checkout-pickup-box__text">
                    Crave House Restaurant - Branch
                  </span>
                  <span className="checkout-pickup-box__text">BRANCH-001</span>
                </div>
              </div>
              <p className="checkout-pickup-note">We'll notify you when ready</p>
            </>
          )}
        </div>

        {/* ───── Payment Method ───── */}
        <div className="checkout-card">
          <div className="checkout-card__heading">
            <span className="checkout-card__icon checkout-card__icon--green">
              <CreditCard size={16} />
            </span>
            <h2 className="checkout-card__title">Payment Method</h2>
          </div>
          <div className="checkout-type-grid">
            <button
              className={`checkout-type${paymentMethod === 'pay-now' ? ' checkout-type--active' : ''}`}
              onClick={() => setPaymentMethod('pay-now')}
            >
              <CreditCard size={24} className="checkout-type__icon" />
              <span className="checkout-type__label">Pay Now</span>
              <span className="checkout-type__sub">Card • UPI • Wallet</span>
            </button>
            <button
              className={`checkout-type${paymentMethod === 'pay-later' ? ' checkout-type--active' : ''}`}
              onClick={() => setPaymentMethod('pay-later')}
            >
              <Banknote size={24} className="checkout-type__icon" />
              <span className="checkout-type__label">Pay Later</span>
              <span className="checkout-type__sub">Cash on delivery</span>
            </button>
          </div>
        </div>

        {/* ───── Order Summary ───── */}
        <div className="checkout-summary">
          <h3 className="checkout-summary__title">Order Summary</h3>
          <div className="checkout-summary__row">
            <span>Subtotal ({cartCount} items)</span>
            <span>LKR {subtotal.toLocaleString()}</span>
          </div>
          {orderType === 'delivery' && (
            <div className="checkout-summary__row">
              <span>Delivery Fee</span>
              <span>LKR {deliveryFee.toLocaleString()}</span>
            </div>
          )}
          <div className="checkout-summary__row">
            <span>Tax (8%)</span>
            <span>LKR {tax.toLocaleString()}</span>
          </div>
          <div className="checkout-summary__total">
            <span>Total</span>
            <span className="checkout-summary__total-value">LKR {total.toLocaleString()}</span>
          </div>
        </div>

        {/* ───── Error Message ───── */}
        {error && (
          <div style={{
            background: '#FEE2E2', color: '#991B1B', padding: '12px 16px',
            borderRadius: '10px', marginBottom: '16px', fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* ───── Place Order ───── */}
        <button
          className="checkout-place-btn"
          disabled={isSubmitting}
          onClick={async () => {
            // Validate required fields
            if (!fullName.trim() || !phone.trim()) {
              setError('Please fill in your name and phone number.');
              return;
            }
            if (orderType === 'delivery' && !address.trim()) {
              setError('Please enter your delivery address.');
              return;
            }
            if (cartItems.length === 0) {
              setError('Your cart is empty.');
              return;
            }

            setError(null);
            setIsSubmitting(true);

            try {
              // Build the request payload matching CreateOrderRequest.java
              const payload = {
                customerName: fullName,
                customerPhone: phone,
                deliveryAddress: orderType === 'delivery' ? address : null,
                orderType,
                paymentMethod,
                branchId: DEFAULT_BRANCH_ID,
                items: cartItems.map((item) => ({
                  menuItemId: item.id,
                  quantity: item.quantity,
                })),
              };

              const res = await fetch(`${API_BASE}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              });

              if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to place order');
              }

              const data = await res.json();

              // Clear the cart after successful order
              clearCart();

              // Navigate to confirmation with server response data
              navigate('/order-confirmation', {
                state: {
                  orderId: data.orderNumber,
                  orderDate: data.createdAt,
                  items: cartItems,
                  subtotal,
                  deliveryFee,
                  tax,
                  total,
                  orderType,
                  fullName,
                  phone,
                  address,
                  paymentMethod,
                  serverOrder: data, // full server response for future use
                },
              });
            } catch (err) {
              setError(err.message || 'Something went wrong. Please try again.');
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          {isSubmitting ? (
            <>Placing Order… <Loader2 size={18} className="spin" /></>
          ) : (
            <>Place Order • LKR {total.toLocaleString()} <ChevronRight size={18} /></>
          )}
        </button>
      </div>
    </div>
  );
}
