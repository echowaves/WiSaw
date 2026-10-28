// Metro resolves image imports to a registered asset reference; this makes that
// contract visible to TypeScript so importing an asset type-checks as a valid
// `source` value for react-native's Image.
declare module '*.png' {
  import type { ImageSourcePropType } from 'react-native'

  const source: ImageSourcePropType
  export default source
}

declare module '*.jpg' {
  import type { ImageSourcePropType } from 'react-native'

  const source: ImageSourcePropType
  export default source
}
