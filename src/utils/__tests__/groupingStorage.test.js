/* eslint-env jest */
import { getGranularityThreshold } from '../groupingStorage'

describe('getGranularityThreshold', () => {
  it('returns 10 km for DISTRICT', () => {
    expect(getGranularityThreshold('DISTRICT')).toBe(10)
  })

  it('returns 50 km for CITY', () => {
    expect(getGranularityThreshold('CITY')).toBe(50)
  })

  it('returns 250 km for REGION', () => {
    expect(getGranularityThreshold('REGION')).toBe(250)
  })

  it('returns 1000 km for COUNTRY', () => {
    expect(getGranularityThreshold('COUNTRY')).toBe(1000)
  })

  it('returns CITY threshold (50 km) for unknown granularity', () => {
    expect(getGranularityThreshold('UNKNOWN')).toBe(50)
  })
})
