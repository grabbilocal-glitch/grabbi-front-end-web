import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  selectedFranchise: null,
  nearbyFranchises: [],
  customerLocation: null,
  locationLoading: false,
  locationError: null,
}

const franchiseSlice = createSlice({
  name: 'franchise',
  initialState,
  reducers: {
    setSelectedFranchise: (state, action) => {
      state.selectedFranchise = action.payload
      try {
        if (action.payload) {
          localStorage.setItem('selectedFranchise', JSON.stringify(action.payload))
        } else {
          localStorage.removeItem('selectedFranchise')
        }
      } catch {
        // localStorage may not be available
      }
    },
    // Change franchise and clear cart if franchise is different
    // This should be used when user explicitly changes store location
    changeFranchise: (state, action) => {
      const newFranchise = action.payload
      const previousFranchiseId = state.selectedFranchise?.id
      
      state.selectedFranchise = newFranchise
      try {
        if (newFranchise) {
          localStorage.setItem('selectedFranchise', JSON.stringify(newFranchise))
        } else {
          localStorage.removeItem('selectedFranchise')
        }
      } catch {
        // localStorage may not be available
      }
      
      // Return the franchise change info so the caller can clear cart if needed
      return {
        ...state,
        franchiseChanged: previousFranchiseId && previousFranchiseId !== newFranchise?.id,
        previousFranchiseId,
        newFranchiseId: newFranchise?.id,
      }
    },
    setNearbyFranchises: (state, action) => {
      state.nearbyFranchises = action.payload
    },
    setCustomerLocation: (state, action) => {
      state.customerLocation = action.payload
    },
    setLocationLoading: (state, action) => {
      state.locationLoading = action.payload
    },
    setLocationError: (state, action) => {
      state.locationError = action.payload
    },
    clearFranchise: (state) => {
      state.selectedFranchise = null
      state.customerLocation = null
      try {
        localStorage.removeItem('selectedFranchise')
      } catch {
        // localStorage may not be available
      }
    },
  },
})

export const {
  setSelectedFranchise,
  changeFranchise,
  setNearbyFranchises,
  setCustomerLocation,
  setLocationLoading,
  setLocationError,
  clearFranchise,
} = franchiseSlice.actions

export const selectSelectedFranchise = (state) => state.franchise.selectedFranchise
export const selectNearbyFranchises = (state) => state.franchise.nearbyFranchises
export const selectCustomerLocation = (state) => state.franchise.customerLocation
export const selectLocationLoading = (state) => state.franchise.locationLoading
export const selectLocationError = (state) => state.franchise.locationError

export default franchiseSlice.reducer
