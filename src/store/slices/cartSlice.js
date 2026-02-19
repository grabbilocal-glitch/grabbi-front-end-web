import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../../services/cartService';

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

// Load franchise ID from localStorage
function loadFranchiseIdFromStorage() {
  try {
    return localStorage.getItem('grabbi_cart_franchise_id') || null;
  } catch {
    return null;
  }
}

function saveCartToStorage(items) {
  try {
    localStorage.setItem('grabbi_cart', JSON.stringify(items));
  } catch {
    // localStorage may not be available or quota exceeded
  }
}

function saveFranchiseIdToStorage(franchiseId) {
  try {
    if (franchiseId) {
      localStorage.setItem('grabbi_cart_franchise_id', franchiseId);
    } else {
      localStorage.removeItem('grabbi_cart_franchise_id');
    }
  } catch {
    // localStorage may not be available
  }
}

const initialState = {
  items: loadCartFromStorage(),
  isOpen: false,
  cartFranchiseId: loadFranchiseIdFromStorage(),
  loading: false,
  error: null,
  // Track loading states for individual operations
  addingToCart: false,
  updatingItems: {}, // { [productId]: boolean }
  removingItems: {}, // { [productId]: boolean }
};

// Async thunk to sync cart with backend
export const syncCartWithBackend = createAsyncThunk(
  'cart/syncWithBackend',
  async (_, { rejectWithValue }) => {
    try {
      const cartItems = await cartService.getCart();
      return cartItems;
    } catch (error) {
      // If user is not authenticated, that's okay - we use local cart
      if (error.response?.status === 401) {
        return null;
      }
      return rejectWithValue(error.response?.data?.error || 'Failed to sync cart');
    }
  }
);

// Async thunk to add item to backend cart
export const addItemToBackend = createAsyncThunk(
  'cart/addItemToBackend',
  async ({ product_id, quantity = 1, productData }, { rejectWithValue }) => {
    try {
      const response = await cartService.addToCart(product_id, quantity);
      return { ...response, productData };
    } catch (error) {
      // If user is not authenticated, we still add to local cart
      if (error.response?.status === 401) {
        return { local: true, productData, quantity };
      }
      return rejectWithValue(error.response?.data?.error || 'Failed to add item');
    }
  },
  {
    // Condition to check if we should dispatch - always dispatch to get pending state
    condition: () => true,
    // Optimize by tracking request id to prevent duplicate requests
    idGenerator: ({ product_id }) => `add-${product_id}-${Date.now()}`,
  }
);

// Async thunk to update cart item quantity
export const updateBackendCartItem = createAsyncThunk(
  'cart/updateBackendCartItem',
  async ({ cartItemId, quantity, productId }, { rejectWithValue }) => {
    try {
      if (quantity <= 0) {
        await cartService.removeCartItem(cartItemId);
        return { removed: true, productId };
      }
      const response = await cartService.updateCartItem(cartItemId, quantity);
      return { ...response, quantity };
    } catch (error) {
      if (error.response?.status === 401) {
        return { local: true, productId, quantity };
      }
      return rejectWithValue(error.response?.data?.error || 'Failed to update item');
    }
  }
);

// Async thunk to remove item from backend cart
export const removeFromBackendCart = createAsyncThunk(
  'cart/removeFromBackendCart',
  async ({ cartItemId, productId }, { rejectWithValue }) => {
    try {
      await cartService.removeCartItem(cartItemId);
      return { productId };
    } catch (error) {
      if (error.response?.status === 401) {
        return { local: true, productId };
      }
      return rejectWithValue(error.response?.data?.error || 'Failed to remove item');
    }
  }
);

// Async thunk to clear backend cart
export const clearBackendCart = createAsyncThunk(
  'cart/clearBackendCart',
  async (_, { rejectWithValue }) => {
    try {
      await cartService.clearCart();
      return true;
    } catch (error) {
      if (error.response?.status === 401) {
        return { local: true };
      }
      return rejectWithValue(error.response?.data?.error || 'Failed to clear cart');
    }
  }
);

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
      state.cartFranchiseId = null;
      saveCartToStorage(state.items);
      saveFranchiseIdToStorage(null);
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
    setCartFranchise: (state, action) => {
      state.cartFranchiseId = action.payload;
      saveFranchiseIdToStorage(action.payload);
    },
    // Clear cart when franchise changes - used by franchise slice
    clearCartOnFranchiseChange: (state) => {
      state.items = [];
      saveCartToStorage([]);
    },
    setCartFromBackend: (state, action) => {
      // Transform backend cart items to local format
      const backendItems = action.payload || [];
      state.items = backendItems.map(cartItem => ({
        id: cartItem.product_id || cartItem.product?.id,
        cartItemId: cartItem.id, // Store backend cart item ID for updates
        name: cartItem.product?.item_name || cartItem.product?.name || cartItem.name,
        price: cartItem.product?.retail_price || cartItem.product?.price || cartItem.price,
        retail_price: cartItem.product?.retail_price,
        promotion_price: cartItem.product?.promotion_price,
        pack_size: cartItem.product?.pack_size,
        packSize: cartItem.product?.pack_size,
        brand: cartItem.product?.brand,
        images: cartItem.product?.images,
        image: cartItem.product?.images?.[0]?.image_url,
        is_vegan: cartItem.product?.is_vegan,
        is_vegetarian: cartItem.product?.is_vegetarian,
        is_gluten_free: cartItem.product?.is_gluten_free,
        is_age_restricted: cartItem.product?.is_age_restricted,
        quantity: cartItem.quantity,
        category: cartItem.product?.category,
      }));
      saveCartToStorage(state.items);
    },
  },
  extraReducers: (builder) => {
    builder
      // Sync cart with backend
      .addCase(syncCartWithBackend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncCartWithBackend.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && Array.isArray(action.payload)) {
          // Transform backend cart items
          state.items = action.payload.map(cartItem => ({
            id: cartItem.product_id || cartItem.product?.id,
            cartItemId: cartItem.id,
            name: cartItem.product?.item_name || cartItem.product?.name || cartItem.name,
            price: cartItem.product?.retail_price || cartItem.product?.price || cartItem.price,
            retail_price: cartItem.product?.retail_price,
            promotion_price: cartItem.product?.promotion_price,
            pack_size: cartItem.product?.pack_size,
            packSize: cartItem.product?.pack_size,
            brand: cartItem.product?.brand,
            images: cartItem.product?.images,
            image: cartItem.product?.images?.[0]?.image_url,
            is_vegan: cartItem.product?.is_vegan,
            is_vegetarian: cartItem.product?.is_vegetarian,
            is_gluten_free: cartItem.product?.is_gluten_free,
            is_age_restricted: cartItem.product?.is_age_restricted,
            quantity: cartItem.quantity,
            category: cartItem.product?.category,
          }));
          saveCartToStorage(state.items);
        }
      })
      .addCase(syncCartWithBackend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add item to backend - OPTIMISTIC UPDATE with loading state
      .addCase(addItemToBackend.pending, (state, action) => {
        state.addingToCart = true;
        state.error = null;
        // Immediately update UI (optimistic update)
        const { productData, quantity } = action.meta.arg;
        const existingItem = state.items.find(item => item.id === productData.id);
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          state.items.push({ ...productData, quantity });
        }
        saveCartToStorage(state.items);
      })
      .addCase(addItemToBackend.fulfilled, (state, action) => {
        state.addingToCart = false;
        const { local, productData, quantity, id: cartItemId, product_id } = action.payload;
        
        if (!local) {
          // Backend responded - update cartItemId for future operations
          const productId = product_id || productData?.id;
          const existingItem = state.items.find(item => item.id === productId);
          if (existingItem) {
            existingItem.cartItemId = cartItemId;
          }
          saveCartToStorage(state.items);
        }
        // If local=true, the optimistic update already handled it
      })
      .addCase(addItemToBackend.rejected, (state, action) => {
        state.addingToCart = false;
        // Revert optimistic update on error
        const { productData, quantity } = action.meta.arg;
        const existingItem = state.items.find(item => item.id === productData.id);
        if (existingItem) {
          existingItem.quantity -= quantity;
          if (existingItem.quantity <= 0) {
            state.items = state.items.filter(item => item.id !== productData.id);
          }
        }
        saveCartToStorage(state.items);
        state.error = action.payload;
      })
      // Update backend cart item - OPTIMISTIC UPDATE with loading state
      .addCase(updateBackendCartItem.pending, (state, action) => {
        const { productId } = action.meta.arg;
        state.updatingItems[productId] = true;
        state.error = null;
        const { quantity } = action.meta.arg;
        const item = state.items.find(item => item.id === productId);
        if (item) {
          if (quantity <= 0) {
            state.items = state.items.filter(item => item.id !== productId);
          } else {
            item.quantity = quantity;
          }
        }
        saveCartToStorage(state.items);
      })
      .addCase(updateBackendCartItem.fulfilled, (state, action) => {
        const { productId, quantity } = action.meta.arg;
        state.updatingItems[productId] = false;
        // Already handled in pending - just ensure sync
        const item = state.items.find(item => item.id === productId);
        if (item && quantity > 0) {
          item.quantity = quantity;
        }
        saveCartToStorage(state.items);
      })
      .addCase(updateBackendCartItem.rejected, (state, action) => {
        const { productId } = action.meta.arg;
        state.updatingItems[productId] = false;
        // Could implement rollback here if needed
        state.error = action.payload;
      })
      // Remove from backend cart - OPTIMISTIC UPDATE with loading state
      .addCase(removeFromBackendCart.pending, (state, action) => {
        const { productId } = action.meta.arg;
        state.removingItems[productId] = true;
        state.error = null;
        state.items = state.items.filter(item => item.id !== productId);
        saveCartToStorage(state.items);
      })
      .addCase(removeFromBackendCart.fulfilled, (state, action) => {
        const { productId } = action.meta.arg;
        state.removingItems[productId] = false;
        // Already handled in pending
      })
      .addCase(removeFromBackendCart.rejected, (state, action) => {
        const { productId } = action.meta.arg;
        state.removingItems[productId] = false;
        state.error = action.payload;
      })
      // Clear backend cart - OPTIMISTIC UPDATE
      .addCase(clearBackendCart.pending, (state) => {
        state.items = [];
        state.cartFranchiseId = null;
        saveCartToStorage(state.items);
        saveFranchiseIdToStorage(null);
      })
      .addCase(clearBackendCart.fulfilled, (state) => {
        // Already handled in pending
      })
      .addCase(clearBackendCart.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { 
  addItem, 
  removeItem, 
  updateQuantity, 
  clearCart, 
  toggleCart, 
  openCart, 
  closeCart,
  setCartFranchise,
  clearCartOnFranchiseChange,
  setCartFromBackend,
} = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => {
  return state.cart.items.reduce((total, item) => total + ((item.promotion_price || item.retail_price || item.price) * item.quantity), 0);
};
export const selectCartItemCount = (state) => {
  return state.cart.items.reduce((count, item) => count + item.quantity, 0);
};
export const selectIsCartOpen = (state) => state.cart.isOpen;
export const selectCartFranchiseId = (state) => state.cart.cartFranchiseId;
export const selectCartLoading = (state) => state.cart.loading;
export const selectAddingToCart = (state) => state.cart.addingToCart;
export const selectUpdatingItems = (state) => state.cart.updatingItems;
export const selectRemovingItems = (state) => state.cart.removingItems;
export const selectIsItemUpdating = (productId) => (state) => !!state.cart.updatingItems[productId];
export const selectIsItemRemoving = (productId) => (state) => !!state.cart.removingItems[productId];
export const selectAnyCartOperationLoading = (state) => 
  state.cart.addingToCart || 
  Object.values(state.cart.updatingItems).some(Boolean) || 
  Object.values(state.cart.removingItems).some(Boolean);

export default cartSlice.reducer;
