import { createSlice } from '@reduxjs/toolkit';

// Load cart from localStorage
function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem('grabbi_cart');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // ignore parse errors
  }
  return [];
}

function saveCartToStorage(items) {
  try {
    localStorage.setItem('grabbi_cart', JSON.stringify(items));
  } catch {
    // localStorage may not be available or quota exceeded
  }
}

const initialState = {
  items: loadCartFromStorage(),
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action) => {
      const existingItem = state.items.find(
        item => item.id === action.payload.id
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity || 1;
      } else {
        state.items.push({ ...action.payload, quantity: action.payload.quantity || 1 });
      }
      saveCartToStorage(state.items);
    },
    removeItem: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      saveCartToStorage(state.items);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.id !== id);
        } else {
          item.quantity = quantity;
        }
      }
      saveCartToStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveCartToStorage(state.items);
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    openCart: (state) => {
      state.isOpen = true;
    },
    closeCart: (state) => {
      state.isOpen = false;
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart, toggleCart, openCart, closeCart } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => {
  return state.cart.items.reduce((total, item) => total + ((item.promotion_price || item.retail_price || item.price) * item.quantity), 0);
};
export const selectCartItemCount = (state) => {
  return state.cart.items.reduce((count, item) => count + item.quantity, 0);
};
export const selectIsCartOpen = (state) => state.cart.isOpen;

export default cartSlice.reducer;
