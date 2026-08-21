import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();
export const MAX_ITEM_QUANTITY = 50;

export function CartProvider({ children }) {
  // 1. Initialize cart from localStorage so items survive page refreshes and redirects!
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('bk_guest_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Failed to parse cart from local storage", error);
      return [];
    }
  });

  // 2. Automatically save to localStorage every time cartItems changes
  useEffect(() => {
    localStorage.setItem('bk_guest_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    setCartItems((prev) => {
      const existing = prev.find((ci) => ci.id === item.id);
      if (existing) {
        if (existing.quantity >= MAX_ITEM_QUANTITY) {
          toast.warning(`Maximum of ${MAX_ITEM_QUANTITY} items allowed per dish.`);
          return prev;
        }
        return prev.map((ci) =>
          ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((ci) => ci.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    if (quantity > MAX_ITEM_QUANTITY) {
      toast.warning(`Maximum of ${MAX_ITEM_QUANTITY} items allowed per dish.`);
      return;
    }
    setCartItems((prev) =>
      prev.map((ci) => (ci.id === id ? { ...ci, quantity } : ci))
    );
  };

  const updateItemNote = (id, note) => {
    setCartItems((prev) =>
      prev.map((ci) => (ci.id === id ? { ...ci, kitchenNote: note } : ci))
    );
  };

  const cartCount = cartItems.reduce((sum, ci) => sum + ci.quantity, 0);
  const cartTotal = cartItems.reduce((sum, ci) => sum + ci.price * ci.quantity, 0);

  // 3. Ensure clearCart wipes the localStorage holding cell too
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('bk_guest_cart');
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, updateItemNote, cartCount, cartTotal, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}