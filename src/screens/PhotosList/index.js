import PropTypes from 'prop-types'

import { useAtom } from 'jotai'
import React, { useEffect, useState } from 'react'

import * as MediaLibrary from 'expo-media-library'
import { router, useNavigation } from 'expo-router'
// import * as FileSystem from 'expo-file-system'
import * as Notifications from 'expo-notifications'
import * as SecureStore from 'expo-secure-store'

import * as ImagePicker from 'expo-image-picker'
import * as Linking from 'expo-linking'
import * as Location from 'expo-location'
// import * as Updates from 'expo-updates'
import Toast from 'react-native-toast-message'

import * as BackgroundTask from 'expo-background-task'
import * as Haptics from 'expo-haptics'
import * as TaskManager from 'expo-task-manager'

import useKeyboard from '@rnhooks/keyboard'
import { CacheManager } from 'expo-cached-image'
import {
  Alert,
  Animated,
  Keyboard,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native'

import {
  AntDesign,
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from '@expo/vector-icons'

import NetInfo from '@react-native-community/netinfo'

import { ExpoMasonryLayout } from 'expo-masonry-layout'

import {
  Badge,
  Button,
  Card,
  Divider,
  LinearProgress,
  ListItem,
  Overlay,
  Text,
} from '@rneui/themed'

import * as friendsHelper from '../FriendsList/friends_helper'

import * as reducer from './reducer'

import * as CONST from '../../consts'
import * as STATE from '../../state'

import EmptyStateCard from '../../components/EmptyStateCard'
import Thumb from '../../components/Thumb'

const BACKGROUND_TASK_NAME = 'background-task'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CONST.BG_COLOR,
  },
  thumbContainer: {
    // height: thumbDimension,
    // paddingBottom: 10,
    // marginBottom: 10,
  },
  // Modern header styles
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  customSegmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CONST.HEADER_BORDER_COLOR,
    shadowColor: CONST.HEADER_SHADOW_COLOR,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
    padding: 4,
  },
  segmentButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  activeSegmentButton: {
    backgroundColor: CONST.SEGMENT_BACKGROUND_ACTIVE,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  buttonGroupContainer: {
    width: 220,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: CONST.HEADER_BORDER_COLOR,
    shadowColor: CONST.HEADER_SHADOW_COLOR,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonContainer: {
    borderRadius: 18,
    margin: 2,
  },
  buttonStyle: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  selectedButtonStyle: {
    backgroundColor: CONST.SEGMENT_BACKGROUND_ACTIVE,
    borderRadius: 16,
  },
})

// 1. Define the task by providing a name and the function that should be executed
// Note: This needs to be called in the global scope (e.g outside of your React components)
TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  // const now = Date.now()
  try {
    const uuid = await SecureStore.getItemAsync(CONST.UUID_KEY)
    const unreadCountList = await friendsHelper.getUnreadCountsList({ uuid })

    const badgeCount = unreadCountList.reduce((a, b) => a + (b.unread || 0), 0)
    Notifications.setBadgeCountAsync(badgeCount || 0)
    // console.log("background task", { badgeCount })

    // Be sure to return the successful result type!
    return BackgroundTask.BackgroundTaskResult.Success
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('background task', { error })
    return BackgroundTask.BackgroundTaskResult.Failed
  }
})

// 2. Register the task at some point in your app by providing the same name, and some configuration options for how the background task should behave
// Note: This does NOT need to be in the global scope and CAN be used in your React components!
async function registerBackgroundFetchAsync() {
  // console.log('registering background task...')
  return BackgroundTask.registerTaskAsync(BACKGROUND_TASK_NAME, {
    minimumInterval: 15, // 15 minutes (minimum allowed)
  })
}

// 3. (Optional) Unregister tasks by specifying the task name
// This will cancel any future background task calls that match the given name
// Note: This does NOT need to be in the global scope and CAN be used in your React components!
// async function unregisterBackgroundTaskAsync() {
//   return BackgroundTask.unregisterTaskAsync(BACKGROUND_TASK_NAME)
// }

const FOOTER_HEIGHT = 90

let currentBatch = `${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`

const PhotosList = ({ searchFromUrl }) => {
  // console.log({ activeSegment, currentBatch })

  const [uuid, setUuid] = useAtom(STATE.uuid)
  const [nickName, setNickName] = useAtom(STATE.nickName)
  const [topOffset, setTopOffset] = useAtom(STATE.topOffset)
  const [photosList, setPhotosList] = useAtom(STATE.photosList)
  const [friendsList, setFriendsList] = useAtom(STATE.friendsList)
  const [triggerSearch, setTriggerSearch] = useAtom(STATE.triggerSearch)

  const navigation = useNavigation()

  const { width, height } = useWindowDimensions()

  // const [currentBatch, setCurrentBatch] = useState(
  //   `${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`,
  // )

  const [thumbDimension, setThumbDimension] = useState(100)
  const [lastViewableRow, setLastViewableRow] = useState(1)
  const [stopLoading, setStopLoading] = useState(false)

  const [isTandcAccepted, setIsTandcAccepted] = useState(true)
  const [zeroMoment, setZeroMoment] = useState(0)

  const [netAvailable, setNetAvailable] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [location, setLocation] = useState({
    coords: { latitude: 0, longitude: 0 },
  })

  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  // const [isLastPage, setIsLastPage] = useState(false)

  const [pageNumber, setPageNumber] = useState(0)
  const [consecutiveEmptyResponses, setConsecutiveEmptyResponses] = useState(0)

  const [pendingPhotos, setPendingPhotos] = useState([])

  const [activeSegment, setActiveSegment] = useState(0)

  const [loading, setLoading] = useState(false)

  const [unreadCountList, setUnreadCountList] = useState([])

  const [unreadCount, setUnreadCount] = useState(0)

  const [textVisible, setTextVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [scrollViewHeight, setScrollViewHeight] = useState(0)
  const [contentHeight, setContentHeight] = useState(0)
  const textAnimation = React.useRef(new Animated.Value(1)).current // 1 = visible, 0 = hidden
  const searchBarRef = React.useRef(null)

  // Animation states for pending photos
  const pendingPhotosAnimation = React.useRef(new Animated.Value(0)).current // 0 = hidden, 1 = visible
  const uploadIconAnimation = React.useRef(new Animated.Value(1)).current // For pulsing upload icon
  const [previousPendingCount, setPreviousPendingCount] = useState(0)

  const [keyboardVisible, dismissKeyboard] = useKeyboard()

  const onViewRef = React.useRef((viewableItems) => {
    if (viewableItems.changed && viewableItems.changed.length > 0) {
      // Get all currently visible items
      const visibleItems = viewableItems.changed.filter(
        (item) => item.isViewable,
      )

      if (visibleItems.length > 0) {
        // Find the item with the highest index
        const lastVisibleItem = visibleItems.reduce((max, current) => {
          return current.index > max.index ? current : max
        })

        if (lastVisibleItem && lastVisibleItem.index !== undefined) {
          setLastViewableRow(lastVisibleItem.index)
        }
      }
    }

    // Alternative: use viewableItems directly if it has viewableItems property
    if (viewableItems.viewableItems && viewableItems.viewableItems.length > 0) {
      const visibleItems = viewableItems.viewableItems

      const lastVisibleItem = visibleItems.reduce((max, current) => {
        return current.index > max.index ? current : max
      })

      if (lastVisibleItem && lastVisibleItem.index !== undefined) {
        setLastViewableRow(lastVisibleItem.index)
      }
    }
  })

  useEffect(() => {
    setUnreadCount(unreadCountList.reduce((a, b) => a + (b.unread || 0), 0))
  }, [unreadCountList])

  // Animation effect for pending photos
  useEffect(() => {
    if (pendingPhotos.length > 0 && previousPendingCount === 0) {
      // Animate in when photos are added
      Animated.spring(pendingPhotosAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }).start()
    } else if (pendingPhotos.length === 0 && previousPendingCount > 0) {
      // Animate out when all photos are uploaded
      Animated.timing(pendingPhotosAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }

    // Start pulsing animation for upload icon when uploading
    if (pendingPhotos.length > 0 && netAvailable) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(uploadIconAnimation, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(uploadIconAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      )
      pulseAnimation.start()

      return () => {
        pulseAnimation.stop()
        uploadIconAnimation.setValue(1)
      }
    } else {
      uploadIconAnimation.setValue(1)
    }

    setPreviousPendingCount(pendingPhotos.length)
  }, [pendingPhotos.length, netAvailable, previousPendingCount])

  // Render function for individual masonry items
  const renderMasonryItem = React.useCallback(
    ({ item, index, dimensions }) => {
      // All segments now use the same Thumb component
      return (
        <Thumb
          item={item}
          index={index}
          thumbWidth={dimensions.width}
          thumbHeight={dimensions.height}
          photosList={photosList}
          searchTerm={searchTerm}
          activeSegment={activeSegment}
          topOffset={topOffset}
          uuid={uuid}
        />
      )
    },
    [photosList?.length, searchTerm, activeSegment, topOffset, uuid],
  )

  const wantToLoadMore = () => {
    if (stopLoading) {
      return false
    }
    if (photosList.length === 0) {
      return true
    }

    // Primary check: use lastViewableRow if it's reasonable
    const screenColumns = width / thumbDimension
    const screenRows = height / thumbDimension
    const totalNumRows = photosList.length / screenColumns

    // If lastViewableRow seems stuck at 1, be more aggressive
    if (lastViewableRow <= 1) {
      return true
    }

    const shouldLoad = screenRows * 2 + lastViewableRow > totalNumRows

    return shouldLoad
  }

  const load = async (segmentOverride = null, searchTermOverride = null) => {
    setLoading(true)

    // Use current values if overrides are not provided
    const effectiveSegment =
      segmentOverride !== null ? segmentOverride : activeSegment

    // Only use search term for search segment (segment 2)
    let effectiveSearchTerm = ''
    if (effectiveSegment === 2) {
      effectiveSearchTerm =
        searchTermOverride !== null ? searchTermOverride : searchTerm
    }

    const { photos, noMoreData, batch } = await reducer.getPhotos({
      uuid,
      zeroMoment,
      location,
      netAvailable,
      searchTerm: effectiveSearchTerm,
      topOffset,
      activeSegment: effectiveSegment,
      batch: currentBatch, // clone
      pageNumber,
    })

    if (batch === currentBatch) {
      // Track consecutive empty responses
      if (!photos || photos.length === 0) {
        setConsecutiveEmptyResponses((prev) => {
          const newCount = prev + 1

          // Stop loading only after 10 consecutive empty responses
          if (newCount >= 10) {
            setStopLoading(true)
          }

          return newCount
        })
      } else {
        // Reset consecutive empty count when we get data
        setConsecutiveEmptyResponses(0)

        // Add photos to list
        setPhotosList((currentList) =>
          [...currentList, ...photos]
            .sort((a, b) => a.row_number - b.row_number)
            .filter(
              (obj, pos, arr) =>
                arr.map((mapObj) => mapObj.id).indexOf(obj.id) === pos,
            ),
        )
      }

      // Continue loading if we haven't hit the stop condition and user wants more
      if (!stopLoading && wantToLoadMore()) {
        setPageNumber((currentPage) => currentPage + 1)
      }
    }

    setLoading(false)
  }

  const handleScroll = (event) => {
    const currentScrollY = event.nativeEvent.contentOffset.y
    const layoutHeight = event.nativeEvent.layoutMeasurement.height
    const contentSizeHeight = event.nativeEvent.contentSize.height

    // Update scroll tracking
    setLastScrollY(currentScrollY)
    setScrollViewHeight(layoutHeight)
    setContentHeight(contentSizeHeight)

    // Calculate how close we are to the bottom
    const scrollProgress = (currentScrollY + layoutHeight) / contentSizeHeight

    // Trigger loading when we're 80% down the content
    if (scrollProgress > 0.8 && !loading && !stopLoading) {
      setPageNumber((currentPage) => currentPage + 1)
    }

    const isAtTop = currentScrollY <= 10 // Consider "top" as within 10px of the very top

    if (isAtTop) {
      // At the top - show text with slow animation
      if (!textVisible) {
        setTextVisible(true)
        Animated.timing(textAnimation, {
          toValue: 1,
          duration: 1600, // Extra slow motion - 1600ms (2x slower)
          useNativeDriver: true,
        }).start()
      }
    }

    if (!isAtTop) {
      // Not at top - hide text with slow animation
      if (textVisible) {
        setTextVisible(false)
        Animated.timing(textAnimation, {
          toValue: 0,
          duration: 1600, // Extra slow motion - 1600ms (2x slower)
          useNativeDriver: true,
        }).start()
      }
    }
  }

  async function uploadPendingPhotos() {
    // return Promise.resolve()
    if (netAvailable === false) {
      return Promise.resolve()
    }

    if (uploadingPhoto) {
      // console.log({ uploadingPhoto })
      // already uploading photos, just exit here
      return Promise.resolve()
    }
    setUploadingPhoto(true)

    try {
      let i
      // here let's iterate over the items and upload one file at a time

      // generatePhotoQueue will only contain item with undefined photo
      const generatePhotoQueue = (await reducer.getQueue()).filter(
        (image) => !image.photo,
      )

      // first pass iteration to generate photos ID and the photo record on the backend
      for (i = 0; i < generatePhotoQueue.length; i += 1) {
        const item = generatePhotoQueue[i]
        try {
          // Process the file if it hasn't been processed yet (compress, generate thumbnails, etc.)
          // eslint-disable-next-line no-await-in-loop
          const processedItem = await reducer.processQueuedItemForUpload(item)

          // eslint-disable-next-line no-await-in-loop
          const photo = await reducer.generatePhoto({
            uuid,
            lat: processedItem.location.coords.latitude,
            lon: processedItem.location.coords.longitude,
            video: processedItem?.type === 'video',
          })
          // eslint-disable-next-line no-await-in-loop
          await CacheManager.addToCache({
            file: processedItem.localThumbUrl,
            key: `${photo.id}-thumb`,
          })
          // eslint-disable-next-line no-await-in-loop
          await CacheManager.addToCache({
            file: processedItem.localImgUrl,
            key: `${photo.id}`,
          })
          // eslint-disable-next-line no-await-in-loop
          await reducer.removeFromQueue(processedItem)
          // eslint-disable-next-line no-await-in-loop
          await reducer.addToQueue({
            ...processedItem,
            photo,
          })
          // eslint-disable-next-line no-await-in-loop
          // setPendingPhotos(await reducer.getQueue())
        } catch (err123) {
          // eslint-disable-next-line no-console
          Toast.show({
            text1: 'Error Uploading',
            text2: `${err123}`,
            type: 'error',
            topOffset,
          })
          console.error({ err123 })
          if (`${err123}`.includes('banned')) {
            // eslint-disable-next-line no-await-in-loop
            await reducer.removeFromQueue(item)
            // eslint-disable-next-line no-await-in-loop
            setPendingPhotos(await reducer.getQueue())
          }
        }
      }

      // uploadQueue will only contain item with photo generated on the backend
      const uploadQueue = (await reducer.getQueue()).filter(
        (image) => image.photo,
      )
      // second pass -- upload files
      for (i = 0; i < uploadQueue.length; i += 1) {
        const item = uploadQueue[i]

        // eslint-disable-next-line no-await-in-loop
        const { responseData } = await reducer.uploadItem({
          item,
        })

        if (responseData?.status === 200) {
          // console.log('uploaded', { item: item?.id })
          // eslint-disable-next-line no-await-in-loop
          await reducer.removeFromQueue(item)

          setPhotosList(
            (currentList) =>
              [item.photo, ...currentList].filter(
                (obj, pos, arr) =>
                  arr.map((mapObj) => mapObj.id).indexOf(obj.id) === pos,
              ), // fancy way to remove duplicate photos
          )

          // Toast.show({
          //   text1: `${item.photo.video ? 'Video' : 'Photo'} uploaded`,
          //   topOffset,
          //   visibilityTime: 500,
          // })
          // eslint-disable-next-line no-await-in-loop
          setPendingPhotos(await reducer.getQueue())
        } else {
          // alert(JSON.stringify({ responseData }))
          Toast.show({
            text1: 'Upload is going slooooow...',
            text2: 'Still trying to upload.',
            visibilityTime: 500,
            topOffset,
          })
        }
      }
    } catch (err2) {
      // eslint-disable-next-line no-console
      Toast.show({
        text1: 'Upload is slow...',
        text2: 'Still trying to upload.',
        visibilityTime: 500,
        topOffset,
      })
      console.error('Upload process error:', err2)
    }

    setUploadingPhoto(false)
    // sleep for 500ms before re-trying
    // eslint-disable-next-line no-promise-executor-return
    await new Promise((resolve) => setTimeout(resolve, 500))

    if ((await reducer.getQueue()).length > 0) {
      uploadPendingPhotos()
    }
    return Promise.resolve()
  }

  const reload = async (segmentOverride = null, searchTermOverride = null) => {
    currentBatch = `${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`

    setStopLoading(false)
    setConsecutiveEmptyResponses(0)
    setPageNumber(null)
    setPhotosList([])

    // setPageNumber(null)
    // setStopLoading(false)
    setPageNumber(0)

    setPendingPhotos(await reducer.getQueue())

    uploadPendingPhotos()
    if (uuid.length > 0) {
      setFriendsList(
        await friendsHelper.getEnhancedListOfFriendships({
          uuid,
        }),
      )

      setUnreadCountList(await friendsHelper.getUnreadCountsList({ uuid })) // the list of enhanced friends list has to be loaded earlier on
    }

    // Load new content after state is reset, using the specific segment if provided
    await load(segmentOverride, searchTermOverride)
    // setPendingPhotos(await reducer.getQueue())
    // load()
  }

  const updateIndex = async (index) => {
    // Provide haptic feedback for better UX
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch (error) {
      // Haptics might not be available on all devices - fail silently
    }

    // Only clear photos and reset if actually switching segments
    if (activeSegment !== index) {
      setPhotosList([])
      setStopLoading(false)
      setConsecutiveEmptyResponses(0)
      setPageNumber(null)
      setActiveSegment(index)

      // Clear search term when switching away from search segment
      if (index !== 2) {
        setSearchTerm('')
      }
    }

    // Always reload content when any segment is clicked (including current one)
    // Pass the new segment index directly to ensure immediate use
    reload(index)
  }

  // Custom header renderer for Expo Router compatibility
  const renderCustomHeader = () => {
    const segmentTitles = ['Global', 'Starred', 'Search']

    return (
      <SafeAreaView
        style={{
          backgroundColor: CONST.HEADER_GRADIENT_END,
          borderBottomWidth: 1,
          borderBottomColor: CONST.HEADER_BORDER_COLOR,
          shadowColor: CONST.HEADER_SHADOW_COLOR,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 1,
          shadowRadius: 4,
          elevation: 3,
          paddingTop: 0,
        }}
      >
        <View
          style={{
            height: 60,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 16,
          }}
        >
          {/* Left: Empty space */}
          <View
            style={{
              position: 'absolute',
              left: 16,
              width: 40,
              height: 40,
            }}
          />

          {/* Center: Three segment control */}
          <View style={styles.headerContainer}>
            <View style={styles.customSegmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  activeSegment === 0 && styles.activeSegmentButton,
                ]}
                onPress={() => updateIndex(0)}
              >
                <FontAwesome
                  name="globe"
                  size={20}
                  color={
                    activeSegment === 0
                      ? CONST.ACTIVE_SEGMENT_COLOR
                      : CONST.INACTIVE_SEGMENT_COLOR
                  }
                />
                {textVisible && (
                  <Animated.Text
                    style={[
                      styles.segmentText,
                      {
                        color:
                          activeSegment === 0
                            ? CONST.ACTIVE_SEGMENT_COLOR
                            : CONST.INACTIVE_SEGMENT_COLOR,
                        opacity: textAnimation,
                        transform: [
                          {
                            translateY: textAnimation.interpolate({
                              inputRange: [0, 1],
                              outputRange: [10, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    {segmentTitles[0]}
                  </Animated.Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  activeSegment === 1 && styles.activeSegmentButton,
                ]}
                onPress={() => updateIndex(1)}
              >
                <FontAwesome
                  name="star"
                  size={20}
                  color={
                    activeSegment === 1
                      ? CONST.ACTIVE_SEGMENT_COLOR
                      : CONST.INACTIVE_SEGMENT_COLOR
                  }
                />
                {textVisible && (
                  <Animated.Text
                    style={[
                      styles.segmentText,
                      {
                        color:
                          activeSegment === 1
                            ? CONST.ACTIVE_SEGMENT_COLOR
                            : CONST.INACTIVE_SEGMENT_COLOR,
                        opacity: textAnimation,
                        transform: [
                          {
                            translateY: textAnimation.interpolate({
                              inputRange: [0, 1],
                              outputRange: [10, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    {segmentTitles[1]}
                  </Animated.Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  activeSegment === 2 && styles.activeSegmentButton,
                ]}
                onPress={() => updateIndex(2)}
              >
                <FontAwesome
                  name="search"
                  size={20}
                  color={
                    activeSegment === 2
                      ? CONST.ACTIVE_SEGMENT_COLOR
                      : CONST.INACTIVE_SEGMENT_COLOR
                  }
                />
                {textVisible && (
                  <Animated.Text
                    style={[
                      styles.segmentText,
                      {
                        color:
                          activeSegment === 2
                            ? CONST.ACTIVE_SEGMENT_COLOR
                            : CONST.INACTIVE_SEGMENT_COLOR,
                        opacity: textAnimation,
                        transform: [
                          {
                            translateY: textAnimation.interpolate({
                              inputRange: [0, 1],
                              outputRange: [10, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    {segmentTitles[2]}
                  </Animated.Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  const renderHeaderTitle = () => {
    const segmentTitles = ['Global', 'Starred', 'Search']

    return (
      <View style={styles.headerContainer}>
        <View style={styles.customSegmentedControl}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              activeSegment === 0 && styles.activeSegmentButton,
            ]}
            onPress={() => updateIndex(0)}
          >
            <FontAwesome
              name="globe"
              size={20}
              color={
                activeSegment === 0
                  ? CONST.ACTIVE_SEGMENT_COLOR
                  : CONST.INACTIVE_SEGMENT_COLOR
              }
            />
            {textVisible && (
              <Animated.Text
                style={[
                  styles.segmentText,
                  {
                    color:
                      activeSegment === 0
                        ? CONST.ACTIVE_SEGMENT_COLOR
                        : CONST.INACTIVE_SEGMENT_COLOR,
                    opacity: textAnimation,
                    transform: [
                      {
                        translateY: textAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [10, 0], // Slide down when hiding, slide up when showing
                        }),
                      },
                    ],
                  },
                ]}
              >
                {segmentTitles[0]}
              </Animated.Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              activeSegment === 1 && styles.activeSegmentButton,
            ]}
            onPress={() => updateIndex(1)}
          >
            <AntDesign
              name="star"
              size={20}
              color={
                activeSegment === 1
                  ? CONST.ACTIVE_SEGMENT_COLOR
                  : CONST.INACTIVE_SEGMENT_COLOR
              }
            />
            {textVisible && (
              <Animated.Text
                style={[
                  styles.segmentText,
                  {
                    color:
                      activeSegment === 1
                        ? CONST.ACTIVE_SEGMENT_COLOR
                        : CONST.INACTIVE_SEGMENT_COLOR,
                    opacity: textAnimation,
                    transform: [
                      {
                        translateY: textAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [10, 0], // Slide down when hiding, slide up when showing
                        }),
                      },
                    ],
                  },
                ]}
              >
                {segmentTitles[1]}
              </Animated.Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              activeSegment === 2 && styles.activeSegmentButton,
            ]}
            onPress={() => updateIndex(2)}
          >
            <FontAwesome
              name="search"
              size={20}
              color={
                activeSegment === 2
                  ? CONST.ACTIVE_SEGMENT_COLOR
                  : CONST.INACTIVE_SEGMENT_COLOR
              }
            />
            {textVisible && (
              <Animated.Text
                style={[
                  styles.segmentText,
                  {
                    color:
                      activeSegment === 2
                        ? CONST.ACTIVE_SEGMENT_COLOR
                        : CONST.INACTIVE_SEGMENT_COLOR,
                    opacity: textAnimation,
                    transform: [
                      {
                        translateY: textAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [10, 0], // Slide down when hiding, slide up when showing
                        }),
                      },
                    ],
                  },
                ]}
              >
                {segmentTitles[2]}
              </Animated.Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // updateNavBar function is no longer needed since we use a custom header with Expo Router
  // const updateNavBar = async () => {
  //   navigation.setOptions({
  //     headerTitle: renderHeaderTitle,
  //     headerStyle: {
  //       backgroundColor: CONST.HEADER_GRADIENT_END,
  //       borderBottomWidth: 1,
  //       borderBottomColor: CONST.HEADER_BORDER_COLOR,
  //       shadowColor: CONST.HEADER_SHADOW_COLOR,
  //       shadowOffset: {
  //         width: 0,
  //         height: 2,
  //       },
  //       shadowOpacity: 1,
  //       shadowRadius: 4,
  //       elevation: 3,
  //     },
  //     headerTitleStyle: {
  //       fontSize: 18,
  //       fontWeight: '600',
  //       color: CONST.TEXT_COLOR,
  //     },
  //   })
  // }

  async function checkPermission({
    permissionFunction,
    alertHeader,
    alertBody,
    permissionFunctionArgument,
  }) {
    const { status } = await permissionFunction(permissionFunctionArgument)
    if (status !== 'granted') {
      Alert.alert(alertHeader, alertBody, [
        {
          text: 'Open Settings',
          onPress: () => {
            Linking.openSettings()
          },
        },
      ])
    }
    return status
  }

  const takePhoto = async ({ cameraType }) => {
    let cameraReturn
    if (cameraType === 'camera') {
      // launch photo capturing
      cameraReturn = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        // allowsEditing: true,
        quality: 1.0, // Reduced from 1.0 to 0.8 for better upload performance
        exif: false,
      })
    } else {
      // launch video capturing
      cameraReturn = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        // allowsEditing: true,
        videoMaxDuration: 5,
        quality: 1.0, // Reduced from 1.0 to 0.8 for better upload performance
        exif: false,
      })
    }

    // alert(`cameraReturn.canceled ${cameraReturn.canceled}`)
    if (cameraReturn.canceled === false) {
      await MediaLibrary.saveToLibraryAsync(cameraReturn.assets[0].uri)
      // have to wait, otherwise the upload will not start
      await reducer.queueFileForUpload({
        cameraImgUrl: cameraReturn.assets[0].uri,
        type: cameraReturn.assets[0].type,
        location,
      })

      setPendingPhotos(await reducer.getQueue())

      uploadPendingPhotos({
        uuid,
        topOffset,
        netAvailable,
        uploadingPhoto: true,
      })
    }
  }

  const checkPermissionsForPhotoTaking = async ({ cameraType }) => {
    const cameraPermission = await checkPermission({
      permissionFunction: ImagePicker.requestCameraPermissionsAsync,
      alertHeader: 'Do you want to take photo with wisaw?',
      alertBody: "Why don't you enable photo permission?",
    })

    if (cameraPermission === 'granted') {
      const photoAlbomPermission = await checkPermission({
        permissionFunction: ImagePicker.requestMediaLibraryPermissionsAsync,
        alertHeader: 'Do you want to save photo on your device?',
        alertBody: "Why don't you enable the permission?",
        permissionFunctionArgument: true,
      })

      if (photoAlbomPermission === 'granted') {
        await takePhoto({ cameraType })
      }
    }
  }

  async function initLocation() {
    const locationPermission = await checkPermission({
      permissionFunction: Location.requestForegroundPermissionsAsync,
      alertHeader:
        'WiSaw shows you near-by photos based on your current location.',
      alertBody: 'You need to enable Location in Settings and Try Again.',
    })

    if (locationPermission === 'granted') {
      try {
        // initially set the location that is last known -- works much faster this way
        let loc = await Location.getLastKnownPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        })
        if (!loc) {
          loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.BestForNavigation,
          })
        }
        if (loc) setLocation(loc)

        return loc
      } catch (err12) {
        console.error({ err12 })
        Toast.show({
          text1: 'Unable to get location',
          type: 'error',
          topOffset,
        })
      }
    }
    return null
  }

  useEffect(() => {
    reducer.initPendingUploads()

    // add network availability listener
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      if (state) {
        setNetAvailable(state.isInternetReachable)
      }
    })

    return () => {
      unsubscribeNetInfo()
    }
  }, [])

  useEffect(() => {
    if (netAvailable) {
      reload()
    }
    // updateNavBar()
  }, [netAvailable])

  useEffect(() => {
    // TODO: delete next line -- debuggin
    // navigation.navigate('ConfirmFriendship', {
    //   friendshipUuid: '544e4564-1fb2-429f-917c-3495f545552b',
    // })
    ;(async () => {
      await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowAnnouncements: true,
        },
      })
    })()
    ;(async () => {
      await registerBackgroundFetchAsync()
    })()
    ;(async () => {
      setIsTandcAccepted(await reducer.getTancAccepted())
    })()
    ;(async () => {
      setZeroMoment(await reducer.getZeroMoment())
    })()
  }, [])

  useEffect(() => {
    const thumbsCount = Math.floor(width / 90)
    setThumbDimension(
      Math.floor((width - thumbsCount * 3 * 2) / thumbsCount) + 2,
    )

    // checkForUpdate(),
    // check permissions, retrieve UUID, make sure upload folder exists

    initLocation()
  }, [])

  useEffect(() => {
    // updateNavBar()
    reload()
  }, [location])

  // useEffect(() => {}, [currentBatch])

  // useEffect(() => {
  //   updateNavBar()
  // }, [loading])

  // Update navigation bar when activeSegment changes
  useEffect(() => {
    // updateNavBar() // No longer needed with custom header
  }, [activeSegment])

  // Update navigation bar when text visibility changes
  useEffect(() => {
    // updateNavBar() // No longer needed with custom header
  }, [textVisible])

  useEffect(() => {
    if (pageNumber !== null) {
      load()
    }
  }, [pageNumber])

  useEffect(() => {
    if (wantToLoadMore() && loading === false) {
      setPageNumber((currentPage) => currentPage + 1)
      // load()
    }
  }, [lastViewableRow])

  // Handle search from URL parameter (e.g., from AI tag clicks)
  useEffect(() => {
    if (searchFromUrl && searchFromUrl.trim().length > 0) {
      const searchTermToUse = searchFromUrl.trim()

      // Set the search term
      setSearchTerm(searchTermToUse)

      // Switch to search segment
      setActiveSegment(2)

      // Immediately clear photos list
      setPhotosList([])

      // Reset pagination and loading state
      setPageNumber(0)
      setStopLoading(false)
      setConsecutiveEmptyResponses(0)
      currentBatch = `${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`

      // Focus the search bar if it exists
      setTimeout(() => {
        if (searchBarRef.current) {
          searchBarRef.current.focus()
        }
      }, 200)

      // Trigger search immediately with the search term directly passed
      const performSearch = async () => {
        try {
          await reload(2, searchTermToUse)
        } catch (error) {
          // Search failed, but don't break the app
        }
      }
      performSearch()
    }
  }, [searchFromUrl])

  // Handle search triggered from AI tag clicks
  useEffect(() => {
    if (triggerSearch && triggerSearch.trim().length > 0) {
      const searchTermToUse = triggerSearch.trim()

      // Dismiss keyboard immediately since search is automatic
      Keyboard.dismiss()

      // Set the search term
      setSearchTerm(searchTermToUse)

      // Switch to search segment
      setActiveSegment(2)

      // Immediately clear photos list
      setPhotosList([])

      // Reset pagination and loading state
      setPageNumber(0)
      setStopLoading(false)
      setConsecutiveEmptyResponses(0)
      currentBatch = `${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`

      // Don't focus the search bar for automatic searches triggered by AI labels
      // The search is already performed and keyboard is not needed

      // Trigger search immediately with the search term directly passed
      const performSearch = async () => {
        try {
          await reload(2, searchTermToUse)
        } catch (error) {
          // Search failed, but don't break the app
        }
      }
      performSearch()

      // Clear the trigger
      setTriggerSearch(null)
    }
  }, [triggerSearch])

  const renderThumbs = () => {
    // Different configurations for each segment
    const getSegmentConfig = () => {
      switch (activeSegment) {
        case 0: // Near You - compact masonry layout
          return {
            spacing: 5,
            maxItemsPerRow: 12,
            baseHeight: 100,
            aspectRatioFallbacks: [
              0.56, // 9:16 (portrait)
              0.67, // 2:3 (portrait)
              0.75, // 3:4 (portrait)
              1.0, // 1:1 (square)
              1.33, // 4:3 (landscape)
              1.5, // 3:2 (landscape)
              1.78, // 16:9 (landscape)
            ],
          }
        case 1: // Watched - larger items with comments
          return {
            spacing: 5,
            maxItemsPerRow: 12,
            baseHeight: 100,
            aspectRatioFallbacks: [
              0.56, // 9:16 (portrait)
              0.67, // 2:3 (portrait)
              0.75, // 3:4 (portrait)
              1.0, // 1:1 (square)
              1.33, // 4:3 (landscape)
              1.5, // 3:2 (landscape)
              1.78, // 16:9 (landscape)
            ],
          }
        case 2: // Search - same masonry layout as Global for consistent experience
          return {
            spacing: 5,
            maxItemsPerRow: 12,
            baseHeight: 100,
            aspectRatioFallbacks: [
              0.56, // 9:16 (portrait)
              0.67, // 2:3 (portrait)
              0.75, // 3:4 (portrait)
              1.0, // 1:1 (square)
              1.33, // 4:3 (landscape)
              1.5, // 3:2 (landscape)
              1.78, // 16:9 (landscape)
            ],
          }
        default:
          return {
            spacing: 5,
            maxItemsPerRow: 12,
            baseHeight: 100,
            aspectRatioFallbacks: [
              0.56, // 9:16 (portrait)
              0.67, // 2:3 (portrait)
              0.75, // 3:4 (portrait)
              1.0, // 1:1 (square)
              1.33, // 4:3 (landscape)
              1.5, // 3:2 (landscape)
              1.78, // 16:9 (landscape)
            ],
          }
      }
    }

    const config = getSegmentConfig()

    return (
      <ExpoMasonryLayout
        data={photosList}
        renderItem={renderMasonryItem}
        spacing={config.spacing}
        maxItemsPerRow={config.maxItemsPerRow}
        baseHeight={config.baseHeight}
        aspectRatioFallbacks={config.aspectRatioFallbacks}
        keyExtractor={(item) => item.id}
        onEndReached={() => {
          // Always try to load more when reaching the end, regardless of lastViewableRow calculation
          if (!loading && !stopLoading) {
            setPageNumber((currentPage) => {
              const newPage = currentPage + 1
              return newPage
            })
          }
        }}
        onEndReachedThreshold={0.5}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 10,
        }}
        refreshing={false}
        onRefresh={() => {
          reload()
        }}
        onScroll={handleScroll}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={15}
        updateCellsBatchingPeriod={50}
        scrollEventThrottle={16}
        style={{
          ...styles.container,
          marginBottom: FOOTER_HEIGHT,
        }}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
      />
    )
  }

  const renderFooter = () => {
    Notifications.setBadgeCountAsync(unreadCount || 0)

    return (
      location && (
        <SafeAreaView
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            width,
            height: FOOTER_HEIGHT,
            position: 'absolute',
            bottom: 0,
            right: 0,
            left: 0,
            borderTopWidth: 1,
            borderTopColor: 'rgba(0, 0, 0, 0.1)',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 14,
            zIndex: 14,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingTop: 10,
              height: '100%',
              elevation: 14,
              zIndex: 14,
            }}
          >
            {/* Navigation Menu Button */}
            <TouchableOpacity
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                elevation: 15,
                zIndex: 15,
              }}
              onPress={() => {
                try {
                  navigation.openDrawer()
                } catch (error) {
                  // Fallback if drawer navigation is not available
                  console.log('Could not open drawer:', error)
                }
              }}
              disabled={!netAvailable}
            >
              <FontAwesome
                name="navicon"
                size={22}
                color={netAvailable ? CONST.MAIN_COLOR : 'rgba(0, 0, 0, 0.3)'}
              />
            </TouchableOpacity>

            {/* Video Recording Button */}
            <TouchableOpacity
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: '#FF6B6B',
                shadowColor: '#FF6B6B',
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 15,
                zIndex: 15,
              }}
              onPress={() => {
                checkPermissionsForPhotoTaking({ cameraType: 'video' })
              }}
            >
              <FontAwesome5 name="video" color="white" size={24} />
            </TouchableOpacity>

            {/* Photo Capture Button - Main Action */}
            <TouchableOpacity
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: CONST.MAIN_COLOR,
                shadowColor: CONST.MAIN_COLOR,
                shadowOffset: {
                  width: 0,
                  height: 6,
                },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 15,
                zIndex: 15,
                borderWidth: 3,
                borderColor: 'white',
              }}
              onPress={() => {
                checkPermissionsForPhotoTaking({ cameraType: 'camera' })
              }}
            >
              <FontAwesome5 name="camera" color="white" size={28} />
            </TouchableOpacity>

            {/* Friends List Button */}
            <TouchableOpacity
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                position: 'relative',
                elevation: 15,
                zIndex: 15,
              }}
              onPress={() => router.push('/friends')}
              disabled={!netAvailable}
            >
              <FontAwesome5
                name="user-friends"
                size={22}
                color={netAvailable ? CONST.MAIN_COLOR : 'rgba(0, 0, 0, 0.3)'}
              />
              {unreadCount > 0 && (
                <Badge
                  value={unreadCount}
                  badgeStyle={{
                    backgroundColor: '#FF4757',
                    borderWidth: 2,
                    borderColor: 'white',
                    minWidth: 20,
                    height: 20,
                    borderRadius: 10,
                  }}
                  textStyle={{
                    fontSize: 11,
                    fontWeight: 'bold',
                  }}
                  containerStyle={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    elevation: 20,
                    zIndex: 20,
                  }}
                />
              )}
            </TouchableOpacity>
          </View>

          {loading && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
              }}
            >
              <LinearProgress
                color={CONST.MAIN_COLOR}
                style={{
                  flex: 1,
                  height: 3,
                }}
              />
            </View>
          )}
        </SafeAreaView>
      )
    )
  }

  // const renderHeaderLeft = () => (
  //   <FontAwesome5
  //     onPress={
  //       () => {
  //         _reload()
  //       }
  //     }
  //     name="sync"
  //     size={30}
  //     style={
  //       {
  //         marginLeft: 10,
  //         color: CONST.MAIN_COLOR,
  //         width: 60,
  //       }
  //     }
  //   />
  // )

  // const renderHeaderRight = () => (
  //   <MaterialIcons
  //     onPress={
  //       () => navigation.navigate('FeedbackScreen')
  //     }
  //     name="feedback"
  //     size={35}
  //     style={{
  //       marginRight: 20,
  //       color: CONST.MAIN_COLOR,
  //     }}
  //   />
  // )
  const submitSearch = async () => {
    if (searchTerm && searchTerm.length >= 3) {
      if (keyboardVisible) {
        dismissKeyboard()
      }
      reload()
      // await load()
    } else {
      Toast.show({
        text1: 'Search for more than 3 characters',
        type: 'error',
        topOffset,
      })
    }
  }

  const renderSearchBar = (autoFocus) => (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 8,
        zIndex: 8,
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          borderRadius: 20,
          paddingHorizontal: 16,
          marginRight: 12,
        }}
      >
        <Ionicons
          name="search"
          size={20}
          color="rgba(0, 0, 0, 0.5)"
          style={{ marginRight: 8 }}
        />
        <TextInput
          ref={searchBarRef}
          placeholder="Search photos..."
          placeholderTextColor="rgba(0, 0, 0, 0.5)"
          onChangeText={(currentTerm) => {
            setSearchTerm(currentTerm)
          }}
          value={searchTerm}
          onSubmitEditing={() => submitSearch()}
          autoFocus={autoFocus}
          returnKeyType="search"
          style={{
            flex: 1,
            color: CONST.TEXT_COLOR,
            fontSize: 16,
            fontWeight: '400',
            height: 40,
            paddingHorizontal: 0,
            marginLeft: 0,
            paddingRight: searchTerm ? 30 : 0, // Make room for clear button
          }}
        />
        {searchTerm ? (
          <TouchableOpacity
            onPress={() => {
              setSearchTerm('')
              if (searchBarRef.current) {
                searchBarRef.current.clear()
                searchBarRef.current.focus()
              }
            }}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: [{ translateY: -10 }],
              width: 20,
              height: 20,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              borderRadius: 10,
              elevation: 6,
              zIndex: 6,
            }}
          >
            <Ionicons name="close" size={12} color="rgba(0, 0, 0, 0.6)" />
          </TouchableOpacity>
        ) : null}
      </View>

      <TouchableOpacity
        onPress={() => submitSearch()}
        style={{
          backgroundColor: CONST.MAIN_COLOR,
          borderRadius: 20,
          width: 44,
          height: 44,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: CONST.MAIN_COLOR,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 8,
          zIndex: 8,
        }}
      >
        <Ionicons name="send" size={20} color="white" />
      </TouchableOpacity>
    </View>
  )

  const renderPendingPhotos = () => {
    if (pendingPhotos.length > 0) {
      return (
        <Animated.View
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 12,
            padding: 16,
            marginHorizontal: 16,
            marginVertical: 8,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            position: 'relative',
            opacity: pendingPhotosAnimation,
            transform: [
              {
                translateY: pendingPhotosAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              },
              {
                scale: pendingPhotosAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          }}
        >
          <Animated.View
            style={{
              transform: [
                {
                  scale: uploadIconAnimation,
                },
              ],
            }}
          >
            <MaterialIcons
              name="cloud-upload"
              size={24}
              color={netAvailable ? CONST.MAIN_COLOR : 'rgba(0, 0, 0, 0.3)'}
              style={{ marginRight: 12 }}
            />
          </Animated.View>
          <View style={{ flex: 1 }}>
            <Animated.Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: CONST.TEXT_COLOR,
                marginBottom: 4,
                opacity: pendingPhotosAnimation,
              }}
            >
              {pendingPhotos.length}{' '}
              {pendingPhotos.length === 1 ? 'photo' : 'photos'}{' '}
              {netAvailable ? 'uploading' : 'waiting to upload'}
            </Animated.Text>
          </View>
          {netAvailable && (
            <Animated.View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 4,
                borderBottomLeftRadius: 12,
                borderBottomRightRadius: 12,
                overflow: 'hidden',
                opacity: pendingPhotosAnimation,
              }}
            >
              <LinearProgress
                color={CONST.MAIN_COLOR}
                style={{
                  flex: 1,
                  height: 4,
                  borderBottomLeftRadius: 12,
                  borderBottomRightRadius: 12,
                }}
                trackStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  borderBottomLeftRadius: 12,
                  borderBottomRightRadius: 12,
                }}
              />
            </Animated.View>
          )}
        </Animated.View>
      )
    }
    return null
  }

  /// //////////////////////////////////////////////////////////////////////////
  // here where the rendering starts
  /// //////////////////////////////////////////////////////////////////////////

  if (!netAvailable) {
    return (
      <View style={{ flex: 1 }}>
        {renderCustomHeader()}
        {renderPendingPhotos()}
        <View style={styles.container}>
          <EmptyStateCard
            icon="wifi-off"
            iconType="MaterialIcons"
            title="No Internet Connection"
            subtitle="You can still take photos offline. They'll be uploaded automatically when you're back online."
            actionText="Try Again"
            onActionPress={reload}
          />
          {renderFooter({ unreadCount })}
        </View>
      </View>
    )
  }

  if (isTandcAccepted && location && photosList?.length > 0) {
    return (
      <View style={{ flex: 1 }}>
        {renderCustomHeader()}
        {renderPendingPhotos()}
        <View style={styles.container}>
          {activeSegment === 2 && renderSearchBar(false)}
          {/* photos - unified masonry layout for all segments */}
          {renderThumbs()}
          {renderFooter({ unreadCount })}
        </View>
      </View>
    )
  }

  if (!isTandcAccepted) {
    return (
      <View style={styles.container}>
        <Overlay isVisible>
          <ScrollView>
            <Card containerStyle={{ padding: 0 }}>
              <ListItem style={{ borderRadius: 10 }}>
                <Text>
                  When you take a photo with WiSaw app, it will be added to a
                  Photo Album on your phone, as well as posted to global feed in
                  the cloud.
                </Text>
              </ListItem>
              <Divider />
              <ListItem>
                <Text>Everyone close-by can see your photos.</Text>
              </ListItem>
              <Divider />
              <ListItem>
                <Text>You can see other&#39;s photos too.</Text>
              </ListItem>
              <Divider />
              <ListItem>
                <Text>
                  If you find any photo abusive or inappropriate, you can delete
                  it -- it will be deleted from the cloud so that no one will
                  ever see it again.
                </Text>
              </ListItem>
              <Divider />
              <ListItem>
                <Text>
                  No one will tolerate objectionable content or abusive users.
                </Text>
              </ListItem>
              <Divider />
              <ListItem>
                <Text>
                  The abusive users will be banned from WiSaw by other users.
                </Text>
              </ListItem>
              <Divider />
              <ListItem>
                <Text>By using WiSaw I agree to Terms and Conditions.</Text>
              </ListItem>
              <Divider />

              <ListItem style={{ alignItems: 'center' }}>
                <Button
                  title="I Agree"
                  type="outline"
                  onPress={() => {
                    setIsTandcAccepted(reducer.acceptTandC())
                  }}
                />
              </ListItem>
            </Card>
          </ScrollView>
        </Overlay>
      </View>
    )
  }

  if (!location) {
    return (
      <View style={{ flex: 1 }}>
        {renderCustomHeader()}
        {renderPendingPhotos()}
        <View style={styles.container}>
          <EmptyStateCard
            icon="location-on"
            iconType="MaterialIcons"
            title="Location Access Needed"
            subtitle="WiSaw needs location access to show you photos from your area and let others discover your content."
            actionText="Enable Location"
            onActionPress={reload}
          />
          {renderFooter({ renderFooter })}
        </View>
      </View>
    )
  }

  if (photosList?.length === 0 && stopLoading) {
    const getEmptyStateProps = () => {
      switch (activeSegment) {
        case 0: // Global photos
          return {
            icon: 'globe',
            title: 'No Photos in Your Area',
            subtitle:
              "Be the first to share a moment! Take a photo and let others discover what's happening around you.",
            actionText: 'Take a Photo',
            onActionPress: () => {
              // TODO: Add photo taking functionality
              reload()
            },
          }
        case 1: // Starred photos
          return {
            icon: 'star',
            title: 'No Starred Content Yet',
            subtitle:
              "Start building your collection! Take photos, comment on others' posts, or star content you love.",
            actionText: 'Discover Content',
            onActionPress: () => {
              // Switch to global view to discover content
              updateIndex(0)
            },
          }
        case 2: // Search
          return {
            icon: 'search',
            title: 'No Results Found',
            subtitle:
              "Try different keywords or explore what's trending in your area.",
            actionText: 'Clear Search',
            onActionPress: () => {
              // Clear search input and focus, same as the clear button inside input box
              setSearchTerm('')
              if (searchBarRef.current) {
                searchBarRef.current.clear()
                searchBarRef.current.focus()
              }
              reload()
            },
          }
        default:
          return {
            icon: 'photo',
            iconType: 'MaterialIcons',
            title: 'No Photos Available',
            subtitle: 'Start your journey by taking your first photo!',
            actionText: 'Get Started',
            onActionPress: reload,
          }
      }
    }

    return (
      <View style={{ flex: 1 }}>
        {renderCustomHeader()}
        {renderPendingPhotos()}
        <View style={styles.container}>
          {activeSegment === 2 && renderSearchBar(true)}
          <EmptyStateCard {...getEmptyStateProps()} />
          {renderFooter({ unreadCount })}
        </View>
      </View>
    )
  }

  // dispatch(reducer.getPhotos())
  return (
    <View style={{ flex: 1 }}>
      {renderCustomHeader()}
      {renderPendingPhotos()}
      <View style={styles.container}>
        {activeSegment === 2 && renderSearchBar(false)}
        {renderFooter({ unreadCount })}
      </View>
    </View>
  )
}

PhotosList.propTypes = {
  searchFromUrl: PropTypes.string,
}

PhotosList.defaultProps = {
  searchFromUrl: null,
}

export default PhotosList
