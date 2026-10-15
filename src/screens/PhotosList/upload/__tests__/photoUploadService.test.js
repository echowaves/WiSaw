/* eslint-env jest */

// The service references the React Native __DEV__ global; define it so the
// module can be loaded under jest.
global.__DEV__ = false

// Mutable state backing the mocked expo-storage / expo-file-system so tests
// can seed a queue or control copy behavior between calls.
const mockState = {
  queue: [],
  deletedUris: [],
  copySource: null,
  copyDest: null,
  copyImpl: async () => {},
  existingUris: new Set(),
  setItemImpl: async () => {},
  events: []
}

jest.mock('expo-cached-image', () => ({ CacheManager: { addToCache: jest.fn() } }))
jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(async () => {
    const uri = 'file:///docs/pendingUploads/generated-thumb.webp'
    mockState.existingUris.add(uri)
    return { uri }
  }),
  SaveFormat: { WEBP: 'webp' }
}))
jest.mock('expo-video-thumbnails', () => ({
  getThumbnailAsync: jest.fn(async () => {
    const uri = 'file:///docs/pendingUploads/generated-frame.jpg'
    mockState.existingUris.add(uri)
    return { uri }
  })
}))
jest.mock('expo/fetch', () => ({ fetch: jest.fn(async () => ({ status: 200 })) }))
jest.mock('@apollo/client', () => ({ gql: (strings) => strings }))
jest.mock('uuid', () => ({ v4: () => 'fixed-photo-id' }))
jest.mock('react-native', () => ({ Image: { getSize: jest.fn() } }))
jest.mock('../../../../utils/showToast', () => ({
  showInfoToast: jest.fn(),
  showErrorToast: jest.fn()
}))
jest.mock('../../../../consts', () => ({
  PENDING_UPLOADS_KEY: 'PENDING_UPLOADS',
  PENDING_UPLOADS_FOLDER: {
    uri: 'file:///docs/pendingUploads',
    exists: true,
    create: jest.fn()
  },
  gqlClient: { query: jest.fn(), mutate: jest.fn() }
}))

// In-memory expo-storage keyed by the PENDING_UPLOADS key.
jest.mock('expo-storage', () => ({
  Storage: {
    getItem: jest.fn(async () => JSON.stringify(mockState.queue)),
    setItem: jest.fn(async ({ value }) => {
      await mockState.setItemImpl(value)
      mockState.queue = value
      mockState.events.push({ type: 'queue-write', queue: JSON.parse(JSON.stringify(value)) })
    })
  }
}))

// Minimal File implementation: resolves a single-URI or Directory+name
// constructor, records copy()/delete() calls, and reads existence from a set.
jest.mock('expo-file-system', () => ({
  File: class {
    constructor (first, second) {
      this.uri = second !== undefined ? `${first.uri}/${second}` : first
    }

    get exists () {
      return mockState.existingUris.has(this.uri)
    }

    async copy (dest) {
      mockState.copySource = this.uri
      mockState.copyDest = dest.uri
      return mockState.copyImpl()
    }

    async move (dest) {
      mockState.events.push({ type: 'move', from: this.uri, to: dest.uri })
      mockState.existingUris.delete(this.uri)
      mockState.existingUris.add(dest.uri)
    }

    delete () {
      mockState.deletedUris.push(this.uri)
    }
  },
  Directory: jest.fn(),
  Paths: { document: 'file:///docs' }
}))

const {
  queueFileForUpload,
  deleteLocalArtifacts,
  clearQueue,
  getQueue,
  processCompleteUpload,
  recoverStagedVideo
} = require('../photoUploadService')
const { Storage } = require('expo-storage')
const VideoThumbnails = require('expo-video-thumbnails')
const { CacheManager } = require('expo-cached-image')
const { Image } = require('react-native')
const { fetch } = require('expo/fetch')
const { gqlClient } = require('../../../../consts')

beforeEach(() => {
  mockState.queue = []
  mockState.deletedUris = []
  mockState.copySource = null
  mockState.copyDest = null
  mockState.copyImpl = async () => {}
  mockState.existingUris = new Set()
  mockState.setItemImpl = async () => {}
  mockState.events = []
  Storage.setItem.mockClear()
  gqlClient.query.mockReset()
  gqlClient.mutate.mockReset()
  gqlClient.query.mockImplementation(async ({ query }) => (
    query[0].includes('generateUploadUrl')
      ? { data: { generateUploadUrl: 'https://upload.invalid/signed' } }
      : { data: { getPhotoById: null } }
  ))
  gqlClient.mutate.mockImplementation(async () => {
    mockState.events.push({ type: 'create-photo' })
    return { data: { createPhoto: { id: 'fixed-photo-id', active: false } } }
  })
  VideoThumbnails.getThumbnailAsync.mockClear()
  CacheManager.addToCache.mockClear()
  Image.getSize.mockImplementation((uri, onSuccess) => onSuccess(1280, 720))
  fetch.mockClear()
})

describe('queueFileForUpload (stable copy at enqueue)', () => {
  it('copies the capture into the pending-uploads folder and stores the stable path', async () => {
    const cameraImgUrl = 'file:///tmp/camera/photo.jpg'

    await queueFileForUpload({
      cameraImgUrl,
      type: 'image',
      location: { coords: { latitude: 40.7, longitude: -74.0 } },
      waveUuid: undefined
    })

    // The source camera file was copied (never path-checked), into a stable name.
    expect(mockState.copySource).toBe(cameraImgUrl)
    expect(mockState.copyDest).toBe('file:///docs/pendingUploads/fixed-photo-id.src')

    const [entry] = await getQueue()
    // The entry references the durable path, not the evictable temp URI.
    expect(entry.originalCameraUrl).toBe('file:///docs/pendingUploads/fixed-photo-id.src')
    expect(entry.originalCameraUrl).not.toBe(cameraImgUrl)
    expect(entry.photoId).toBe('fixed-photo-id')
  })

  it('rethrows a copy failure BEFORE persisting any queue entry', async () => {
    mockState.copyImpl = async () => {
      throw new Error('disk full')
    }

    await expect(queueFileForUpload({
      cameraImgUrl: 'file:///tmp/camera/photo.jpg',
      type: 'image',
      location: { coords: { latitude: 40.7, longitude: -74.0 } },
      waveUuid: undefined
    })).rejects.toThrow('disk full')

    // No entry with a dead path was persisted.
    expect(await getQueue()).toEqual([])
  })
})

describe('local artifact cleanup includes the stable original (2.2)', () => {
  it('deleteLocalArtifacts deletes the stable originalCameraUrl file', () => {
    deleteLocalArtifacts({
      localImgUrl: 'file:///docs/pendingUploads/a.webp',
      localThumbUrl: 'file:///docs/pendingUploads/a-thumb.webp',
      localVideoUrl: 'file:///docs/pendingUploads/a.mov',
      originalCameraUrl: 'file:///docs/pendingUploads/fixed-photo-id.src'
    })

    expect(mockState.deletedUris).toContain('file:///docs/pendingUploads/fixed-photo-id.src')
    expect(mockState.deletedUris).toContain('file:///docs/pendingUploads/a.webp')
    expect(mockState.deletedUris).toContain('file:///docs/pendingUploads/a-thumb.webp')
    expect(mockState.deletedUris).toContain('file:///docs/pendingUploads/a.mov')
  })

  it('clearQueue deletes the stable originals of all items and empties the queue', async () => {
    mockState.queue = [
      { photoId: 'p1', originalCameraUrl: 'file:///docs/pendingUploads/p1.src', localImgUrl: 'file:///docs/pendingUploads/p1.webp' },
      { photoId: 'p2', originalCameraUrl: 'file:///docs/pendingUploads/p2.src', localImgUrl: 'file:///docs/pendingUploads/p2.webp' }
    ]

    await clearQueue()

    expect(mockState.queue).toEqual([])
    expect(mockState.deletedUris).toContain('file:///docs/pendingUploads/p1.src')
    expect(mockState.deletedUris).toContain('file:///docs/pendingUploads/p2.src')
  })
})

describe('video staging recovery', () => {
  const makeVideoItem = (overrides = {}) => ({
    photoId: 'fixed-photo-id',
    localImageName: 'capture.mov',
    originalCameraUrl: 'file:///docs/pendingUploads/fixed-photo-id.src',
    type: 'video',
    location: { coords: { latitude: 40.7, longitude: -74.0 } },
    ...overrides
  })

  it('persists the staged video before photo creation', async () => {
    const item = makeVideoItem()
    mockState.queue = [item]
    mockState.existingUris.add(item.originalCameraUrl)

    await processCompleteUpload({ item, uuid: 'device-uuid' })

    const stagedWriteIndex = mockState.events.findIndex((event) =>
      event.type === 'queue-write' && event.queue[0]?.localVideoUrl === 'file:///docs/pendingUploads/capture.mov'
    )
    const createPhotoEventIndex = mockState.events.findIndex((event) => event.type === 'create-photo')
    expect(stagedWriteIndex).toBeGreaterThanOrEqual(0)
    expect(createPhotoEventIndex).toBeGreaterThan(stagedWriteIndex)
    expect(mockState.events[stagedWriteIndex].queue[0].localVideoUrl).toBe('file:///docs/pendingUploads/capture.mov')
  })

  it('does not create a photo if persisting the staged video path fails', async () => {
    const item = makeVideoItem()
    mockState.queue = [item]
    mockState.existingUris.add(item.originalCameraUrl)
    mockState.setItemImpl = async (queue) => {
      if (queue[0]?.localVideoUrl) {
        throw new Error('storage unavailable')
      }
    }
    gqlClient.mutate.mockImplementation(async () => {
      mockState.events.push({ type: 'create-photo' })
      return { data: { createPhoto: { id: item.photoId } } }
    })

    await expect(processCompleteUpload({ item, uuid: 'device-uuid' })).resolves.toBeNull()

    expect(gqlClient.mutate).not.toHaveBeenCalled()
    expect(mockState.events.some((event) => event.type === 'create-photo')).toBe(false)
  })

  it('recovers a moved video, clears stale missing-file state, and rebuilds absent thumbnails', async () => {
    const item = makeVideoItem({
      unrecoverable: true,
      unrecoverableReason: 'missing-file'
    })
    const stagedVideoUri = 'file:///docs/pendingUploads/capture.mov'
    mockState.queue = [item]
    mockState.existingUris.add(stagedVideoUri)

    const recovered = await recoverStagedVideo(item)

    expect(recovered.localVideoUrl).toBe(stagedVideoUri)
    expect(recovered.unrecoverable).toBe(false)
    expect(recovered.unrecoverableReason).toBeUndefined()
    expect(mockState.queue[0].localVideoUrl).toBe(stagedVideoUri)
    expect(mockState.queue[0].localImgUrl).toBeUndefined()
    expect(mockState.queue[0].localThumbUrl).toBeUndefined()
  })

  it('reuses an inactive photo after createPhoto times out and completes the staged video upload', async () => {
    const item = makeVideoItem()
    mockState.queue = [item]
    mockState.existingUris.add(item.originalCameraUrl)
    let photoExists = false
    gqlClient.query.mockImplementation(async ({ query }) => {
      if (query[0].includes('generateUploadUrl')) {
        return { data: { generateUploadUrl: 'https://upload.invalid/signed' } }
      }
      return { data: { getPhotoById: photoExists ? { id: item.photoId, active: false } : null } }
    })
    gqlClient.mutate.mockImplementation(async () => {
      mockState.events.push({ type: 'create-photo' })
      photoExists = true
      throw new Error('Photo creation timed out after server commit')
    })

    await expect(processCompleteUpload({ item, uuid: 'device-uuid' })).resolves.toBeNull()
    const persistedItem = mockState.queue[0]
    expect(persistedItem.localVideoUrl).toBe('file:///docs/pendingUploads/capture.mov')
    expect(persistedItem.localImgUrl).toBe('file:///docs/pendingUploads/generated-frame.jpg')
    expect(mockState.events.filter((event) => event.type === 'create-photo')).toHaveLength(1)

    gqlClient.mutate.mockReset()
    await processCompleteUpload({ item: persistedItem, uuid: 'device-uuid' })

    expect(gqlClient.mutate).not.toHaveBeenCalled()
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
