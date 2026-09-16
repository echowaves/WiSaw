/* eslint-env jest */

global.__DEV__ = false

const TestRenderer = require('react-test-renderer')
const { act } = TestRenderer

const makeRnComponent = (name, React) => {
  const C = (props) => React.createElement(name, props, props.children)
  C.displayName = name
  return C
}

jest.mock('react-native', () => {
  const React = require('react')
  const Text = makeRnComponent('Text', React)
  const View = makeRnComponent('View', React)
  const TouchableOpacity = makeRnComponent('TouchableOpacity', React)
  const ActivityIndicator = makeRnComponent('ActivityIndicator', React)
  const Image = makeRnComponent('Image', React)
  const Modal = (props) => (props.visible ? React.createElement('Modal', null, props.children) : null)
  Modal.displayName = 'Modal'
  // Render every item inline so tests can find rows without scroll machinery.
  const FlatList = (props) => React.createElement(
    'FlatList',
    { testID: 'queue-flat-list' },
    (props.data || []).map((item, index) => props.renderItem({ item, index }))
  )
  FlatList.displayName = 'FlatList'

  return {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    StyleSheet: { create: (s) => s },
    Text,
    TouchableOpacity,
    View
  }
})

jest.mock('jotai', () => ({
  useAtom: () => [false, jest.fn()],
  useAtomValue: () => false
}))

jest.mock('expo-cached-image', () => ({
  __esModule: true,
  default: (props) => require('react').createElement('CachedImage', { testID: `cached-image-${props.cacheKey}`, ...props })
}))

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn()
}))

jest.mock('@react-native-vector-icons/ionicons', () => {
  const React = require('react')
  const Icon = (props) => React.createElement('Ionicons', { testID: `ionicons-${props.name}`, ...props })
  Icon.displayName = 'Ionicons'
  return { __esModule: true, default: Icon }
})

jest.mock('@react-native-vector-icons/fontawesome5', () => {
  const React = require('react')
  const Icon = (props) => React.createElement('FontAwesome5', { testID: `fa5-${props.name}`, ...props })
  Icon.displayName = 'FontAwesome5'
  return { __esModule: true, default: Icon }
})

jest.mock('../../../state', () => ({
  isDarkMode: 'isDarkMode'
}))

const THEME = {
  BACKGROUND: '#F5F5F5',
  CARD_BACKGROUND: '#FFFFFF',
  CARD_BORDER: 'rgba(0,0,0,0.06)',
  TEXT_PRIMARY: '#111111',
  TEXT_SECONDARY: 'rgba(85,95,97,0.7)',
  TEXT_DISABLED: 'rgba(85,95,97,0.4)',
  INTERACTIVE_BACKGROUND: 'rgba(234,94,61,0.05)',
  INTERACTIVE_PRIMARY: '#EA5E3D',
  BACKGROUND_DISABLED: 'rgba(85,95,97,0.05)'
}

jest.mock('../../../theme/sharedStyles', () => ({
  getTheme: () => THEME,
  SHARED_STYLES: { text: { subheading: {} } }
}))

jest.mock('../../../consts', () => ({
  MAIN_COLOR: '#EA5E3D'
}))

const mockShowConfirmAlert = jest.fn()
jest.mock('../../../utils/showConfirmAlert', () => ({
  __esModule: true,
  default: mockShowConfirmAlert
}))

const mockShowToast = jest.fn()
jest.mock('../../../utils/showToast', () => ({
  __esModule: true,
  default: mockShowToast
}))

const React = require('react')

const UploadQueueModal = require('../index').default

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

// The header shows "Upload queue · N selected"; the footer button always
// renders the word "selected" in its label, so the count is detected by the
// "<number> selected" pattern rather than a bare substring.
const hasSelectionCount = (root) =>
  root.findAll((node) => node.type === 'Text').some((t) => /\d+ selected/.test(`${t.props.children}`))

const renderModal = (props) => {
  const base = {
    visible: true,
    pendingPhotos: [makeItem('a'), makeItem('b', { type: 'video' }), makeItem('c')],
    activeUploadId: null,
    clearPendingQueue: jest.fn(async () => {}),
    removePendingItem: jest.fn(async () => {}),
    resumeUploads: jest.fn(),
    toastTopOffset: 100,
    onClose: jest.fn(),
    ...props
  }
  let renderer
  act(() => {
    renderer = TestRenderer.create(React.createElement(UploadQueueModal, base))
  })
  return { renderer, props: base }
}

const update = (renderer, props) => {
  act(() => {
    renderer.update(React.createElement(UploadQueueModal, { visible: true, pendingPhotos: props.pendingPhotos, activeUploadId: props.activeUploadId ?? null, clearPendingQueue: jest.fn(), removePendingItem: jest.fn(), resumeUploads: jest.fn(), toastTopOffset: 100, onClose: jest.fn(), ...props }))
  })
}

beforeEach(() => {
  mockShowConfirmAlert.mockReset()
  mockShowToast.mockReset()
})

describe('UploadQueueModal (upload-queue-management)', () => {
  it('3.1 renders one row per pending item with a thumbnail', () => {
    const { renderer } = renderModal({
      pendingPhotos: [
        makeItem('a', { localThumbUrl: 'https://cdn.example.com/a-thumb.webp' }),
        makeItem('b', { type: 'video' }),
        makeItem('c')
      ]
    })
    const root = renderer.root
    expect(root.findByProps({ testID: 'queue-row-a' })).toBeTruthy()
    expect(root.findByProps({ testID: 'queue-row-b' })).toBeTruthy()
    expect(root.findByProps({ testID: 'queue-row-c' })).toBeTruthy()
    // Remote thumbnails resolve through the cached-image fallback chain.
    expect(root.findByProps({ testID: 'cached-image-a-queue-thumb' })).toBeTruthy()
    // Local file:// thumbnails use the native Image: expo-cached-image
    // downloads via FileSystem.downloadFileAsync, which rejects file:// URIs.
    const localImages = root.findAll((node) =>
      node.type === 'Image' && node.props.source && `${node.props.source.uri}`.startsWith('file:'))
    expect(localImages).toHaveLength(2)
    act(() => { renderer.unmount() })
  })

  it('3.2 tapping a row toggles selection and the count; queue changes prune the selection', () => {
    const { renderer } = renderModal()
    const root = renderer.root

    act(() => { root.findByProps({ testID: 'queue-row-a' }).props.onPress() })
    expect(hasSelectionCount(renderer.root)).toBe(true)

    // Tap again: deselects.
    act(() => { root.findByProps({ testID: 'queue-row-a' }).props.onPress() })
    expect(hasSelectionCount(renderer.root)).toBe(false)

    // Select, then drop the item from the queue: the selection is pruned.
    act(() => { root.findByProps({ testID: 'queue-row-a' }).props.onPress() })
    update(renderer, {
      pendingPhotos: [makeItem('b', { type: 'video' }), makeItem('c')],
      activeUploadId: null
    })
    expect(hasSelectionCount(renderer.root)).toBe(false)

    act(() => { renderer.unmount() })
  })

  it('3.3 the in-flight row is visible but not selectable', () => {
    const { renderer, props } = renderModal({ activeUploadId: 'b' })
    const root = renderer.root
    const activeRow = root.findByProps({ testID: 'queue-row-b' })
    expect(activeRow.props.disabled).toBe(true)
    expect(activeRow.props.onPress).toBeUndefined()

    // Pressing it (if it could be pressed) must not change the selection.
    act(() => { if (activeRow.props.onPress) activeRow.props.onPress() })
    expect(hasSelectionCount(renderer.root)).toBe(false)

    // A non-active row remains selectable.
    act(() => { root.findByProps({ testID: 'queue-row-a' }).props.onPress() })
    expect(props.resumeUploads).toBeDefined()
    expect(hasSelectionCount(renderer.root)).toBe(true)

    act(() => { renderer.unmount() })
  })

  it('3.4 footer buttons are gated on the selection (mirroring UngroupedPhotosCard)', () => {
    const { renderer } = renderModal()
    const root = renderer.root

    // Nothing selected: delete-selected disabled, delete-all enabled.
    expect(root.findByProps({ testID: 'queue-delete-selected-button' }).props.disabled).toBe(true)
    expect(root.findByProps({ testID: 'queue-delete-all-button' }).props.disabled).toBe(false)

    // One selected: inverted.
    act(() => { root.findByProps({ testID: 'queue-row-a' }).props.onPress() })
    expect(renderer.root.findByProps({ testID: 'queue-delete-selected-button' }).props.disabled).toBe(false)
    expect(renderer.root.findByProps({ testID: 'queue-delete-all-button' }).props.disabled).toBe(true)

    act(() => { renderer.unmount() })
  })

  it('3.5 delete selected removes exactly the selected items and keeps the modal open', async () => {
    const { renderer, props } = renderModal()
    const root = renderer.root
    act(() => { root.findByProps({ testID: 'queue-row-a' }).props.onPress() })
    act(() => { root.findByProps({ testID: 'queue-row-c' }).props.onPress() })
    act(() => { renderer.root.findByProps({ testID: 'queue-delete-selected-button' }).props.onPress() })
    await act(async () => { await Promise.resolve() })

    expect(props.removePendingItem).toHaveBeenCalledTimes(2)
    const removed = props.removePendingItem.mock.calls.map((call) => call[0].photoId).sort()
    expect(removed).toEqual(['a', 'c'])
    // Selection reset; modal still open (header still rendered).
    expect(hasSelectionCount(renderer.root)).toBe(false)
    expect(renderer.root.findByProps({ testID: 'queue-row-b' })).toBeTruthy()

    act(() => { renderer.unmount() })
  })

  it('3.6 delete all confirms via showConfirmAlert, then clears the queue', async () => {
    const { renderer, props } = renderModal()
    const root = renderer.root
    act(() => { root.findByProps({ testID: 'queue-delete-all-button' }).props.onPress() })

    expect(mockShowConfirmAlert).toHaveBeenCalledTimes(1)
    const [title, message, onConfirm] = mockShowConfirmAlert.mock.calls[0]
    expect(title).toBe('Clear Upload Queue')
    expect(message).toContain('2 photos and 1 video')

    await act(async () => { await onConfirm() })
    expect(props.clearPendingQueue).toHaveBeenCalledTimes(1)

    act(() => { renderer.unmount() })
  })

  it('3.6 delete all is ignored while items are selected', () => {
    const { renderer } = renderModal()
    const root = renderer.root
    act(() => { root.findByProps({ testID: 'queue-row-a' }).props.onPress() })
    const deleteAll = renderer.root.findByProps({ testID: 'queue-delete-all-button' })
    expect(deleteAll.props.disabled).toBe(true)
    act(() => { deleteAll.props.onPress() })
    expect(mockShowConfirmAlert).not.toHaveBeenCalled()

    act(() => { renderer.unmount() })
  })

  it('3.7 closing the modal resets selection and resumes; close is ignored while a delete is running', async () => {
    // Close resumes.
    const { renderer, props } = renderModal()
    const root = renderer.root
    act(() => { root.findByProps({ testID: 'queue-row-a' }).props.onPress() })
    act(() => { renderer.root.findByProps({ testID: 'queue-close-button' }).props.onPress() })
    expect(props.onClose).toHaveBeenCalledTimes(1)
    expect(props.resumeUploads).toHaveBeenCalledTimes(1)
    act(() => { renderer.unmount() })

    // While a delete is in flight, close is a no-op.
    const pendingRemove = jest.fn(() => new Promise(() => {}))
    const second = renderModal({ removePendingItem: pendingRemove })
    const root2 = second.renderer.root
    act(() => { root2.findByProps({ testID: 'queue-row-a' }).props.onPress() })
    act(() => { second.renderer.root.findByProps({ testID: 'queue-delete-selected-button' }).props.onPress() })
    await act(async () => { await Promise.resolve() })
    act(() => { second.renderer.root.findByProps({ testID: 'queue-close-button' }).props.onPress() })
    expect(second.props.onClose).not.toHaveBeenCalled()
    expect(second.props.resumeUploads).not.toHaveBeenCalled()
    act(() => { second.renderer.unmount() })
  })

  it('3.8 an empty queue shows the empty state with both actions disabled', () => {
    const { renderer } = renderModal({ pendingPhotos: [] })
    const root = renderer.root
    expect(root.findAll((node) => node.type === 'Text').some((t) => `${t.props.children}`.includes('No pending uploads'))).toBe(true)
    expect(root.findByProps({ testID: 'queue-delete-selected-button' }).props.disabled).toBe(true)
    expect(root.findByProps({ testID: 'queue-delete-all-button' }).props.disabled).toBe(true)

    act(() => { renderer.unmount() })
  })
})
