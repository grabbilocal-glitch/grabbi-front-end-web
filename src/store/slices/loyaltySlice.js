import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  points: 0,
  history: [],
  customerId: null,
};

const loyaltySlice = createSlice({
  name: 'loyalty',
  initialState,
  reducers: {
    setPoints: (state, action) => {
      state.points = action.payload;
    },
    addPoints: (state, action) => {
      state.points += action.payload.amount;
      state.history.unshift({
        id: Date.now(),
        type: 'earned',
        amount: action.payload.amount,
        description: action.payload.description || 'Points earned',
        date: new Date().toISOString(),
      });
    },
    redeemPoints: (state, action) => {
      state.points -= action.payload.amount;
      state.history.unshift({
        id: Date.now(),
        type: 'redeemed',
        amount: action.payload.amount,
        description: action.payload.description || 'Points redeemed',
        date: new Date().toISOString(),
      });
    },
    setCustomerId: (state, action) => {
      state.customerId = action.payload;
    },
    setHistory: (state, action) => {
      state.history = action.payload;
    },
  },
});

export const { setPoints, addPoints, redeemPoints, setCustomerId, setHistory } = loyaltySlice.actions;

export const selectPoints = (state) => state.loyalty.points;
export const selectCustomerId = (state) => state.loyalty.customerId;
export const selectLoyaltyHistory = (state) => state.loyalty.history;

export default loyaltySlice.reducer;

