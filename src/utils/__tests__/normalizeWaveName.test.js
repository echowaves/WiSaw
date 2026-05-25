import { normalizeWaveName } from '../normalizeWaveName'

describe('normalizeWaveName', () => {
  // Old format: "Locality, Mon D, YYYY"
  describe('single date format', () => {
    it('converts "New York, Mar 5, 2026" to season format', () => {
      expect(normalizeWaveName('New York, Mar 5, 2026')).toBe('New York, Spring 2026')
    })

    it('converts "NYC, Jun 15, 2025" to season format', () => {
      expect(normalizeWaveName('NYC, Jun 15, 2025')).toBe('NYC, Summer 2025')
    })

    it('converts "Tokyo, Sep 1, 2026" to season format', () => {
      expect(normalizeWaveName('Tokyo, Sep 1, 2026')).toBe('Tokyo, Fall 2026')
    })

    it('converts "London, Dec 25, 2025" to season format', () => {
      expect(normalizeWaveName('London, Dec 25, 2025')).toBe('London, Winter 2025')
    })
  })

  // Old format: "Locality, Mon YYYY"
  describe('month-year format', () => {
    it('converts "New York, Mar 2026" to season format', () => {
      expect(normalizeWaveName('New York, Mar 2026')).toBe('New York, Spring 2026')
    })

    it('converts "NYC, Dec 2025" to season format', () => {
      expect(normalizeWaveName('NYC, Dec 2025')).toBe('NYC, Winter 2025')
    })
  })

  // Old format: "Locality, Mon – Mon YYYY"
  describe('date range same year format', () => {
    it('converts "New York, Mar – Jun 2026" using start month', () => {
      expect(normalizeWaveName('New York, Mar – Jun 2026')).toBe('New York, Spring 2026')
    })

    it('converts "NYC, Jun – Aug 2025" using start month', () => {
      expect(normalizeWaveName('NYC, Jun – Aug 2025')).toBe('NYC, Summer 2025')
    })
  })

  // Old format: "Locality, Mon YYYY – Mon YYYY"
  describe('date range cross year format', () => {
    it('converts "New York, Mar 2025 – Jun 2026" using start month/year', () => {
      expect(normalizeWaveName('New York, Mar 2025 – Jun 2026')).toBe('New York, Spring 2025')
    })

    it('converts "NYC, Dec 2025 – Feb 2026" using start month/year', () => {
      expect(normalizeWaveName('NYC, Dec 2025 – Feb 2026')).toBe('NYC, Winter 2025')
    })
  })

  // Winter year adjustment (Jan/Feb → previous year)
  describe('winter year adjustment', () => {
    it('adjusts January to previous year winter', () => {
      expect(normalizeWaveName('New York, Jan 2026')).toBe('New York, Winter 2025')
    })

    it('adjusts February to previous year winter', () => {
      expect(normalizeWaveName('New York, Feb 2026')).toBe('New York, Winter 2025')
    })

    it('keeps December in same year winter', () => {
      expect(normalizeWaveName('New York, Dec 2025')).toBe('New York, Winter 2025')
    })

    it('adjusts January single date to previous year winter', () => {
      expect(normalizeWaveName('NYC, Jan 15, 2026')).toBe('NYC, Winter 2025')
    })
  })

  // Season-format passthrough
  describe('season format passthrough', () => {
    it('passes through "New York, Spring 2026" unchanged', () => {
      expect(normalizeWaveName('New York, Spring 2026')).toBe('New York, Spring 2026')
    })

    it('passes through "NYC, Winter 2025" unchanged', () => {
      expect(normalizeWaveName('NYC, Winter 2025')).toBe('NYC, Winter 2025')
    })

    it('passes through "Tokyo, Summer 2026" unchanged', () => {
      expect(normalizeWaveName('Tokyo, Summer 2026')).toBe('Tokyo, Summer 2026')
    })

    it('passes through "London, Fall 2025" unchanged', () => {
      expect(normalizeWaveName('London, Fall 2025')).toBe('London, Fall 2025')
    })
  })

  // User-created names passthrough
  describe('user-created name passthrough', () => {
    it('passes through "My Vacation Photos" unchanged', () => {
      expect(normalizeWaveName('My Vacation Photos')).toBe('My Vacation Photos')
    })

    it('passes through "Beach Trip" unchanged', () => {
      expect(normalizeWaveName('Beach Trip')).toBe('Beach Trip')
    })

    it('passes through single word names', () => {
      expect(normalizeWaveName('Favorites')).toBe('Favorites')
    })
  })

  // Coordinate-based names
  describe('coordinate-based names', () => {
    it('normalizes coordinate wave name with month-year', () => {
      expect(normalizeWaveName('40.7°N, 74.0°W, Mar 2026')).toBe('40.7°N, 74.0°W, Spring 2026')
    })
  })

  // Edge cases
  describe('edge cases', () => {
    it('returns null for null input', () => {
      expect(normalizeWaveName(null)).toBe(null)
    })

    it('returns undefined for undefined input', () => {
      expect(normalizeWaveName(undefined)).toBe(undefined)
    })

    it('returns empty string for empty string', () => {
      expect(normalizeWaveName('')).toBe('')
    })
  })
})
