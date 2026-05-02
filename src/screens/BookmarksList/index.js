import { useAtom, useAtomValue } from 'jotai'
import React, { useCallback, useContext, useMemo, useState } from 'react'

import {
  RefreshControl,
  ScrollView,
  Text,
  useWindowDimensions,
  View
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { router, useNavigation } from 'expo-router'

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
import { subscribeToIdentityChange } from '../../events/identityChangeBus'

const FOOTER_HEIGHT = 90

const BookmarksList = () => {
  const [uuid] = useAtom(STATE.uuid)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const [netAvailable] = useAtom(STATE.netAvailable)
  const theme = getTheme(isDarkMode)

  const headerTitle = (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Ionicons name='bookmark' size={18} color={theme.TEXT_PRIMARY} style={{ marginRight: 6 }} />
      <Text style={{ color: theme.TEXT_PRIMARY, fontSize: 16, fontWeight: '600' }}>Bookmarks</Text>
    </View>
  )

  const navigation = useNavigation()
  const locationState = useAtomValue(STATE.locationAtom)
  const { enqueueCapture } = useContext(UploadContext)
  const { isCameraOpening, checkPermissionsForPhotoTaking } = useCameraCapture({
    enqueueCapture,
    toastTopOffset: 100
  })

  const { width } = useWindowDimensions()

  // Bookmarks layout config — larger tiles, square aspect ratios
  const segmentConfig = useMemo(() => {
    return {
      spacing: 8,
      baseHeight: 200,
      aspectRatioFallbacks: [1.0]
    }
  }, [])

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
    masonryRef,
    expandedItemIds,
    getExpandedHeight,
    toggleExpand,
    updateExpandedHeight
  } = usePhotoExpansion()

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
    onBeforeSearch: () => {}
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

  // Reload when identity is attached or detached
  React.useEffect(() => {
    const unsubscribe = subscribeToIdentityChange(() => {
      reload()
    })
    return unsubscribe
  }, [reload])

  const photosListContextValue = useMemo(() => ({ removePhoto }), [removePhoto])

  const handleBack = useCallback(() => {
    router.back()
  }, [])

  // Offline state
  if (!netAvailable) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.HEADER_BACKGROUND }}>
        <AppHeader title={headerTitle} onBack={handleBack} loading={loading} />
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
          <AppHeader title={headerTitle} onBack={handleBack} loading={loading} />
          <View style={{ flex: 1, backgroundColor: theme.INTERACTIVE_BACKGROUND }}>
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
              styles={{}}
              FOOTER_HEIGHT={FOOTER_HEIGHT}
              onPhotoLongPress={handlePhotoLongPress}
              theme={theme}
              removePhoto={removePhoto}
              expandedItemIds={expandedItemIds}
              getExpandedHeight={getExpandedHeight}
              toggleExpand={toggleExpand}
              updateExpandedHeight={updateExpandedHeight}
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
        <AppHeader title={headerTitle} onBack={handleBack} loading={loading} />
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
          locationReady={locationState.status === 'ready'}
        />
      </View>
    )
  }

  // Loading state
  return (
    <View style={{ flex: 1, backgroundColor: theme.HEADER_BACKGROUND }}>
      <AppHeader title={headerTitle} onBack={handleBack} loading={loading} />
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
