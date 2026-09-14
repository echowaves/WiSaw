/* eslint-env jest */

// The service references the React Native __DEV__ global.
global.__DEV__ = false

// Hoisting-safe shared state. The jest.mock factory may only reference
// `global` (and `jest`), so all shared state lives on `global`. The factory
// *executes* when the hook module is required (at the bottom of this file),
// by which point these globals are initialized; the functions read them
// lazily at call time.
global.__uploadTestState = {
  queue: [],
  existingFiles: new Set(),
  uploadCalls: [],
  appStateListeners: []
}
global.__emitUploadComplete = jest.fn()

jest.mock('expo-secure-store', () => ({
  __esModule: true,
  default: {
    getItemAsync: jest.fn(async () => null),
    setItemAsync: jest.fn()
  }
}))
jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn((event, listener) => {
      global.__uploadTestState.appStateListeners.push(listener)
      return { remove: jest.fn() }
    })
  }
}))
jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    fetch: jest.fn(async () => ({ isConnected: true, isInternetReachable: true }))
  }
}))
jest.mock('../../../../events/uploadBus', () => ({
  emitUploadComplete: jest.fn((payload) => global.__emitUploadComplete(payload))
}))
jest.mock('../../../../utils/isValidLocation', () => ({
  __esModule: true,
  default: (loc) => {
    const lat = loc?.coords?.latitude
    const lon = loc?.coords?.longitude
    return typeof lat === 'number' && typeof lon === 'number' && lat !== 0 && lon !== 0 && !Number.isNaN(lat) && !Number.isNaN(lon)
  }
}))
jest.mock('../../../../utils/showToast', () => ({
  showInfoToast: jest.fn(),
  showErrorToast: jest.fn()
}))
jest.mock('../../../../consts', () => ({
  UUID_KEY: 'wisaw_device_uuid'
}))
jest.mock('../photoUploadService', () => ({
  getQueue: jest.fn(async () => global.__uploadTestState.queue),
  updateQueueItem: jest.fn(async (originalItem, updatedItem) => {
    const q = global.__uploadTestState.queue
    const idx = q.findIndex((i) => i.photoId === originalItem?.photoId)
    if (idx !== -1) q[idx] = updatedItem
  }),
  ensureFileExists: jest.fn(async (uri) => global.__uploadTestState.existingFiles.has(uri)),
  processCompleteUpload: jest.fn(async ({ item }) => {
    const q = global.__uploadTestState.queue
    global.__uploadTestState.uploadCalls.push(item.photoId)
    // Mirror the real service: a confirmed success removes the entry.
    q.splice(0, q.length, ...q.filter((i) => i.photoId !== item.photoId))
    return { id: item.photoId }
  }),
  deleteLocalArtifacts: jest.fn(),
  removeFromQueue: jest.fn(async () => {}),
  clearQueue: jest.fn(async () => {
    global.__uploadTestState.queue.splice(0, global.__uploadTestState.queue.length)
  }),
  initPendingUploads: jest.fn(async () => {}),
  queueFileForUpload: jest.fn(async () => {})
}))

const React = require('react')
const TestRenderer = require('react-test-renderer')
const { act } = TestRenderer

const service = require('../photoUploadService')
const usePhotoUploader = require('../usePhotoUploader').default

const VALID_LOCATION = { coords: { latitude: 40.7, longitude: -74.0 } }
const makeItem = (photoId, overrides = {}) => ({
  photoId,
  localImageName: `${photoId}.webp`,
  type: 'image',
  originalCameraUrl: `file:///pending/${photoId}.src`,
  localImgUrl: undefined,
  location: VALID_LOCATION,
  ...overrides
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const renderHook = () => {
  let renderer
  // setUuid must be stable across re-renders: the hook's processQueue depends
  // on it (via resolveUuid), and an unstable identity would re-fire the mount
  // effect on every render, driving an endless processing loop.
  const setUuid = jest.fn()
  const Harness = () => {
    usePhotoUploader({ uuid: 'device-uuid', setUuid, topOffset: 0, netAvailable: true })
    return null
  }
  act(() => {
    renderer = TestRenderer.create(React.createElement(Harness))
  })
  return renderer
}

beforeEach(() => {
  const st = global.__uploadTestState
  st.queue.splice(0, st.queue.length)
  st.existingFiles.clear()
  st.uploadCalls.length = 0
  st.appStateListeners.length = 0
  Object.values(service).forEach((fn) => {
    if (typeof fn === 'function' && fn.mock) fn.mockClear()
  })
  global.__emitUploadComplete.mockClear()
})

describe('processQueue unrecoverable skip (task 3.1)', () => {
  it('marks a missing-file item unrecoverable, uploads the valid item behind it, and keeps the skipped item in the queue', async () => {
    global.__uploadTestState.queue.push(makeItem('a'), makeItem('b'))
    // Only b's stable file exists; a's file is gone.
    global.__uploadTestState.existingFiles.add('file:///pending/b.src')

    const renderer = renderHook()
    await act(async () => { await sleep(30) })

    // Only the valid item reached the upload cycle.
    expect(global.__uploadTestState.uploadCalls).toEqual(['b'])
    // The missing-file item was classified, not deleted, and not retried.
    expect(global.__uploadTestState.queue).toHaveLength(1)
    expect(global.__uploadTestState.queue[0].photoId).toBe('a')
    expect(global.__uploadTestState.queue[0].unrecoverable).toBe(true)
    expect(global.__uploadTestState.queue[0].unrecoverableReason).toBe('missing-file')
    // A skip is not a failure: no retry bookkeeping was recorded.
    expect(global.__uploadTestState.queue[0].retryCount).toBeUndefined()
    expect(global.__uploadTestState.queue[0].lastFailedAt).toBeUndefined()
    // Exactly one completion event, for the valid item.
    expect(global.__emitUploadComplete).toHaveBeenCalledTimes(1)

    act(() => { renderer.unmount() })
  })

  it('marks an invalid-location item unrecoverable and continues to the next item', async () => {
    global.__uploadTestState.queue.push(makeItem('a', { location: null }), makeItem('b'))
    global.__uploadTestState.existingFiles.add('file:///pending/a.src')
    global.__uploadTestState.existingFiles.add('file:///pending/b.src')

    const renderer = renderHook()
    await act(async () => { await sleep(30) })

    expect(global.__uploadTestState.uploadCalls).toEqual(['b'])
    expect(global.__uploadTestState.queue).toHaveLength(1)
    expect(global.__uploadTestState.queue[0].photoId).toBe('a')
    expect(global.__uploadTestState.queue[0].unrecoverableReason).toBe('invalid-location')

    act(() => { renderer.unmount() })
  })
})

describe('processQueue head-of-line blocking (task 3.2)', () => {
  it('completes all valid items in one pass when the head is already unrecoverable', async () => {
    global.__uploadTestState.queue.push(
      makeItem('a', { unrecoverable: true, unrecoverableReason: 'missing-file' }),
      makeItem('b'),
      makeItem('c')
    )
    global.__uploadTestState.existingFiles.add('file:///pending/b.src')
    global.__uploadTestState.existingFiles.add('file:///pending/c.src')

    const renderer = renderHook()
    await act(async () => { await sleep(30) })

    // Both valid items completed within the single pass, in order.
    expect(global.__uploadTestState.uploadCalls).toEqual(['b', 'c'])
    // The already-flagged head was skipped without any disk check.
    expect(service.ensureFileExists).not.toHaveBeenCalledWith('file:///pending/a.src')
    // Only the unrecoverable item remains.
    expect(global.__uploadTestState.queue.map((i) => i.photoId)).toEqual(['a'])
    expect(global.__emitUploadComplete).toHaveBeenCalledTimes(2)

    act(() => { renderer.unmount() })
  })
})
