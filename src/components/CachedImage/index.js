import React, { useEffect, useState, useRef } from 'react'

import { Image } from 'react-native'

import * as FileSystem from 'expo-file-system'

import PropTypes from 'prop-types'

const CachedImage = props => {
  const { uri, cacheKey } = props
  const filesystemURI = `${FileSystem.cacheDirectory}${cacheKey}`

  const [imgURI, setImgURI] = useState(filesystemURI)

  const componentIsMounted = useRef(true)

  useEffect(() => {
    getImageUri()
    return () => {
      componentIsMounted.current = false
    }
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  const getImageUri = async () => {
    // console.log(cacheKey)
    try {
      // Use the cached image if it exists
      const metadata = await FileSystem.getInfoAsync(filesystemURI)
      if (!metadata.exists) {
        // download to cache

        if (componentIsMounted.current) {
          setImgURI(null)
          await FileSystem.downloadAsync(
            uri,
            filesystemURI
          )
        }
        await new Promise(r => setTimeout(r, 100))
        if (componentIsMounted.current) {
          setImgURI(filesystemURI)
        }
        // TODO: ugly timeout
        // setTimeout(() => { setImgURI(filesystemURI) }, 100)
      }
    } catch (err) {
      setImgURI(uri)
    }
  }

  return (
    <Image
      {...props} // eslint-disable-line react/jsx-props-no-spreading
      source={{
        uri: imgURI,
      }}
    />
  )
}

CachedImage.propTypes = {
  uri: PropTypes.string.isRequired,
  cacheKey: PropTypes.string.isRequired,
}

export default CachedImage