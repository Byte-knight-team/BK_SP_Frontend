import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();

  const subtotal = cartTotal;

  return (
    <div className="cart-page">
      {/* ───── Header ───── */}
      <header className="cart-header">
        <button className="cart-header__back" onClick={() => navigate('/menu')}>
          <ArrowLeft size={20} />
        </button>
        <div className="cart-header__text">
          <h1 className="cart-header__title">Your Cart</h1>
          <span className="cart-header__count">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </header>

      {/* ───── Cart Items ───── */}
      <div className="cart-items">
        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <p className="cart-empty__text">Your cart is empty</p>
            <button className="cart-empty__btn" onClick={() => navigate('/menu')}>
              Browse Menu
            </button>
          </div>
        ) : (
          cartItems.map((item) => (
            <div className="cart-item" key={item.id}>
              <img src={item.image} alt={item.name} className="cart-item__img" />
              <div className="cart-item__details">
                <h3 className="cart-item__name">{item.name}</h3>
                <span className="cart-item__price">LKR {item.price.toLocaleString()}</span>
                <div className="cart-item__controls">
                  <button
                    className="cart-item__qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="cart-item__qty">{item.quantity}</span>
                  <button
                    className="cart-item__qty-btn cart-item__qty-btn--plus"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    className="cart-item__delete"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <span className="cart-item__total">
                LKR {(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>

      {/* ───── Summary & Checkout ───── */}
      {cartItems.length > 0 && (
        <div className="cart-footer">
          <div className="cart-summary">
            <div className="cart-summary__row">
              <span className="cart-summary__label">Subtotal</span>
              <span className="cart-summary__value">LKR {subtotal.toLocaleString()}</span>
            </div>
            <div className="cart-summary__divider" />
            <div className="cart-summary__row cart-summary__row--total">
              <span className="cart-summary__label--total">Total</span>
              <span className="cart-summary__value--total">LKR {subtotal.toLocaleString()}</span>
            </div>
          </div>
          <button className="cart-checkout" onClick={() => navigate('/checkout')}>
            Proceed to Checkout <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
