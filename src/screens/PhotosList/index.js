import PropTypes from 'prop-types'
import * as Crypto from 'expo-crypto'

import { useAtom, useSetAtom } from 'jotai'
import React, { useCallback, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'

import { useFocusEffect, useIsFocused } from '@react-navigation/native'
import { router, useNavigation } from 'expo-router'
import * as Notifications from '../../utils/notifications'
import * as SecureStore from 'expo-secure-store'

import Toast from 'react-native-toast-message'

import * as BackgroundTask from 'expo-background-task'
import * as Haptics from 'expo-haptics'
import * as TaskManager from 'expo-task-manager'

import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native'

import * as Linking from 'expo-linking'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import * as Constants from 'expo-constants'
import InteractionHintBanner from '../../components/ui/InteractionHintBanner'

import { emitPhotoSearch, subscribeToPhotoSearch } from '../../events/photoSearchBus'
import { subscribeToIdentityChange } from '../../events/identityChangeBus'

import useToastTopOffset from '../../hooks/useToastTopOffset'

import * as friendsHelper from '../FriendsList/friends_helper'

import * as reducer from './reducer'

import QuickActionsModal from '../../components/QuickActionsModal'

import * as CONST from '../../consts'
import * as STATE from '../../state'
import { getTheme } from '../../theme/sharedStyles'
import {
  createFrozenPhoto,
  validateFrozenPhotosList
} from '../../utils/photoListHelpers'

import EmptyStateCard from '../../components/EmptyStateCard'
import PhotosListFooter from './components/PhotosListFooter'
import PhotosListHeader from './components/PhotosListHeader'
import SearchFab from '../../components/SearchFab'
import PendingPhotosBanner from './components/PendingPhotosBanner'
import LocationDriftBanner from './components/LocationDriftBanner'
import PhotosListEmptyState from './components/PhotosListEmptyState'
import PhotosListMasonry from './components/PhotosListMasonry'
import PhotosListContext from '../../contexts/PhotosListContext'
import UploadContext from '../../contexts/UploadContext'
import { subscribeToUploadComplete } from '../../events/uploadBus'
import { subscribeToPhotoDeletion } from '../../events/photoDeletionBus'

import useCameraCapture from './hooks/useCameraCapture'
import usePendingAnimation from './hooks/usePendingAnimation'
import usePhotoExpansion from './hooks/usePhotoExpansion'
import haversine from '../../utils/haversine'

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

// Lightweight wrapper isolating longPressPhoto state from PhotosList re-renders
const QuickActionsModalWrapper = React.memo(
  React.forwardRef(({ setPhotosList }, ref) => {
    const [longPressPhoto, setLongPressPhoto] = useState(null)

    useImperativeHandle(ref, () => ({
      open: (photo) => setLongPressPhoto(photo)
    }), [])

    return (
      <QuickActionsModal
        visible={!!longPressPhoto}
        photo={longPressPhoto}
        onClose={() => setLongPressPhoto(null)}
        onPhotoDeleted={(photoId) => {
          setPhotosList((currentList) => currentList.filter((p) => p.id !== photoId))
        }}
      />
    )
  })
)

const PhotosList = ({ searchFromUrl }) => {
  // console.log({ activeSegment, currentBatch })

  const [uuid, setUuid] = useAtom(STATE.uuid)
  // const [nickName, setNickName] = useAtom(STATE.nickName)
  const [photosList, setPhotosList] = useState([])
  const [, setFriendsList] = useAtom(STATE.friendsList)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const setUngroupedPhotosCount = useSetAtom(STATE.ungroupedPhotosCount)

  const [searchTerm, setSearchTerm] = useState('')
  const [pendingTriggerSearch, setPendingTriggerSearch] = useState(null)

  const toastTopOffset = useToastTopOffset()

  // --- Extracted hooks ---
  const [netAvailable] = useAtom(STATE.netAvailable)

  const [locationState] = useAtom(STATE.locationAtom)
  const location = locationState.status === 'ready' ? { coords: locationState.coords } : null

  const feedLocationRef = useRef(null)
  const [feedLocationVersion, setFeedLocationVersion] = useState(0)
  const abortControllerRef = useRef(null)

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

  useEffect(() => {
    const unsubscribe = subscribeToIdentityChange(() => {
      reload()
    })
    return unsubscribe
  }, [reload])

  const triggerSearch = useCallback((term) => {
    emitPhotoSearch(term)
  }, [])

  // Development-only: Add guards to detect unauthorized mutations to photo dimensions
  // eslint-disable-next-line
  if (__DEV__) {
    validateFrozenPhotosList(photosList, 'in PhotosList render')
  }

  const theme = getTheme(isDarkMode)


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
  const segmentWidth = Math.min(90, Math.floor(width * 0.22))
  const insets = useSafeAreaInsets()

  const [stopLoading, setStopLoading] = useState(false)

  const [isTandcAccepted, setIsTandcAccepted] = useState(true)
  const [zeroMoment, setZeroMoment] = useState(0)

  // const [isLastPage, setIsLastPage] = useState(false)

  const [pageNumber, setPageNumber] = useState(0)
  const [, setConsecutiveEmptyResponses] = useState(0)

  const [activeSegment, setActiveSegment] = useState(0)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  // Search is active whenever the search term has content
  const isSearchActive = searchTerm.length > 0

  const DRIFT_THRESHOLD = 500 // meters
  const showDriftBanner = useMemo(() => {
    if (activeSegment !== 0) return false
    if (!feedLocationRef.current || !locationState.coords) return false
    const drift = haversine(
      feedLocationRef.current.latitude,
      feedLocationRef.current.longitude,
      locationState.coords.latitude,
      locationState.coords.longitude
    )
    return drift > DRIFT_THRESHOLD
  }, [activeSegment, locationState.coords?.latitude, locationState.coords?.longitude, feedLocationVersion])

  const [loading, setLoading] = useState(false)

  const [unreadCountList, setUnreadCountList] = useState([])

  const [unreadCount, setUnreadCount] = useState(0)

  const {
    pendingPhotos,
    isUploading,
    enqueueCapture,
    clearPendingQueue,
    refreshPendingQueue,
    processQueue: processPendingQueue
  } = useContext(UploadContext)

  // Subscribe to upload completions via event bus
  useEffect(() => {
    return subscribeToUploadComplete(({ photo, waveUuid }) => {
      setPhotosList((currentList) => {
        const updatedList = [createFrozenPhoto(photo), ...currentList]
        const seen = new Set()
        return updatedList.filter((p) => {
          if (seen.has(p.id)) return false
          seen.add(p.id)
          return true
        })
      })
      if (!waveUuid) {
        setUngroupedPhotosCount(prev => (prev ?? 0) + 1)
      }
    })
  }, [setPhotosList])

  // Subscribe to cross-screen photo deletions
  useEffect(() => {
    return subscribeToPhotoDeletion(({ photoId }) => {
      setPhotosList((currentList) => currentList.filter((p) => p.id !== photoId))
    })
  }, [setPhotosList])

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

  // --- Extracted hooks (depend on values above) ---
  const {
    expandedPhotoIds,
    setExpandedPhotoIds,
    isPhotoExpanded,
    handlePhotoToggle,
    getCalculatedDimensions,
    updatePhotoHeight,
    ensureItemVisible,
    handleScroll,
    resetAnchorState,
    masonryRef,
    justCollapsedId,
    measuredHeights
  } = usePhotoExpansion({ width, height, insets, segmentConfig })

  const { isCameraOpening, checkPermissionsForPhotoTaking } = useCameraCapture({
    enqueueCapture,
    toastTopOffset
  })

  const { pendingPhotosAnimation, uploadIconAnimation } = usePendingAnimation({
    pendingPhotosCount: pendingPhotos.length,
    netAvailable
  })

  useEffect(() => {
    setUnreadCount(unreadCountList.reduce((a, b) => a + (b.unread || 0), 0))
  }, [unreadCountList])

  // Long-press handler — open quick-actions modal
  const quickActionsRef = useRef(null)

  const handlePhotoLongPress = useCallback((photo) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    quickActionsRef.current?.open(photo)
  }, [])

  // Preloading disabled for consistency; rely on onEndReached

  const load = async (segmentOverride = null, searchTermOverride = null, signal = null, pageOverride = null) => {
    setLoading(true)

    // Use current values if overrides are not provided
    const effectiveSegment = segmentOverride !== null ? segmentOverride : activeSegment

    // Always include search term in queries when present
    const effectiveSearchTerm = searchTermOverride !== null ? searchTermOverride : searchTerm

    // Use explicit page number to avoid stale closure
    const effectivePage = pageOverride !== null ? pageOverride : pageNumber

    const { photos, batch } = await reducer.getPhotos({
      uuid,
      zeroMoment,
      location,
      netAvailable,
      searchTerm: effectiveSearchTerm,
      topOffset: toastTopOffset,
      activeSegment: effectiveSegment,
      batch: currentBatch, // clone
      pageNumber: effectivePage
    })

    if (signal?.aborted) return

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
          // sorting should come from the backend now
          // const sortedList = combinedList.sort(
          //   (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          // )
          const deduplicatedList = combinedList.filter(
            (obj, pos, arr) => arr.map((mapObj) => mapObj.id).indexOf(obj.id) === pos
          )

          return deduplicatedList
        })
      }
    }

    if (!signal?.aborted) {
      setLoading(false)
    }
  }

  const reload = async (segmentOverride = null, searchTermOverride = null) => {
    // Cancel any in-flight reload/load chain
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller
    const { signal } = controller

    // Snapshot current location for drift comparison
    if (locationState.coords) {
      feedLocationRef.current = locationState.coords
      setFeedLocationVersion(v => v + 1)
    }

    currentBatch = Crypto.randomUUID()

    setStopLoading(false)
    setConsecutiveEmptyResponses(0)
    setPhotosList([])
    setPageNumber(0)

    await refreshPendingQueue()
    if (signal.aborted) return
    await processPendingQueue()
    if (signal.aborted) return
    if (uuid.length > 0) {
      setFriendsList(
        await friendsHelper.getEnhancedListOfFriendships({
          uuid
        })
      )
      if (signal.aborted) return

      setUnreadCountList(await friendsHelper.getUnreadCountsList({ uuid })) // the list of enhanced friends list has to be loaded earlier on
      if (signal.aborted) return
    }

    // Load new content after state is reset, using the specific segment if provided
    // Pass page 0 explicitly since setPageNumber(0) hasn't been applied yet
    await load(segmentOverride, searchTermOverride, signal, 0)
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
    // Always include search term if present
    const searchTermToUse = searchTerm.length > 0 ? searchTerm : null
    reload(index, searchTermToUse)
  }

  useEffect(() => {
    if (netAvailable) {
      reload()
    }
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
        // Dismiss keyboard immediately so it doesn't interfere with the
        // destination screen's mount (e.g. WavesHub's KeyboardStickyView
        // reacts to ongoing keyboard-dismiss animations and freezes).
        Keyboard.dismiss()
        // Cancel any in-flight reload/load chains when screen loses focus
        abortControllerRef.current?.abort()
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
      setZeroMoment(await reducer.getZeroMoment({ netAvailable }))
    })()
  }, [])

  useEffect(() => {
    // Load feed once when location first becomes available
    if (locationState.status === 'ready') {
      reload()
    }
  }, [locationState.status])

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

  // pageNumber useEffect removed — pagination now calls load() explicitly

  // Handle search from URL parameter (e.g., from AI tag clicks)
  useEffect(() => {
    if (searchFromUrl && searchFromUrl.trim().length > 0) {
      const searchTermToUse = searchFromUrl.trim()

      // Set the search term and activate search via FAB
      setSearchTerm(searchTermToUse)
      setIsSearchExpanded(true)

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
          await reload(activeSegment, searchTermToUse)
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

    // Set the search term and activate search via FAB
    setSearchTerm(searchTermToUse)
    setIsSearchExpanded(true)

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
        await reload(activeSegment, searchTermToUse)
      } catch (error) {
        // Search failed, but don't break the app
      }
    }
    performSearch()
  }, [pendingTriggerSearch, reload])

  const submitSearch = async () => {
    Keyboard.dismiss()
    reload(activeSegment, searchTerm)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setIsSearchExpanded(false)
    reload(activeSegment, '')
  }

  /// //////////////////////////////////////////////////////////////////////////
  // here where the rendering starts
  /// //////////////////////////////////////////////////////////////////////////

  const handleLoadMore = () => {
    setPageNumber((currentPage) => {
      const newPage = currentPage + 1
      // Pass newPage explicitly to avoid stale closure
      load(null, null, null, newPage)
      return newPage
    })
  }

  const renderHeader = () => (
    <PhotosListHeader
      theme={theme}
      activeSegment={activeSegment}
      updateIndex={updateIndex}
      loading={loading}
      segmentWidth={segmentWidth}
      styles={styles}
    />
  )

  const removePhoto = useCallback((photoId) => {
    setPhotosList((currentList) => currentList.filter((p) => p.id !== photoId))
  }, [setPhotosList])

  const photosListContextValue = useMemo(() => ({ removePhoto }), [removePhoto])

  if (!netAvailable) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.HEADER_BACKGROUND }}>
        {renderHeader()}
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
          locationReady={!!location}
        />
      </View>
    )
  }

  if (isTandcAccepted && (location || activeSegment !== 0) && photosList?.length > 0) {
    return (
      <PhotosListContext.Provider value={photosListContextValue}>
        <View style={{ flex: 1, backgroundColor: theme.HEADER_BACKGROUND }}>
          {renderHeader()}
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
          {showDriftBanner && (
            <LocationDriftBanner theme={theme} onPress={() => reload()} />
          )}
          <View style={styles.container}>
            <InteractionHintBanner hasContent={photosList?.length > 0} />
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
              onLoadMore={handleLoadMore}
              setExpandedPhotoIds={setExpandedPhotoIds}
              reload={reload}
              styles={styles}
              FOOTER_HEIGHT={FOOTER_HEIGHT}
              justCollapsedId={justCollapsedId}
              onPhotoLongPress={handlePhotoLongPress}
            />
          </View>
          <SearchFab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSubmitSearch={submitSearch}
            onClearSearch={handleClearSearch}
            isExpanded={isSearchExpanded}
            setIsExpanded={setIsSearchExpanded}
            theme={theme}
            footerHeight={FOOTER_HEIGHT}
            screenWidth={width}
          />
          <PhotosListFooter
            theme={theme}
            navigation={navigation}
            netAvailable={netAvailable}
            unreadCount={unreadCount}
            isCameraOpening={isCameraOpening}
            onCameraPress={checkPermissionsForPhotoTaking}
            locationReady={!!location}
          />
          <QuickActionsModalWrapper ref={quickActionsRef} setPhotosList={setPhotosList} />
        </View>
      </PhotosListContext.Provider>
    )
  }

  if (!isTandcAccepted) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.HEADER_BACKGROUND }}>
        {renderHeader()}
      </View>
    )
  }

  if (!location && activeSegment === 0) {
    const isPending = locationState.status === 'pending'
    const isDenied = locationState.status === 'denied'
    const isUnavailable = locationState.status === 'unavailable'
    return (
      <View style={{ flex: 1, backgroundColor: theme.HEADER_BACKGROUND }}>
        {renderHeader()}
        {isPending && (
          <View style={{ backgroundColor: theme.CARD_BACKGROUND, paddingVertical: 8, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: theme.BORDER_LIGHT }}>
            <Text style={{ color: theme.TEXT_SECONDARY, fontSize: 14, textAlign: 'center' }}>Obtaining your location...</Text>
          </View>
        )}
        {isDenied && (
          <TouchableOpacity
            onPress={() => Linking.openSettings()}
            style={{ backgroundColor: theme.CARD_BACKGROUND, paddingVertical: 8, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: theme.BORDER_LIGHT }}
          >
            <Text style={{ color: theme.STATUS_ERROR, fontSize: 14, textAlign: 'center' }}>Location access needed — tap to open Settings</Text>
          </TouchableOpacity>
        )}
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
          {isPending && (
            <EmptyStateCard
              icon='location-on'
              iconType='MaterialIcons'
              title='Finding Your Location'
              subtitle="We're finding your location so we can show nearby photos."
            />
          )}
          {isDenied && (
            <EmptyStateCard
              icon='location-on'
              iconType='MaterialIcons'
              title='Location Access Needed'
              subtitle='WiSaw needs location access to show you photos from your area and let others discover your content.'
              actionText='Enable Location'
              onActionPress={() => Linking.openSettings()}
            />
          )}
          {isUnavailable && (
            <EmptyStateCard
              icon='location-off'
              iconType='MaterialIcons'
              title='Location Unavailable'
              subtitle="We couldn't determine your location. Try the Watched or Search tabs to browse photos."
            />
          )}
        </ScrollView>
        <PhotosListFooter
          theme={theme}
          navigation={navigation}
          netAvailable={netAvailable}
          unreadCount={unreadCount}
          isCameraOpening={isCameraOpening}
          onCameraPress={checkPermissionsForPhotoTaking}
          locationReady={false}
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
        renderCustomHeader={renderHeader}
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
            locationReady={!!location}
          />
        )}
        renderSearchFab={() => (
          <SearchFab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSubmitSearch={submitSearch}
            onClearSearch={handleClearSearch}
            isExpanded={isSearchExpanded}
            setIsExpanded={setIsSearchExpanded}
            theme={theme}
            footerHeight={FOOTER_HEIGHT}
            screenWidth={width}
          />
        )}
        unreadCount={unreadCount}
        reload={reload}
        updateIndex={updateIndex}
        isSearchActive={isSearchActive}
        searchTerm={searchTerm}
        onClearSearch={handleClearSearch}
        FOOTER_HEIGHT={FOOTER_HEIGHT}
      />
    )
  }

  // dispatch(reducer.getPhotos())
  return (
    <View style={{ flex: 1, backgroundColor: theme.HEADER_BACKGROUND }}>
      {renderHeader()}
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
        {isSearchActive &&
          (loading || (
            <EmptyStateCard
              icon='search'
              title={`No results for '${searchTerm}'`}
              subtitle='Try different keywords or clear the search.'
              actionText='Clear Search'
              onActionPress={handleClearSearch}
            />
          ))}
        {!isSearchActive && activeSegment === 1 &&
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
      <SearchFab
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSubmitSearch={submitSearch}
        onClearSearch={handleClearSearch}
        isExpanded={isSearchExpanded}
        setIsExpanded={setIsSearchExpanded}
        theme={theme}
        footerHeight={FOOTER_HEIGHT}
        screenWidth={width}
      />
      <PhotosListFooter
        theme={theme}
        navigation={navigation}
        netAvailable={netAvailable}
        unreadCount={unreadCount}
        isCameraOpening={isCameraOpening}
        onCameraPress={checkPermissionsForPhotoTaking}
        locationReady={!!location}
      />
      <QuickActionsModalWrapper ref={quickActionsRef} setPhotosList={setPhotosList} />
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

