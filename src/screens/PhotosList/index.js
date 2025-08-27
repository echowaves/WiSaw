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
import { getTheme } from '../../theme/sharedStyles'

import EmptyStateCard from '../../components/EmptyStateCard'
import ExpandableThumb from '../../components/ExpandableThumb'
import ThumbWithComments from '../../components/ThumbWithComments'

const BACKGROUND_TASK_NAME = 'background-task'

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
  const [isDarkMode] = useAtom(STATE.isDarkMode)

  const theme = getTheme(isDarkMode)

  // Dynamic styles based on current theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.BACKGROUND,
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
      backgroundColor: theme.CARD_BACKGROUND,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.HEADER_BORDER,
      shadowColor: theme.HEADER_SHADOW,
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
      borderRadius: 16,
      marginHorizontal: 2,
      alignItems: 'center',
      justifyContent: 'center',
      // Removed fixed padding and minWidth - now handled by animations
    },
    activeSegmentButton: {
      backgroundColor: theme.INTERACTIVE_ACTIVE,
    },
    segmentText: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 4,
    },
    activeSegmentText: {
      color: theme.TEXT_PRIMARY,
    },
    inactiveSegmentText: {
      color: theme.TEXT_SECONDARY,
    },
    buttonGroupContainer: {
      width: 220,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.CARD_BACKGROUND,
      borderWidth: 1,
      borderColor: theme.HEADER_BORDER,
      shadowColor: theme.HEADER_SHADOW,
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
      backgroundColor: theme.INTERACTIVE_ACTIVE,
      borderRadius: 16,
    },
    footerContainer: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: 0,
      borderTopWidth: 1,
      borderTopColor: theme.BORDER_LIGHT,
      shadowColor: theme.HEADER_SHADOW,
    },
    videoRecordButton: {
      justifyContent: 'center',
      alignItems: 'center',
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.STATUS_ERROR,
      shadowColor: theme.STATUS_ERROR,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 15,
      zIndex: 15,
    },
    badgeStyle: {
      backgroundColor: theme.STATUS_ERROR,
      borderWidth: 2,
      borderColor: theme.BACKGROUND,
      minWidth: 20,
      height: 20,
      borderRadius: 10,
    },
    cameraButton: {
      shadowColor: theme.HEADER_SHADOW,
    },
  })

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
  const [searchTerm, setSearchTerm] = useAtom(STATE.searchTerm)
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

  // State for inline photo expansion
  const [expandedPhotoId, setExpandedPhotoId] = useState(null)
  const [isPhotoExpanding, setIsPhotoExpanding] = useState(false)
  const [scrollToIndex, setScrollToIndex] = useState(null)

  const [textVisible, setTextVisible] = useState(true)
  const textAnimation = React.useRef(new Animated.Value(1)).current // 1 = visible, 0 = hidden
  const headerHeightAnimation = React.useRef(new Animated.Value(1)).current // Start full: 1 = full height, 0 = compact height
  const searchBarRef = React.useRef(null)

  // Animation states for pending photos
  const pendingPhotosAnimation = React.useRef(new Animated.Value(0)).current // 0 = hidden, 1 = visible
  const uploadIconAnimation = React.useRef(new Animated.Value(1)).current // For pulsing upload icon
  const [previousPendingCount, setPreviousPendingCount] = useState(0)

  // Footer animation states
  const footerAnimation = React.useRef(new Animated.Value(1)).current // 1 = visible, 0 = hidden
  const lastScrollY = React.useRef(0) // Track scroll position
  const scrollDirection = React.useRef('up') // Track scroll direction

  const [keyboardVisible, dismissKeyboard] = useKeyboard()

  const masonryRef = React.useRef(null)

  // Simplified scroll detection - only use viewable items to determine state
  const setHeaderState = (shouldBeCompact) => {
    const targetValue = shouldBeCompact ? 0 : 1

    // Only animate if the state is actually changing
    if (headerHeightAnimation._value !== targetValue) {
      setTextVisible(!shouldBeCompact)

      Animated.timing(textAnimation, {
        toValue: shouldBeCompact ? 0 : 1,
        duration: 250,
        useNativeDriver: true,
      }).start()

      Animated.timing(headerHeightAnimation, {
        toValue: targetValue,
        duration: 250,
        useNativeDriver: false,
      }).start()
    }
  }

  const onViewRef = React.useRef((viewableItems) => {
    const currentViewableItems =
      viewableItems.viewableItems ||
      viewableItems.changed?.filter((item) => item.isViewable) ||
      []

    if (currentViewableItems.length > 0) {
      // Check if the first item (index 0) is visible
      const firstItemVisible = currentViewableItems.some(
        (item) => item.index === 0,
      )

      // Simple two-state logic: compact if first item not visible, full if first item visible
      setHeaderState(!firstItemVisible)

      // Keep the original functionality for tracking last viewable row
      const lastVisibleItem = currentViewableItems.reduce((max, current) => {
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

  // Monitor photosList and ensure header is in correct state
  useEffect(() => {
    // If there are no photos or very few photos, keep header in full mode
    if (!photosList || photosList.length === 0) {
      setHeaderState(false) // false = full header

      // Also ensure the footer is visible when list is empty/reset
      if (footerAnimation._value !== 1) {
        Animated.timing(footerAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start()
      }
    }
  }, [photosList])

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

  // Effect to handle scrolling to expanded photo (simplified as backup)
  useEffect(() => {
    if (scrollToIndex !== null) {
      // Clear the scroll target after a delay (cleanup)
      const timer = setTimeout(() => {
        setScrollToIndex(null)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [scrollToIndex])

  // Function to handle photo expansion toggle
  const handlePhotoToggle = React.useCallback(
    (photoId) => {
      if (isPhotoExpanding) return // Prevent multiple rapid toggles

      setIsPhotoExpanding(true)

      // Find the index of the photo being toggled
      const photoIndex = photosList.findIndex((photo) => photo.id === photoId)
      const isCurrentlyExpanded = photosList.find(
        (photo) => photo.id === photoId,
      )?.isExpanded

      // Update the photosList to toggle the expanded state
      setPhotosList((currentList) => {
        return currentList.map((photo) => {
          if (photo.id === photoId) {
            // Toggle this photo's expanded state
            const newExpandedState = !photo.isExpanded
            const screenWidth = width - 20 // Account for padding
            const aspectRatio =
              photo.width && photo.height ? photo.width / photo.height : 1
            const expandedImageHeight = screenWidth / aspectRatio

            // Calculate total height to match ExpandableThumb logic:
            // - Photo image height (based on aspect ratio)
            // - Action card (~100px)
            // - Comments section (estimate ~300px for multiple comments)
            // - Recognition section (~150px)
            // - Padding and margins (~100px)
            const totalExpandedHeight = newExpandedState
              ? Math.max(
                  expandedImageHeight + 650, // Image height + estimated content height
                  Math.max(screenWidth * 1.8, 800), // Fallback: larger multiple of screen width
                )
              : expandedImageHeight + 120

            return {
              ...photo,
              isExpanded: newExpandedState,
              // Override dimensions when expanded
              overrideWidth: newExpandedState ? screenWidth : undefined,
              overrideHeight: newExpandedState
                ? totalExpandedHeight
                : undefined,
            }
          } else if (photo.isExpanded) {
            // Collapse any other expanded photos
            return {
              ...photo,
              isExpanded: false,
              overrideWidth: undefined,
              overrideHeight: undefined,
            }
          }
          return photo
        })
      })

      // Update the expandedPhotoId for backwards compatibility
      setExpandedPhotoId((prevId) => (prevId === photoId ? null : photoId))

      // Scroll to the expanded photo if it's being expanded (not collapsed)
      if (!isCurrentlyExpanded && photoIndex !== -1) {
        // Scroll DOWN to position the expanded photo properly on screen
        setTimeout(() => {
          if (masonryRef.current && masonryRef.current._scrollRef) {
            try {
              // Calculate the full expanded photo height using same logic as above
              const expandedPhoto = photosList[photoIndex]
              const screenWidth = width - 20
              const aspectRatio =
                expandedPhoto.width && expandedPhoto.height
                  ? expandedPhoto.width / expandedPhoto.height
                  : 1
              const expandedPhotoImageHeight = screenWidth / aspectRatio
              const totalExpandedHeight = Math.max(
                expandedPhotoImageHeight + 650, // Image height + estimated content height
                Math.max(screenWidth * 1.8, 800), // Fallback: larger multiple of screen width
              )

              // Scroll DOWN by the full expanded height to bring it into view
              const scrollDownDistance = totalExpandedHeight

              // Use the internal scroll ref and get current position
              const scrollRef = masonryRef.current._scrollRef

              // Try to get current scroll position
              if (scrollRef && scrollRef.scrollTo) {
                // Get current scroll metrics
                const scrollMetrics = masonryRef.current._getScrollMetrics
                  ? masonryRef.current._getScrollMetrics()
                  : null

                let currentY = 0
                if (scrollMetrics && scrollMetrics.offset !== undefined) {
                  currentY = scrollMetrics.offset
                } else if (masonryRef.current._scrollMetrics) {
                  currentY = masonryRef.current._scrollMetrics.offset || 0
                } else {
                  // Fallback: estimate current position
                  currentY = photoIndex * 80
                }

                // Calculate new position: current position PLUS scroll down distance
                const targetY = currentY + scrollDownDistance

                scrollRef.scrollTo({
                  y: targetY,
                  animated: true,
                })
              }
            } catch (error) {
              // Silently handle scroll errors
            }
          }
        }, 300)
      }

      // Reset expanding state after animation
      setTimeout(() => setIsPhotoExpanding(false), 500)
    },
    [isPhotoExpanding, width, photosList, masonryRef],
  )

  // Callback to update item dimensions when Photo component measures its actual height
  const updateItemDimensions = React.useCallback(
    (itemId, measuredHeight) => {
      setPhotosList((currentList) =>
        currentList.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              overrideHeight: measuredHeight,
              // Keep the calculated width if it exists, otherwise use current override
              overrideWidth: item.overrideWidth || item.width,
            }
          }
          return item
        }),
      )
    },
    [setPhotosList],
  )

  // Render function for individual masonry items
  const renderMasonryItem = React.useCallback(
    ({ item, index, dimensions }) => {
      // Use ThumbWithComments for starred (segment 1) and search (segment 2)
      // Use simple Thumb for global photos (segment 0)
      if (activeSegment === 1 || activeSegment === 2) {
        return (
          <ThumbWithComments
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
      }

      return (
        <ExpandableThumb
          item={item}
          index={index}
          thumbWidth={dimensions.width}
          thumbHeight={dimensions.height}
          photosList={photosList}
          searchTerm={searchTerm}
          activeSegment={activeSegment}
          topOffset={topOffset}
          uuid={uuid}
          isExpanded={item.isExpanded || false}
          onToggleExpand={handlePhotoToggle}
          expandedPhotoId={expandedPhotoId}
          onUpdateDimensions={updateItemDimensions}
        />
      )
    },
    [
      photosList?.length,
      searchTerm,
      activeSegment,
      topOffset,
      uuid,
      expandedPhotoId,
      handlePhotoToggle,
    ],
  )

  const wantToLoadMore = () => {
    if (stopLoading) {
      return false
    }
    if (photosList.length === 0) {
      return true
    }

    // Conservative check for preemptive loading
    // This is used for background preloading, not for onEndReached
    const screenColumns = width / thumbDimension
    const screenRows = height / thumbDimension
    const totalNumRows = photosList.length / screenColumns

    // Only preload when we're within 2 screens of the end
    const shouldLoad = lastViewableRow + screenRows * 2 >= totalNumRows

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
    }

    setLoading(false)
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
      // Get all pending items once
      const pendingQueue = await reducer.getQueue()

      // Process each item completely from start to finish
      for (let i = 0; i < pendingQueue.length; i += 1) {
        const originalItem = pendingQueue[i]

        try {
          // Double-check network before each upload
          const currentNetState = await NetInfo.fetch()
          if (
            !currentNetState.isConnected ||
            currentNetState.isInternetReachable === false
          ) {
            console.log('Network lost during upload, stopping')
            break
          }

          // Complete upload sequence for this item
          // eslint-disable-next-line no-await-in-loop
          const uploadedPhoto = await reducer.processCompleteUpload({
            item: originalItem,
            uuid,
            topOffset,
          })

          if (uploadedPhoto) {
            // Successfully uploaded - remove from queue and update UI
            // eslint-disable-next-line no-await-in-loop
            await reducer.removeFromQueue(originalItem)

            // Add to photos list
            setPhotosList(
              (currentList) =>
                [uploadedPhoto, ...currentList].filter(
                  (obj, pos, arr) =>
                    arr.map((mapObj) => mapObj.id).indexOf(obj.id) === pos,
                ), // fancy way to remove duplicate photos
            )

            // Update pending photos count
            // eslint-disable-next-line no-await-in-loop
            setPendingPhotos(await reducer.getQueue())
          }
        } catch (err123) {
          // eslint-disable-next-line no-console
          console.error('Upload error for item:', err123)

          // Handle network/timeout errors
          const errorMsg = `${err123}`.toLowerCase()
          if (errorMsg.includes('network') || errorMsg.includes('timeout')) {
            Toast.show({
              text1: 'Network Issue',
              text2: 'Upload will resume when connection is stable',
              type: 'info',
              topOffset,
            })
            break // Stop processing more items if network issues
          }

          Toast.show({
            text1: 'Error Uploading',
            text2: `${err123}`,
            type: 'error',
            topOffset,
          })

          // If banned, remove the item from queue
          if (`${err123}`.includes('banned')) {
            // eslint-disable-next-line no-await-in-loop
            await reducer.removeFromQueue(originalItem)
            // eslint-disable-next-line no-await-in-loop
            setPendingPhotos(await reducer.getQueue())
          }
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

    // Use 750ms delay for retry to balance responsiveness and system load
    // eslint-disable-next-line no-promise-executor-return
    await new Promise((resolve) => setTimeout(resolve, 750))

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

    // Show footer when photosList is reloaded/reset
    if (footerAnimation._value !== 1) {
      Animated.timing(footerAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start()
    }

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

      // Collapse any expanded photo when switching segments
      if (expandedPhotoId) {
        setExpandedPhotoId(null)
      }

      // Note: We no longer clear search term when switching segments
      // This allows the search term to persist in the atom
    }

    // Always reload content when any segment is clicked (including current one)
    // Pass the new segment index directly to ensure immediate use
    // For search segment, pass existing search term if available
    const searchTermToUse = index === 2 ? searchTerm : null
    reload(index, searchTermToUse)
  }

  // Custom header renderer for Expo Router compatibility
  const renderCustomHeader = () => {
    const segmentTitles = ['Global', 'Starred', 'Search']

    // Calculate dynamic header height: compact when scrolled, appropriately sized at top
    const animatedHeaderHeight = headerHeightAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [50, 70], // Compact: 50px, Full: 70px (reduced from 90px)
    })

    // Calculate dynamic segment button padding: smaller when scrolled, just enough for icon+text at top
    const animatedButtonPaddingVertical = headerHeightAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [8, 8], // Keep vertical padding consistent - text goes below icon
    })

    const animatedButtonPaddingHorizontal = headerHeightAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 20], // Keep horizontal padding consistent for width
    })

    const animatedButtonWidth = headerHeightAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [90, 90], // Further increased width to prevent text wrapping - exactly the same for both states
    })

    const animatedControlPadding = headerHeightAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [4, 4], // Keep control padding consistent
    })

    return (
      <SafeAreaView
        style={{
          backgroundColor: theme.HEADER_BACKGROUND,
          borderBottomWidth: 1,
          borderBottomColor: theme.HEADER_BORDER,
          shadowColor: theme.HEADER_SHADOW,
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
        <Animated.View
          style={{
            height: animatedHeaderHeight,
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
            <Animated.View
              style={[
                styles.customSegmentedControl,
                {
                  padding: animatedControlPadding,
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.segmentButton,
                  activeSegment === 0 && styles.activeSegmentButton,
                  {
                    paddingVertical: animatedButtonPaddingVertical,
                    paddingHorizontal: animatedButtonPaddingHorizontal,
                    width: animatedButtonWidth,
                  },
                ]}
              >
                <TouchableOpacity
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                  }}
                  onPress={() => updateIndex(0)}
                >
                  <FontAwesome
                    name="globe"
                    size={20}
                    color={
                      activeSegment === 0
                        ? theme.TEXT_PRIMARY
                        : theme.TEXT_SECONDARY
                    }
                  />
                  {textVisible && (
                    <Animated.Text
                      style={[
                        styles.segmentText,
                        {
                          color:
                            activeSegment === 0
                              ? theme.TEXT_PRIMARY
                              : theme.TEXT_SECONDARY,
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
              </Animated.View>

              <Animated.View
                style={[
                  styles.segmentButton,
                  activeSegment === 1 && styles.activeSegmentButton,
                  {
                    paddingVertical: animatedButtonPaddingVertical,
                    paddingHorizontal: animatedButtonPaddingHorizontal,
                    width: animatedButtonWidth,
                  },
                ]}
              >
                <TouchableOpacity
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                  }}
                  onPress={() => updateIndex(1)}
                >
                  <AntDesign
                    name="star"
                    size={20}
                    color={
                      activeSegment === 1
                        ? theme.TEXT_PRIMARY
                        : theme.TEXT_SECONDARY
                    }
                  />
                  {textVisible && (
                    <Animated.Text
                      style={[
                        styles.segmentText,
                        {
                          color:
                            activeSegment === 1
                              ? theme.TEXT_PRIMARY
                              : theme.TEXT_SECONDARY,
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
              </Animated.View>

              <Animated.View
                style={[
                  styles.segmentButton,
                  activeSegment === 2 && styles.activeSegmentButton,
                  {
                    paddingVertical: animatedButtonPaddingVertical,
                    paddingHorizontal: animatedButtonPaddingHorizontal,
                    width: animatedButtonWidth,
                  },
                ]}
              >
                <TouchableOpacity
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                  }}
                  onPress={() => updateIndex(2)}
                >
                  <FontAwesome
                    name="search"
                    size={20}
                    color={
                      activeSegment === 2
                        ? theme.TEXT_PRIMARY
                        : theme.TEXT_SECONDARY
                    }
                  />
                  {textVisible && (
                    <Animated.Text
                      style={[
                        styles.segmentText,
                        {
                          color:
                            activeSegment === 2
                              ? theme.TEXT_PRIMARY
                              : theme.TEXT_SECONDARY,
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
              </Animated.View>
            </Animated.View>
          </View>
        </Animated.View>
        {loading && (
          <View
            style={{
              height: 3,
              backgroundColor: theme.HEADER_BACKGROUND,
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

    // add network availability listener with improved reliability
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      if (state) {
        // Check both isConnected and isInternetReachable for better reliability
        const isNetworkAvailable =
          state.isConnected && state.isInternetReachable !== false

        setNetAvailable(isNetworkAvailable)

        // Log network state for debugging
        console.log('Network state:', {
          isConnected: state.isConnected,
          isInternetReachable: state.isInternetReachable,
          type: state.type,
          computed: isNetworkAvailable,
        })
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
            spacing: 8,
            maxItemsPerRow: 2,
            baseHeight: 200,
            aspectRatioFallbacks: [1.0], // Square thumbnails for better comment display
          }
        case 2: // Search - same layout as starred to accommodate comments
          return {
            spacing: 8,
            maxItemsPerRow: 2,
            baseHeight: 200,
            aspectRatioFallbacks: [1.0], // Square thumbnails for better comment display
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

    // Handle scroll events to show/hide footer
    const handleScroll = (event) => {
      const currentScrollY = event.nativeEvent.contentOffset.y
      const contentHeight = event.nativeEvent.contentSize.height
      const scrollViewHeight = event.nativeEvent.layoutMeasurement.height
      const threshold = 5 // Reduced threshold for more responsive hiding

      // Calculate if we're near the bottom (within 50px of the bottom)
      const isNearBottom =
        currentScrollY + scrollViewHeight >= contentHeight - 50

      // HIGHEST PRIORITY: Always show footer when at the very top (0-10px)
      if (currentScrollY <= 10) {
        if (footerAnimation._value !== 1) {
          Animated.timing(footerAnimation, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start()
        }
        lastScrollY.current = currentScrollY
        return
      }

      // SECOND PRIORITY: Always hide footer when at the bottom
      if (isNearBottom) {
        if (footerAnimation._value !== 0) {
          Animated.timing(footerAnimation, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start()
        }
        lastScrollY.current = currentScrollY
        return
      }

      // Skip if scroll distance is too small
      if (Math.abs(currentScrollY - lastScrollY.current) < threshold) {
        return
      }

      const scrollingDown = currentScrollY > lastScrollY.current
      const currentDirection = scrollingDown ? 'down' : 'up'

      // Always hide immediately when scrolling down (no position restrictions)
      if (scrollingDown) {
        if (footerAnimation._value !== 0) {
          Animated.timing(footerAnimation, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start()
        }
      } else {
        // Show footer when scrolling up (unless at bottom)
        if (footerAnimation._value !== 1) {
          Animated.timing(footerAnimation, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start()
        }
      }

      scrollDirection.current = currentDirection
      lastScrollY.current = currentScrollY
    }

    return (
      <ExpoMasonryLayout
        ref={masonryRef}
        data={photosList}
        renderItem={renderMasonryItem}
        spacing={config.spacing}
        maxItemsPerRow={config.maxItemsPerRow}
        baseHeight={config.baseHeight}
        aspectRatioFallbacks={config.aspectRatioFallbacks}
        keyExtractor={(item) =>
          `${item.id}-${item.isExpanded ? 'expanded' : 'collapsed'}`
        }
        // Force recalculation when items have override dimensions
        getItemDimensions={(item, calculatedDimensions) => {
          if (item.overrideWidth && item.overrideHeight) {
            return {
              width: item.overrideWidth,
              height: item.overrideHeight,
            }
          }
          return calculatedDimensions
        }}
        onScroll={handleScroll}
        onEndReached={() => {
          // Load more when user reaches the end
          if (!loading && !stopLoading) {
            setPageNumber((currentPage) => {
              const newPage = currentPage + 1
              return newPage
            })
          }
        }}
        onEndReachedThreshold={0.2}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 5, // More sensitive - triggers when only 5% visible
          minimumViewTime: 50, // Shorter time to register changes
        }}
        refreshing={false}
        onRefresh={() => {
          reload()
        }}
        scrollEventThrottle={16}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={15}
        updateCellsBatchingPeriod={50}
        style={{
          ...styles.container,
          flex: 1, // Allow the scroll area to take full available height
        }}
        contentContainerStyle={{
          paddingBottom: FOOTER_HEIGHT + 20, // Add padding to ensure content is visible above footer
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
        <Animated.View
          style={{
            backgroundColor: theme.CARD_BACKGROUND,
            width,
            height: FOOTER_HEIGHT,
            ...styles.footerContainer,
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 14,
            zIndex: 14,
            transform: [
              {
                translateY: footerAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [FOOTER_HEIGHT, 0], // Slide down completely to hide footer entirely
                }),
              },
            ],
          }}
        >
          <SafeAreaView
            style={{
              flex: 1,
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
                  backgroundColor: theme.INTERACTIVE_BACKGROUND,
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
                  color={netAvailable ? CONST.MAIN_COLOR : theme.TEXT_DISABLED}
                />
              </TouchableOpacity>

              {/* Video Recording Button */}
              <TouchableOpacity
                style={styles.videoRecordButton}
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
                  borderColor: theme.BACKGROUND,
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
                  backgroundColor: theme.INTERACTIVE_BACKGROUND,
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
                  color={netAvailable ? CONST.MAIN_COLOR : theme.TEXT_DISABLED}
                />
                {unreadCount > 0 && (
                  <Badge
                    value={unreadCount}
                    badgeStyle={styles.badgeStyle}
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
          </SafeAreaView>
        </Animated.View>
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
        backgroundColor: theme.HEADER_BACKGROUND,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.BORDER_LIGHT,
        shadowColor: theme.HEADER_SHADOW,
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
          backgroundColor: theme.CARD_BACKGROUND,
          borderRadius: 20,
          paddingHorizontal: 16,
          marginRight: 12,
          borderWidth: 1,
          borderColor: theme.CARD_BORDER,
          shadowColor: theme.CARD_SHADOW,
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <Ionicons
          name="search"
          size={20}
          color={theme.TEXT_SECONDARY}
          style={{ marginRight: 8 }}
        />
        <TextInput
          ref={searchBarRef}
          placeholder="Search photos..."
          placeholderTextColor={theme.TEXT_SECONDARY}
          onChangeText={(currentTerm) => {
            setSearchTerm(currentTerm)
          }}
          value={searchTerm}
          onSubmitEditing={() => submitSearch()}
          autoFocus={autoFocus}
          returnKeyType="search"
          style={{
            flex: 1,
            color: theme.TEXT_PRIMARY,
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
              backgroundColor: theme.INTERACTIVE_SECONDARY,
              borderRadius: 10,
              elevation: 6,
              zIndex: 6,
            }}
          >
            <Ionicons name="close" size={12} color={theme.TEXT_PRIMARY} />
          </TouchableOpacity>
        ) : null}
      </View>

      <TouchableOpacity
        onPress={() => submitSearch()}
        style={{
          backgroundColor: theme.INTERACTIVE_PRIMARY,
          borderRadius: 20,
          width: 44,
          height: 44,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: theme.INTERACTIVE_PRIMARY,
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
        <TouchableOpacity
          activeOpacity={0.8}
          onLongPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            Alert.alert(
              'Clear Upload Queue',
              `Are you sure you want to cancel all ${pendingPhotos.length} pending upload${pendingPhotos.length === 1 ? '' : 's'}? This cannot be undone.`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Clear All',
                  style: 'destructive',
                  onPress: async () => {
                    await reducer.clearQueue()
                    setPendingPhotos(await reducer.getQueue())
                    Toast.show({
                      text1: 'Upload queue cleared',
                      text2: 'All pending uploads have been cancelled',
                      type: 'success',
                      topOffset,
                    })
                  },
                },
              ],
            )
          }}
        >
          <Animated.View
            style={{
              backgroundColor: theme.CARD_BACKGROUND,
              borderRadius: 12,
              padding: 16,
              marginHorizontal: 16,
              marginVertical: 8,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.CARD_BORDER,
              shadowColor: theme.CARD_SHADOW,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
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
                color={
                  netAvailable ? theme.INTERACTIVE_PRIMARY : theme.TEXT_DISABLED
                }
                style={{ marginRight: 12 }}
              />
            </Animated.View>
            <View style={{ flex: 1 }}>
              <Animated.Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: theme.TEXT_PRIMARY,
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
                  color={theme.INTERACTIVE_PRIMARY}
                  style={{
                    flex: 1,
                    height: 4,
                    borderBottomLeftRadius: 12,
                    borderBottomRightRadius: 12,
                  }}
                  trackStyle={{
                    backgroundColor: theme.BORDER_LIGHT,
                    borderBottomLeftRadius: 12,
                    borderBottomRightRadius: 12,
                  }}
                />
              </Animated.View>
            )}
          </Animated.View>
        </TouchableOpacity>
      )
    }
    return null
  }

  /// //////////////////////////////////////////////////////////////////////////
  // here where the rendering starts
  /// //////////////////////////////////////////////////////////////////////////

  if (!netAvailable) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.HEADER_BACKGROUND }}>
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
      <View style={{ flex: 1, backgroundColor: theme.HEADER_BACKGROUND }}>
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
            <Card
              containerStyle={{
                padding: 0,
                backgroundColor: theme.CARD_BACKGROUND,
              }}
            >
              <ListItem
                style={{
                  borderRadius: 10,
                  backgroundColor: theme.CARD_BACKGROUND,
                }}
              >
                <Text
                  style={{
                    color: theme.TEXT_PRIMARY,
                    fontSize: 16,
                    lineHeight: 22,
                  }}
                >
                  When you take a photo with WiSaw app, it will be added to a
                  Photo Album on your phone, as well as posted to global feed in
                  the cloud.
                </Text>
              </ListItem>
              <Divider style={{ backgroundColor: theme.BORDER_LIGHT }} />
              <ListItem style={{ backgroundColor: theme.CARD_BACKGROUND }}>
                <Text
                  style={{
                    color: theme.TEXT_PRIMARY,
                    fontSize: 16,
                    lineHeight: 22,
                  }}
                >
                  Everyone close-by can see your photos.
                </Text>
              </ListItem>
              <Divider style={{ backgroundColor: theme.BORDER_LIGHT }} />
              <ListItem style={{ backgroundColor: theme.CARD_BACKGROUND }}>
                <Text
                  style={{
                    color: theme.TEXT_PRIMARY,
                    fontSize: 16,
                    lineHeight: 22,
                  }}
                >
                  You can see other&#39;s photos too.
                </Text>
              </ListItem>
              <Divider style={{ backgroundColor: theme.BORDER_LIGHT }} />
              <ListItem style={{ backgroundColor: theme.CARD_BACKGROUND }}>
                <Text
                  style={{
                    color: theme.TEXT_PRIMARY,
                    fontSize: 16,
                    lineHeight: 22,
                  }}
                >
                  If you find any photo abusive or inappropriate, you can delete
                  it -- it will be deleted from the cloud so that no one will
                  ever see it again.
                </Text>
              </ListItem>
              <Divider style={{ backgroundColor: theme.BORDER_LIGHT }} />
              <ListItem style={{ backgroundColor: theme.CARD_BACKGROUND }}>
                <Text
                  style={{
                    color: theme.TEXT_PRIMARY,
                    fontSize: 16,
                    lineHeight: 22,
                  }}
                >
                  No one will tolerate objectionable content or abusive users.
                </Text>
              </ListItem>
              <Divider style={{ backgroundColor: theme.BORDER_LIGHT }} />
              <ListItem style={{ backgroundColor: theme.CARD_BACKGROUND }}>
                <Text
                  style={{
                    color: theme.TEXT_PRIMARY,
                    fontSize: 16,
                    lineHeight: 22,
                  }}
                >
                  The abusive users will be banned from WiSaw by other users.
                </Text>
              </ListItem>
              <Divider style={{ backgroundColor: theme.BORDER_LIGHT }} />
              <ListItem style={{ backgroundColor: theme.CARD_BACKGROUND }}>
                <Text
                  style={{
                    color: theme.TEXT_PRIMARY,
                    fontSize: 16,
                    lineHeight: 22,
                    fontWeight: '600',
                  }}
                >
                  By using WiSaw I agree to Terms and Conditions.
                </Text>
              </ListItem>
              <Divider style={{ backgroundColor: theme.BORDER_LIGHT }} />

              <ListItem
                style={{
                  alignItems: 'center',
                  backgroundColor: theme.CARD_BACKGROUND,
                  paddingVertical: 20,
                }}
              >
                <Button
                  title="I Agree"
                  type="outline"
                  buttonStyle={{
                    borderColor: theme.INTERACTIVE_PRIMARY,
                    borderWidth: 2,
                    paddingHorizontal: 30,
                    paddingVertical: 12,
                    borderRadius: 8,
                  }}
                  titleStyle={{
                    color: theme.INTERACTIVE_PRIMARY,
                    fontSize: 18,
                    fontWeight: '600',
                  }}
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
      <View style={{ flex: 1, backgroundColor: theme.HEADER_BACKGROUND }}>
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
      <View style={{ flex: 1, backgroundColor: theme.HEADER_BACKGROUND }}>
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
    <View style={{ flex: 1, backgroundColor: theme.HEADER_BACKGROUND }}>
      {renderCustomHeader()}
      {renderPendingPhotos()}
      <View style={styles.container}>
        {activeSegment === 2 && renderSearchBar(false)}
        {activeSegment === 2 && (
          <EmptyStateCard
            icon="search"
            title="Ready to Search"
            subtitle="Enter a search term above to find photos from your area and beyond."
            actionText="Start Exploring"
            onActionPress={() => {
              if (searchBarRef.current) {
                searchBarRef.current.focus()
              }
            }}
          />
        )}
        {activeSegment === 1 && (
          <EmptyStateCard
            icon="star"
            title="No Starred Content Yet"
            subtitle="Start building your collection! Take photos, comment on others' posts, or star content you love."
            actionText="Discover Content"
            onActionPress={() => updateIndex(0)}
          />
        )}
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
