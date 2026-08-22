import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ChevronRight,
  ShoppingBag,
  UtensilsCrossed
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, cartTotal, updateItemNote } = useCart();

  const subtotal = cartTotal;
  const totalQuantity = cartItems.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0);
  const uniqueDishes = cartItems.length;

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col justify-between relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed -top-20 right-0 h-96 w-96 rounded-full bg-orange-400/5 blur-3xl" />
      <div className="pointer-events-none fixed top-1/2 -left-24 h-96 w-96 rounded-full bg-amber-400/5 blur-3xl" />

      {/* ───── Header ───── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-2xs">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 hover:bg-orange-50 border border-slate-200/80 hover:border-orange-200 text-slate-700 hover:text-orange-600 transition-all active:scale-95 shadow-2xs"
              onClick={() => navigate('/menu')}
              aria-label="Back to Menu"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="font-heading text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                Your Cart
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {uniqueDishes > 0 && uniqueDishes !== totalQuantity && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-orange-600 text-xs font-bold shadow-2xs">
                <UtensilsCrossed size={13} />
                <span>{uniqueDishes} {uniqueDishes === 1 ? 'Dish' : 'Dishes'}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-xs">
              <ShoppingBag size={14} />
              <span>{totalQuantity} {totalQuantity === 1 ? 'Item' : 'Items'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ───── Cart Items ───── */}
      <main className="flex-1 p-4 sm:p-6 flex flex-col gap-3.5 max-w-4xl mx-auto w-full relative z-10">
        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-4">
            <div className="w-full max-w-sm rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 border border-orange-100 shadow-2xs">
                <ShoppingBag size={28} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Your cart is empty</h2>
              <p className="mt-1.5 text-sm text-slate-500">Looks like you haven't added anything yet.</p>
              <button
                onClick={() => navigate('/menu')}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-orange-500 py-3 text-sm font-bold text-white shadow-sm shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-[0.99]"
              >
                Browse Menu
              </button>
            </div>
          </div>
        ) : (
          cartItems.map((item) => (
            <div className="flex flex-col gap-3 p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:shadow-md hover:border-orange-200/80 transition-all" key={item.id}>
              <div className="flex items-start gap-3.5">
                <img
                  src={item.imageUrl || item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-100 shadow-2xs"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between min-h-[80px]">
                  {/* Top Row: Title & Total Price */}
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="font-heading text-base font-bold text-slate-900 leading-snug">
                      {item.name}
                    </h3>
                    <span className="font-heading text-base font-bold text-slate-900 shrink-0">
                      LKR {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>

                  {/* Bottom Row: Base Price & Quantity Controls */}
                  <div className="flex flex-wrap justify-between items-center mt-auto gap-2">
                    <span className="text-xs font-bold text-orange-600 bg-orange-50/80 px-2.5 py-0.5 rounded-lg border border-orange-100">
                      LKR {item.price.toLocaleString()} each
                    </span>

                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1.5 bg-slate-100/90 border border-slate-200/80 rounded-full p-1 shadow-inner">
                        <button
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-700 shadow-2xs transition-colors hover:text-orange-600 active:scale-90"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} strokeWidth={2.5} />
                        </button>
                        <span className="text-xs font-bold text-slate-800 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-700 shadow-2xs transition-colors hover:text-orange-600 active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= 50}
                          title={item.quantity >= 50 ? 'Maximum quantity is 50' : 'Add one more'}
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} strokeWidth={2.5} />
                        </button>
                      </div>

                      <button
                        className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                        onClick={() => {
                          removeFromCart(item.id);
                          toast.info('Item removed');
                        }}
                        title="Remove item"
                        aria-label="Remove item"
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
                maxLength={255}
                placeholder="Add a kitchen note (optional, e.g. no onions)"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white focus:bg-white focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 text-slate-800 placeholder-slate-400 transition-all"
                value={item.kitchenNote || ''}
                onChange={(e) => updateItemNote(item.id, e.target.value)}
              />
            </div>
          ))
        )}
      </main>

      {/* ───── Summary & Checkout ───── */}
      {cartItems.length > 0 && (
        <div className="sticky bottom-0 w-full pt-2 pb-6 px-4 sm:px-6 z-[90] bg-gradient-to-t from-[#f4f6f8] via-[#f4f6f8]/90 to-transparent">
          <div className="max-w-4xl mx-auto w-full">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 mb-3 shadow-[0_4px_25px_rgba(15,23,42,0.06)]">
              <div className="flex justify-between items-center text-sm font-medium text-slate-500 mb-2">
                <span>Subtotal</span>
                <span>LKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="h-px bg-slate-100 my-2.5" />
              <div className="flex justify-between items-center">
                <span className="font-heading text-base font-bold text-slate-900">Total</span>
                <span className="font-heading text-xl font-extrabold text-orange-600">
                  LKR {subtotal.toLocaleString()}
                </span>
              </div>
            </div>
            <button
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 py-4 font-heading text-base font-bold text-white shadow-lg shadow-orange-500/25 transition-all duration-200 active:scale-[0.99]"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}