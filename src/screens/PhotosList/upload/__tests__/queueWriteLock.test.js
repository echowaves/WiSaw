/* eslint-env jest */

// The service references the React Native __DEV__ global; define it so the
// module can be loaded under jest.
global.__DEV__ = false

jest.mock('expo-cached-image', () => ({ CacheManager: { addToCache: jest.fn() } }))
jest.mock('expo-file-system', () => ({
  File: jest.fn(),
  Directory: jest.fn(),
  Paths: { document: 'file:///documents' }
}))
jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: { WEBP: 'webp' }
}))
jest.mock('expo-storage', () => ({ Storage: { getItem: jest.fn(), setItem: jest.fn() } }))
jest.mock('expo-video-thumbnails', () => ({ getThumbnailAsync: jest.fn() }))
jest.mock('expo/fetch', () => ({ fetch: jest.fn() }))
jest.mock('react-native', () => ({ Image: { getSize: jest.fn() } }))
jest.mock('@apollo/client', () => ({ gql: (strings) => strings }))
jest.mock('uuid', () => ({ v4: () => 'test-photo-id' }))
jest.mock('../../../../consts', () => ({
  PENDING_UPLOADS_KEY: 'PENDING_UPLOADS',
  PENDING_UPLOADS_FOLDER: {
    uri: 'file:///documents/pendingUploads',
    exists: true,
    create: jest.fn()
  },
  gqlClient: { query: jest.fn(), mutate: jest.fn() }
}))
jest.mock('../../../../utils/showToast', () => ({
  showInfoToast: jest.fn(),
  showErrorToast: jest.fn()
}))

const { Storage } = require('expo-storage')

const { addToQueue, clearQueue, updateQueueItem, getQueue } = require('../photoUploadService')

// Simulate storage latency so read-modify-write windows overlap.
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

beforeEach(() => {
  const store = {}
  Storage.getItem.mockImplementation(({ key }) => sleep(10).then(() => JSON.stringify(store[key] ?? null)))
  Storage.setItem.mockImplementation(({ key, value }) => sleep(10).then(() => {
    store[key] = value
  }))
})

describe('queue write lock', () => {
  it('does not cull a concurrent addToQueue when updateQueueItem is in flight', async () => {
    const item1 = { photoId: 'a', localImageName: 'a.webp' }
    await addToQueue(item1)

    const updated = { ...item1, retryCount: 1, lastFailedAt: 123 }

    // Fire both mutations concurrently; without the lock, one write
    // clobbers the other (lost update).
    await Promise.all([
      updateQueueItem(item1, updated),
      addToQueue({ photoId: 'b', localImageName: 'b.webp' })
    ])

    const queue = await getQueue()
    expect(queue).toHaveLength(2)
    expect(queue.find((i) => i.photoId === 'a')).toMatchObject({ photoId: 'a', retryCount: 1, lastFailedAt: 123 })
    expect(queue.find((i) => i.photoId === 'b')).toMatchObject({ photoId: 'b' })
  })

  it('serializes clearQueue behind an in-flight updateQueueItem', async () => {
    const item1 = { photoId: 'a', localImageName: 'a.webp' }
    await addToQueue(item1)

    // Both start in the same tick; the lock orders them by enqueue order.
    // clearQueue is enqueued last, so it must observe the updated queue and
    // end with an empty queue — no partial interleaving.
    await Promise.all([
      updateQueueItem(item1, { ...item1, retryCount: 1 }),
      clearQueue()
    ])

    const queue = await getQueue()
    expect(queue).toHaveLength(0)
  })

  it('keeps the write lock usable after a throwing mutation', async () => {
    await addToQueue({ photoId: 'seed' })

    // Corrupted payload: the first write that carries the poisoned item fails.
    Storage.setItem.mockImplementationOnce(({ value }) => {
      if (value && value.some((i) => i.photoId === 'boom')) {
        throw new Error('corrupted payload')
      }
      return Promise.resolve()
    })

    // The mutation swallows and logs its own failure (existing behavior).
    await expect(updateQueueItem({ photoId: 'seed' }, { photoId: 'boom' }))
      .resolves.toBeUndefined()

    // The lock chain must still be usable: a subsequent addToQueue succeeds
    // and the persisted queue contains the new item.
    await addToQueue({ photoId: 'after' })

    const queue = await getQueue()
    expect(queue.some((i) => i.photoId === 'after')).toBe(true)
    // The failed update was not persisted.
    expect(queue.some((i) => i.photoId === 'boom')).toBe(false)
    expect(queue.some((i) => i.photoId === 'seed')).toBe(true)
  })
})
