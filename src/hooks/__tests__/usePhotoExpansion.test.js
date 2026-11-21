/* eslint-env jest */

global.IS_REACT_ACT_ENVIRONMENT = true

const React = require('react')
const TestRenderer = require('react-test-renderer')
const { act } = TestRenderer

const usePhotoExpansion = require('../usePhotoExpansion').default

const renderHook = () => {
  let latest
  const Probe = () => {
    latest = usePhotoExpansion()
    return null
  }
  let tree
  act(() => {
    tree = TestRenderer.create(React.createElement(Probe))
  })
  return {
    get result () {
      return latest
    },
    rerender: () => act(() => { tree.update(React.createElement(Probe)) })
  }
}

describe('usePhotoExpansion', () => {
  it('keeps expandedItemIds identity stable while nothing is expanded', () => {
    const hook = renderHook()
    const first = hook.result.expandedItemIds
    expect(first).toEqual([])

    hook.rerender()
    hook.rerender()

    // A new array identity makes expo-masonry-layout relayout the whole feed on every render.
    expect(hook.result.expandedItemIds).toBe(first)
  })

  it('keeps one array while the same photo stays expanded, and updates when it changes', () => {
    const hook = renderHook()

    act(() => { hook.result.toggleExpand('photo-1') })
    const ids = hook.result.expandedItemIds
    expect(ids).toEqual(['photo-1'])

    hook.rerender()
    expect(hook.result.expandedItemIds).toBe(ids)

    act(() => { hook.result.toggleExpand('photo-2') })
    expect(hook.result.expandedItemIds).toEqual(['photo-2'])

    act(() => { hook.result.toggleExpand('photo-2') })
    expect(hook.result.expandedItemIds).toEqual([])
  })
})
