import { formatTime, formatPoints, formatDuration, formatDate } from './formatters'
import { validateRequired, validatePetName, validateImageFile } from './validators'

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

const getStorageSync = (key, defaultValue = null) => {
  try {
    const value = wx.getStorageSync(key)
    return value || defaultValue
  } catch (error) {
    console.error('getStorageSync error:', error)
    return defaultValue
  }
}

const setStorageSync = (key, value) => {
  try {
    wx.setStorageSync(key, value)
    return true
  } catch (error) {
    console.error('setStorageSync error:', error)
    return false
  }
}

const showToast = (title, icon = 'none', duration = 2000) => {
  wx.showToast({
    title,
    icon,
    duration
  })
}

const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title,
    mask: true
  })
}

const hideLoading = () => {
  wx.hideLoading()
}

const navigateTo = (url, params = {}) => {
  const queryString = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&')
  
  const fullUrl = queryString ? `${url}?${queryString}` : url
  
  wx.navigateTo({
    url: fullUrl,
    fail: (error) => {
      console.error('navigateTo failed:', error)
    }
  })
}

const redirectTo = (url, params = {}) => {
  const queryString = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&')
  
  const fullUrl = queryString ? `${url}?${queryString}` : url
  
  wx.redirectTo({
    url: fullUrl,
    fail: (error) => {
      console.error('redirectTo failed:', error)
    }
  })
}

const switchTab = (url) => {
  wx.switchTab({
    url,
    fail: (error) => {
      console.error('switchTab failed:', error)
    }
  })
}

module.exports = {
  formatTime,
  formatPoints,
  formatDuration,
  formatDate,
  formatNumber,
  validateRequired,
  validatePetName,
  validateImageFile,
  debounce,
  throttle,
  deepClone,
  generateId,
  getStorageSync,
  setStorageSync,
  showToast,
  showLoading,
  hideLoading,
  navigateTo,
  redirectTo,
  switchTab
}
