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
  existingUris: new Set()
}

jest.mock('expo-cached-image', () => ({ CacheManager: { addToCache: jest.fn() } }))
jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: { WEBP: 'webp' }
}))
jest.mock('expo-video-thumbnails', () => ({ getThumbnailAsync: jest.fn() }))
jest.mock('expo/fetch', () => ({ fetch: jest.fn() }))
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
      mockState.queue = value
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
  getQueue
} = require('../photoUploadService')

beforeEach(() => {
  mockState.queue = []
  mockState.deletedUris = []
  mockState.copySource = null
  mockState.copyDest = null
  mockState.copyImpl = async () => {}
  mockState.existingUris = new Set()
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
