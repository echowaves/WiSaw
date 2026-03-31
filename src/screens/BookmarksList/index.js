import { useAtom, useAtomValue } from 'jotai'
import React, { useCallback, useContext, useMemo, useState } from 'react'

import {
  ScrollView,
  useWindowDimensions,
  View
} from 'react-native'

import { router, useNavigation } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { requestWatchedPhotos } from '../PhotosList/reducer'

import AppHeader from '../../components/AppHeader'
import EmptyStateCard from '../../components/EmptyStateCard'
import SearchFab from '../../components/SearchFab'
import PhotosListMasonry from '../PhotosList/components/PhotosListMasonry'
import PhotosListFooter from '../PhotosList/components/PhotosListFooter'
import PhotosListContext from '../../contexts/PhotosListContext'
import UploadContext from '../../contexts/UploadContext'

import * as STATE from '../../state'
import { getTheme } from '../../theme/sharedStyles'
import {
  validateFrozenPhotosList
} from '../../utils/photoListHelpers'

import usePhotoExpansion from '../PhotosList/hooks/usePhotoExpansion'
import useFeedLoader from '../PhotosList/hooks/useFeedLoader'
import useFeedSearch from '../PhotosList/hooks/useFeedSearch'
import useCameraCapture from '../PhotosList/hooks/useCameraCapture'

import * as Haptics from 'expo-haptics'
import QuickActionsModal from '../../components/QuickActionsModal'

const FOOTER_HEIGHT = 90

const BookmarksList = () => {
  const [uuid] = useAtom(STATE.uuid)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const [netAvailable] = useAtom(STATE.netAvailable)
  const theme = getTheme(isDarkMode)

  const navigation = useNavigation()
  const locationState = useAtomValue(STATE.locationAtom)
  const { enqueueCapture } = useContext(UploadContext)
  const { isCameraOpening, checkPermissionsForPhotoTaking } = useCameraCapture({
    enqueueCapture,
    toastTopOffset: 100
  })

  const { width, height } = useWindowDimensions()
  const insets = useSafeAreaInsets()

  // Bookmarks layout config — larger tiles, square aspect ratios
  const segmentConfig = useMemo(() => {
    const getResponsiveColumns = (baseColumns, largeColumns) => {
      if (width >= 768) return Math.max(3, largeColumns * 1.3)
      if (width >= 428) return Math.max(3, largeColumns / 1.3)
      if (width >= 390) return Math.max(3, baseColumns / 1.3)
      return Math.max(3, baseColumns / 6)
    }

    return {
      spacing: 8,
      maxItemsPerRow: getResponsiveColumns(2, 4),
      baseHeight: 200,
      aspectRatioFallbacks: [1.0]
    }
  }, [width])

  // --- Feed loader hook (no upload subscription) ---
  const {
    photosList,
    setPhotosList,
    loading,
    stopLoading,
    reload: feedReload,
    handleLoadMore: feedHandleLoadMore,
    removePhoto
  } = useFeedLoader(requestWatchedPhotos, {
    subscribeToUploads: false
  })

  // eslint-disable-next-line
  if (__DEV__) {
    validateFrozenPhotosList(photosList, 'in BookmarksList render')
  }

  const getFetchParams = useCallback(() => ({
    uuid,
    netAvailable
  }), [uuid, netAvailable])

  const reload = useCallback(async (searchTermOverride = null) => {
    await feedReload(getFetchParams(), searchTermOverride)
  }, [feedReload, getFetchParams])

  const handleLoadMore = useCallback(() => {
    feedHandleLoadMore(getFetchParams())
  }, [feedHandleLoadMore, getFetchParams])

  // --- Photo expansion ---
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

  // --- Feed search ---
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
    onBeforeSearch: () => setExpandedPhotoIds(new Set())
  })

  // Long-press handler
  const [longPressPhoto, setLongPressPhoto] = useState(null)
  const handlePhotoLongPress = useCallback((photo) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setLongPressPhoto(photo)
  }, [])

  // Initial load
  React.useEffect(() => {
    if (netAvailable && uuid) {
      reload()
    }
  }, [netAvailable, uuid])

  const photosListContextValue = useMemo(() => ({ removePhoto }), [removePhoto])

  const handleBack = useCallback(() => {
    router.back()
  }, [])

  // Offline state
  if (!netAvailable) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.HEADER_BACKGROUND }}>
        <AppHeader title='Bookmarks' onBack={handleBack} />
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
            subtitle='Bookmarked content requires an internet connection.'
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
          locationReady={locationState.status === 'ready'}
        />
      </View>
    )
  }

  // Has content
  if (photosList?.length > 0) {
    return (
      <PhotosListContext.Provider value={photosListContextValue}>
        <View style={{ flex: 1, backgroundColor: theme.HEADER_BACKGROUND }}>
          <AppHeader title='Bookmarks' onBack={handleBack} />
          <View style={{ flex: 1, backgroundColor: theme.INTERACTIVE_BACKGROUND }}>
            <PhotosListMasonry
              activeSegment={1}
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
              styles={{}}
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
          <QuickActionsModal
            visible={!!longPressPhoto}
            photo={longPressPhoto}
            onClose={() => setLongPressPhoto(null)}
            onPhotoDeleted={(photoId) => {
              setPhotosList((currentList) => currentList.filter((p) => p.id !== photoId))
            }}
          />
          <PhotosListFooter
            theme={theme}
            navigation={navigation}
            netAvailable={netAvailable}
            isCameraOpening={isCameraOpening}
            onCameraPress={checkPermissionsForPhotoTaking}
            locationReady={locationState.status === 'ready'}
          />
        </View>
      </PhotosListContext.Provider>
    )
  }

  // Empty + stopped loading
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
          icon: 'bookmark',
          title: 'No Bookmarks Yet',
          subtitle: "Start building your collection! Take photos, comment on others' posts, or bookmark content you love.",
          actionText: 'Discover Content',
          onActionPress: () => router.navigate('/(drawer)/(tabs)')
        }

    return (
      <View style={{ flex: 1, backgroundColor: theme.HEADER_BACKGROUND }}>
        <AppHeader title='Bookmarks' onBack={handleBack} />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            justifyContent: 'center',
            paddingHorizontal: 20,
            paddingBottom: FOOTER_HEIGHT + 80
          }}
          showsVerticalScrollIndicator
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
          locationReady={locationState.status === 'ready'}
        />
      </View>
    )
  }

  // Loading state
  return (
    <View style={{ flex: 1, backgroundColor: theme.HEADER_BACKGROUND }}>
      <AppHeader title='Bookmarks' onBack={handleBack} />
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
        locationReady={locationState.status === 'ready'}
      />
    </View>
  )
}

export default BookmarksList
