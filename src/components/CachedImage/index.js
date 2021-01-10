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
    if (typeof CachedImage.counter === 'undefined') {
      CachedImage.counter = 0
    }
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
          // console.log(CachedImage.counter)
          while (CachedImage.counter > 10) {
            await new Promise(r => setTimeout(r, 10)) // eslint-disable-line no-await-in-loop
          }
          CachedImage.counter += 1
          setImgURI(null)
          // make sure no more than 4 images at a time are being downloading

          // await new Promise(r => setTimeout(r, 10 * CachedImage.counter))
          await FileSystem.downloadAsync(
            uri,
            filesystemURI
          )
          CachedImage.counter -= 1
        }
        // await new Promise(r => setTimeout(r, 100))
        if (componentIsMounted.current) {
          setImgURI(filesystemURI)
        }
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
