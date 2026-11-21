/* eslint-env jest */

// async-storage v3 ships ESM only, which this CJS Jest runtime cannot load.
const mockState = { data: {} }

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getMany: jest.fn(async (keys) =>
      Object.fromEntries(keys.map(key => [key, mockState.data[key] ?? null]))),
    setMany: jest.fn(async (entries) => { Object.assign(mockState.data, entries) }),
    setItem: jest.fn(async (key, value) => { mockState.data[key] = value }),
    removeItem: jest.fn(async (key) => { delete mockState.data[key] })
  }
}))

const { getGroupingThreshold, loadGroupingSettings } = require('../groupingStorage')

describe('getGroupingThreshold', () => {
  it('returns 10 km for DISTRICT', () => {
    expect(getGroupingThreshold('DISTRICT')).toBe(10)
  })

  it('returns 50 km for CITY', () => {
    expect(getGroupingThreshold('CITY')).toBe(50)
  })

  it('returns 250 km for REGION', () => {
    expect(getGroupingThreshold('REGION')).toBe(250)
  })

  it('returns 1000 km for COUNTRY', () => {
    expect(getGroupingThreshold('COUNTRY')).toBe(1000)
  })

  it('returns CITY threshold (50 km) for unknown granularity', () => {
    expect(getGroupingThreshold('UNKNOWN')).toBe(50)
  })
})

describe('loadGroupingSettings', () => {
  beforeEach(() => {
    mockState.data = {}
  })

  it('returns defaults when nothing is stored', async () => {
    expect(await loadGroupingSettings()).toEqual({
      enabled: true,
      groupingLevel: 'CITY',
      lastTriggerLat: null,
      lastTriggerLon: null,
      lastTriggerTs: null
    })
  })

  it('reads and parses stored values', async () => {
    mockState.data = {
      '@grouping:enabled': 'false',
      '@grouping:groupingLevel': 'REGION',
      '@grouping:lastTriggerLat': '40.7128',
      '@grouping:lastTriggerLon': '-74.006',
      '@grouping:lastTriggerTs': '1764576000000'
    }

    expect(await loadGroupingSettings()).toEqual({
      enabled: false,
      groupingLevel: 'REGION',
      lastTriggerLat: 40.7128,
      lastTriggerLon: -74.006,
      lastTriggerTs: 1764576000000
    })
  })

  it('migrates the legacy granularity key and clears it', async () => {
    mockState.data = { '@grouping:granularity': 'DISTRICT' }

    const settings = await loadGroupingSettings()

    expect(settings.groupingLevel).toBe('DISTRICT')
    expect(mockState.data['@grouping:groupingLevel']).toBe('DISTRICT')
    expect(mockState.data['@grouping:granularity']).toBeUndefined()
  })
})
