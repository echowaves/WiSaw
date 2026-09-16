/* eslint-env jest */

global.__DEV__ = false

const React = require('react')
const TestRenderer = require('react-test-renderer')
const { act } = TestRenderer

const mockUsePhotoUploader = jest.fn()
jest.mock('../../screens/PhotosList/upload/usePhotoUploader', () => ({
  __esModule: true,
  default: (config) => mockUsePhotoUploader(config)
}))

jest.mock('../../state', () => ({
  uuid: 'uuid-atom',
  netAvailable: 'netAvailable-atom',
  useNetInfoSubscription: jest.fn()
}))

jest.mock('jotai', () => ({
  useAtom: (atom) => (atom === 'uuid-atom' ? ['device-uuid', jest.fn()] : [true, jest.fn()])
}))

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 50, bottom: 20, left: 0, right: 0 })
}))

const { UploadProvider } = require('../UploadContext')
const UploadContext = require('../UploadContext').default

let captured = null
const Consumer = () => {
  captured = React.useContext(UploadContext)
  return null
}

beforeEach(() => {
  mockUsePhotoUploader.mockReset()
  mockUsePhotoUploader.mockReturnValue({
    pendingPhotos: [],
    isUploading: false,
    isPaused: false,
    activeUploadId: null,
    enqueueCapture: jest.fn(),
    clearPendingQueue: jest.fn(),
    refreshPendingQueue: jest.fn(),
    processQueue: jest.fn(),
    pauseUploads: jest.fn(),
    resumeUploads: jest.fn(),
    removePendingItem: jest.fn()
  })
})

describe('UploadProvider (upload-queue-management task 2.1)', () => {
  it('exposes all five new values wired to the hook', () => {
    let renderer
    act(() => {
      renderer = TestRenderer.create(
        React.createElement(UploadProvider, null, React.createElement(Consumer))
      )
    })

    expect(mockUsePhotoUploader).toHaveBeenCalled()
    const hookReturn = mockUsePhotoUploader.mock.results[0].value
    expect(captured.isPaused).toBe(hookReturn.isPaused)
    expect(captured.activeUploadId).toBe(hookReturn.activeUploadId)
    expect(captured.pauseUploads).toBe(hookReturn.pauseUploads)
    expect(captured.resumeUploads).toBe(hookReturn.resumeUploads)
    expect(captured.removePendingItem).toBe(hookReturn.removePendingItem)

    act(() => { renderer.unmount() })
  })
})
