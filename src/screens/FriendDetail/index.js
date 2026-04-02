import React, { useEffect, useState, useCallback, useMemo, useImperativeHandle } from 'react'
import {
  View,
  StyleSheet,
  Alert,
  useWindowDimensions
} from 'react-native'
import { useAtom, useSetAtom } from 'jotai'
import Toast from 'react-native-toast-message'
import { router, useLocalSearchParams } from 'expo-router'
import * as Haptics from 'expo-haptics'
import * as Crypto from 'expo-crypto'

import * as STATE from '../../state'
import LinearProgress from '../../components/ui/LinearProgress'
import * as CONST from '../../consts'
import { getTheme } from '../../theme/sharedStyles'
import * as reducer from './reducer'
import { saveFriendFeedSortPreferences } from '../../utils/waveStorage'
import EmptyStateCard from '../../components/EmptyStateCard'
import PhotosListMasonry from '../PhotosList/components/PhotosListMasonry'
import useToastTopOffset from '../../hooks/useToastTopOffset'
import InteractionHintBanner from '../../components/ui/InteractionHintBanner'
import {
  createFrozenPhoto
} from '../../utils/photoListHelpers'
import usePhotoExpansion from '../PhotosList/hooks/usePhotoExpansion'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ActionMenu from '../../components/ActionMenu'
import NamePicker from '../../components/NamePicker'
import * as friendsHelper from '../FriendsList/friends_helper'

const FriendDetail = React.forwardRef((_props, ref) => {
  const { friendUuid, friendName: initialFriendName, friendshipUuid } = useLocalSearchParams()
  const [uuid] = useAtom(STATE.uuid)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const [friendFeedSortBy] = useAtom(STATE.friendFeedSortBy)
  const [friendFeedSortDirection] = useAtom(STATE.friendFeedSortDirection)
  const setFriendFeedSortBy = useSetAtom(STATE.friendFeedSortBy)
  const setFriendFeedSortDirection = useSetAtom(STATE.friendFeedSortDirection)

  const [friendName, setFriendName] = useState(initialFriendName || 'Friend')
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(false)
  const [stopLoading, setStopLoading] = useState(false)
  const [pageNumber, setPageNumber] = useState(0)
  const [batch, setBatch] = useState(Crypto.randomUUID())
  const [noMoreData, setNoMoreData] = useState(false)
  const [netAvailable] = useAtom(STATE.netAvailable)

  // Menu state
  const [menuVisible, setMenuVisible] = useState(false)
  const [showNamePicker, setShowNamePicker] = useState(false)

  const { width, height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const theme = getTheme(isDarkMode)
  const toastTopOffset = useToastTopOffset()

  // Bookmarked-layout segment config (same as WaveDetail)
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

  const handlePhotoLongPress = useCallback((photo) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }, [])

  const loadPhotos = useCallback(async (pageNum, currentBatch, refresh = false) => {
    if (loading) return
    setLoading(true)
    try {
      const data = await reducer.fetchFriendPhotos({
        uuid,
        friendUuid,
        pageNumber: pageNum,
        batch: currentBatch,
        sortBy: friendFeedSortBy,
        sortDirection: friendFeedSortDirection
      })

      const frozenPhotos = data.photos.map(createFrozenPhoto)

      if (refresh) {
        setPhotos(frozenPhotos)
      } else {
        setPhotos(prev => [...prev, ...frozenPhotos])
      }

      setNoMoreData(data.noMoreData)
      setBatch(data.batch)
      if (data.noMoreData || frozenPhotos.length === 0) {
        setStopLoading(true)
      }
    } catch (error) {
      console.error(error)
      Toast.show({ type: 'error', text1: 'Error loading photos', text2: error.message })
    } finally {
      setLoading(false)
    }
  }, [uuid, friendUuid, friendFeedSortBy, friendFeedSortDirection])

  useEffect(() => {
    setPageNumber(0)
    setStopLoading(false)
    setNoMoreData(false)
    setExpandedPhotoIds(new Set())
    const newBatch = Crypto.randomUUID()
    setBatch(newBatch)
    loadPhotos(0, newBatch, true)
  }, [friendUuid, friendFeedSortBy, friendFeedSortDirection])

  const handleRefresh = () => {
    setPageNumber(0)
    setStopLoading(false)
    const newBatch = Crypto.randomUUID()
    setBatch(newBatch)
    loadPhotos(0, newBatch, true)
  }

  const handleLoadMore = () => {
    if (!noMoreData && !loading) {
      const nextPage = pageNumber + 1
      setPageNumber(nextPage)
      loadPhotos(nextPage, batch)
    }
  }

  const showHeaderMenu = () => {
    setMenuVisible(true)
  }

  const handleRemoveFriend = () => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${friendName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await friendsHelper.deleteFriendship({ friendshipUuid })
              Toast.show({ type: 'success', text1: 'Friend removed', topOffset: toastTopOffset })
              router.back()
            } catch (error) {
              console.error(error)
              Toast.show({ type: 'error', text1: 'Error removing friend', text2: error.message })
            }
          }
        }
      ]
    )
  }

  const setContactName = async (name) => {
    await friendsHelper.addFriendshipLocally({ friendshipUuid, contactName: name })
    setFriendName(name)
    router.setParams({ friendName: name })
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

  useImperativeHandle(ref, () => ({
    showHeaderMenu
  }), [friendName])

  if (!netAvailable) {
    return (
      <View style={[styles.container, { backgroundColor: theme.INTERACTIVE_BACKGROUND, justifyContent: 'center', paddingHorizontal: 20 }]}>
        <EmptyStateCard
          icon='wifi-off'
          iconType='MaterialIcons'
          title='No Internet Connection'
          subtitle='Friend photos require an internet connection. Please check your connection and try again.'
        />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.INTERACTIVE_BACKGROUND }]}>
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

      {photos.length === 0 && !loading
        ? (
          <EmptyStateCard
            icon='images'
            iconType='FontAwesome5'
            title='No Photos Yet'
            subtitle='No shared photos from this friend yet.'
            iconColor={theme.TEXT_PRIMARY}
          />
          )
        : (
          <>
            <InteractionHintBanner hasContent={photos?.length > 0} />
            <PhotosListMasonry
              activeSegment={1}
              photosList={photos}
              segmentConfig={segmentConfig}
              onScroll={handleScroll}
              masonryRef={masonryRef}
              getCalculatedDimensions={getCalculatedDimensions}
              isPhotoExpanded={isPhotoExpanded}
              uuid={uuid}
              expandedPhotoIds={expandedPhotoIds}
              onToggleExpand={handlePhotoToggle}
              updatePhotoHeight={updatePhotoHeight}
              onRequestEnsureVisible={ensureItemVisible}
              onEndReached={handleLoadMore}
              onRefresh={handleRefresh}
              loading={loading}
              stopLoading={stopLoading}
              setPageNumber={setPageNumber}
              setExpandedPhotoIds={setExpandedPhotoIds}
              reload={handleRefresh}
              styles={{}}
              FOOTER_HEIGHT={0}
              justCollapsedId={justCollapsedId}
              onPhotoLongPress={handlePhotoLongPress}
              theme={theme}
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
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})

export default FriendDetail
