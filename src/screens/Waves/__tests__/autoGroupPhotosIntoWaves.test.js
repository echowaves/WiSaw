/* eslint-env jest */
// Mock the heavy module graph: consts.js instantiates ApolloClient at import
// time (and reads expoConfig), and @apollo/client pulls in the full client.
jest.mock('../../../consts', () => ({
  gqlClient: {
    mutate: jest.fn()
  }
}))
jest.mock('@apollo/client', () => ({
  gql: (strings) => strings
}))

import * as CONST from '../../../consts'
import { autoGroupPhotosIntoWaves } from '../reducer'

const mutate = CONST.gqlClient.mutate

/**
 * Enqueue one or more AutoGroupResult batches that gqlClient.mutate returns
 * in order, simulating the server's one-wave-per-call contract.
 */
function queueBatches (batches) {
  mutate.mockReset()
  const results = batches.map(b => ({ data: { autoGroupPhotosIntoWaves: b } }))
  mutate.mockImplementation(() => Promise.resolve(results.shift()))
}

const LEVEL = 'CITY'

describe('autoGroupPhotosIntoWaves reducer', () => {
  it('returns the batch summary when there are no more batches', async () => {
    queueBatches([
      { waveUuid: 'w1', name: 'NYC', photosGrouped: 10, photosRemaining: 0, hasMore: false, wavesCreated: 1 }
    ])

    const total = await autoGroupPhotosIntoWaves({ uuid: 'u1', groupingLevel: LEVEL })

    expect(total).toEqual({ wavesCreated: 1, photosGrouped: 10, photosRemaining: 0, hasMore: false })
    expect(mutate).toHaveBeenCalledTimes(1)
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { uuid: 'u1', groupingLevel: LEVEL },
        fetchPolicy: 'network-only'
      })
    )
  })

  it('loops while hasMore and accumulates wavesCreated and photosGrouped across batches', async () => {
    queueBatches([
      { waveUuid: 'w1', name: 'NYC', photosGrouped: 5, photosRemaining: 6, hasMore: true, wavesCreated: 1 },
      { waveUuid: 'w2', name: 'LA', photosGrouped: 3, photosRemaining: 2, hasMore: true, wavesCreated: 2 },
      { waveUuid: 'w3', name: 'SF', photosGrouped: 2, photosRemaining: 0, hasMore: false, wavesCreated: 1 }
    ])

    const total = await autoGroupPhotosIntoWaves({ uuid: 'u1', groupingLevel: LEVEL })

    expect(total).toEqual({ wavesCreated: 4, photosGrouped: 10, photosRemaining: 0, hasMore: false })
    expect(mutate).toHaveBeenCalledTimes(3)
  })

  it('stops (no infinite loop) when a batch groups 0 photos despite hasMore=true', async () => {
    queueBatches([
      { waveUuid: 'w1', name: 'NYC', photosGrouped: 4, photosRemaining: 4, hasMore: true, wavesCreated: 1 },
      { waveUuid: null, name: null, photosGrouped: 0, photosRemaining: 4, hasMore: true, wavesCreated: 0 }
    ])

    const total = await autoGroupPhotosIntoWaves({ uuid: 'u1', groupingLevel: LEVEL })

    expect(total).toEqual({ wavesCreated: 1, photosGrouped: 4, photosRemaining: 4, hasMore: true })
    expect(mutate).toHaveBeenCalledTimes(2)
  })

  it('propagates mutation errors', async () => {
    mutate.mockReset()
    mutate.mockRejectedValue(new Error('boom'))

    await expect(autoGroupPhotosIntoWaves({ uuid: 'u1', groupingLevel: LEVEL }))
      .rejects.toThrow('boom')
  })
})
