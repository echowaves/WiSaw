import Toast from 'react-native-toast-message'
import showError from './showErrorToast'

/**
 * Standardized toast notification utility.
 * Replaces direct Toast.show() calls with consistent defaults.
 *
 * Usage:
 *   showToast('Wave saved')                          // success, 2s
 *   showToast('Wave saved', { type: 'error' })       // override type
 *   showToast('Wave saved', { text2: 'Detail', topOffset: 80 })
 *   showToast({ type: 'info', text1: 'All clear', text2: '12 photos grouped', visibilityTime: 3000 })
 *
 * Defaults: position='top', topOffset=60, visibilityTime=2000, autoHide=true
 *
 * `type: 'error'` is delegated to ./showErrorToast, which guarantees a reason
 * and attaches the long-press detail (full message + stack when available).
 */
const DEFAULTS = {
  position: 'top',
  topOffset: 60,
  visibilityTime: 2000,
  autoHide: true
}

const ERROR_DEFAULTS = {
  visibilityTime: 3000
}

export default function showToast (messageOrOptions, options = {}) {
  const asObject = typeof messageOrOptions === 'object' && messageOrOptions !== null
  const type = (asObject ? messageOrOptions.type : undefined) || options.type
  if (type === 'error') {
    // Every failure toast goes through showError so the reason is guaranteed
    // and the detail payload is attached to this toast rather than shared state.
    const source = asObject ? { ...messageOrOptions, ...options } : { title: messageOrOptions, ...options }
    showError({ topOffset: DEFAULTS.topOffset, visibilityTime: ERROR_DEFAULTS.visibilityTime, ...source })
    return
  }

  let config

  if (typeof messageOrOptions === 'string') {
    // showToast('message') or showToast('message', { type, text2, topOffset, ... })
    config = {
      ...DEFAULTS,
      ...options,
      text1: messageOrOptions
    }
  } else {
    // showToast({ type, text1, text2, ... })
    config = {
      ...DEFAULTS,
      ...messageOrOptions,
      text1: messageOrOptions.text1 || messageOrOptions.text2 || 'Heads up'
    }
  }

  Toast.show(config)
}

/**
 * Shorthand helpers for common toast types.
 * Each applies standardized defaults with the appropriate type.
 */

export function showSuccessToast (message, options = {}) {
  showToast(message, { type: 'success', ...options })
}

export function showErrorToast (message, options = {}) {
  showToast(message, { type: 'error', ...options })
}

export function showInfoToast (message, options = {}) {
  showToast(message, { type: 'info', ...options })
}
