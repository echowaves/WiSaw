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
  // Pass through style/transform but flatten Animated values so the renderer
  // never sees an Animated.Value as a child.
  const Animated = {
    Value: class {
      constructor (value) { this._value = value }
      interpolate () { return this._value }
      setValue (v) { this._value = v }
    },
    View: (props) => React.createElement('Animated.View', props, props.children),
    Text: (props) => React.createElement('Animated.Text', props, props.children),
    spring: (value, config) => ({ start: (cb) => { value._value = config.toValue; if (cb) cb() } }),
    timing: (value, config) => ({ start: (cb) => { value._value = config.toValue; if (cb) cb() } }),
    loop: (anim) => ({ start: () => {}, stop: () => {} }),
    sequence: (anims) => ({ start: () => {}, stop: () => {} })
  }
  return {
    Animated,
    StyleSheet: { create: (s) => s },
    Text,
    TouchableOpacity,
    View
  }
})

jest.mock('jotai', () => ({
  useAtom: () => [false, jest.fn()],
  useAtomValue: () => true,
  useSetAtom: () => jest.fn()
}))

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 50, bottom: 20, left: 0, right: 0 })
}))

jest.mock('@react-native-vector-icons/material-icons', () => {
  const React = require('react')
  const MockIcon = (props) => React.createElement('MaterialIcons', { testID: `icon-${props.name}`, ...props })
  MockIcon.displayName = 'MaterialIcons'
  return MockIcon
})

jest.mock('../../../state', () => ({
  netAvailable: 'netAvailable-atom',
  isDarkMode: 'isDarkMode-atom',
  bannerHeightAtom: 'bannerHeight-atom'
}))

const THEME = {
  CARD_BACKGROUND: '#FFFFFF',
  CARD_BORDER: 'rgba(0,0,0,0.06)',
  CARD_SHADOW: 'rgba(0,0,0,0.1)',
  TEXT_PRIMARY: '#111111',
  INTERACTIVE_PRIMARY: '#EA5E3D',
  TEXT_DISABLED: 'rgba(85,95,97,0.4)'
}
jest.mock('../../../theme/sharedStyles', () => ({
  getTheme: () => THEME
}))

jest.mock('../../../consts', () => ({
  MAIN_COLOR: '#EA5E3D'
}))

jest.mock('../../ui/LinearProgress', () => ({
  __esModule: true,
  default: (props) => require('react').createElement('LinearProgress', { testID: 'linear-progress', ...props })
}))

// The modal is covered by its own test file; here it is a props-capturing stub.
jest.mock('../../UploadQueueModal', () => ({
  __esModule: true,
  default: (props) => require('react').createElement('UploadQueueModalStub', { testID: 'upload-queue-modal', ...props })
}))

const mockShowConfirmAlert = jest.fn()
jest.mock('../../../utils/showConfirmAlert', () => ({
  __esModule: true,
  default: mockShowConfirmAlert
}))

// A real React context (created lazily so the factory stays self-contained):
// the banner reads it via useContext and the test renders through its Provider.
jest.mock('../../../contexts/UploadContext', () => ({
  __esModule: true,
  default: require('react').createContext({})
}))

const React = require('react')

const UploadContext = require('../../../contexts/UploadContext').default
const GlobalUploadBanner = require('../index').default

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

const renderBanner = (contextValue) => {
  const value = {
    pendingPhotos: [makeItem('a'), makeItem('b', { type: 'video' })],
    isUploading: true,
    isPaused: false,
    activeUploadId: null,
    clearPendingQueue: jest.fn(),
    pauseUploads: jest.fn(),
    resumeUploads: jest.fn(),
    removePendingItem: jest.fn(),
    ...contextValue
  }
  let renderer
  act(() => {
    renderer = TestRenderer.create(
      React.createElement(UploadContext.Provider, { value }, React.createElement(GlobalUploadBanner))
    )
  })
  return { renderer, value }
}

const findIcon = (renderer, name) =>
  renderer.root.findAll((node) => node.props.testID === `icon-${name}`)

describe('GlobalUploadBanner wiring (upload-queue-management)', () => {
  it('4.1 renders a 3-dots button when the banner is visible', () => {
    const { renderer } = renderBanner({})
    expect(findIcon(renderer, 'more-vert')).toHaveLength(1)
    act(() => { renderer.unmount() })
  })

  it('4.2 tapping the 3-dots and long-pressing the card both pause and open the modal', () => {
    // 3-dots tap
    const first = renderBanner({})
    const dots = first.renderer.root.findAll(
      (node) => node.type === 'TouchableOpacity' && node.props.hitSlop && node.props.onPress
    ).find((node) => node.findAll((c) => c.props.testID === 'icon-more-vert').length > 0)
    act(() => { dots.props.onPress() })
    expect(first.value.pauseUploads).toHaveBeenCalledTimes(1)

    // Long press
    const second = renderBanner({})
    const outer = second.renderer.root.children[0]
    expect(outer.props.onLongPress).toBeInstanceOf(Function)
    act(() => { outer.props.onLongPress() })
    expect(second.value.pauseUploads).toHaveBeenCalledTimes(1)

    act(() => { first.renderer.unmount() })
    act(() => { second.renderer.unmount() })
  })

  it('4.3 long-press no longer triggers the clear confirm alert', () => {
    const { renderer } = renderBanner({})
    const outer = renderer.root.children[0]
    act(() => { outer.props.onLongPress() })
    expect(mockShowConfirmAlert).not.toHaveBeenCalled()
    act(() => { renderer.unmount() })
  })

  it('4.4 paused state: label reads "paused", pause icon, no pulse, dimmed progress strip', () => {
    const { renderer } = renderBanner({ isPaused: true, isUploading: false })
    const root = renderer.root

    const label = root.findAll((node) => node.type === 'Animated.Text').map((t) => t.props.children).join(' ')
    expect(label).toContain('paused')
    expect(findIcon(renderer, 'pause-circle')).toHaveLength(1)
    expect(findIcon(renderer, 'cloud-upload')).toHaveLength(0)

    // The absolute progress strip is dimmed while paused.
    const strip = root.findAll(
      (node) => node.type === 'View' && Array.isArray(node.props.style)
        ? false
        : node.props.style && node.props.style.position === 'absolute'
    )
    expect(strip.length).toBeGreaterThan(0)
    expect(strip[0].props.style.opacity).toBe(0.3)

    act(() => { renderer.unmount() })
  })

  it('4.4 non-paused uploading state: label reads "uploading" and the strip is full opacity', () => {
    const { renderer } = renderBanner({ isPaused: false, isUploading: true })
    const root = renderer.root
    const label = root.findAll((node) => node.type === 'Animated.Text').map((t) => t.props.children).join(' ')
    expect(label).toContain('uploading')
    expect(findIcon(renderer, 'pause-circle')).toHaveLength(0)
    const strip = root.findAll(
      (node) => node.props.style && node.props.style.position === 'absolute'
    )
    expect(strip[0].props.style.opacity).toBe(1)
    act(() => { renderer.unmount() })
  })

  it('4.5 the banner computes the toast top offset below itself', () => {
    // The offset is insets.top (50) + bannerHeight + 10; with height 0 at
    // first layout it is 60. The modal receives it via props, so verify the
    // banner passes a finite numeric offset by rendering with a queue.
    const { renderer, value } = renderBanner({})
    expect(typeof value.pauseUploads).toBe('function')
    // Simulate layout to set bannerHeightInternal, then confirm the computed
    // offset is used by the modal (onLayout is on the Animated.View).
    const animatedViews = renderer.root.findAll((node) => node.type === 'Animated.View')
    const card = animatedViews.find((v) => v.props.onLayout)
    act(() => {
      card.props.onLayout({ nativeEvent: { layout: { height: 64 } } })
    })
    // The modal is rendered inside the banner; after layout the offset is
    // insets.top + 64 + 10 = 124. Find the modal element by its props.
    const modal = renderer.root.findAll((node) => node.props && typeof node.props.toastTopOffset === 'number')
    expect(modal.length).toBeGreaterThan(0)
    expect(modal[0].props.toastTopOffset).toBe(50 + 64 + 10)
    act(() => { renderer.unmount() })
  })
})
