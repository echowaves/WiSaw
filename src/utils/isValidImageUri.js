const isValidImageUri = (uri) =>
  typeof uri === 'string' && uri.length > 0 && /^https?:\/\//i.test(uri)

export default isValidImageUri
