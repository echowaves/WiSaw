/* eslint-disable no-console */
/* eslint-disable camelcase */
/* global WebSocket */
/**
 * Raw WebSocket AppSync subscription service.
 *
 * Bypasses Apollo Client link system entirely for subscriptions.
 * Uses React Native's global WebSocket with AppSync protocol handling.
 * Emits received events to the local uploadBus event bus.
 */

import Constants from 'expo-constants'
import base64 from 'react-native-base64'
import { v4 as uuidv4 } from 'uuid'
import { emitUploadComplete } from '../events/uploadBus'

const { API_URI, REALTIME_API_URI, API_KEY } = Constants.expoConfig.extra

// eslint-disable-next-line camelcase
const HOST = API_URI.replace('https://', '').replace('/graphql', '')

// eslint-disable-next-line camelcase
const api_header = {
  host: HOST,
  'x-api-key': API_KEY
}

const header_encode = (obj) => base64.encode(JSON.stringify(obj))

// eslint-disable-next-line camelcase
const connection_url = `${REALTIME_API_URI}?header=${header_encode(
  api_header
)}&payload=${header_encode({})}`

// The GraphQL subscription query string
const PHOTO_UPLOAD_COMPLETE_SUBSCRIPTION = `
  subscription OnPhotoUploadComplete {
    onPhotoUploadComplete {
      photoId
      waveUuid
      photosGrouped
    }
  }
`

// --- State ---
let ws = null
let reconnectTimer = null
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 10
const RECONNECT_BASE_DELAY = 1000
let isSubscribed = false
let isManuallyClosed = false

// --- WebSocket Management ---

function connect () {
  if (ws) {
    ws.close()
  }

  console.log('[AppSync WS] Connecting...')
  ws = new WebSocket(connection_url)

  ws.onopen = () => {
    console.log('[AppSync WS] Connected')
    reconnectAttempts = 0

    // Re-send subscription if it was active
    if (isSubscribed) {
      sendSubscription()
    }
  }

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data)
      handleMessage(message)
    } catch (e) {
      console.error('[AppSync WS] Failed to parse message:', e)
    }
  }

  ws.onerror = (error) => {
    console.error('[AppSync WS] Error:', error)
  }

  ws.onclose = (event) => {
    console.log('[AppSync WS] Closed:', event.code, event.reason)

    // Don't reconnect if manually closed
    if (isManuallyClosed) return

    scheduleReconnect()
  }
}

function handleMessage (message) {
  switch (message.type) {
    case 'start_ack':
      // AppSync sends this but we don't need it
      break
    case 'data':
      if (message?.data?.onPhotoUploadComplete) {
        const { photoId, waveUuid } = message.data.onPhotoUploadComplete
        console.log('[AppSync WS] OnPhotoUploadComplete received:', { photoId, waveUuid })
        emitUploadComplete({ photo: { photoId }, waveUuid })
      }
      break
    case 'complete':
      console.log('[AppSync WS] Subscription complete')
      break
    case 'error':
      console.error('[AppSync WS] Subscription error:', message)
      break
    default:
      console.log('[AppSync WS] Unknown message type:', message.type)
  }
}

function sendSubscription () {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.warn('[AppSync WS] Cannot send subscription: WebSocket not open')
    return
  }

  const id = uuidv4()
  const frame = {
    id,
    type: 'start',
    payload: {
      data: JSON.stringify({
        query: PHOTO_UPLOAD_COMPLETE_SUBSCRIPTION,
        variables: {}
      }),
      extensions: {
        authorization: api_header
      }
    },
    query: PHOTO_UPLOAD_COMPLETE_SUBSCRIPTION
  }

  ws.send(JSON.stringify(frame))
  console.log('[AppSync WS] Subscription started:', id)
}

function scheduleReconnect () {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('[AppSync WS] Max reconnect attempts reached')
    return
  }

  const delay = RECONNECT_BASE_DELAY * Math.min(2 ** reconnectAttempts, 32)
  reconnectAttempts++
  console.log(`[AppSync WS] Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`)

  reconnectTimer = setTimeout(() => {
    connect()
  }, delay)
}

// --- Public API ---

/**
 * Subscribe to OnPhotoUploadComplete events.
 * Events are emitted to the uploadBus event bus.
 * @returns {Function} Unsubscribe function
 */
export function subscribeToPhotoUploadComplete () {
  isSubscribed = true
  isManuallyClosed = false

  // Connect if not already connected
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    connect()
  } else {
    sendSubscription()
  }

  // Return unsubscribe function
  return unsubscribePhotoUploadComplete
}

/**
 * Unsubscribe from OnPhotoUploadComplete events.
 */
export function unsubscribePhotoUploadComplete () {
  isSubscribed = false
  isManuallyClosed = true

  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }

  if (ws) {
    ws.close()
    ws = null
  }

  console.log('[AppSync WS] Unsubscribed and disconnected')
}
