export default function isValidLocation (loc) {
  const lat = loc?.coords?.latitude
  const lon = loc?.coords?.longitude
  return typeof lat === 'number' && typeof lon === 'number' && lat !== 0 && lon !== 0 && !Number.isNaN(lat) && !Number.isNaN(lon)
}
