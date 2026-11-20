import Toast from 'react-native-toast-message'

/**
 * The single implementation behind every failure toast. It guarantees two
 * things: the toast always states a reason, and the full detail (longest
 * available explanation plus a stack trace when one exists) travels with that
 * individual toast so the long-press/tap handler in app/_layout.tsx can show
 * it without any shared mutable state.
 */

const ERROR_DEFAULTS = {
  position: 'top',
  autoHide: true,
  topOffset: 100,
  visibilityTime: 8000
}

const UNKNOWN_ERROR = 'Unknown error'
const GENERIC_HEADLINE = 'Something went wrong'
const MAX_REASON_LENGTH = 80

/** Text for display from an arbitrary value; null when it carries no meaning. */
function toText (value) {
  if (typeof value === 'string') return value.trim() || null
  if (value == null || value instanceof Error) return null
  try {
    const text = String(value).trim()
    return text.length > 0 && text !== '[object Object]' ? text : null
  } catch (stringifyError) {
    return null
  }
}

function firstText (values) {
  for (const value of values) {
    const text = toText(value)
    if (text) return text
  }
  return ''
}

function pickError (values) {
  for (const value of values) {
    if (value instanceof Error) return value
  }
  return null
}

function graphQLErrorsMessage (value) {
  const graphQLErrors = value.graphQLErrors
  if (!Array.isArray(graphQLErrors) || graphQLErrors.length === 0) return null
  return firstText(graphQLErrors.map((graphQLError) => graphQLError?.message)) || null
}

function networkErrorMessage (value) {
  const networkError = value.networkError
  if (!networkError) return null
  return toText(networkError.message) || toText(networkError)
}

/**
 * Best human-readable reason obtainable from an arbitrary thrown value.
 * GraphQL and network specifics beat the generic wrapper message, because a
 * bare "Something went wrong" tells the user nothing about what failed.
 */
export function extractErrorReason (thrown) {
  if (!thrown) return UNKNOWN_ERROR
  if (typeof thrown === 'string') return toText(thrown) || UNKNOWN_ERROR
  const structured = typeof thrown === 'object'
    ? graphQLErrorsMessage(thrown) || networkErrorMessage(thrown)
    : null
  if (structured) return structured
  if (thrown instanceof Error) {
    return toText(thrown.message) || toText(thrown.name) || UNKNOWN_ERROR
  }
  return toText(thrown.message) || toText(thrown) || UNKNOWN_ERROR
}

export function extractErrorStack (thrown) {
  const stack = typeof thrown?.stack === 'string' ? thrown.stack.trim() : ''
  return stack.length > 0 ? stack : null
}

function truncateReason (reason) {
  return reason.length > MAX_REASON_LENGTH
    ? `${reason.slice(0, MAX_REASON_LENGTH)}...`
    : reason
}

/**
 * Accept both call shapes — `showErrorToast({ title, message, err })` and
 * `showErrorToast('Title', { text2, err })` — so a mismatch can no longer
 * silently produce an empty toast.
 */
function normalizeArgs (messageOrOptions, options) {
  const isRichForm = typeof messageOrOptions === 'object' &&
    messageOrOptions !== null &&
    !(messageOrOptions instanceof Error)
  if (isRichForm) return { ...messageOrOptions }
  return { title: messageOrOptions, ...(options || {}) }
}

function resolvePresentation (input) {
  const errorValue = pickError([input.err, input.error, input.message, input.text2])
  const technical = errorValue ? extractErrorReason(errorValue) : ''
  const headline = firstText([input.title, input.text1]) || GENERIC_HEADLINE
  const shown = firstText([input.text2, input.message]) || technical || headline
  const detailMessage = technical && technical !== shown
    ? `${shown}\n${technical}`
    : technical || shown
  return { errorValue, headline, shown, detailMessage }
}

export default function showErrorToast (messageOrOptions, options) {
  const input = normalizeArgs(messageOrOptions, options)
  const { errorValue, headline, shown, detailMessage } = resolvePresentation(input)
  const stack = toText(input.stack) || extractErrorStack(errorValue)

  Toast.show({
    type: 'error',
    text1: headline,
    text2: truncateReason(shown),
    topOffset: input.topOffset ?? ERROR_DEFAULTS.topOffset,
    visibilityTime: input.visibilityTime ?? ERROR_DEFAULTS.visibilityTime,
    position: input.position || ERROR_DEFAULTS.position,
    autoHide: input.autoHide ?? ERROR_DEFAULTS.autoHide,
    props: { detail: { title: headline, message: detailMessage, stack } }
  })
}

