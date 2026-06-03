import { atom } from 'jotai'

/**
 * Jotai atom for error context shared between toast and modal.
 * Shape: { visible: boolean, title: string, message: string, stack?: string }
 * Null means no error is active.
 */
export const errorContextAtom = atom({
  visible: false,
  title: '',
  message: '',
  stack: null
})

/**
 * Write-only atom to show an error context.
 * Usage: setShowError(errorAtom, { title, message, stack })
 */
export const setShowErrorAtom = atom(
  null,
  (get, set, payload) => {
    set(errorContextAtom, { visible: true, ...payload })
  }
)

/**
 * Write-only atom to hide the error context.
 */
export const hideErrorAtom = atom(
  null,
  (_get, set) => {
    set(errorContextAtom, { visible: false, title: '', message: '', stack: null })
  }
)
