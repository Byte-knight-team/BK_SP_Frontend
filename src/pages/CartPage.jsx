import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();

  const subtotal = cartTotal;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ───── Header ───── */}
      <header className="flex items-center gap-3.5 px-6 h-[72px] bg-white border-b border-gray-200 sticky top-0 z-[100] max-md:px-4">
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-800 transition-colors duration-300 ease-smooth hover:bg-gray-200"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/menu'))}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-heading text-[1.25rem] font-bold text-navy leading-[1.2]">Your Cart</h1>
          <span className="text-[0.82rem] text-gray-500">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </header>

      {/* ───── Cart Items ───── */}
      <div className="flex-1 p-5 px-6 flex flex-col gap-4 max-md:p-4">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[60px] px-5 gap-4">
            <p className="text-base text-gray-500">Your cart is empty</p>
            <button className="px-7 py-2.5 rounded-sm bg-orange text-white text-[0.9rem] font-semibold transition-colors duration-300 ease-smooth hover:bg-orange-hover" onClick={() => navigate('/menu')}>
              Browse Menu
            </button>
          </div>
        ) : (
          cartItems.map((item) => (
            <div className="flex items-center gap-4 p-[18px] px-5 bg-white border border-gray-200 rounded-[14px] transition-shadow duration-300 ease-smooth hover:shadow-card-hover max-[480px]:flex-wrap" key={item.id}>
              <img src={item.image} alt={item.name} className="w-20 h-20 rounded-[10px] object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-heading text-[0.95rem] font-bold text-navy mb-1">
                  {item.name}
                </h3>
                <span className="block text-[0.88rem] font-semibold text-orange mb-2.5">
                  LKR {item.price.toLocaleString()}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 bg-white text-navy transition-all duration-300 ease-smooth hover:border-navy"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-[0.95rem] font-semibold text-navy min-w-[20px] text-center">{item.quantity}</span>
                  <button
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-orange border-orange text-white transition-all duration-300 ease-smooth hover:bg-orange-hover hover:border-orange-hover"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-transparent text-orange transition-all duration-300 ease-smooth ml-1 hover:bg-orange-light"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <span className="font-heading text-base font-bold text-navy whitespace-nowrap shrink-0 max-[480px]:w-full max-[480px]:text-right max-[480px]:mt-2">
                LKR {(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>

      {/* ───── Summary & Checkout ───── */}
      {cartItems.length > 0 && (
        <div className="px-6 pb-7 max-md:px-4 max-md:pb-5">
          <div className="bg-white border border-gray-200 rounded-[14px] p-5 px-6 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-[0.9rem] text-gray-500">Subtotal</span>
              <span className="text-[0.9rem] text-gray-500">LKR {subtotal.toLocaleString()}</span>
            </div>
            <div className="h-px bg-gray-200 my-3.5" />
            <div className="flex justify-between items-center">
              <span className="font-heading text-[1.05rem] font-bold text-navy">Total</span>
              <span className="font-heading text-[1.1rem] font-bold text-orange">LKR {subtotal.toLocaleString()}</span>
            </div>
          </div>
          <button className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-orange-500 py-4 font-heading text-[1.05rem] font-bold text-white shadow-sm transition-colors duration-300 ease-smooth hover:bg-orange-600" onClick={() => navigate('/checkout')}>
            Proceed to Checkout <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
