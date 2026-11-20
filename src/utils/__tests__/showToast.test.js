/* eslint-env jest */

// The modules under test import react-native-toast-message, which pulls React
// Native in; stub it so these assertions stay pure JS.
global.__DEV__ = false

jest.mock('react-native-toast-message', () => ({ show: jest.fn() }))

const Toast = require('react-native-toast-message')
const { default: showToast, showErrorToast, showSuccessToast } = require('../showToast')
const richShowErrorToast = require('../showErrorToast').default

const shownToasts = () => Toast.show.mock.calls.map(([config]) => config)
const lastToast = () => shownToasts()[shownToasts().length - 1]

beforeEach(() => {
  Toast.show.mockClear()
})

describe('failure toasts always state a reason', () => {
  it('shows the GraphQL reason and carries the full detail plus stack', () => {
    const error = new Error('Something went wrong')
    error.stack = 'Error: Something went wrong\n  at deletePhoto (src/components/Photo/reducer.js:129)'
    error.graphQLErrors = [{ message: 'Photo is bookmarked' }]

    richShowErrorToast({ title: 'Unable to delete', message: error, topOffset: 60 })

    const shown = lastToast()
    expect(shown.type).toBe('error')
    expect(shown.text1).toBe('Unable to delete')
    expect(shown.text2).toContain('Photo is bookmarked')
    expect(shown.props.detail.title).toBe('Unable to delete')
    expect(shown.props.detail.message).toContain('Photo is bookmarked')
    expect(shown.props.detail.stack).toContain('deletePhoto')
  })

  it('prefers a network error message over the generic wrapper text', () => {
    const error = new Error('Something went wrong')
    error.networkError = Object.assign(new Error('Network request failed'), { name: 'AjaxError' })

    richShowErrorToast({ title: 'Unable to delete', message: error })

    expect(lastToast().text2).toContain('Network request failed')
  })

  it.each([
    ['a bare string', 'boom'],
    ['an empty object', {}],
    ['null', null]
  ])('never falls back to the old "Notification" placeholder for %s', (_label, thrown) => {
    richShowErrorToast({ title: 'Unable to delete', message: thrown })

    const shown = lastToast()
    expect(shown.text2).not.toBe('Notification')
    expect(shown.text2.trim().length).toBeGreaterThan(0)
  })

  it('renders an Error handed in as text2 instead of dropping it', () => {
    // BaseToast only renders text2 when it has a length, so an Error object
    // used to produce a toast that said nothing.
    showErrorToast('Upload failed', { text2: new Error('disk full') })

    const shown = lastToast()
    expect(typeof shown.text2).toBe('string')
    expect(shown.text2).toContain('disk full')
    expect(shown.props.detail.stack).toContain('disk full')
  })

  it('survives the historical mismatch of rich arguments on the string helper', () => {
    // src/components/Photo/reducer.js called the string-form helper with
    // { title, message }, which used to render a blank "Notification" toast.
    showErrorToast({ title: 'Unable to delete', message: new Error('Photo is bookmarked'), topOffset: 60 })

    const shown = lastToast()
    expect(shown.text1).toBe('Unable to delete')
    expect(shown.text2).toContain('Photo is bookmarked')
    expect(shown.props.detail.message).toContain('Photo is bookmarked')
  })

  it('binds each error toast to its own detail', () => {
    richShowErrorToast({ title: 'Unable to delete', message: new Error('delete rejected') })
    richShowErrorToast({ title: 'Unable to bookmark', message: new Error('watch rejected') })

    const [first, second] = shownToasts()
    expect(first.props.detail.message).toContain('delete rejected')
    expect(second.props.detail.message).toContain('watch rejected')
    expect(first.props.detail.title).toBe('Unable to delete')
  })
})

describe('non-error toasts are untouched', () => {
  it('keeps success defaults and attaches no detail payload', () => {
    showSuccessToast('Photo deleted', { topOffset: 60 })

    const shown = lastToast()
    expect(shown).toMatchObject({ type: 'success', text1: 'Photo deleted', topOffset: 60, visibilityTime: 2000 })
    expect(shown.props).toBeUndefined()
  })

  it('routes showToast({ type: "error" }) through the guaranteed error path', () => {
    showToast({ type: 'error', text1: 'Upload failed', text2: 'Queue locked' })

    const shown = lastToast()
    expect(shown.text2).toContain('Queue locked')
    expect(shown.props.detail.message).toContain('Queue locked')
  })
})

describe('entry-point defaults stay as they were', () => {
  it('keeps the rich helper at 100px / 8s and the string helper at 60px / 3s', () => {
    richShowErrorToast({ title: 'Unable to delete', message: new Error('nope') })
    expect(lastToast()).toMatchObject({ topOffset: 100, visibilityTime: 8000 })

    showErrorToast('Unable to delete', { text2: 'nope' })
    expect(lastToast()).toMatchObject({ topOffset: 60, visibilityTime: 3000 })
  })
})
