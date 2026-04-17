import PropTypes from 'prop-types'

import { useAtom, useSetAtom } from 'jotai'
import React, { useCallback, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'

import { useFocusEffect, useIsFocused } from '@react-navigation/native'
import { router, useNavigation } from 'expo-router'
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
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import * as Constants from 'expo-constants'
import InteractionHintBanner from '../../components/ui/InteractionHintBanner'

import { subscribeToIdentityChange } from '../../events/identityChangeBus'

import useToastTopOffset from '../../hooks/useToastTopOffset'

import * as friendsHelper from '../FriendsList/friends_helper'

import * as reducer from './reducer'
import { requestGeoPhotos } from './reducer'

import QuickActionsModal from '../../components/QuickActionsModal'

import * as STATE from '../../state'
import { getTheme } from '../../theme/sharedStyles'
import {
  validateFrozenPhotosList
} from '../../utils/photoListHelpers'

import EmptyStateCard from '../../components/EmptyStateCard'
import PhotosListFooter from './components/PhotosListFooter'
import PhotosListHeader from './components/PhotosListHeader'
import SearchFab from '../../components/SearchFab'
import PendingPhotosBanner from './components/PendingPhotosBanner'
import LocationDriftBanner from './components/LocationDriftBanner'
import PhotosListMasonry from './components/PhotosListMasonry'
import PhotosListContext from '../../contexts/PhotosListContext'
import UploadContext from '../../contexts/UploadContext'

import useCameraCapture from './hooks/useCameraCapture'
import usePendingAnimation from './hooks/usePendingAnimation'
import usePhotoExpansion from './hooks/usePhotoExpansion'
import useFeedLoader from './hooks/useFeedLoader'
import useFeedSearch from './hooks/useFeedSearch'
import haversine from '../../utils/haversine'

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
  const [uuid] = useAtom(STATE.uuid)
  const [, setFriendsList] = useAtom(STATE.friendsList)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const setUngroupedPhotosCount = useSetAtom(STATE.ungroupedPhotosCount)

  const toastTopOffset = useToastTopOffset()

  const [netAvailable] = useAtom(STATE.netAvailable)

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

  const { width, height } = useWindowDimensions()
  const insets = useSafeAreaInsets()

  const [isTandcAccepted, setIsTandcAccepted] = useState(true)
  const [zeroMoment, setZeroMoment] = useState(0)

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

  // Global feed layout config - compact masonry
  const segmentConfig = React.useMemo(() => {
    const getResponsiveColumns = (baseColumns, largeColumns) => {
      if (width >= 768) return Math.max(3, largeColumns * 1.3)
      if (width >= 428) return Math.max(3, largeColumns / 1.3)
      if (width >= 390) return Math.max(3, baseColumns / 1.3)
      return Math.max(3, baseColumns / 6)
    }

    return {
      spacing: 5,
      maxItemsPerRow: getResponsiveColumns(4, 6),
      baseHeight: 100,
      aspectRatioFallbacks: [
        0.56, 0.67, 0.75, 1.0, 1.33, 1.5, 1.78
      ]
    }
  }, [width])

  // --- Feed loader hook ---
  const {
    photosList,
    setPhotosList,
    loading,
    stopLoading,
    reload: feedReload,
    handleLoadMore: feedHandleLoadMore,
    removePhoto,
    abort: abortFeed
  } = useFeedLoader(requestGeoPhotos, {
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
    // Skip reload when location is not yet available — the locationState.status
    // effect will trigger reload once location permission resolves
    if (!location) return

    // Snapshot current location for drift comparison
    if (locationState.coords) {
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
  }, [feedReload, getFetchParams, locationState.coords, refreshPendingQueue, processPendingQueue, uuid, setFriendsList])

  const handleLoadMore = useCallback(() => {
    feedHandleLoadMore(getFetchParams())
  }, [feedHandleLoadMore, getFetchParams])

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
    masonryRef,
    justCollapsedId
  } = usePhotoExpansion({ width, height, insets, segmentConfig })

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
    onBeforeSearch: () => setExpandedPhotoIds(new Set())
  })

  const { isCameraOpening, checkPermissionsForPhotoTaking } = useCameraCapture({
    enqueueCapture,
    toastTopOffset
  })

  const { pendingPhotosAnimation, uploadIconAnimation } = usePendingAnimation({
    pendingPhotosCount: pendingPhotos.length,
    netAvailable
  })

  // Long-press handler — open quick-actions modal
  const quickActionsRef = useRef(null)

  const handlePhotoLongPress = useCallback((photo) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    quickActionsRef.current?.open(photo)
  }, [])
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

  useEffect(() => {
    if (locationState.status === 'ready') {
      reload()
    }
  }, [locationState.status])

  /// //////////////////////////////////////////////////////////////////////////
  // here where the rendering starts
  /// //////////////////////////////////////////////////////////////////////////

  const renderHeader = () => (
    <PhotosListHeader
      theme={theme}
      loading={loading}
    />
  )

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
          isCameraOpening={isCameraOpening}
          onCameraPress={checkPermissionsForPhotoTaking}
          locationReady={!!location}
        />
      </View>
    )
  }

  if (isTandcAccepted && location && photosList?.length > 0) {
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
            <PhotosListMasonry
              activeSegment={0}
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
              theme={theme}
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
              subtitle="We couldn't determine your location. Try the Bookmarks screen from the menu or use Search to browse photos."
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
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={reload}
            />
          }
        >
          <EmptyStateCard {...emptyStateProps} />
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
