import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  Clock,
  MapPin,
  Home,
  CheckCircle2,
  ChefHat,
  Truck,
  CircleCheckBig,
} from 'lucide-react';

const PROGRESS_STEPS = [
  {
    key: 'confirmed',
    icon: CheckCircle2,
    title: 'Order Confirmed',
    desc: 'Your order has been confirmed and sent to the kitchen',
  },
  {
    key: 'preparing',
    icon: ChefHat,
    title: 'Preparing Your Food',
    desc: 'Our chefs are preparing your delicious meal',
  },
  {
    key: 'delivery',
    icon: Truck,
    title: 'Out for Delivery',
    desc: 'Your order is on its way to you',
  },
  {
    key: 'delivered',
    icon: CircleCheckBig,
    title: 'Delivered',
    desc: 'Your order has been delivered',
  },
];

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state || {};

  const {
    orderId = '229714',
    orderDate = new Date().toLocaleString(),
    items = [],
    subtotal = 0,
    deliveryFee = 0,
    tax = 0,
    total = 0,
    orderType = 'delivery',
    fullName = '',
    phone = '',
    address = '',
    paymentMethod = 'pay-now',
  } = order;

  const currentStep = 0; // 0 = confirmed

  const estimatedStart = new Date();
  estimatedStart.setMinutes(estimatedStart.getMinutes() + 15);
  const estimatedEnd = new Date();
  estimatedEnd.setMinutes(estimatedEnd.getMinutes() + 35);
  const fmt = (d) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();

  return (
    <div className="ocp">
      {/* ───── Header ───── */}
      <header className="ocp-header">
        <div className="ocp-header__left">
          <button className="ocp-header__back" onClick={() => navigate('/menu')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="ocp-header__title">Order #{orderId}</h1>
            <span className="ocp-header__date">{orderDate}</span>
          </div>
        </div>
        <button className="ocp-header__help">
          <MessageSquare size={16} /> Help
        </button>
      </header>

      <div className="ocp-body">
        {/* ───── Status Banner ───── */}
        <div className="ocp-banner">
          <span className="ocp-banner__live">
            <span className="ocp-banner__dot" /> LIVE TRACKING
          </span>
          <h2 className="ocp-banner__title">Order Confirmed</h2>
          <p className="ocp-banner__desc">
            Your order has been confirmed and sent to the kitchen
          </p>
          <div className="ocp-banner__time">
            <Clock size={16} />
            <div>
              <span className="ocp-banner__time-label">Estimated Time</span>
              <span className="ocp-banner__time-value">
                {fmt(estimatedStart)} - {fmt(estimatedEnd)}
              </span>
            </div>
          </div>
        </div>

        {/* ───── Live Map ───── */}
        {orderType === 'delivery' && (
          <div className="ocp-card">
            <div className="ocp-card__heading">
              <MapPin size={16} className="ocp-card__heading-icon--orange" />
              <h3 className="ocp-card__title">Live Delivery Map</h3>
            </div>
            <div className="ocp-map">
              <div className="ocp-map__canvas">
                <div className="ocp-map__pin ocp-map__pin--restaurant">
                  <Home size={18} />
                </div>
                <div className="ocp-map__pin ocp-map__pin--destination">
                  <MapPin size={18} />
                </div>
              </div>
              <div className="ocp-map__legend">
                <span className="ocp-map__legend-item ocp-map__legend-item--restaurant">
                  <Home size={12} /> Restaurant
                </span>
                <span className="ocp-map__legend-item ocp-map__legend-item--destination">
                  <MapPin size={12} /> Destination
                </span>
                <span className="ocp-map__legend-label">Interactive Map View</span>
              </div>
            </div>
          </div>
        )}

        {/* ───── Order Progress ───── */}
        <div className="ocp-card">
          <h3 className="ocp-card__title" style={{ marginBottom: 20 }}>Order Progress</h3>
          <div className="ocp-progress">
            {PROGRESS_STEPS.map((step, i) => {
              const isActive = i === currentStep;
              const isDone = i < currentStep;
              const StepIcon = step.icon;
              return (
                <div
                  className={`ocp-step${isActive ? ' ocp-step--active' : ''}${isDone ? ' ocp-step--done' : ''}`}
                  key={step.key}
                >
                  <div className="ocp-step__indicator">
                    <div className="ocp-step__circle">
                      <StepIcon size={18} />
                    </div>
                    {i < PROGRESS_STEPS.length - 1 && <div className="ocp-step__line" />}
                  </div>
                  <div className="ocp-step__content">
                    <span className="ocp-step__title">{step.title}</span>
                    <span className="ocp-step__desc">{step.desc}</span>
                    {isActive && (
                      <span className="ocp-step__status">
                        In <span className="ocp-step__status-badge">Progress</span> •{' '}
                        {new Date().toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        }).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ───── Order Details ───── */}
        <div className="ocp-card">
          <h3 className="ocp-card__title" style={{ marginBottom: 16 }}>Order Details</h3>
          <div className="ocp-details">
            {items.map((item) => (
              <div className="ocp-details__item" key={item.id}>
                <div className="ocp-details__left">
                  <span className="ocp-details__dot" />
                  <div>
                    <span className="ocp-details__name">{item.name}</span>
                    <span className="ocp-details__qty">Qty: {item.quantity}</span>
                  </div>
                </div>
                <span className="ocp-details__price">
                  LKR {(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="ocp-totals">
            <div className="ocp-totals__row">
              <span>Subtotal</span>
              <span>LKR {subtotal.toLocaleString()}</span>
            </div>
            {orderType === 'delivery' && (
              <div className="ocp-totals__row">
                <span>Delivery Fee</span>
                <span>LKR {deliveryFee.toLocaleString()}</span>
              </div>
            )}
            <div className="ocp-totals__row">
              <span>Tax</span>
              <span>LKR {tax.toLocaleString()}</span>
            </div>
            <div className="ocp-totals__row ocp-totals__row--total">
              <span>Total</span>
              <span className="ocp-totals__total-value">LKR {total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ───── Delivery / Pickup Address ───── */}
        <div className="ocp-card">
          <h3 className="ocp-card__title" style={{ marginBottom: 14 }}>
            {orderType === 'delivery' ? 'Delivery Address' : 'Pickup Location'}
          </h3>
          <div className="ocp-address">
            <div className="ocp-address__icon">
              <MapPin size={18} />
            </div>
            <div>
              {orderType === 'delivery' ? (
                <>
                  <span className="ocp-address__line">{fullName || 'Customer'}</span>
                  <span className="ocp-address__line">{address || 'Colombo Western Province'}</span>
                  <span className="ocp-address__line">{phone || '1234567890'}</span>
                </>
              ) : (
                <>
                  <span className="ocp-address__line">Crave House Restaurant - Branch</span>
                  <span className="ocp-address__line">BRANCH-001</span>
                  <span className="ocp-address__line">{phone || '1234567890'}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ───── Contact Support ───── */}
        <button className="ocp-support-btn">
          <MessageSquare size={18} /> Contact Support
        </button>
      </div>
    </div>
  );
}
