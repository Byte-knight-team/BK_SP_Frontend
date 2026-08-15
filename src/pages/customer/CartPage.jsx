import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2, ChevronRight, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, cartTotal, updateItemNote } = useCart();

  const subtotal = cartTotal;

  return (
    <div className="min-h-screen bg-[#f3f1ee] flex flex-col">
      {/* ───── Header ───── */}
      <header className="flex items-center gap-3.5 px-6 h-[72px] bg-white border-b border-slate-200 sticky top-0 z-[100] max-md:px-4">
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-800 transition-colors duration-300 hover:bg-slate-200"
          onClick={() => (navigate('/menu'))}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-heading text-[1.25rem] font-bold text-slate-900 leading-[1.2]">Your Cart</h1>
          <span className="text-[0.82rem] text-slate-500">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </header>

      {/* ───── Cart Items ───── */}
      <div className="flex-1 p-5 px-6 flex flex-col gap-4 max-md:p-4 max-w-[800px] mx-auto w-full">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[60px] px-5 gap-4 rounded-[16px] border border-dashed border-slate-300 bg-white/70 mt-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <ShoppingCart size={28} />
            </div>
            <p className="text-base font-semibold text-slate-900">Your cart is empty</p>
            <p className="text-center text-sm text-slate-500">Looks like you haven't added anything yet.</p>
            <button className="px-7 py-2.5 rounded-xl bg-orange-500 text-white text-[0.9rem] font-semibold transition-colors duration-300 hover:bg-orange-600" onClick={() => navigate('/menu')}>
              Browse Menu
            </button>
          </div>
        ) : (
          cartItems.map((item) => (
            <div className="flex flex-col gap-2.5 p-3.5 bg-white border border-slate-200 rounded-[14px] transition-shadow duration-300 hover:shadow-md" key={item.id}>
              <div className="flex items-start gap-3.5">
                <img src={item.imageUrl || item.image} alt={item.name} className="w-[72px] h-[72px] rounded-[10px] object-cover shrink-0" />
                
                <div className="flex-1 min-w-0 flex flex-col justify-between min-h-[72px]">
                  {/* Top Row: Title & Total Price */}
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="font-heading text-[0.95rem] font-bold text-slate-900 leading-tight">
                      {item.name}
                    </h3>
                    <span className="font-heading text-[0.95rem] font-bold text-slate-900 shrink-0">
                      LKR {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Bottom Row: Base Price & Quantity */}
                  <div className="flex flex-wrap justify-between items-center mt-auto gap-2">
                    <span className="text-[0.82rem] font-semibold text-orange-500 truncate">
                      LKR {item.price.toLocaleString()} <span className="hidden sm:inline">each</span>
                    </span>
                    
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full p-0.5">
                        <button
                          className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition-colors hover:text-orange-500 hover:border-orange-200 border border-transparent"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus size={13} />
                        </button>
                        <span className="text-[0.85rem] font-bold text-slate-800 min-w-[18px] text-center">{item.quantity}</span>
                        <button
                          className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition-colors hover:text-orange-500 hover:border-orange-200 border border-transparent"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <button
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        onClick={() => {
                          removeFromCart(item.id);
                          toast.info('Item removed');
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Kitchen Note Input */}
              <input
                type="text"
                placeholder="Add a kitchen note (optional, e.g. no onions)"
                className="w-full text-[0.8rem] px-3 py-2 rounded-[8px] border border-slate-200 bg-slate-50 focus:outline-none focus:border-orange-300 focus:bg-white text-slate-700 placeholder-slate-400 transition-colors"
                value={item.kitchenNote || ''}
                onChange={(e) => updateItemNote(item.id, e.target.value)}
              />
            </div>
          ))
        )}
      </div>

      {/* ───── Summary & Checkout ───── */}
      {cartItems.length > 0 && (
        <div className="sticky bottom-0 w-full pt-2 pb-7 px-6 max-md:px-4 max-md:pb-5 z-[90]">
          <div className="max-w-[800px] mx-auto w-full">
            <div className="bg-white border border-slate-200 rounded-[14px] p-4 px-6 mb-4 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
            <div className="flex justify-between items-center">
              <span className="text-[0.9rem] text-slate-500">Subtotal</span>
              <span className="text-[0.9rem] text-slate-500">LKR {subtotal.toLocaleString()}</span>
            </div>
            <div className="h-px bg-slate-200 my-3.5" />
            <div className="flex justify-between items-center">
              <span className="font-heading text-[1.05rem] font-bold text-slate-900">Total</span>
              <span className="font-heading text-[1.1rem] font-bold text-orange-500">LKR {subtotal.toLocaleString()}</span>
            </div>
          </div>
          <button className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-orange-500 py-4 font-heading text-[1.05rem] font-bold text-white shadow-sm transition-colors duration-300 hover:bg-orange-600" onClick={() => navigate('/checkout')}>
            Proceed to Checkout <ChevronRight size={18} />
          </button>
          </div>
        </div>
      )}
    </div>
  );
}