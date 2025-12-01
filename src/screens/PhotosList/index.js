import PropTypes from 'prop-types'
import * as Crypto from 'expo-crypto'

import { useAtom } from 'jotai'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useFocusEffect, useIsFocused } from '@react-navigation/native'
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
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import * as Constants from 'expo-constants'

import { AntDesign, FontAwesome } from '@expo/vector-icons'

import NetInfo from '@react-native-community/netinfo'

import { emitPhotoSearch, subscribeToPhotoSearch } from '../../events/photoSearchBus'
import { useSafeAreaViewStyle } from '../../hooks/useStatusBarHeight'
import useToastTopOffset from '../../hooks/useToastTopOffset'

import * as friendsHelper from '../FriendsList/friends_helper'

import * as reducer from './reducer'
import usePhotoUploader from './upload/usePhotoUploader'

import * as CONST from '../../consts'
import * as STATE from '../../state'
import { getTheme } from '../../theme/sharedStyles'
import {
  calculatePhotoDimensions,
  createFrozenPhoto,
  validateFrozenPhotosList
} from '../../utils/photoListHelpers'
import { saveActiveWave } from '../../utils/waveStorage'

import LinearProgress from '../../components/ui/LinearProgress'
import PhotosListFooter from './components/PhotosListFooter'
import PhotosListSearchBar from './components/PhotosListSearchBar'
import PendingPhotosBanner from './components/PendingPhotosBanner'
import PhotosListEmptyState from './components/PhotosListEmptyState'
import PhotosListMasonry from './components/PhotosListMasonry'
import EmptyStateCard from '../../components/EmptyStateCard'

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
  try {
    // Only register when BackgroundTask is available (not Expo Go / simulator on iOS)
    const status = await BackgroundTask.getStatusAsync()

    // In Expo Go, appOwnership === 'expo'. Background tasks require a dev/prod build on iOS.
    const isExpoGo = Constants?.appOwnership === 'expo'

    if (
      Platform.OS === 'ios' &&
      (isExpoGo || status !== BackgroundTask.BackgroundTaskStatus.Available)
    ) {
      // Skip registration on iOS when running in Expo Go or when unavailable (e.g., simulator)
      return
    }

    // Avoid duplicate registration
    const alreadyRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME)
    if (alreadyRegistered) return

    await BackgroundTask.registerTaskAsync(BACKGROUND_TASK_NAME, {
      minimumInterval: 15 // 15 minutes (minimum allowed)
    })
  } catch (e) {
    // eslint-disable-next-line
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('Skipping background task registration:', e?.message || e)
    }
  }
}

// 3. (Optional) Unregister tasks by specifying the task name
// This will cancel any future background task calls that match the given name
// Note: This does NOT need to be in the global scope and CAN be used in your React components!
// async function unregisterBackgroundTaskAsync() {
//   return BackgroundTask.unregisterTaskAsync(BACKGROUND_TASK_NAME)
// }

const FOOTER_HEIGHT = 90

let currentBatch = Crypto.randomUUID()

// IMPORTANT: PhotosList items are frozen to prevent unauthorized mutation of width/height properties
// by third-party libraries (like masonry layout). When creating new items (expansion, dimension updates),
// we must always return Object.freeze() wrapped objects to maintain immutability.

const PhotosList = ({ searchFromUrl }) => {
  // console.log({ activeSegment, currentBatch })

  const [uuid, setUuid] = useAtom(STATE.uuid)
  const [activeWave, setActiveWave] = useAtom(STATE.activeWave)
  // const [nickName, setNickName] = useAtom(STATE.nickName)
  const [photosList, setPhotosList] = useAtom(STATE.photosList)
  const [, setFriendsList] = useAtom(STATE.friendsList)
  const [isDarkMode] = useAtom(STATE.isDarkMode)

  const [searchTerm, setSearchTerm] = useState('')
  const [pendingTriggerSearch, setPendingTriggerSearch] = useState(null)

  const toastTopOffset = useToastTopOffset()

  // State to prevent double-clicking camera buttons
  const [isCameraOpening, setIsCameraOpening] = useState(false)

  // State to track the ID of the photo that was just collapsed to trigger scroll
  const [justCollapsedId, setJustCollapsedId] = useState(null)

  const handleIncomingSearch = useCallback(
    (term) => {
      if (typeof term !== 'string') {
        return
      }

      const trimmed = term.trim()
      if (!trimmed.length) {
        return
      }

      setPendingTriggerSearch(trimmed)
    },
    [setPendingTriggerSearch]
  )

  useEffect(() => {
    const unsubscribe = subscribeToPhotoSearch(handleIncomingSearch)
    return unsubscribe
  }, [handleIncomingSearch])

  const triggerSearch = useCallback((term) => {
    emitPhotoSearch(term)
  }, [])

  // Development-only: Add guards to detect unauthorized mutations to photo dimensions
  // eslint-disable-next-line
  if (__DEV__) {
    validateFrozenPhotosList(photosList, 'in PhotosList render')
  }

  const theme = getTheme(isDarkMode)

  // Get safe area view style for proper status bar handling on Android
  const safeAreaViewStyle = useSafeAreaViewStyle()

  // Dynamic styles based on current theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.INTERACTIVE_BACKGROUND // Much darker background for high contrast with ExpandableThumb
    },
    thumbContainer: {
      // height: thumbDimension,
      // paddingBottom: 10,
      // marginBottom: 10,
    },
    // Modern header styles
    headerContainer: {
      alignItems: 'center',
      justifyContent: 'center'
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
        height: 1
      },
      shadowOpacity: 1,
      shadowRadius: 2,
      elevation: 2,
      padding: 4
    },
    segmentButton: {
      borderRadius: 16,
      marginHorizontal: 2,
      alignItems: 'center',
      justifyContent: 'center'
      // Removed fixed padding and minWidth - now handled by animations
    },
    activeSegmentButton: {
      backgroundColor: theme.INTERACTIVE_ACTIVE
    },
    segmentText: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 4
    },
    activeSegmentText: {
      color: theme.TEXT_PRIMARY
    },
    inactiveSegmentText: {
      color: theme.TEXT_SECONDARY
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
        height: 1
      },
      shadowOpacity: 1,
      shadowRadius: 2,
      elevation: 2
    },
    buttonContainer: {
      borderRadius: 18,
      margin: 2
    },
    buttonStyle: {
      backgroundColor: 'transparent',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 16
    },
    selectedButtonStyle: {
      backgroundColor: theme.INTERACTIVE_ACTIVE,
      borderRadius: 16
    },
    footerContainer: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: 0,
      borderTopWidth: 1,
      borderTopColor: theme.BORDER_LIGHT,
      shadowColor: theme.HEADER_SHADOW
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
        height: 4
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 15,
      zIndex: 15
    },
    badgeStyle: {
      backgroundColor: theme.STATUS_ERROR,
      borderWidth: 2,
      borderColor: theme.BACKGROUND,
      minWidth: 20,
      height: 20,
      borderRadius: 10
    },
    cameraButton: {
      shadowColor: theme.HEADER_SHADOW
    }
  })

  const navigation = useNavigation()
  const isFocused = useIsFocused()
  const hasOpenedTandcRef = useRef(false)

  const { width, height } = useWindowDimensions()
  const insets = useSafeAreaInsets()

  const [stopLoading, setStopLoading] = useState(false)

  const [isTandcAccepted, setIsTandcAccepted] = useState(true)
  const [zeroMoment, setZeroMoment] = useState(0)

  const [netAvailable, setNetAvailable] = useState(true)
  const [location, setLocation] = useState({
    coords: { latitude: 0, longitude: 0 }
  })

  // const [isLastPage, setIsLastPage] = useState(false)

  const [pageNumber, setPageNumber] = useState(0)
  const [, setConsecutiveEmptyResponses] = useState(0)

  const [activeSegment, setActiveSegment] = useState(0)

  const [loading, setLoading] = useState(false)

  const [unreadCountList, setUnreadCountList] = useState([])

  const [unreadCount, setUnreadCount] = useState(0)

  const handleUploadSuccess = useCallback(
    (uploadedPhoto) => {
      setPhotosList((currentList) => {
        const updatedList = [createFrozenPhoto(uploadedPhoto), ...currentList]
        const seen = new Set()
        return updatedList.filter((photo) => {
          if (seen.has(photo.id)) {
            return false
          }
          seen.add(photo.id)
          return true
        })
      })
    },
    [setPhotosList]
  )

  const {
    pendingPhotos,
    isUploading,
    enqueueCapture,
    clearPendingQueue,
    refreshPendingQueue,
    processQueue: processPendingQueue
  } = usePhotoUploader({
    uuid,
    setUuid,
    topOffset: toastTopOffset,
    netAvailable,
    onPhotoUploaded: handleUploadSuccess
  })

  // State for inline photo expansion - now supports multiple expanded photos
  const [expandedPhotoIds, setExpandedPhotoIds] = useState(new Set())
  const [isPhotoExpanding, setIsPhotoExpanding] = useState(false)
  const [scrollToIndex, setScrollToIndex] = useState(null)
  const [measuredHeights, setMeasuredHeights] = useState(new Map())

  // Real-time height tracking using refs (no state storage)
  const photoHeightRefs = useRef(new Map())
  // Anchor scrolling: track the last expanded photo id and prevent competing scrolls
  const lastExpandedIdRef = useRef(null)
  const scrollingInProgressRef = useRef(false)

  // Callback to update height refs when Photo components measure themselves
  const updatePhotoHeight = useCallback((photoId, height) => {
    photoHeightRefs.current.set(photoId, height)
    // Force a re-render by updating the measured heights state
    setMeasuredHeights((current) => {
      const updated = new Map(current)
      updated.set(photoId, height)
      return updated
    })
  }, [])

  // Keep only a simple scroll position ref to support ensureItemVisible without driving UI state
  const headerScrollYRef = React.useRef(0)
  const searchBarRef = React.useRef(null)

  // Animation states for pending photos
  const pendingPhotosAnimation = React.useRef(new Animated.Value(0)).current // 0 = hidden, 1 = visible
  const uploadIconAnimation = React.useRef(new Animated.Value(1)).current // For pulsing upload icon
  const [previousPendingCount, setPreviousPendingCount] = useState(0)

  // Track scroll position for inline ensureItemVisible calculations
  const lastScrollY = React.useRef(0)

  const [keyboardVisible, dismissKeyboard] = useKeyboard()
  const [keyboardOffset, setKeyboardOffset] = useState(0)

  const masonryRef = React.useRef(null)

  // Reset anchor/scroll-related state to avoid stale offsets when switching segments
  const resetAnchorState = React.useCallback(({ skipScrollToTop = false } = {}) => {
    try {
      // Clear anchor targets and scrolling flags
      lastExpandedIdRef.current = null
      scrollingInProgressRef.current = false

      // Reset scroll refs used in calculations
      lastScrollY.current = 0
      headerScrollYRef.current = 0

      // Clear any measured height caches so layout recalculates cleanly
      setMeasuredHeights(new Map())
      photoHeightRefs.current = new Map()

      // Collapse any expanded photos
      setExpandedPhotoIds(new Set())

      // Clear pending scroll target
      if (scrollToIndex !== null) setScrollToIndex(null)

      // Scroll list to top synchronously to normalize offsets
      if (!skipScrollToTop && masonryRef.current) {
        if (typeof masonryRef.current.scrollToOffset === 'function') {
          masonryRef.current.scrollToOffset({ offset: 0, animated: false })
        } else if (typeof masonryRef.current.scrollTo === 'function') {
          masonryRef.current.scrollTo({ y: 0, animated: false })
        }
      }
    } catch (e) {
      // best-effort reset
    }
  }, [scrollToIndex])

  const performScroll = (targetOffset) => {
    const masonry = masonryRef.current
    if (!masonry) return

    if (typeof masonry.scrollToOffset === 'function') {
      masonry.scrollToOffset({
        offset: targetOffset,
        animated: true
      })
    } else if (typeof masonry.scrollTo === 'function') {
      masonry.scrollTo({ y: targetOffset, animated: true })
    } else if (typeof masonry.getScrollResponder === 'function') {
      const scrollResponder = masonry.getScrollResponder()
      if (scrollResponder && typeof scrollResponder.scrollTo === 'function') {
        scrollResponder.scrollTo({ y: targetOffset, animated: true })
      }
    }
  }

  // Ensure the expanded photo is fully visible within the viewport
  const ensureItemVisible = React.useCallback(
    ({ id, y, height: itemHeight, alignTop = false, topPadding = 0 }) => {
      try {
        // Only auto-scroll when this callback is for the last expanded photo and no scroll is in progress
        if (lastExpandedIdRef.current !== id || scrollingInProgressRef.current) {
          return
        }

        // Prefer a simple anchor scroll for the last expanded item: align its top under the header
        const headerReserve = 60 + insets.top
        const snapPadding = topPadding || 8

        if (masonryRef.current) {
          scrollingInProgressRef.current = true

          // y is window-relative; convert to absolute content offset by adding current scrollY
          const targetOffset = Math.max(
            0,
            (lastScrollY.current || 0) + y - headerReserve - snapPadding
          )
          // Try FlatList-like API first
          performScroll(targetOffset)

          // Clear anchor target and scrolling flag after a delay to allow scroll to complete
          setTimeout(() => {
            lastExpandedIdRef.current = null
            scrollingInProgressRef.current = false
          }, 500)
        }
      } catch (e) {
        // best-effort; ignore errors
        scrollingInProgressRef.current = false
      }
    },
    [height]
  )

  // Remove viewability-driven header/footer toggling to reduce jank

  useEffect(() => {
    setUnreadCount(unreadCountList.reduce((a, b) => a + (b.unread || 0), 0))
  }, [unreadCountList])

  // No header/footer state changes based on photosList size

  // Animation effect for pending photos
  useEffect(() => {
    if (pendingPhotos.length > 0 && previousPendingCount === 0) {
      // Animate in when photos are added
      Animated.spring(pendingPhotosAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 8
      }).start()
    } else if (pendingPhotos.length === 0 && previousPendingCount > 0) {
      // Animate out when all photos are uploaded
      Animated.timing(pendingPhotosAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start()
    }

    // Start pulsing animation for upload icon when uploading
    if (pendingPhotos.length > 0 && netAvailable) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(uploadIconAnimation, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: true
          }),
          Animated.timing(uploadIconAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true
          })
        ])
      )
      pulseAnimation.start()

      return () => {
        pulseAnimation.stop()
        uploadIconAnimation.setValue(1)
      }
    }
    uploadIconAnimation.setValue(1)

    setPreviousPendingCount(pendingPhotos.length)
  }, [pendingPhotos.length, netAvailable, previousPendingCount])

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const handleKeyboardShow = (event) => {
      const height = event?.endCoordinates?.height ?? 0
      setKeyboardOffset(height)
    }

    const handleKeyboardHide = () => {
      setKeyboardOffset(0)
    }

    const showListener = Keyboard.addListener(showEvent, handleKeyboardShow)
    const hideListener = Keyboard.addListener(hideEvent, handleKeyboardHide)

    return () => {
      showListener.remove()
      hideListener.remove()
    }
  }, [])

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

  // Configuration for different segments - responsive to device size
  const segmentConfig = React.useMemo(() => {
    // Determine columns based on screen width for better responsiveness
    const getResponsiveColumns = (baseColumns, largeColumns) => {
      // iPhone Pro Max, iPad Mini and up: increase columns (increased by 35% total: 20% + 10% + 5%)
      if (width >= 768) return Math.max(3, largeColumns * 1.3) // iPad and larger: large columns + 35%
      if (width >= 428) return Math.max(3, largeColumns / 1.3) // iPhone Pro Max: half of large + 35%
      if (width >= 390) return Math.max(3, baseColumns / 1.3) // iPhone 14 Pro: 0.75x + 35%
      return Math.max(3, baseColumns / 6) // Standard phones: ensure minimum 2 columns
    }

    switch (activeSegment) {
      case 0: // Near You - compact masonry layout
        return {
          spacing: 5,
          maxItemsPerRow: getResponsiveColumns(4, 6),
          baseHeight: 100,
          aspectRatioFallbacks: [
            0.56, // 9:16 (portrait)
            0.67, // 2:3 (portrait)
            0.75, // 3:4 (portrait)
            1.0, // 1:1 (square)
            1.33, // 4:3 (landscape)
            1.5, // 3:2 (landscape)
            1.78 // 16:9 (landscape)
          ]
        }
      case 1: // Watched - larger items with comments
        return {
          spacing: 8,
          maxItemsPerRow: getResponsiveColumns(2, 4),
          baseHeight: 200,
          aspectRatioFallbacks: [1.0] // Square thumbnails for better comment display
        }
      case 2: // Search - same layout as starred to accommodate comments
        return {
          spacing: 8,
          maxItemsPerRow: getResponsiveColumns(2, 4),
          baseHeight: 200,
          aspectRatioFallbacks: [1.0] // Square thumbnails for better comment display
        }
      default:
        return {
          spacing: 5,
          maxItemsPerRow: getResponsiveColumns(4, 6),
          baseHeight: 100,
          aspectRatioFallbacks: [
            0.56, // 9:16 (portrait)
            0.67, // 2:3 (portrait)
            0.75, // 3:4 (portrait)
            1.0, // 1:1 (square)
            1.33, // 4:3 (landscape)
            1.5, // 3:2 (landscape)
            1.78 // 16:9 (landscape)
          ]
        }
    }
  }, [activeSegment, width])

  // Helper function to check if a photo is expanded
  const isPhotoExpanded = React.useCallback(
    (photoId) => expandedPhotoIds.has(photoId),
    [expandedPhotoIds]
  )

  // Helper function to get calculated dimensions for a photo
  const getCalculatedDimensions = React.useCallback(
    (photo) => {
      // Removed debug logging to reduce console noise

      const screenWidth = width - 20 // Account for padding
      const isExpanded = isPhotoExpanded(photo.id)

      // For expanded photos, try to use real-time measured height
      if (isExpanded) {
        const currentHeight = measuredHeights.get(photo.id) || photoHeightRefs.current.get(photo.id)
        if (currentHeight) {
          const result = {
            width: screenWidth,
            height: currentHeight
          }

          // Removed debug logging to reduce console noise

          return result
        }
      }

      // Fallback to purely dynamic calculation (for collapsed or unmeasured expanded)
      const result = calculatePhotoDimensions(
        photo,
        isExpanded,
        screenWidth,
        segmentConfig.maxItemsPerRow,
        segmentConfig.spacing
      )

      return result
    },
    [isPhotoExpanded, width, segmentConfig, measuredHeights]
  )

  // Function to handle photo expansion toggle - now supports multiple expanded photos
  const handlePhotoToggle = React.useCallback(
    (photoId) => {
      if (isPhotoExpanding) return // Prevent multiple rapid toggles

      setIsPhotoExpanding(true)

      // Check if we are collapsing or expanding based on current state
      const isExpanded = expandedPhotoIds.has(photoId)

      if (isExpanded) {
        // Collapsing
        setJustCollapsedId(photoId)
        lastExpandedIdRef.current = photoId

        setMeasuredHeights((current) => {
          const updated = new Map(current)
          updated.delete(photoId)
          return updated
        })

        setExpandedPhotoIds((prevIds) => {
          const newIds = new Set(prevIds)
          newIds.delete(photoId)
          return newIds
        })
      } else {
        // Expanding
        setJustCollapsedId(null)
        lastExpandedIdRef.current = photoId

        setExpandedPhotoIds((prevIds) => {
          const newIds = new Set(prevIds)
          newIds.add(photoId)
          return newIds
        })
      }

      // Reset expanding state after animation
      setTimeout(() => setIsPhotoExpanding(false), 500)
    },
    [isPhotoExpanding, photosList, expandedPhotoIds]
  )

  // Lightweight onScroll: keep lastScrollY for ensureItemVisible; avoid UI work during scroll
  const handleScroll = React.useCallback((event) => {
    lastScrollY.current = event?.nativeEvent?.contentOffset?.y || 0
  }, [])

  // Preloading disabled for consistency; rely on onEndReached

  const load = async (segmentOverride = null, searchTermOverride = null) => {
    setLoading(true)

    // Use current values if overrides are not provided
    const effectiveSegment = segmentOverride !== null ? segmentOverride : activeSegment

    // Only use search term for search segment (segment 2)
    let effectiveSearchTerm = ''
    if (effectiveSegment === 2) {
      effectiveSearchTerm = searchTermOverride !== null ? searchTermOverride : searchTerm
    }

    const { photos, batch } = await reducer.getPhotos({
      uuid,
      zeroMoment,
      location,
      netAvailable,
      searchTerm: effectiveSearchTerm,
      topOffset: toastTopOffset,
      activeSegment: effectiveSegment,
      batch: currentBatch, // clone
      pageNumber,
      activeWave
    })

    if (batch === currentBatch) {
      // Track consecutive empty responses
      if (!photos || photos.length === 0) {
        setConsecutiveEmptyResponses((prev) => {
          const newCount = prev + 1

          // Stop loading on first empty response if photosList is empty (initial load)
          // or after 10 consecutive empty responses (pagination exhausted)
          setPhotosList((currentList) => {
            if (currentList.length === 0 || newCount >= 10) {
              setStopLoading(true)
            }
            return currentList
          })

          return newCount
        })
      } else {
        // Reset consecutive empty count when we get data
        setConsecutiveEmptyResponses(0)

        // Add photos to list - freeze them immediately to prevent mutations
        setPhotosList((currentList) => {
          // Freeze incoming photos before any operations
          const frozenPhotos = photos.map((photo) => createFrozenPhoto(photo))
          const combinedList = [...currentList, ...frozenPhotos]
          const sortedList = combinedList.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt)
          })
          const deduplicatedList = sortedList.filter(
            (obj, pos, arr) => arr.map((mapObj) => mapObj.id).indexOf(obj.id) === pos
          )

          return deduplicatedList
        })
      }
    }

    setLoading(false)
  }

  const reload = async (segmentOverride = null, searchTermOverride = null) => {
    currentBatch = Crypto.randomUUID()

    setStopLoading(false)
    setConsecutiveEmptyResponses(0)
    setPageNumber(null)
    setPhotosList([])

    // setPageNumber(null)
    // setStopLoading(false)
    setPageNumber(0)

    await refreshPendingQueue()
    await processPendingQueue()
    if (uuid.length > 0) {
      setFriendsList(
        await friendsHelper.getEnhancedListOfFriendships({
          uuid
        })
      )

      setUnreadCountList(await friendsHelper.getUnreadCountsList({ uuid })) // the list of enhanced friends list has to be loaded earlier on
    }

    // Load new content after state is reset, using the specific segment if provided
    await load(segmentOverride, searchTermOverride)
    // load()
  }

  const updateIndex = async (index) => {
    // Provide haptic feedback for better UX
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch (error) {
      // Haptics might not be available on all devices - fail silently
    }

    const isSwitchingSegment = activeSegment !== index

    // Clear anchor-related state before reloading content to avoid stale offsets
    resetAnchorState({ skipScrollToTop: !isSwitchingSegment })

    // Only clear photos and reset if actually switching segments
    if (isSwitchingSegment) {
      setPhotosList([])
      setStopLoading(false)
      setConsecutiveEmptyResponses(0)
      setPageNumber(null)
      setActiveSegment(index)

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

    // Static dimensions to avoid extra work during scroll
    const headerHeight = 60

    return (
      <SafeAreaView
        style={[
          {
            backgroundColor: theme.HEADER_BACKGROUND,
            borderBottomWidth: 1,
            borderBottomColor: theme.HEADER_BORDER,
            shadowColor: theme.HEADER_SHADOW,
            shadowOffset: {
              width: 0,
              height: 2
            },
            shadowOpacity: 1,
            shadowRadius: 4,
            elevation: 3
          },
          safeAreaViewStyle
        ]}
      >
        <View
          style={{
            height: headerHeight,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 16
          }}
        >
          {/* Left: Empty space */}
          <View
            style={{
              position: 'absolute',
              left: 16,
              width: 40,
              height: 40
            }}
          />

          {/* Center: Three segment control */}
          <View style={styles.headerContainer}>
            <View style={[styles.customSegmentedControl, { padding: 4 }]}>
              <View
                style={[
                  styles.segmentButton,
                  activeSegment === 0 && styles.activeSegmentButton,
                  {
                    paddingVertical: 8,
                    paddingHorizontal: 20,
                    width: 90
                  }
                ]}
              >
                <TouchableOpacity
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%'
                  }}
                  onPress={() => updateIndex(0)}
                >
                  <FontAwesome
                    name='globe'
                    size={20}
                    color={activeSegment === 0 ? theme.TEXT_PRIMARY : theme.TEXT_SECONDARY}
                  />
                  <Text
                    style={[
                      styles.segmentText,
                      {
                        color: activeSegment === 0 ? theme.TEXT_PRIMARY : theme.TEXT_SECONDARY
                      }
                    ]}
                  >
                    {segmentTitles[0]}
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.segmentButton,
                  activeSegment === 1 && styles.activeSegmentButton,
                  {
                    paddingVertical: 8,
                    paddingHorizontal: 20,
                    width: 90
                  }
                ]}
              >
                <TouchableOpacity
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%'
                  }}
                  onPress={() => updateIndex(1)}
                >
                  <AntDesign
                    name='star'
                    size={20}
                    color={activeSegment === 1 ? theme.TEXT_PRIMARY : theme.TEXT_SECONDARY}
                  />
                  <Text
                    style={[
                      styles.segmentText,
                      {
                        color: activeSegment === 1 ? theme.TEXT_PRIMARY : theme.TEXT_SECONDARY
                      }
                    ]}
                  >
                    {segmentTitles[1]}
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.segmentButton,
                  activeSegment === 2 && styles.activeSegmentButton,
                  {
                    paddingVertical: 8,
                    paddingHorizontal: 20,
                    width: 90
                  }
                ]}
              >
                <TouchableOpacity
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%'
                  }}
                  onPress={() => updateIndex(2)}
                >
                  <FontAwesome
                    name='search'
                    size={20}
                    color={activeSegment === 2 ? theme.TEXT_PRIMARY : theme.TEXT_SECONDARY}
                  />
                  <Text
                    style={[
                      styles.segmentText,
                      {
                        color: activeSegment === 2 ? theme.TEXT_PRIMARY : theme.TEXT_SECONDARY
                      }
                    ]}
                  >
                    {segmentTitles[2]}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        {loading && (
          <View
            style={{
              height: 3,
              backgroundColor: theme.HEADER_BACKGROUND
            }}
          >
            <LinearProgress
              color={CONST.MAIN_COLOR}
              style={{
                flex: 1,
                height: 3
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

  async function checkPermission ({
    permissionFunction,
    alertHeader,
    alertBody,
    permissionFunctionArgument
  }) {
    const { status } = await permissionFunction(permissionFunctionArgument)
    if (status !== 'granted') {
      Alert.alert(alertHeader, alertBody, [
        {
          text: 'Open Settings',
          onPress: () => {
            Linking.openSettings()
          }
        }
      ])
    }
    return status
  }

  const takePhoto = async ({ cameraType }) => {
    let cameraReturn
    if (cameraType === 'camera') {
      // launch photo capturing
      cameraReturn = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        // allowsEditing: true,
        quality: 1.0, // Reduced from 1.0 to 0.8 for better upload performance
        exif: true
      })
    } else {
      // launch video capturing
      cameraReturn = await ImagePicker.launchCameraAsync({
        mediaTypes: ['videos'],
        // allowsEditing: true,
        videoMaxDuration: 5,
        quality: 1.0, // Reduced from 1.0 to 0.8 for better upload performance
        exif: true
      })
    }

    // alert(`cameraReturn.canceled ${cameraReturn.canceled}`)
    if (cameraReturn.canceled === false) {
      await MediaLibrary.saveToLibraryAsync(cameraReturn.assets[0].uri)
      // have to wait, otherwise the upload will not start
      await enqueueCapture({
        cameraImgUrl: cameraReturn.assets[0].uri,
        type: cameraReturn.assets[0].type,
        location,
        waveUuid: activeWave?.waveUuid
      })
    }
  }

  const checkPermissionsForPhotoTaking = async ({ cameraType }) => {
    // Prevent double-clicking by checking if camera is already opening
    if (isCameraOpening) {
      console.log('Camera already opening, ignoring duplicate request')
      return
    }

    setIsCameraOpening(true)

    try {
      const cameraPermission = await checkPermission({
        permissionFunction: ImagePicker.requestCameraPermissionsAsync,
        alertHeader: 'Do you want to take photo with wisaw?',
        alertBody: "Why don't you enable photo permission?"
      })

      if (cameraPermission === 'granted') {
        const photoAlbomPermission = await checkPermission({
          permissionFunction: ImagePicker.requestMediaLibraryPermissionsAsync,
          alertHeader: 'Do you want to save photo on your device?',
          alertBody: "Why don't you enable the permission?",
          permissionFunctionArgument: true
        })

        if (photoAlbomPermission === 'granted') {
          await takePhoto({ cameraType })
        }
      }
    } catch (error) {
      console.error('Error in checkPermissionsForPhotoTaking:', error)
    } finally {
      // Always reset the flag, regardless of success or failure
      setIsCameraOpening(false)
    }
  }

  async function initLocation () {
    const locationPermission = await checkPermission({
      permissionFunction: Location.requestForegroundPermissionsAsync,
      alertHeader: 'WiSaw shows you near-by photos based on your current location.',
      alertBody: 'You need to enable Location in Settings and Try Again.'
    })

    if (locationPermission === 'granted') {
      try {
        // initially set the location that is last known -- works much faster this way
        let loc = await Location.getLastKnownPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation
        })
        if (!loc) {
          loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.BestForNavigation
          })
        }
        if (loc) setLocation(loc)

        return loc
      } catch (err12) {
        console.error({ err12 })
        Toast.show({
          text1: 'Unable to get location',
          type: 'error',
          topOffset: toastTopOffset
        })
      }
    }
    return null
  }

  useEffect(() => {
    // add network availability listener with improved reliability
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      if (state) {
        // Check both isConnected and isInternetReachable for better reliability
        const isNetworkAvailable = state.isConnected && state.isInternetReachable !== false

        setNetAvailable(isNetworkAvailable)

        // Log network state for debugging
        console.log('Network state:', {
          isConnected: state.isConnected,
          isInternetReachable: state.isInternetReachable,
          type: state.type,
          computed: isNetworkAvailable
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

  useFocusEffect(
    useCallback(() => {
      let isMounted = true

      const checkAcceptance = async () => {
        const accepted = await reducer.getTancAccepted()
        if (isMounted) {
          setIsTandcAccepted(accepted)
        }
      }

      checkAcceptance()

      return () => {
        isMounted = false
      }
    }, [])
  )

  useEffect(() => {
    if (isFocused && !isTandcAccepted && !hasOpenedTandcRef.current) {
      hasOpenedTandcRef.current = true
      router.push('/tandc-modal')
    } else if (isTandcAccepted) {
      hasOpenedTandcRef.current = false
    }
  }, [isFocused, isTandcAccepted, router])

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
          allowAnnouncements: true
        }
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
    // checkForUpdate(),
    // check permissions, retrieve UUID, make sure upload folder exists

    initLocation()
  }, [])

  useEffect(() => {
    // updateNavBar()
    reload()
  }, [location, activeWave])

  // useEffect(() => {}, [currentBatch])

  // useEffect(() => {
  //   updateNavBar()
  // }, [loading])

  // Update navigation bar when activeSegment changes and clear anchor state
  useEffect(() => {
    resetAnchorState()
    // updateNavBar() // No longer needed with custom header
  }, [activeSegment, resetAnchorState])

  // Removed: no header text visibility effect

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
      currentBatch = Crypto.randomUUID()

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
    if (!pendingTriggerSearch) {
      return
    }

    const searchTermToUse = pendingTriggerSearch
    setPendingTriggerSearch(null)

    // Dismiss keyboard immediately since search is automatic
    Keyboard.dismiss()

    // Close any expanded photos
    setExpandedPhotoIds(new Set())

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
    currentBatch = Crypto.randomUUID()

    // Trigger search immediately with the search term directly passed
    const performSearch = async () => {
      try {
        await reload(2, searchTermToUse)
      } catch (error) {
        // Search failed, but don't break the app
      }
    }
    performSearch()
  }, [pendingTriggerSearch, reload])

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
        topOffset: toastTopOffset
      })
    }
  }

  /// //////////////////////////////////////////////////////////////////////////
  // here where the rendering starts
  /// //////////////////////////////////////////////////////////////////////////

  if (!netAvailable) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.HEADER_BACKGROUND }}>
        {renderCustomHeader()}
        <PendingPhotosBanner
          theme={theme}
          pendingPhotos={pendingPhotos}
          netAvailable={netAvailable}
          isUploading={isUploading}
          clearPendingQueue={clearPendingQueue}
          toastTopOffset={toastTopOffset}
          pendingPhotosAnimation={pendingPhotosAnimation}
          uploadIconAnimation={uploadIconAnimation}
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            justifyContent: 'center',
            paddingHorizontal: 20,
            paddingBottom: FOOTER_HEIGHT + 20
          }}
          showsVerticalScrollIndicator={false}
        >
          <EmptyStateCard
            icon='wifi-off'
            iconType='MaterialIcons'
            title='No Internet Connection'
            subtitle="You can still take photos offline. They'll be uploaded automatically when you're back online."
            actionText='Try Again'
            onActionPress={reload}
          />
        </ScrollView>
        <PhotosListFooter
          theme={theme}
          navigation={navigation}
          netAvailable={netAvailable}
          unreadCount={unreadCount}
          isCameraOpening={isCameraOpening}
          onCameraPress={checkPermissionsForPhotoTaking}
          location={location}
        />
      </View>
    )
  }

  if (isTandcAccepted && location && photosList?.length > 0) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.HEADER_BACKGROUND }}>
        {renderCustomHeader()}
        <PendingPhotosBanner
          theme={theme}
          pendingPhotos={pendingPhotos}
          netAvailable={netAvailable}
          isUploading={isUploading}
          clearPendingQueue={clearPendingQueue}
          toastTopOffset={toastTopOffset}
          pendingPhotosAnimation={pendingPhotosAnimation}
          uploadIconAnimation={uploadIconAnimation}
        />
        <View style={styles.container}>
          {activeSegment === 2 && (
            <PhotosListSearchBar
              theme={theme}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSubmitSearch={submitSearch}
              keyboardVisible={keyboardVisible}
              keyboardOffset={keyboardOffset}
              autoFocus={false}
            />
          )}
          {/* photos - unified masonry layout for all segments */}
          <PhotosListMasonry
            activeSegment={activeSegment}
            photosList={photosList}
            segmentConfig={segmentConfig}
            onScroll={handleScroll}
            masonryRef={masonryRef}
            getCalculatedDimensions={getCalculatedDimensions}
            isPhotoExpanded={isPhotoExpanded}
            searchTerm={searchTerm}
            uuid={uuid}
            expandedPhotoIds={expandedPhotoIds}
            onToggleExpand={handlePhotoToggle}
            updatePhotoHeight={updatePhotoHeight}
            onRequestEnsureVisible={ensureItemVisible}
            onTriggerSearch={triggerSearch}
            loading={loading}
            stopLoading={stopLoading}
            setPageNumber={setPageNumber}
            setExpandedPhotoIds={setExpandedPhotoIds}
            reload={reload}
            styles={styles}
            FOOTER_HEIGHT={FOOTER_HEIGHT}
            justCollapsedId={justCollapsedId}
          />
          <PhotosListFooter
            theme={theme}
            navigation={navigation}
            netAvailable={netAvailable}
            unreadCount={unreadCount}
            isCameraOpening={isCameraOpening}
            onCameraPress={checkPermissionsForPhotoTaking}
            location={location}
          />
        </View>
      </View>
    )
  }

  if (!isTandcAccepted) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.HEADER_BACKGROUND }}>
        {renderCustomHeader()}
      </View>
    )
  }

  if (!location) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.HEADER_BACKGROUND }}>
        {renderCustomHeader()}
        <PendingPhotosBanner
          theme={theme}
          pendingPhotos={pendingPhotos}
          netAvailable={netAvailable}
          isUploading={isUploading}
          clearPendingQueue={clearPendingQueue}
          toastTopOffset={toastTopOffset}
          pendingPhotosAnimation={pendingPhotosAnimation}
          uploadIconAnimation={uploadIconAnimation}
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            justifyContent: 'center',
            paddingHorizontal: 20,
            paddingBottom: FOOTER_HEIGHT + 20
          }}
          showsVerticalScrollIndicator={false}
        >
          <EmptyStateCard
            icon='location-on'
            iconType='MaterialIcons'
            title='Location Access Needed'
            subtitle='WiSaw needs location access to show you photos from your area and let others discover your content.'
            actionText='Enable Location'
            onActionPress={reload}
          />
        </ScrollView>
        <PhotosListFooter
          theme={theme}
          navigation={navigation}
          netAvailable={netAvailable}
          unreadCount={unreadCount}
          isCameraOpening={isCameraOpening}
          onCameraPress={checkPermissionsForPhotoTaking}
          location={location}
        />
      </View>
    )
  }

  if (photosList?.length === 0 && stopLoading) {
    return (
      <PhotosListEmptyState
        theme={theme}
        activeSegment={activeSegment}
        loading={loading}
        stopLoading={stopLoading}
        photosList={photosList}
        renderCustomHeader={renderCustomHeader}
        renderPendingPhotos={() => (
          <PendingPhotosBanner
            theme={theme}
            pendingPhotos={pendingPhotos}
            netAvailable={netAvailable}
            isUploading={isUploading}
            clearPendingQueue={clearPendingQueue}
            toastTopOffset={toastTopOffset}
            pendingPhotosAnimation={pendingPhotosAnimation}
            uploadIconAnimation={uploadIconAnimation}
          />
        )}
        renderFooter={() => (
          <PhotosListFooter
            theme={theme}
            navigation={navigation}
            netAvailable={netAvailable}
            unreadCount={unreadCount}
            isCameraOpening={isCameraOpening}
            onCameraPress={checkPermissionsForPhotoTaking}
            location={location}
          />
        )}
        unreadCount={unreadCount}
        reload={reload}
        updateIndex={updateIndex}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchBarRef={searchBarRef}
        submitSearch={submitSearch}
        keyboardVisible={keyboardVisible}
        keyboardOffset={keyboardOffset}
        FOOTER_HEIGHT={FOOTER_HEIGHT}
        activeWave={activeWave}
        clearActiveWave={() => {
          setActiveWave(null)
          saveActiveWave(null)
        }}
      />
    )
  }

  // dispatch(reducer.getPhotos())
  return (
    <View style={{ flex: 1, backgroundColor: theme.HEADER_BACKGROUND }}>
      {renderCustomHeader()}
      <PendingPhotosBanner
        theme={theme}
        pendingPhotos={pendingPhotos}
        netAvailable={netAvailable}
        isUploading={isUploading}
        clearPendingQueue={clearPendingQueue}
        toastTopOffset={toastTopOffset}
        pendingPhotosAnimation={pendingPhotosAnimation}
        uploadIconAnimation={uploadIconAnimation}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          justifyContent: 'center',
          paddingHorizontal: 20,
          paddingBottom: FOOTER_HEIGHT + 80
        }}
        showsVerticalScrollIndicator
      >
        {activeSegment === 2 &&
          (loading || (
            <EmptyStateCard
              icon='search'
              title='Ready to Search'
              subtitle='Enter a search term above to find photos from your area and beyond.'
              actionText='Start Exploring'
              onActionPress={() => {
                if (searchBarRef.current) {
                  searchBarRef.current.focus()
                }
              }}
            />

          ))}
        {activeSegment === 1 &&
          (loading || (
            <EmptyStateCard
              icon='star'
              title='No Starred Content Yet'
              subtitle="Start building your collection! Take photos, comment on others' posts, or star content you love."
              actionText='Discover Content'
              onActionPress={() => updateIndex(0)}
            />
          ))}
      </ScrollView>
      {activeSegment === 2 && (
        <PhotosListSearchBar
          theme={theme}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSubmitSearch={submitSearch}
          keyboardVisible={keyboardVisible}
          keyboardOffset={keyboardOffset}
          autoFocus={false}
        />
      )}
      <PhotosListFooter
        theme={theme}
        navigation={navigation}
        netAvailable={netAvailable}
        unreadCount={unreadCount}
        isCameraOpening={isCameraOpening}
        onCameraPress={checkPermissionsForPhotoTaking}
        location={location}
      />
    </View>
  )
}

PhotosList.propTypes = {
  searchFromUrl: PropTypes.string
}

PhotosList.defaultProps = {
  searchFromUrl: null
}

export default PhotosList

