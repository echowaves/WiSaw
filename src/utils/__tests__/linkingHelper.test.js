/* global jest, describe, it, expect, beforeEach */

import * as Linking from 'expo-linking'
import base64 from 'react-native-base64'

import { parseDeepLink } from '../linkingHelper'

jest.mock('expo-linking', () => ({
  parse: jest.fn(),
  createURL: jest.fn(() => 'wisaw://'),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  getInitialURL: jest.fn(),
}))

jest.mock('react-native-base64', () => ({
  __esModule: true,
  default: {
    encode: (value) => Buffer.from(value, 'utf8').toString('base64'),
    decode: (value) => Buffer.from(value, 'base64').toString('utf8'),
  },
}))

describe('parseDeepLink', () => {
  beforeEach(() => {
    Linking.parse.mockReset()
  })

  it('handles custom scheme photo links', () => {
    const result = parseDeepLink('wisaw://photos/abc123')

    expect(result).toEqual({
      type: 'photo',
      photoId: 'abc123',
    })
  })

  it('handles custom scheme friend links', () => {
    const result = parseDeepLink('wisaw://friends/uuid-999')

    expect(result).toEqual({
      type: 'friend',
      friendshipUuid: 'uuid-999',
    })
  })

  it('handles universal links for confirm friendship', () => {
    Linking.parse.mockReturnValue({
      hostname: 'link.wisaw.com',
      path: 'confirm-friendship/uuid-123',
      queryParams: {},
    })

    const result = parseDeepLink(
      'https://link.wisaw.com/confirm-friendship/uuid-123',
    )

    expect(Linking.parse).toHaveBeenCalled()
    expect(result).toEqual({
      type: 'friend',
      friendshipUuid: 'uuid-123',
    })
  })

  it('decodes friendship name updates from custom scheme link params', () => {
    const payload = {
      action: 'friendshipName',
      friendshipUuid: 'uuid-555',
      friendName: 'Sam Example',
      timestamp: 1735928573,
    }

    const encoded = base64.encode(JSON.stringify(payload))

    const result = parseDeepLink(
      `wisaw://friendship?type=friendship&data=${encodeURIComponent(encoded)}`,
    )

    expect(result).toEqual({
      type: 'friendshipName',
      friendshipUuid: 'uuid-555',
      friendName: 'Sam Example',
      timestamp: 1735928573,
    })
  })
})
