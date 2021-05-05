import React, { useEffect, useState, useRef } from 'react'

import { Image } from 'react-native'

import * as FileSystem from 'expo-file-system'

import PropTypes from 'prop-types'

import * as CONST from '../../consts.js'

const CachedImage = props => {
  const { source: { uri }, cacheKey } = props

  const filesystemURI = `${CONST.IMAGE_CACHE_FOLDER}${cacheKey}`

  const [imgURI, setImgURI] = useState(filesystemURI)

  const componentIsMounted = useRef(true)

  useEffect(() => {
    loadImage({ fileURI: filesystemURI })

    return () => {
      componentIsMounted.current = false
    }
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadImage({ fileURI: filesystemURI })

    return () => {
      componentIsMounted.current = false
    }
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  const loadImage = async ({ fileURI }) => {
    try {
      // Use the cached image if it exists
      const metadata = await FileSystem.getInfoAsync(fileURI)
      if (!metadata.exists) {
        if (componentIsMounted.current) {
          await setImgURI(null)
        }
        // download to cache
        if (componentIsMounted.current) {
          await FileSystem.downloadAsync(
            uri,
            fileURI
          )
        }
        if (componentIsMounted.current) {
          setImgURI(fileURI)
        }
      }
    } catch (err) {
      // console.log({ err })
      if (componentIsMounted.current) {
        setImgURI(uri)
      }
    }
  }

  return (
    <Image
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      source={{
        uri: imgURI,
      }}
    />
  )
}

CachedImage.propTypes = {
  source: PropTypes.object.isRequired,
  cacheKey: PropTypes.string.isRequired,
}

export default React.memo(CachedImage)
