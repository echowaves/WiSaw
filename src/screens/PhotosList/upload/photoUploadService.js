import { CacheManager } from 'expo-cached-image'
import { File as FSFile } from 'expo-file-system'
import * as ImageManipulator from 'expo-image-manipulator'
import { Storage } from 'expo-storage'
import * as VideoThumbnails from 'expo-video-thumbnails'
import { fetch } from 'expo/fetch'

import Toast from 'react-native-toast-message'

import { gql } from '@apollo/client'

import * as CONST from '../../../consts'

/**
 * Utility: Wrap a promise with a timeout to prevent hanging uploads
 * @param {Promise<T>} promise
 * @param {number} ms
 * @param {string} label
 * @returns {Promise<T>}
 * @template T
 */
const withTimeout = (promise, ms, label = 'operation') =>
  new Promise((resolve, reject) => {
    let done = false
    const timer = setTimeout(() => {
      if (!done) reject(new Error(`${label} timed out after ${ms}ms`))
    }, ms)

    promise
      .then((res) => {
        done = true
        clearTimeout(timer)
        resolve(res)
      })
      .catch((err) => {
        done = true
        clearTimeout(timer)
        reject(err)
      })
  })

const ensurePendingUploadsFolder = async () => {
  try {
    if (!CONST.PENDING_UPLOADS_FOLDER.exists) {
      CONST.PENDING_UPLOADS_FOLDER.create({ intermediates: true })
    }
  } catch (error) {
    console.error('Failed to ensure pending uploads folder:', error)
    throw error
  }
}

const readQueue = async () => {
  let imagesInQueue = JSON.parse(await Storage.getItem({ key: CONST.PENDING_UPLOADS_KEY }))

  if (!imagesInQueue) {
    imagesInQueue = []
    await Storage.setItem({ key: CONST.PENDING_UPLOADS_KEY, value: [] })
  }

  return imagesInQueue
}

const writeQueue = async (queue) =>
  Storage.setItem({ key: CONST.PENDING_UPLOADS_KEY, value: queue })

const genLocalThumbs = async (image) => {
  try {
    if (image.type === 'image') {
      const manipResult = await ImageManipulator.manipulateAsync(
        image.localImgUrl,
        [{ resize: { height: 300 } }],
        { compress: 1.0, format: ImageManipulator.SaveFormat.WEBP }
      )
      return {
        ...image,
        localThumbUrl: manipResult.uri
      }
    }

    const { uri } = await VideoThumbnails.getThumbnailAsync(image.localImgUrl)

    const manipResult = await ImageManipulator.manipulateAsync(uri, [{ resize: { height: 300 } }], {
      compress: 1.0,
      format: ImageManipulator.SaveFormat.WEBP
    })

    return {
      ...image,
      localVideoUrl: image.localImgUrl,
      localThumbUrl: manipResult.uri,
      localImgUrl: uri
    }
  } catch (error) {
    console.error('Thumbnail generation failed', error)
  }

  return {
    image: null,
    localVideoUrl: '',
    localThumbUrl: '',
    localImgUrl: ''
  }
}

export const removeFromQueue = async (imageToRemove) => {
  try {
    const pendingImagesBefore = await readQueue()
    const pendingImagesAfter = pendingImagesBefore.filter(
      (imageInTheQueue) => JSON.stringify(imageInTheQueue) !== JSON.stringify(imageToRemove)
    )

    await writeQueue(pendingImagesAfter)
  } catch (error) {
    console.error('Error removing item from queue', error)
  }
}

export const clearQueue = async () => {
  try {
    const currentQueue = await readQueue()

    for (const item of currentQueue) {
      try {
        if (item.localImgUrl) {
          try {
            new FSFile(item.localImgUrl).delete()
          } catch {}
        }
        if (item.localThumbUrl) {
          try {
            new FSFile(item.localThumbUrl).delete()
          } catch {}
        }
        if (item.localVideoUrl) {
          try {
            new FSFile(item.localVideoUrl).delete()
          } catch {}
        }
      } catch (fileDeleteError) {
        console.error('Error deleting queued file', fileDeleteError)
      }
    }

    await writeQueue([])
  } catch (error) {
    console.error('Error clearing queue', error)
  }
}

export const getQueue = async () => {
  try {
    return await readQueue()
  } catch (error) {
    console.error('Error reading queue', error)
    return []
  }
}

export const addToQueue = async (image) => {
  try {
    const pendingImages = await readQueue()
    await writeQueue([...pendingImages, image])
  } catch (error) {
    console.error('Error adding item to queue', error)
  }
}

export const updateQueueItem = async (originalItem, updatedItem) => {
  try {
    const pendingImages = await readQueue()
    const updatedQueue = pendingImages.map((item) =>
      JSON.stringify(item) === JSON.stringify(originalItem) ? updatedItem : item
    )

    await writeQueue(updatedQueue)
  } catch (error) {
    console.error('Error updating queue item', error)
  }
}

export const processQueuedFile = async ({ queuedItem, topOffset = 100 }) => {
  try {
    await ensurePendingUploadsFolder()

    const localImgUrl = new FSFile(CONST.PENDING_UPLOADS_FOLDER, queuedItem.localImageName).uri

    if (queuedItem.type === 'image') {
      const compressedResult = await ImageManipulator.manipulateAsync(
        queuedItem.originalCameraUrl,
        [{ resize: { height: 3000 } }],
        { compress: 1.0, format: ImageManipulator.SaveFormat.WEBP }
      )

      try {
        const src = new FSFile(compressedResult.uri)
        const dest = new FSFile(CONST.PENDING_UPLOADS_FOLDER, queuedItem.localImageName)

        if (dest.exists) {
          try {
            src.delete()
          } catch (deleteErr) {
            console.warn('Could not delete temp compressed file:', deleteErr)
          }
        } else {
          src.move(dest)
        }
      } catch (error) {
        Toast.show({
          text1: 'Error processing image',
          text2: error.message || `${error}`,
          type: 'error',
          visibilityTime: 4000,
          topOffset
        })

        const fallbackSrc = new FSFile(compressedResult.uri)
        const fallbackDest = new FSFile(localImgUrl)
        fallbackSrc.move(fallbackDest)
      }
    } else {
      try {
        const src = new FSFile(queuedItem.originalCameraUrl)
        const dest = new FSFile(CONST.PENDING_UPLOADS_FOLDER, queuedItem.localImageName)

        if (!dest.exists) {
          src.move(dest)
        }
      } catch (error) {
        Toast.show({
          text1: 'Error processing video',
          text2: error.message || `${error}`,
          type: 'error',
          visibilityTime: 4000,
          topOffset
        })

        const fallbackSrc = new FSFile(queuedItem.originalCameraUrl)
        const fallbackDest = new FSFile(localImgUrl)
        fallbackSrc.move(fallbackDest)
      }
    }

    const processedImage = {
      ...queuedItem,
      localImgUrl
    }

    const thumbEnhancedImage = await genLocalThumbs(processedImage)

    try {
      await CacheManager.addToCache({
        file: thumbEnhancedImage.localThumbUrl,
        key: thumbEnhancedImage.localCacheKey
      })
    } catch (cacheError) {
      if (!`${cacheError}`.toLowerCase().includes('already exists')) {
        console.warn('Cache error for thumbnail:', cacheError)
      }
    }

    return thumbEnhancedImage
  } catch (error) {
    console.error('Error processing queued file:', error)
    throw error
  }
}

export const queueFileForUpload = async ({ cameraImgUrl, type, location }) => {
  try {
    const localImageName = cameraImgUrl.substr(cameraImgUrl.lastIndexOf('/') + 1)
    const localCacheKey = localImageName.split('.')[0]

    const image = {
      originalCameraUrl: cameraImgUrl,
      localImageName,
      type,
      location,
      localCacheKey
    }

    await addToQueue(image)
  } catch (error) {
    console.error('Error queueing file for upload', error)
  }
}

export const ensureFileExists = async (uri) => {
  try {
    return new FSFile(uri).exists
  } catch (error) {
    return false
  }
}

const uploadFile = async ({
  assetKey,
  contentType,
  assetUri,
  topOffset = 100,
  retries = 3,
  timeoutMs = 180_000
}) => {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const exists = await ensureFileExists(assetUri)
      if (!exists) {
        throw new Error(`Local file not found: ${assetUri}`)
      }

      const uploadUrl = (
        await CONST.gqlClient.query({
          query: gql`
            query generateUploadUrl($assetKey: String!, $contentType: String!) {
              generateUploadUrl(assetKey: $assetKey, contentType: $contentType)
            }
          `,
          variables: {
            assetKey,
            contentType
          }
        })
      ).data.generateUploadUrl

      const responseData = await withTimeout(
        fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': contentType
          },
          body: new FSFile(assetUri)
        }),
        timeoutMs,
        `Upload ${assetKey}`
      )

      if (!responseData || responseData.status !== 200) {
        throw new Error(`Upload failed with status ${responseData?.status || 'unknown'}`)
      }

      return { responseData }
    } catch (error) {
      console.error(`Upload attempt ${attempt}/${retries} failed:`, { error })

      if (attempt === retries) {
        Toast.show({
          text1: 'Upload failed after retries',
          text2: `${error}`,
          type: 'error',
          topOffset
        })
        return null
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
    }
  }

  return null
}

export const uploadItem = async ({ item }) => {
  try {
    if (item.type === 'video') {
      const videoResponse = await uploadFile({
        assetKey: `${item.photo.id}.mov`,
        contentType: 'video/mov',
        assetUri: item.localVideoUrl
      })

      if (!videoResponse || videoResponse?.responseData?.status !== 200) {
        return {
          responseData: 'Unable to upload video asset.',
          status: videoResponse?.responseData?.status
        }
      }
    }

    const response = await uploadFile({
      assetKey: `${item.photo.id}.upload`,
      contentType: 'image/jpeg',
      assetUri: item.localImgUrl
    })

    return { responseData: response?.responseData }
  } catch (error) {
    console.error('Upload item failed', error)
    return {
      responseData: `Unable to upload asset ${JSON.stringify(error)}`
    }
  }
}

export const generatePhoto = async ({ uuid, lat, lon, video }) => {
  try {
    if (!uuid || typeof uuid !== 'string' || uuid.trim() === '') {
      throw new Error(`Invalid UUID provided: "${uuid}". UUID cannot be empty.`)
    }

    const timeoutMs = 30_000

    const photo = (
      await withTimeout(
        CONST.gqlClient.mutate({
          mutation: gql`
            mutation createPhoto($lat: Float!, $lon: Float!, $uuid: String!, $video: Boolean) {
              createPhoto(lat: $lat, lon: $lon, uuid: $uuid, video: $video) {
                active
                commentsCount
                watchersCount
                createdAt
                id
                imgUrl
                thumbUrl
                location
                updatedAt
                uuid
                video
              }
            }
          `,
          variables: {
            uuid,
            lat,
            lon,
            video
          }
        }),
        timeoutMs,
        'Generate photo mutation'
      )
    ).data.createPhoto

    return photo
  } catch (error) {
    console.error('generatePhoto error:', error)

    const errorMessage = `${error}`.toLowerCase()
    if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
      throw new Error('Photo creation timed out. Please check your connection and try again.')
    }

    throw error
  }
}

export const processCompleteUpload = async ({ item, uuid, topOffset = 100 }) => {
  try {
    let processedItem = item
    if (!item.localImgUrl) {
      try {
        if (!new FSFile(item.originalCameraUrl).exists) {
          Toast.show({
            text1: 'Upload skipped',
            text2: 'Original file is missing on device.',
            type: 'error',
            topOffset
          })
          await removeFromQueue(item)
          return null
        }
      } catch (error) {
        await removeFromQueue(item)
        return null
      }

      processedItem = await processQueuedFile({ queuedItem: item, topOffset })
    }

    if (!processedItem) {
      console.error('processedItem is null after processing')
      return null
    }

    let { photo } = processedItem
    if (!photo) {
      if (!uuid || typeof uuid !== 'string' || uuid.trim() === '') {
        console.error('Invalid UUID provided for photo generation:', uuid)
        Toast.show({
          text1: 'Upload Error',
          text2: 'Invalid user ID. Please try again.',
          type: 'error',
          topOffset
        })
        return null
      }

      try {
        photo = await generatePhoto({
          uuid: uuid.trim(),
          lat: processedItem.location.coords.latitude,
          lon: processedItem.location.coords.longitude,
          video: processedItem?.type === 'video'
        })

        try {
          CacheManager.addToCache({
            file: processedItem.localThumbUrl,
            key: `${photo.id}-thumb`
          })
        } catch (cacheError1) {
          if (!`${cacheError1}`.toLowerCase().includes('already exists')) {
            console.warn('Cache error for photo thumbnail:', cacheError1)
          }
        }

        try {
          CacheManager.addToCache({
            file: processedItem.localImgUrl,
            key: `${photo.id}`
          })
        } catch (cacheError2) {
          if (!`${cacheError2}`.toLowerCase().includes('already exists')) {
            console.warn('Cache error for photo image:', cacheError2)
          }
        }

        processedItem = { ...processedItem, photo }
        await updateQueueItem(item, processedItem)
      } catch (photoGenError) {
        Toast.show({
          text1: 'Unable to create photo',
          text2: photoGenError.message || `${photoGenError}`,
          type: 'error',
          visibilityTime: 4000,
          topOffset,
          onPress: () => alert(`error: ${photoGenError.message || `${photoGenError}`}`)
        })
        console.error('Photo generation failed:', photoGenError)

        const errorMsg = `${photoGenError}`.toLowerCase()
        if (errorMsg.includes('timeout') || errorMsg.includes('network')) {
          Toast.show({
            text1: 'Upload delayed',
            text2: 'Connection issues. Will retry automatically.',
            type: 'info',
            topOffset
          })
        }
        return null
      }
    }

    const { responseData } = await uploadItem({ item: processedItem })

    if (responseData?.status === 200) {
      return photo
    }

    Toast.show({
      text1: 'Upload is going slooooow...',
      text2: 'Still trying to upload.',
      visibilityTime: 500,
      topOffset
    })
    return null
  } catch (error) {
    console.error('Complete upload process error:', error)
    Toast.show({
      text1: 'Complete upload process error',
      text2: error.message || `${error}`,
      type: 'error',
      topOffset,
      onPress: () => alert(`error: ${error.message || `${error}`}`)
    })

    const errStr = `${error}`.toLowerCase()
    if (errStr.includes('not found') || errStr.includes('missing')) {
      try {
        await removeFromQueue(item)
      } catch (removeError) {
        console.error('Failed to remove missing item from queue', removeError)
      }
      Toast.show({
        text1: 'Upload removed',
        text2: 'Local file was not found on device.',
        type: 'error',
        topOffset
      })
      return null
    }

    return null
  }
}

export const initPendingUploads = async () => {
  try {
    const pendingImages = await readQueue()

    if (pendingImages && pendingImages.length > 0) {
      console.log(`Found ${pendingImages.length} pending uploads in queue`)

      const stuckItems = pendingImages.filter((item) => !item.localImgUrl && item.photo)
      if (stuckItems.length > 0) {
        console.warn(`Found ${stuckItems.length} potentially stuck upload items`)
      }

      for (let i = 0; i < pendingImages.length; i += 1) {
        const item = pendingImages[i]
        if (item.originalCameraUrl) {
          try {
            if (!new FSFile(item.originalCameraUrl).exists) {
              console.warn(`Pending upload has missing original file: ${item.localImageName}`)
            }
          } catch (error) {
            console.warn(`Cannot check file status for: ${item.localImageName}`, error)
          }
        }
      }
    }
  } catch (error) {
    console.error('initPendingUploads error', error)
    await writeQueue([])
  }
}
