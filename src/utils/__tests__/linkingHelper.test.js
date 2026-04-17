/* global jest, describe, it, expect, beforeEach */

import * as Linking from 'expo-linking'

import { parseDeepLink } from '../linkingHelper'

jest.mock('expo-linking', () => ({
  parse: jest.fn(),
  createURL: jest.fn(() => 'wisaw://'),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  getInitialURL: jest.fn()
}))

describe('parseDeepLink', () => {
  beforeEach(() => {
    Linking.parse.mockReset()
  })

  it('handles custom scheme photo links', () => {
    const result = parseDeepLink('wisaw://photos/abc123')

    expect(result).toEqual({
      type: 'photo',
      photoId: 'abc123'
    })
  })

  it('handles custom scheme friend links', () => {
    const result = parseDeepLink('wisaw://friends/uuid-999')

    expect(result).toEqual({
      type: 'friend',
      friendshipUuid: 'uuid-999'
    })
  })

  it('handles universal links for confirm friendship', () => {
    Linking.parse.mockReturnValue({
      hostname: 'link.wisaw.com',
      path: 'confirm-friendship/uuid-123',
      queryParams: {}
    })

    const result = parseDeepLink('https://link.wisaw.com/confirm-friendship/uuid-123')

    expect(Linking.parse).toHaveBeenCalled()
    expect(result).toEqual({
      type: 'friend',
      friendshipUuid: 'uuid-123'
    })
  })

  it('handles custom scheme wave join links', () => {
    const result = parseDeepLink('wisaw://wave/join/wave-123')

    expect(result).toEqual({
      type: 'wave-join',
      waveUuid: 'wave-123'
    })
  })

  it('handles custom scheme wave invite links', () => {
    const result = parseDeepLink('wisaw://wave/invite/invite-abc')

    expect(result).toEqual({
      type: 'wave-invite',
      inviteToken: 'invite-abc'
    })
  })

  it('handles universal links for wave join', () => {
    Linking.parse.mockReturnValue({
      hostname: 'link.wisaw.com',
      path: 'wave/join/wave-456',
      queryParams: {}
    })

    const result = parseDeepLink('https://link.wisaw.com/wave/join/wave-456')

    expect(Linking.parse).toHaveBeenCalled()
    expect(result).toEqual({
      type: 'wave-join',
      waveUuid: 'wave-456'
    })
  })

  it('handles universal links for wave invite', () => {
    Linking.parse.mockReturnValue({
      hostname: 'link.wisaw.com',
      path: 'wave/invite/token-789',
      queryParams: {}
    })

    const result = parseDeepLink('https://link.wisaw.com/wave/invite/token-789')

    expect(Linking.parse).toHaveBeenCalled()
    expect(result).toEqual({
      type: 'wave-invite',
      inviteToken: 'token-789'
    })
  })
})
