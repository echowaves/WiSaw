import PropTypes from 'prop-types'

import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import React, { useCallback, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'

import { useFocusEffect, useIsFocused } from '@react-navigation/native'
import { router, useNavigation } from 'expo-router'
import * as Location from 'expo-location'
import * as Notifications from '../../utils/notifications'

import * as BackgroundTask from 'expo-background-task'
import * as Haptics from 'expo-haptics'
import * as TaskManager from 'expo-task-manager'

import {
  Keyboard,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native'

import * as Linking from 'expo-linking'

import * as Constants from 'expo-constants'
import InteractionHintBanner from '../../components/ui/InteractionHintBanner'

import { subscribeToIdentityChange } from '../../events/identityChangeBus'

import useToastTopOffset from '../../hooks/useToastTopOffset'

import * as friendsHelper from '../FriendsList/friends_helper'

import * as reducer from './reducer'
import { requestGeoPhotos, requestWatchedPhotos } from './reducer'

import QuickActionsModalWrapper from '../../components/QuickActionsModalWrapper'

import * as STATE from '../../state'
import { bannerHeightAtom } from '../../state'
import { getTheme } from '../../theme/sharedStyles'
import {
  validateFrozenPhotosList
} from '../../utils/photoListHelpers'

import EmptyStateCard from '../../components/EmptyStateCard'
import { BOOKMARK_LAYOUT_CONFIG } from '../../consts'
import PhotosListFooter from '../../components/PhotosListFooter'
import PhotosListHeader from '../../components/PhotosListHeader'
import SearchFab from '../../components/SearchFab'
import FeedModeToggleFAB from '../../components/FeedModeToggleFAB'
import LocationDriftBanner from './components/LocationDriftBanner'
import PhotosListMasonry from '../../components/PhotosListMasonry'
import PhotosListContext from '../../contexts/PhotosListContext'
import UploadContext from '../../contexts/UploadContext'

import useCameraCapture from '../../hooks/useCameraCapture'
import usePhotoExpansion from '../../hooks/usePhotoExpansion'
import useFeedLoader from '../../hooks/useFeedLoader'
import useFeedSearch from '../../hooks/useFeedSearch'
import { haversine } from '../../utils/haversine'

const BACKGROUND_TASK_NAME = 'background-task'

// 1. Define the task by providing a name and the function that should be executed
// Note: This needs to be called in the global scope (e.g outside of your React components)
TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  // const now = Date.now()
  try {
    Notifications.setBadgeCountAsync(0)
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
async function registerBackgroundFetchAsync () {
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

// IMPORTANT: PhotosList items are frozen to prevent unauthorized mutation of width/height properties
// by third-party libraries (like masonry layout). When creating new items (expansion, dimension updates),
// we must always return Object.freeze() wrapped objects to maintain immutability.

const PhotosList = ({ searchFromUrl }) => {
  const [uuid] = useAtom(STATE.uuid)
  const [, setFriendsList] = useAtom(STATE.friendsList)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const [isBookmarksMode, setIsBookmarksMode] = useAtom(STATE.isBookmarksMode)
  const setUngroupedPhotosCount = useSetAtom(STATE.ungroupedPhotosCount)

  const toastTopOffset = useToastTopOffset()

  const [netAvailable] = useAtom(STATE.netAvailable)
  const setLocation = useSetAtom(STATE.locationAtom)

  const [locationState] = useAtom(STATE.locationAtom)
  const location = locationState.status === 'ready' ? { coords: locationState.coords } : null

  const feedLocationRef = useRef(null)
  const [feedLocationVersion, setFeedLocationVersion] = useState(0)

  const theme = getTheme(isDarkMode)

  // Dynamic styles based on current theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.INTERACTIVE_BACKGROUND
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
    cameraButton: {
      shadowColor: theme.HEADER_SHADOW
    }
  })

  const navigation = useNavigation()
  const isFocused = useIsFocused()
  const hasOpenedTandcRef = useRef(false)

  const { width } = useWindowDimensions()

  const [isTandcAccepted, setIsTandcAccepted] = useState(true)
  const [zeroMoment, setZeroMoment] = useState(0)
  const [locationDismissed, setLocationDismissed] = useState(false)
  // Comment editing state for SearchFab visibility
  const [isCommentEditing, setIsCommentEditing] = useState(false)
  // Keyboard height tracking for dynamic masonry padding
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  const DRIFT_THRESHOLD = 500 // meters
  const showDriftBanner = useMemo(() => {
    if (!feedLocationRef.current || !locationState.coords) return false
    const drift = haversine(
      feedLocationRef.current.latitude,
      feedLocationRef.current.longitude,
      locationState.coords.latitude,
      locationState.coords.longitude
    )
    return drift > DRIFT_THRESHOLD
  }, [locationState.coords?.latitude, locationState.coords?.longitude, feedLocationVersion])

  const {
    pendingPhotos,
    isUploading,
    enqueueCapture,
    clearPendingQueue,
    refreshPendingQueue,
    processQueue: processPendingQueue
  } = useContext(UploadContext)

  // Unified feed layout config - bookmark style (larger tiles, square, comments)
  const segmentConfig = BOOKMARK_LAYOUT_CONFIG

  // --- Feed loader hook ---
  const fetchFn = isBookmarksMode ? requestWatchedPhotos : requestGeoPhotos
  const {
    photosList,
    setPhotosList,
    loading,
    stopLoading,
    reload: feedReload,
    handleLoadMore: feedHandleLoadMore,
    removePhoto,
    abort: abortFeed
  } = useFeedLoader(fetchFn, {
    subscribeToUploads: true,
    setUngroupedPhotosCount
  })

  // Development-only: Add guards to detect unauthorized mutations to photo dimensions
  // eslint-disable-next-line
  if (__DEV__) {
    validateFrozenPhotosList(photosList, 'in PhotosList render')
  }

  // Build fetchParams for the geo feed
  const getFetchParams = useCallback(() => ({
    uuid,
    location,
    zeroMoment,
    netAvailable
  }), [uuid, location, zeroMoment, netAvailable])

  const reload = useCallback(async (searchTermOverride = null) => {
    // Skip geo reload when location is not yet available — the locationState.status
    // effect will trigger reload once location permission resolves
    if (!location && !isBookmarksMode) return

    // Snapshot current location for drift comparison (geo mode only)
    if (locationState.coords && !isBookmarksMode) {
      feedLocationRef.current = locationState.coords
      setFeedLocationVersion(v => v + 1)
    }

    await refreshPendingQueue()
    await processPendingQueue()
    if (uuid.length > 0) {
      setFriendsList(
        await friendsHelper.getEnhancedListOfFriendships({ uuid })
      )
    }

    await feedReload(getFetchParams(), searchTermOverride)
  }, [feedReload, getFetchParams, locationState.coords, refreshPendingQueue, processPendingQueue, uuid, setFriendsList, isBookmarksMode, location])

  const handleLoadMore = useCallback(() => {
    feedHandleLoadMore(getFetchParams())
  }, [feedHandleLoadMore, getFetchParams])

  // --- Extracted hooks (depend on values above) ---
  const {
    masonryRef,
    expandedItemIds,
    getExpandedHeight,
    toggleExpand
  } = usePhotoExpansion()

  // --- Feed search hook ---
  const {
    searchTerm,
    setSearchTerm,
    isSearchExpanded,
    setIsSearchExpanded,
    isSearchActive,
    submitSearch,
    handleClearSearch,
    triggerSearch
  } = useFeedSearch({
    onSearch: (term) => reload(term),
    onClear: () => reload(''),
    searchFromUrl,
    onBeforeSearch: () => {}
  })

  const bannerHeight = useAtomValue(bannerHeightAtom)

  const { isCameraOpening, checkPermissionsForPhotoTaking } = useCameraCapture({
    enqueueCapture,
    toastTopOffset
  })

  // Long-press handler — open quick-actions modal
  const quickActionsRef = useRef(null)

  const handlePhotoLongPress = useCallback((photo) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    quickActionsRef.current?.open(photo)
  }, [])

  // Reload feed when mode toggle changes — pass current search term so results re-query
  useEffect(() => {
    if (netAvailable && uuid) {
      reload(searchTerm)
    }
  }, [isBookmarksMode]) // searchTerm intentionally omitted — only react to mode change, not keystrokes
  // Identity change triggers reload
  useEffect(() => {
    const unsubscribe = subscribeToIdentityChange(() => {
      reload()
    })
    return unsubscribe
  }, [reload])

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
        Keyboard.dismiss()
        abortFeed()
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

  // Track keyboard height for dynamic masonry bottom padding
  useEffect(() => {
    const showHandler = (e) => setKeyboardHeight(e.endCoordinates.height)
    const hideHandler = () => setKeyboardHeight(0)

    // iOS fires Will events, Android fires Did events
    const willShow = Keyboard.addListener('keyboardWillShow', showHandler)
    const willHide = Keyboard.addListener('keyboardWillHide', hideHandler)
    const didShow = Keyboard.addListener('keyboardDidShow', showHandler)
    const didHide = Keyboard.addListener('keyboardDidHide', hideHandler)

    return () => {
      willShow.remove()
      willHide.remove()
      didShow.remove()
      didHide.remove()
    }
  }, [])

  useEffect(() => {
    if (locationState.status === 'ready') {
      reload()
    }
  }, [locationState.status])

  // Force-refresh handler: check GPS and refresh the feed
  const handleTryAgain = useCallback(async () => {
    try {
      const freshLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      })
      setLocation({
        status: 'ready',
        coords: {
          latitude: freshLocation.coords.latitude,
          longitude: freshLocation.coords.longitude
        },
        accuracy: freshLocation.coords.accuracy
      })
    } catch (e) {
      if (__DEV__) console.warn('[PhotosList] Force GPS check failed:', e?.message)
    }
    reload()
  }, [reload, setLocation])

  /// //////////////////////////////////////////////////////////////////////////
  // here where the rendering starts
  /// //////////////////////////////////////////////////////////////////////////

  const renderHeader = () => (
    <View style={{ paddingTop: bannerHeight }}>
      <PhotosListHeader
        theme={theme}
        loading={loading}
      />
    </View>
  )

  const photosListContextValue = useMemo(() => ({ removePhoto }), [removePhoto])

  if (!netAvailable) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.HEADER_BACKGROUND }}>
        {renderHeader()}
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
            subtitle="You can take photos when your location is determined. They'll be uploaded automatically when you're back online."
            actionText='Try Again'
            onActionPress={handleTryAgain}
          />
        </ScrollView>
        <PhotosListFooter
          theme={theme}
          navigation={navigation}
          netAvailable={netAvailable}
          isCameraOpening={isCameraOpening}
          onCameraPress={checkPermissionsForPhotoTaking}
          locationReady={!!location}
        />
      </View>
    )
  }

  if (isTandcAccepted && (location || isBookmarksMode) && photosList?.length > 0) {
    return (
      <PhotosListContext.Provider value={photosListContextValue}>
        <View style={{ flex: 1, backgroundColor: theme.HEADER_BACKGROUND }}>
          {renderHeader()}
          {showDriftBanner && !isBookmarksMode && (
            <LocationDriftBanner theme={theme} onPress={() => reload()} />
          )}
          <View style={styles.container}>
            <InteractionHintBanner hasContent={photosList?.length > 0} />
            <PhotosListMasonry
              activeSegment={1}
              photosList={photosList}
              segmentConfig={segmentConfig}
              columns={{ 402: 2, 440: 3, 834: 5, 1024: 7, default: 9 }}
              masonryRef={masonryRef}
              searchTerm={searchTerm}
              uuid={uuid}
              onTriggerSearch={triggerSearch}
              loading={loading}
              stopLoading={stopLoading}
              onLoadMore={handleLoadMore}
              reload={reload}
              styles={styles}
              FOOTER_HEIGHT={FOOTER_HEIGHT}
              contentPaddingBottom={FOOTER_HEIGHT + 56 + 32 + keyboardHeight}
              onPhotoLongPress={handlePhotoLongPress}
              theme={theme}
              removePhoto={removePhoto}
              expandedItemIds={expandedItemIds}
              getExpandedHeight={getExpandedHeight}
              toggleExpand={toggleExpand}
              onCommentInputToggle={setIsCommentEditing}
            />
          </View>
          <FeedModeToggleFAB
            footerHeight={FOOTER_HEIGHT}
            theme={theme}
          />
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
            isCommentEditing={isCommentEditing}
          />
          <PhotosListFooter
            theme={theme}
            navigation={navigation}
            netAvailable={netAvailable}
            isCameraOpening={isCameraOpening}
            onCameraPress={checkPermissionsForPhotoTaking}
            locationReady={!!location}
          />
          <QuickActionsModalWrapper
            ref={quickActionsRef}
            onPhotoDeleted={(photoId) => {
              setPhotosList((currentList) => currentList.filter((p) => p.id !== photoId))
            }}
          />
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

  if (!location) {
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
            <Text style={{ color: theme.STATUS_ERROR, fontSize: 14, textAlign: 'center' }}>Location access is needed to show nearby photos — tap to open Settings</Text>
          </TouchableOpacity>
        )}
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
          {isDenied && !locationDismissed && (
            <EmptyStateCard
              icon='location-on'
              iconType='MaterialIcons'
              title='Location Access Needed'
              subtitle='WiSaw uses your location to show photos from people nearby and let others discover your content. You can enable it in Settings.'
              actionText='Enable Location'
              onActionPress={() => Linking.openSettings()}
              secondaryActionText='Cancel'
              onSecondaryActionPress={() => setLocationDismissed(true)}
            />
          )}
          {isDenied && locationDismissed && (
            <EmptyStateCard
              icon='location-off'
              iconType='MaterialIcons'
              title='Location Unavailable'
              subtitle='Unable to show nearby photos without location access'
            />
          )}
          {isUnavailable && (
            <EmptyStateCard
              icon='location-off'
              iconType='MaterialIcons'
              title='Location Unavailable'
              subtitle="We couldn't determine your location. Use Search to browse photos or toggle to your bookmarks."
            />
          )}
        </ScrollView>
        <PhotosListFooter
          theme={theme}
          navigation={navigation}
          netAvailable={netAvailable}
          isCameraOpening={isCameraOpening}
          onCameraPress={checkPermissionsForPhotoTaking}
          locationReady={false}
        />
      </View>
    )
  }

  if (photosList?.length === 0 && stopLoading) {
    const emptyStateProps = isSearchActive
      ? {
          icon: 'search',
          title: `No results for '${searchTerm}'`,
          subtitle: 'Try different keywords or clear the search.',
          actionText: 'Clear Search',
          onActionPress: handleClearSearch
        }
      : isBookmarksMode
        ? {
            icon: 'bookmark',
            title: 'No Bookmarks Yet',
            subtitle: 'Start building your collection! Bookmark content you love.',
            actionText: 'Discover Content',
            onActionPress: () => {
              setIsBookmarksMode(false)
            }
          }
        : {
            icon: 'globe',
            title: 'No Photos in Your Area',
            subtitle: "Be the first to share a moment! Take a photo and let others discover what's happening around you.",
            actionText: 'Refresh',
            onActionPress: () => reload(),
            secondaryActionText: 'Take a Photo',
            onSecondaryActionPress: () => checkPermissionsForPhotoTaking({ cameraType: 'camera' })
          }

    return (
      <View style={{ flex: 1, backgroundColor: theme.HEADER_BACKGROUND }}>
        {renderHeader()}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            justifyContent: 'center',
            paddingHorizontal: 20,
            paddingBottom: FOOTER_HEIGHT + 80
          }}
          showsVerticalScrollIndicator
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={reload}
            />
          }
        >
          <EmptyStateCard {...emptyStateProps} />
        </ScrollView>
        <FeedModeToggleFAB
          footerHeight={FOOTER_HEIGHT}
          theme={theme}
        />
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
          isCameraOpening={isCameraOpening}
          onCameraPress={checkPermissionsForPhotoTaking}
          locationReady={!!location}
        />
      </View>
    )
  }

  // Loading state — no photos yet
  return (
    <View style={{ flex: 1, backgroundColor: theme.HEADER_BACKGROUND }}>
      {renderHeader()}
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
      </ScrollView>
      <FeedModeToggleFAB
        footerHeight={FOOTER_HEIGHT}
        theme={theme}
        onPress={() => reload()}
      />
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
        isCameraOpening={isCameraOpening}
        onCameraPress={checkPermissionsForPhotoTaking}
        locationReady={!!location}
      />
      <QuickActionsModalWrapper
        ref={quickActionsRef}
        onPhotoDeleted={(photoId) => {
          setPhotosList((currentList) => currentList.filter((p) => p.id !== photoId))
        }}
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
