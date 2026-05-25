const MONTH_ABBREVS = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
}

const MONTH_TO_SEASON = {
  0: 'Winter', // Jan
  1: 'Winter', // Feb
  2: 'Spring', // Mar
  3: 'Spring', // Apr
  4: 'Spring', // May
  5: 'Summer', // Jun
  6: 'Summer', // Jul
  7: 'Summer', // Aug
  8: 'Fall', // Sep
  9: 'Fall', // Oct
  10: 'Fall', // Nov
  11: 'Winter' // Dec
}

const MONTH_PATTERN = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec'

// Match: "Locality, Mon D, YYYY"
const SINGLE_DATE_RE = new RegExp(`^(.+),\\s+(${MONTH_PATTERN})\\s+\\d{1,2},\\s+(\\d{4})$`)
// Match: "Locality, Mon YYYY"
const MONTH_YEAR_RE = new RegExp(`^(.+),\\s+(${MONTH_PATTERN})\\s+(\\d{4})$`)
// Match: "Locality, Mon – Mon YYYY"
const RANGE_SAME_YEAR_RE = new RegExp(`^(.+),\\s+(${MONTH_PATTERN})\\s+–\\s+(?:${MONTH_PATTERN})\\s+(\\d{4})$`)
// Match: "Locality, Mon YYYY – Mon YYYY"
const RANGE_CROSS_YEAR_RE = new RegExp(`^(.+),\\s+(${MONTH_PATTERN})\\s+(\\d{4})\\s+–\\s+(?:${MONTH_PATTERN})\\s+\\d{4}$`)

function toSeasonName (monthAbbrev, yearStr) {
  const monthIndex = MONTH_ABBREVS[monthAbbrev]
  const season = MONTH_TO_SEASON[monthIndex]
  let year = parseInt(yearStr, 10)

  // Jan/Feb belong to winter that started in the previous year
  if (monthIndex === 0 || monthIndex === 1) {
    year = year - 1
  }

  return `${season} ${year}`
}

/**
 * Normalize old date-range wave names to season format for display.
 * Names already in season format or user-created names pass through unchanged.
 */
export function normalizeWaveName (name) {
  if (!name || typeof name !== 'string') return name

  let match

  // "Locality, Mon D, YYYY"
  match = name.match(SINGLE_DATE_RE)
  if (match) {
    return `${match[1]}, ${toSeasonName(match[2], match[3])}`
  }

  // "Locality, Mon – Mon YYYY" (must test before MONTH_YEAR_RE since it's more specific)
  match = name.match(RANGE_SAME_YEAR_RE)
  if (match) {
    return `${match[1]}, ${toSeasonName(match[2], match[3])}`
  }

  // "Locality, Mon YYYY – Mon YYYY"
  match = name.match(RANGE_CROSS_YEAR_RE)
  if (match) {
    return `${match[1]}, ${toSeasonName(match[2], match[3])}`
  }

  // "Locality, Mon YYYY"
  match = name.match(MONTH_YEAR_RE)
  if (match) {
    return `${match[1]}, ${toSeasonName(match[2], match[3])}`
  }

  return name
}
