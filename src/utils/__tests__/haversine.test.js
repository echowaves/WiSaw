/* eslint-env jest */
import { haversine } from '../haversine'

describe('haversine', () => {
  it('returns ~0 for the same coordinates', () => {
    const dist = haversine(40.7128, -74.006, 40.7128, -74.006)
    expect(dist).toBeCloseTo(0, 5)
  })

  it('returns ~111 km per degree at the equator', () => {
    const dist = haversine(0, 0, 1, 0)
    expect(dist).toBeGreaterThan(110)
    expect(dist).toBeLessThan(112)
  })

  it('returns correct distance between NYC and Los Angeles', () => {
    const dist = haversine(40.7128, -74.006, 34.0522, -118.2437)
    expect(dist).toBeGreaterThan(3900)
    expect(dist).toBeLessThan(4000)
  })

  it('returns correct distance between London and Tokyo', () => {
    const dist = haversine(51.5074, -0.1278, 35.6762, 139.6503)
    expect(dist).toBeGreaterThan(9500)
    expect(dist).toBeLessThan(9600)
  })

  it('is symmetric (a to b equals b to a)', () => {
    const dist1 = haversine(40.7128, -74.006, 34.0522, -118.2437)
    const dist2 = haversine(34.0522, -118.2437, 40.7128, -74.006)
    expect(dist1).toEqual(dist2)
  })
})
