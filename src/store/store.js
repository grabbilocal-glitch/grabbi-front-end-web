import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import authReducer from './slices/authSlice';
import loyaltyReducer from './slices/loyaltySlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    loyalty: loyaltyReducer,
  },
});

