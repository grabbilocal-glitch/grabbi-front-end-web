import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline'
import {
  setSelectedFranchise,
  setCustomerLocation,
  setLocationLoading,
  setLocationError,
  selectSelectedFranchise,
  selectLocationLoading,
  selectLocationError,
} from '../../store/slices/franchiseSlice'
import { franchiseService } from '../../services/franchiseService'
import MapLocationPicker from '../Map/MapLocationPicker'

export default function StoreSelector({ onClose }) {
  const dispatch = useDispatch()
  const selectedFranchise = useSelector(selectSelectedFranchise)
  const locationLoading = useSelector(selectLocationLoading)
  const locationError = useSelector(selectLocationError)
  const [mapLocation, setMapLocation] = useState({})

  useEffect(() => {
    if (!selectedFranchise) {
      detectLocation()
    }
  }, [])

  const detectLocation = () => {
    if (!navigator.geolocation) {
      dispatch(setLocationError('Geolocation not supported by your browser'))
      return
    }

    dispatch(setLocationLoading(true))
    dispatch(setLocationError(null))

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        dispatch(setCustomerLocation({ lat: latitude, lng: longitude }))

        try {
          const data = await franchiseService.getNearestFranchise(latitude, longitude)
          dispatch(setSelectedFranchise(data.franchise))
        } catch {
          dispatch(setLocationError('No store delivers to your area yet'))
        } finally {
          dispatch(setLocationLoading(false))
        }
      },
      () => {
        dispatch(setLocationLoading(false))
        dispatch(setLocationError('Location access denied. Please pick your location on the map below.'))
      },
      { timeout: 10000 }
    )
  }

  const handleMapPick = async ({ lat, lng, address }) => {
    setMapLocation({ lat, lng, address })
    dispatch(setCustomerLocation({ lat, lng }))
    dispatch(setLocationLoading(true))
    dispatch(setLocationError(null))

    try {
      const data = await franchiseService.getNearestFranchise(lat, lng)
      dispatch(setSelectedFranchise(data.franchise))
    } catch {
      dispatch(setLocationError('No store delivers to your area yet'))
    } finally {
      dispatch(setLocationLoading(false))
    }
  }

  if (selectedFranchise && !onClose) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 dark:bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-6 space-y-4 shadow-glow">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-white/60" />
          </button>
        )}

        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-full bg-brand-mint/20 flex items-center justify-center">
            <MapPinIcon className="h-7 w-7 text-brand-mint" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Find your store</h3>
          <p className="text-sm text-gray-600 dark:text-white/70">
            We'll find the nearest Grabbi store to deliver your order
          </p>
        </div>

        {locationLoading && (
          <div className="text-center py-4">
            <div className="animate-spin h-8 w-8 border-2 border-brand-mint border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-white/70">Detecting your location...</p>
          </div>
        )}

        {locationError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 text-sm">
            {locationError}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={detectLocation}
            disabled={locationLoading}
            className="w-full py-3 rounded-xl button-primary font-semibold flex items-center justify-center gap-2"
          >
            <MapPinIcon className="h-5 w-5" />
            Use my location
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/15" />
            <span className="text-xs text-gray-500 dark:text-white/50 uppercase">or pick on map</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/15" />
          </div>

          <MapLocationPicker
            value={mapLocation}
            onChange={handleMapPick}
            showMyLocation={false}
            height="220px"
          />
        </div>

        {selectedFranchise && (
          <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
            <p className="text-sm text-green-800 dark:text-green-300 font-medium">
              Delivering from: {selectedFranchise.name}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {selectedFranchise.address}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
