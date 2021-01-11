import React from 'react'
import { useAsync } from "react-async"

import { Image, Text } from 'react-native'

import * as FileSystem from 'expo-file-system'

import PropTypes from 'prop-types'

const preloadImage = async ({ fileURI, webURI }, { signal }) => {
  // console.log(`rendering ${cacheKey}`)
  try {
    // Use the cached image if it exists
    const metadata = await FileSystem.getInfoAsync(fileURI)
    if (!metadata.exists) {
      // console.log(`downloading ${cacheKey}`)
      await FileSystem.downloadAsync(webURI, fileURI)
    }
  } catch (err) {
    console.log({ err })
  }
  return true
}

const CachedImage = props => {
  const { uri, cacheKey } = props
  const filesystemURI = `${FileSystem.cacheDirectory}${cacheKey}`

  // const [imgURI, setImgURI] = useState(filesystemURI)

  // const componentIsMounted = useRef(true)

  // useEffect(() => {
  //   if (typeof CachedImage.counter === 'undefined') {
  //     CachedImage.counter = 0
  //   }
  //   // getImageUri()
  //   return () => {
  //     componentIsMounted.current = false
  //   }
  // }, [])// eslint-disable-line react-hooks/exhaustive-deps

  const { data, error, isPending } = useAsync({ promiseFn: preloadImage, webURI: uri, fileURI: filesystemURI })
  // if (isPending) return <Text>Loading...</Text>
  // if (error) return <Text>`Something went wrong: ${error.message}`</Text>
  if (data) {
    return (
      <Image
        {...props} // eslint-disable-line react/jsx-props-no-spreading
        source={{
          uri: filesystemURI,
        }}
      />
    )
  }
  return null
}

CachedImage.propTypes = {
  uri: PropTypes.string.isRequired,
  cacheKey: PropTypes.string.isRequired,
}

export default CachedImage
