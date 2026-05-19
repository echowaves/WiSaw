/* eslint-env jest */
import { getGroupingThreshold } from '../groupingStorage'

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
