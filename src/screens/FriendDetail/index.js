import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity
} from 'react-native'
import { useAtom, useSetAtom } from 'jotai'
import { showSuccessToast } from '../../utils/showToast'
import showErrorToast from '../../utils/showErrorToast'
import showConfirmAlert from '../../utils/showConfirmAlert'
import { router, useLocalSearchParams } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import * as STATE from '../../state'
import { getTheme, SHARED_STYLES } from '../../theme/sharedStyles'
import { BOOKMARK_LAYOUT_CONFIG } from '../../consts'
import * as reducer from './reducer'
import { saveFriendFeedSortPreferences } from '../../utils/waveStorage'
import EmptyStateCard from '../../components/EmptyStateCard'
import PhotosListMasonry from '../../components/PhotosListMasonry'
import useToastTopOffset from '../../hooks/useToastTopOffset'
import InteractionHintBanner from '../../components/ui/InteractionHintBanner'
import { createFrozenPhoto } from '../../utils/photoListHelpers'
import useFeedLoader from '../../hooks/useFeedLoader'
import usePhotoExpansion from '../../hooks/usePhotoExpansion'
import ActionMenu from '../../components/ActionMenu'
import NamePicker from '../../components/NamePicker'
import * as friendsHelper from '../FriendsList/friends_helper'
import AppHeader from '../../components/AppHeader'
import QuickActionsModalWrapper from '../../components/QuickActionsModalWrapper'

const FriendDetail = () => {
  const { friendUuid, friendName: initialFriendName, friendshipUuid } = useLocalSearchParams()
  const [uuid] = useAtom(STATE.uuid)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const [friendFeedSortBy] = useAtom(STATE.friendFeedSortBy)
  const [friendFeedSortDirection] = useAtom(STATE.friendFeedSortDirection)
  const setFriendFeedSortBy = useSetAtom(STATE.friendFeedSortBy)
  const setFriendFeedSortDirection = useSetAtom(STATE.friendFeedSortDirection)

  const [friendName, setFriendName] = useState(initialFriendName || 'Friend')
  const [netAvailable] = useAtom(STATE.netAvailable)

  // --- Feed loader hook ---
  const {
    photosList,
    setPhotosList,
    loading,
    stopLoading,
    reload: feedReload,
    handleLoadMore: feedHandleLoadMore
  } = useFeedLoader(async (fetchParams) => {
    const data = await reducer.fetchFriendPhotos({
      uuid,
      friendUuid,
      pageNumber: fetchParams.pageNumber,
      batch: fetchParams.batch,
      sortBy: friendFeedSortBy,
      sortDirection: friendFeedSortDirection
    })
    return {
      photos: data.photos.map(createFrozenPhoto),
      batch: data.batch,
      noMoreData: data.noMoreData
    }
  }, { subscribeToUploads: false })

  // Menu state
  const [menuVisible, setMenuVisible] = useState(false)
  const [showNamePicker, setShowNamePicker] = useState(false)

  const theme = getTheme(isDarkMode)
  const toastTopOffset = useToastTopOffset()

  // Bookmarked-layout segment config (same as WaveDetail)
  const segmentConfig = BOOKMARK_LAYOUT_CONFIG

  const {
    masonryRef,
    expandedItemIds,
    getExpandedHeight,
    toggleExpand
  } = usePhotoExpansion()

  const quickActionsRef = useRef(null)

  const removePhoto = useCallback((photoId) => {
    setPhotosList((currentList) => currentList.filter((p) => p.id !== photoId))
  }, [])

  const handlePhotoLongPress = useCallback((photo) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    quickActionsRef.current?.open(photo)
  }, [])

  const getFetchParams = useCallback(() => ({
    uuid,
    netAvailable
  }), [uuid, netAvailable])

  const reload = useCallback(async () => {
    await feedReload(getFetchParams())
  }, [feedReload, getFetchParams])

  // Trigger initial reload on mount
  useEffect(() => {
    reload()
  }, [reload])

  const handleLoadMore = useCallback(() => {
    feedHandleLoadMore(getFetchParams())
  }, [feedHandleLoadMore, getFetchParams])

  const showHeaderMenu = () => {
    setMenuVisible(true)
  }

  const handleRemoveFriend = () => {
    showConfirmAlert(
      'Remove Friend',
      `Are you sure you want to remove ${friendName}?`,
      async () => {
        try {
          await friendsHelper.deleteFriendship({ friendshipUuid })
          showSuccessToast('Friend removed', { topOffset: toastTopOffset })
          router.back()
        } catch (error) {
          console.error(error)
          showErrorToast({ title: 'Error removing friend', message: error.message })
        }
      },
      { destructiveText: 'Remove' }
    )
  }

  const setContactName = async ({ contactName }) => {
    await friendsHelper.addFriendshipLocally({ friendshipUuid, contactName })
    setFriendName(contactName)
    router.setParams({ friendName: contactName })
  }

  const feedSortOptions = [
    { label: 'Updated, Newest First', sortBy: 'updatedAt', sortDirection: 'desc', icon: 'sort-descending' },
    { label: 'Updated, Oldest First', sortBy: 'updatedAt', sortDirection: 'asc', icon: 'sort-ascending' },
    { label: 'Created, Newest First', sortBy: 'createdAt', sortDirection: 'desc', icon: 'sort-descending' },
    { label: 'Created, Oldest First', sortBy: 'createdAt', sortDirection: 'asc', icon: 'sort-ascending' }
  ]

  const headerMenuItems = [
    {
      key: 'edit-name',
      icon: 'pencil-outline',
      label: 'Edit Name',
      onPress: () => setShowNamePicker(true)
    },
    'separator',
    {
      key: 'remove',
      icon: 'trash-can-outline',
      label: 'Remove Friend',
      destructive: true,
      onPress: handleRemoveFriend
    },
    'separator',
    ...feedSortOptions.map((opt, i) => ({
      key: `feed-sort-${i}`,
      icon: opt.icon,
      label: opt.label,
      checked: opt.sortBy === friendFeedSortBy && opt.sortDirection === friendFeedSortDirection,
      onPress: () => {
        if (opt.sortBy !== friendFeedSortBy || opt.sortDirection !== friendFeedSortDirection) {
          setFriendFeedSortBy(opt.sortBy)
          setFriendFeedSortDirection(opt.sortDirection)
          saveFriendFeedSortPreferences({ sortBy: opt.sortBy, sortDirection: opt.sortDirection })
        }
      }
    }))
  ]

  const headerRightSlot = (
    <TouchableOpacity
      onPress={showHeaderMenu}
      style={[
        SHARED_STYLES.interactive.headerButton,
        {
          backgroundColor: theme.INTERACTIVE_BACKGROUND,
          borderWidth: 1,
          borderColor: theme.INTERACTIVE_BORDER
        }
      ]}
    >
      <MaterialCommunityIcons name='dots-vertical' size={22} color={theme.TEXT_PRIMARY} />
    </TouchableOpacity>
  )

  if (!netAvailable) {
    return (
      <View style={[styles.container, { backgroundColor: theme.INTERACTIVE_BACKGROUND }]}>
        <AppHeader
          title={String(friendName || 'Friend')}
          onBack={() => router.back()}
          rightSlot={headerRightSlot}
          loading={loading}
        />
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20 }}>
          <EmptyStateCard
            icon='wifi-off'
            iconType='MaterialIcons'
            title='No Internet Connection'
            subtitle='Friend photos require an internet connection. Please check your connection and try again.'
          />
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.INTERACTIVE_BACKGROUND }]}>
      <AppHeader
        title={String(friendName || 'Friend')}
        onBack={() => router.back()}
        rightSlot={headerRightSlot}
        loading={loading}
      />

      {photosList.length === 0 && !loading
        ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20 }}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={reload}
              />
            }
          >
            <EmptyStateCard
              icon='images'
              iconType='FontAwesome5'
              title='No Photos Yet'
              subtitle='No shared photos from this friend yet.'
              iconColor={theme.TEXT_PRIMARY}
              actionText='Refresh'
              onActionPress={reload}
            />
          </ScrollView>
          )
        : (
          <>
            <InteractionHintBanner hasContent={photosList?.length > 0} />
            <PhotosListMasonry
              activeSegment={1}
              photosList={photosList}
              segmentConfig={segmentConfig}
              columns={{ 402: 2, 440: 3, 834: 5, 1024: 7, default: 9 }}
              masonryRef={masonryRef}
              uuid={uuid}
              onEndReached={handleLoadMore}
              onRefresh={reload}
              loading={loading}
              stopLoading={stopLoading}
              reload={reload}
              styles={{}}
              FOOTER_HEIGHT={0}
              onPhotoLongPress={handlePhotoLongPress}
              theme={theme}
              removePhoto={removePhoto}
              expandedItemIds={expandedItemIds}
              getExpandedHeight={getExpandedHeight}
              toggleExpand={toggleExpand}
            />
          </>
          )}

      <NamePicker
        show={showNamePicker}
        setShow={setShowNamePicker}
        setContactName={setContactName}
        headerText='Edit Friend Name'
        friendshipUuid={friendshipUuid}
      />

      <ActionMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        items={headerMenuItems}
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

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})

export default FriendDetail
