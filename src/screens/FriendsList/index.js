import { router } from 'expo-router'
import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useDebouncedSearch from '../../hooks/useDebouncedSearch'

import * as Haptics from 'expo-haptics'

import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'

import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { KeyboardStickyView } from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { showSuccessToast, showErrorToast } from '../../utils/showToast'
import showConfirmAlert from '../../utils/showConfirmAlert'

import * as STATE from '../../state'

import ActionMenu from '../../components/ActionMenu'
import AppHeader from '../../components/AppHeader'
import EmptyStateCard from '../../components/EmptyStateCard'
import FriendCard from '../../components/FriendCard'
import FriendsExplainerView from '../../components/FriendsExplainerView'
import InteractionHintBanner from '../../components/ui/InteractionHintBanner'
import NamePicker from '../../components/NamePicker'
import PendingFriendsCard from '../../components/PendingFriendsCard'
import ShareOptionsModal from '../../components/ShareOptionsModal'
import { emitAddFriend, subscribeToAddFriend } from '../../events/friendAddBus'
import { subscribeToIdentityChange } from '../../events/identityChangeBus'
import { SHARED_STYLES, getTheme } from '../../theme/sharedStyles'
import { ScreenIconTitle } from '../../theme/screenIcons'
import * as friendsHelper from './friends_helper'

const FriendsList = () => {
  const [uuid] = useAtom(STATE.uuid)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const [friendsList, setFriendsList] = useAtom(STATE.friendsList)
  const [netAvailable] = useAtom(STATE.netAvailable)
  const theme = getTheme(isDarkMode)
  const insets = useSafeAreaInsets()
  const searchInputRef = useRef(null)

  const createStyles = (theme) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.INTERACTIVE_BACKGROUND
      },
      flatList: {
        flex: 1
      },
      searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8
      },
      searchInput: {
        flex: 1,
        height: 40,
        borderRadius: 20,
        paddingLeft: 16,
        paddingRight: 16,
        borderWidth: 1,
        fontSize: 14
      },
      clearButton: {
        position: 'absolute',
        right: 24,
        width: 22,
        height: 22,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(128,128,128,0.2)',
        borderRadius: 11
      }
    })

  const styles = createStyles(theme)

  const headerText =
    'Choose a friendly name to help you remember this person when sharing content.'

  const [showNamePicker, setShowNamePicker] = useState(false)
  const [selectedFriendshipUuid, setSelectedFriendshipUuid] = useState(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareModalData, setShareModalData] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [menuVisible, setMenuVisible] = useState(false)
  const [menuFriend, setMenuFriend] = useState(null)
  const [searchText, setSearchText] = useState('')
  const debouncedSearch = useDebouncedSearch(searchText)

  const handleAddFriend = useCallback(() => {
    setSelectedFriendshipUuid(null) // make sure we are adding a new friend
    setShowNamePicker(true)
  }, [])

  const headerRightSlot = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <TouchableOpacity
        onPress={() => emitAddFriend()}
        style={[
          SHARED_STYLES.interactive.headerButton,
          {
            backgroundColor: theme.INTERACTIVE_BACKGROUND,
            borderWidth: 1,
            borderColor: theme.INTERACTIVE_BORDER
          }
        ]}
      >
        <FontAwesome5
          name='plus'
          size={18}
          color={theme.TEXT_PRIMARY}
        />
      </TouchableOpacity>
    </View>
  )

  useEffect(() => {
    const unsubscribe = subscribeToAddFriend(() => {
      handleAddFriend()
    })

    return unsubscribe
  }, [handleAddFriend])

  const handleShareFriend = async ({ friendshipUuid, contactName }) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      setShareModalData({
        friendshipUuid,
        friendName: contactName,
        isPending: true
      })
      setShowShareModal(true)
    } catch (error) {
      console.error('Error opening share modal:', error)
      showErrorToast('Error', { text2: 'Unable to open sharing options', topOffset: 60 })
    }
  }

  const handleRemoveFriend = async ({ friendshipUuid }) => {
    try {
      const success = await friendsHelper.removeFriend({
        uuid,
        friendshipUuid
      })
      if (success) {
        showSuccessToast('Friend removed', { topOffset: 60 })
        // need to re-load friendships from local storage
        const newFriendsList = await friendsHelper.getEnhancedListOfFriendships({
          uuid
        })
        setFriendsList(newFriendsList)
      } else {
        showErrorToast('Error removing friend', { text2: 'Please try again', topOffset: 60 })
      }
    } catch (error) {
      showErrorToast('Error removing friend', { text2: 'Please try again', topOffset: 60 })
    }
  }

  const handleDeletePendingFriend = async ({ friendshipUuid, contactName }) => {
    showConfirmAlert(
      'Remove Pending Friend',
      `Are you sure you want to remove the pending friendship with ${contactName}?`,
      () => handleRemoveFriend({ friendshipUuid }),
      { destructiveText: 'Remove' }
    )
  }

  const setContactName = async ({ friendshipUuid, contactName }) => {
    try {
      let actualFriendshipUuid = friendshipUuid

      // If no friendshipUuid provided, we need to create a new friendship on the server
      if (!actualFriendshipUuid) {
        // Import the reducer to create friendship
        const reducer = await import('./reducer')

        const friendship = await reducer.createFriendship({
          uuid,
          topOffset: 0, // We don't have access to topOffset here, use 0
          contactName,
          autoShare: false // Don't auto-share, user can share manually later
        })

        if (!friendship) {
          throw new Error('Failed to create friendship on server')
        }

        actualFriendshipUuid = friendship.friendshipUuid
      }

      // Save/update the contact name locally (for both new and existing friendships)

      await friendsHelper.setContactName({
        uuid,
        friendshipUuid: actualFriendshipUuid,
        contactName
      })

      // reload friendships from server
      const newFriendsList = await friendsHelper.getEnhancedListOfFriendships({
        uuid
      })
      setFriendsList(newFriendsList)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error in setContactName:', error)
      showErrorToast('Error saving friend name', { text2: 'Please try again', topOffset: 60 })
    }
  }

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const newFriendsList = await friendsHelper.getEnhancedListOfFriendships({
        uuid
      })
      setFriendsList(newFriendsList)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }, [uuid, setFriendsList])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    setLoading(true)
    try {
      const newFriendsList = await friendsHelper.getEnhancedListOfFriendships({
        uuid
      })
      setFriendsList(newFriendsList)
    } catch (error) {
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }, [uuid, setFriendsList])

  useEffect(() => {
    const unsubscribe = subscribeToIdentityChange(() => {
      reload()
    })
    return unsubscribe
  }, [reload])

  useEffect(() => {
    // Only load friendships when uuid is properly initialized
    if (uuid && uuid !== '') {
      reload()
    }
  }, [uuid, reload])

  // --- Sort and filter logic ---
  const sortedAndFilteredFriends = useMemo(() => {
    let list = friendsList || []

    // Client-side search filter
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase()
      list = list.filter((f) => {
        const name = (f?.contact || 'Unnamed Friend').toLowerCase()
        return name.includes(term)
      })
    }

    // Partition: pending first, then confirmed
    const pending = list.filter((f) => f.uuid2 === null)
    const confirmed = list.filter((f) => f.uuid2 !== null)

    // Sort confirmed friends by most recent photo updatedAt desc (newest first)
    // Fallback to friendship createdAt when no photos or no updatedAt available
    const getLatestActivityTime = (friendship) => {
      if (friendship?.photos?.[0]?.updatedAt) {
        return new Date(friendship.photos[0].updatedAt).getTime()
      }
      if (friendship?.createdAt) {
        return new Date(friendship.createdAt).getTime()
      }
      return 0
    }
    const sorted = [...confirmed].sort((a, b) => {
      return getLatestActivityTime(b) - getLatestActivityTime(a)
    })

    return { pending, confirmed: sorted }
  }, [friendsList, debouncedSearch])

  const pendingFriends = sortedAndFilteredFriends.pending
  const confirmedFriends = sortedAndFilteredFriends.confirmed

  // --- ActionMenu items for selected friend ---
  const menuItems = useMemo(() => {
    if (!menuFriend) return []
    const isPending = menuFriend.uuid2 === null
    const displayName = menuFriend?.contact || 'Unnamed Friend'

    if (isPending) {
      return [
        {
          key: 'share',
          icon: 'share-outline',
          label: 'Share Link',
          onPress: () => handleShareFriend({
            friendshipUuid: menuFriend.friendshipUuid,
            contactName: displayName
          })
        },
        'separator',
        {
          key: 'cancel',
          icon: 'trash-can-outline',
          label: 'Cancel Request',
          destructive: true,
          onPress: () => handleDeletePendingFriend({
            friendshipUuid: menuFriend.friendshipUuid,
            contactName: displayName
          })
        }
      ]
    }

    return [
      {
        key: 'edit',
        icon: 'pencil-outline',
        label: 'Edit Name',
        onPress: () => {
          setSelectedFriendshipUuid(menuFriend.friendshipUuid)
          setShowNamePicker(true)
        }
      },
      'separator',
      {
        key: 'remove',
        icon: 'trash-can-outline',
        label: 'Remove Friend',
        destructive: true,
        onPress: () => {
          showConfirmAlert('Remove Friend', `Are you sure you want to remove ${displayName}?`,
            () => handleRemoveFriend({ friendshipUuid: menuFriend.friendshipUuid }),
            { destructiveText: 'Remove' }
          )
        }
      }
    ]
  }, [menuFriend])

  const openMenu = useCallback((friend) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setMenuFriend(friend)
    setMenuVisible(true)
  }, [])

  const handleFriendPress = useCallback((friend) => {
    const friendUserUuid = friend.uuid1 === uuid ? friend.uuid2 : friend.uuid1
    router.push({
      pathname: `/friendships/${friendUserUuid}`,
      params: {
        friendUuid: friendUserUuid,
        friendName: friend?.contact || 'Unnamed Friend',
        friendshipUuid: friend.friendshipUuid
      }
    })
  }, [uuid])

  const handleRemindPending = useCallback((friend) => {
    const displayName = friend?.contact || 'Unnamed Friend'
    handleShareFriend({
      friendshipUuid: friend.friendshipUuid,
      contactName: displayName
    })
  }, [])

  const renderFriend = ({ item: friend }) => (
    <FriendCard
      friend={friend}
      onPress={handleFriendPress}
      onLongPress={openMenu}
      theme={theme}
    />
  )

  const hasAnyFriends = friendsList && friendsList.length > 0
  const isSearching = searchText.length > 0
  const bannerHeight = useAtomValue(STATE.bannerHeightAtom)

  if (!netAvailable) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.HEADER_BACKGROUND }}>
        <View style={{ paddingTop: bannerHeight }}>
          <AppHeader
            title={<ScreenIconTitle screenKey='friends' />}
            onBack={() => router.replace('/')}
            rightSlot={headerRightSlot}
            loading={loading}
          />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20 }}>
          <EmptyStateCard
            icon='wifi-off'
            iconType='MaterialIcons'
            title='No Internet Connection'
            subtitle='Friends list requires an internet connection. Please check your connection and try again.'
          />
        </View>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.HEADER_BACKGROUND }}>
      <View style={{ paddingTop: bannerHeight }}>
        <AppHeader
          title={<ScreenIconTitle screenKey='friends' />}
          onBack={() => router.replace('/')}
          rightSlot={headerRightSlot}
          loading={loading}
        />
      </View>
      <View style={styles.container}>
        <NamePicker
          show={showNamePicker}
          setShow={setShowNamePicker}
          setContactName={setContactName}
          headerText={headerText}
          friendshipUuid={selectedFriendshipUuid}
        />
        <ShareOptionsModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          friendshipUuid={shareModalData?.friendshipUuid}
          friendName={shareModalData?.friendName}
          uuid={uuid}
          topOffset={60}
        />
        <ActionMenu
          visible={menuVisible}
          onClose={() => {
            setMenuVisible(false)
            setMenuFriend(null)
          }}
          title={menuFriend?.contact || 'Unnamed Friend'}
          items={menuItems}
        />
        <InteractionHintBanner
          hasContent={hasAnyFriends}
          hintText='Long-press a friend for options, or tap ⋮'
        />

        <FlatList
          data={confirmedFriends}
          renderItem={renderFriend}
          keyExtractor={(item) => item.friendshipUuid}
          style={styles.flatList}
          contentContainerStyle={{
            paddingBottom: 20,
            flexGrow: 1
          }}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={15}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews
          ListHeaderComponent={
            <PendingFriendsCard
              pendingFriends={pendingFriends}
              onRemind={handleRemindPending}
              onLongPress={openMenu}
              theme={theme}
            />
          }
          ListEmptyComponent={
            !loading && (
              isSearching
                ? (
                  <EmptyStateCard
                    icon='search'
                    iconType='MaterialIcons'
                    title='No Friends Found'
                    subtitle={`No friends matching "${debouncedSearch}"`}
                    actionText='Clear Search'
                    onActionPress={() => {
                      setSearchText('')
                      if (searchInputRef.current) {
                        searchInputRef.current.clear()
                      }
                    }}
                    iconColor={theme.TEXT_PRIMARY}
                  />
                  )
                : (
                  <FriendsExplainerView
                    theme={theme}
                    onAddFriend={handleAddFriend}
                  />
                  )
            )
          }
        />

        {/* Search bar - bottom floating */}
        {(hasAnyFriends || isSearching) && (
          <KeyboardStickyView
            offset={{ closed: -(insets.bottom + 8), opened: 16 }}
          >
            <View style={styles.searchContainer}>
              <TextInput
                ref={searchInputRef}
                style={[styles.searchInput, { color: theme.TEXT_PRIMARY, backgroundColor: theme.CARD_BACKGROUND, borderColor: theme.INTERACTIVE_BORDER, paddingRight: searchText ? 36 : 16 }]}
                placeholder='Search friends...'
                placeholderTextColor={theme.TEXT_SECONDARY}
                value={searchText}
                onChangeText={setSearchText}
              />
              {searchText.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchText('')
                    if (searchInputRef.current) {
                      searchInputRef.current.clear()
                      searchInputRef.current.focus()
                    }
                  }}
                  style={styles.clearButton}
                >
                  <Ionicons name='close' size={14} color={theme.TEXT_PRIMARY} />
                </TouchableOpacity>
              )}
            </View>
          </KeyboardStickyView>
        )}
      </View>
    </View>
  )
}

export default FriendsList
