/**
 * Utility functions for handling store hours and open/closed status
 */

/**
 * Get the day name from day of week (0 = Sunday, 1 = Monday, etc.)
 * @param {number} dayOfWeek - Day of week (0-6)
 * @returns {string} Day name
 */
export const getDayName = (dayOfWeek) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[dayOfWeek] || ''
}

/**
 * Get short day name from day of week
 * @param {number} dayOfWeek - Day of week (0-6)
 * @returns {string} Short day name
 */
export const getShortDayName = (dayOfWeek) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days[dayOfWeek] || ''
}

/**
 * Convert 24-hour time string to 12-hour format
 * @param {string} time24 - Time in 24-hour format (e.g., "22:00")
 * @returns {string} Time in 12-hour format (e.g., "10:00 PM")
 */
export const formatTime12Hour = (time24) => {
  if (!time24) return ''
  
  const [hours, minutes] = time24.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  
  return `${hour12}:${minutes} ${ampm}`
}

/**
 * Get current day of week (0 = Sunday, 1 = Monday, etc.)
 * @returns {number} Current day of week
 */
export const getCurrentDayOfWeek = () => {
  return new Date().getDay()
}

/**
 * Get current time in minutes since midnight
 * @returns {number} Minutes since midnight
 */
export const getCurrentTimeInMinutes = () => {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

/**
 * Convert time string to minutes since midnight
 * @param {string} timeStr - Time string (e.g., "10:00")
 * @returns {number} Minutes since midnight
 */
export const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Check if a store is currently open based on store hours
 * @param {Array} storeHours - Array of store hour objects
 * @returns {boolean} Whether the store is currently open
 */
export const isStoreOpen = (storeHours) => {
  if (!storeHours || storeHours.length === 0) return false
  
  const currentDay = getCurrentDayOfWeek()
  const currentTime = getCurrentTimeInMinutes()
  
  const todayHours = storeHours.find(h => h.day_of_week === currentDay)
  
  if (!todayHours || todayHours.is_closed) return false
  
  const openTime = timeToMinutes(todayHours.open_time)
  const closeTime = timeToMinutes(todayHours.close_time)
  
  // Handle case where close time is after midnight (next day)
  if (closeTime < openTime) {
    // Store is open if current time is after open OR before close
    return currentTime >= openTime || currentTime < closeTime
  }
  
  return currentTime >= openTime && currentTime < closeTime
}

/**
 * Get the next opening time for a closed store
 * @param {Array} storeHours - Array of store hour objects
 * @returns {Object|null} Object with next opening info or null if store is always closed
 */
export const getNextOpeningTime = (storeHours) => {
  if (!storeHours || storeHours.length === 0) return null
  
  const currentDay = getCurrentDayOfWeek()
  const currentTime = getCurrentTimeInMinutes()
  
  // Check today and the next 6 days
  for (let i = 0; i < 7; i++) {
    const dayToCheck = (currentDay + i) % 7
    const dayHours = storeHours.find(h => h.day_of_week === dayToCheck)
    
    if (dayHours && !dayHours.is_closed) {
      const openTime = timeToMinutes(dayHours.open_time)
      
      // If checking today, only consider if opening time is in the future
      if (i === 0 && openTime <= currentTime) {
        continue
      }
      
      return {
        dayOfWeek: dayToCheck,
        dayName: getDayName(dayToCheck),
        shortDayName: getShortDayName(dayToCheck),
        openTime: dayHours.open_time,
        openTimeFormatted: formatTime12Hour(dayHours.open_time),
        isToday: i === 0,
        isTomorrow: i === 1,
        daysAway: i,
      }
    }
  }
  
  return null // Store is closed all week
}

/**
 * Get a human-readable message for when the store will open next
 * @param {Array} storeHours - Array of store hour objects
 * @returns {string} Human-readable message
 */
export const getNextOpeningMessage = (storeHours) => {
  const nextOpening = getNextOpeningTime(storeHours)
  
  if (!nextOpening) {
    return 'Currently unavailable'
  }
  
  if (nextOpening.isToday) {
    return `Opens today at ${nextOpening.openTimeFormatted}`
  }
  
  if (nextOpening.isTomorrow) {
    return `Opens tomorrow at ${nextOpening.openTimeFormatted}`
  }
  
  return `Opens ${nextOpening.dayName} at ${nextOpening.openTimeFormatted}`
}

/**
 * Get store status info combining API response with local calculations
 * @param {Object} franchise - Franchise object with store_status and store_hours
 * @returns {Object} Store status info
 */
export const getStoreStatusInfo = (franchise) => {
  // Prefer the API-provided status if available (it's computed server-side)
  if (franchise.store_status) {
    const storeStatus = franchise.store_status
    
    if (storeStatus.is_open) {
      return {
        isOpen: true,
        message: storeStatus.message || 'Open now',
        closeTime: storeStatus.close_time,
        closeTimeFormatted: formatTime12Hour(storeStatus.close_time),
      }
    }
    
    // Store is closed - get next opening time
    const nextOpening = getNextOpeningTime(franchise.store_hours)
    
    return {
      isOpen: false,
      message: getNextOpeningMessage(franchise.store_hours),
      nextOpening,
      currentDay: storeStatus.current_day,
    }
  }
  
  // Fallback to local calculation if store_status not provided
  const isOpen = isStoreOpen(franchise.store_hours)
  
  if (isOpen) {
    const currentDay = getCurrentDayOfWeek()
    const todayHours = franchise.store_hours?.find(h => h.day_of_week === currentDay)
    return {
      isOpen: true,
      message: `Open until ${formatTime12Hour(todayHours?.close_time)}`,
      closeTime: todayHours?.close_time,
      closeTimeFormatted: formatTime12Hour(todayHours?.close_time),
    }
  }
  
  return {
    isOpen: false,
    message: getNextOpeningMessage(franchise.store_hours),
    nextOpening: getNextOpeningTime(franchise.store_hours),
  }
}