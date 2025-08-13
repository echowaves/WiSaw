import { useNavigation } from '@react-navigation/native'
import { router } from 'expo-router'
import { useAtom } from 'jotai'
import { memo, useCallback, useEffect, useRef, useState } from 'react'

import * as Haptics from 'expo-haptics'

import {
  Alert,
  Animated,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import { PanGestureHandler, State } from 'react-native-gesture-handler'
import Toast from 'react-native-toast-message'

import { FontAwesome5 } from '@expo/vector-icons'

import * as CONST from '../../consts'
import * as STATE from '../../state'

import NamePicker from '../../components/NamePicker'
import ShareFriendNameModal from '../../components/ShareFriendNameModal'
import ShareOptionsModal from '../../components/ShareOptionsModal'
import { SHARED_STYLES } from '../../theme/sharedStyles'
import * as friendsHelper from './friends_helper'

const styles = StyleSheet.create({
  container: {
    ...SHARED_STYLES.containers.main,
    backgroundColor: SHARED_STYLES.theme.BACKGROUND,
  },
  friendItem: {
    backgroundColor: SHARED_STYLES.theme.CARD_BACKGROUND,
    flex: 1,
  },
  friendContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flex: 1,
  },
  friendHeader: {
    ...SHARED_STYLES.layout.spaceBetween,
  },
  friendInfo: {
    marginRight: 12,
    flex: 1,
  },
  friendName: {
    ...SHARED_STYLES.text.subheading,
    fontSize: 16,
    marginBottom: 4,
  },
  friendStatus: {
    ...SHARED_STYLES.text.secondary,
    fontSize: 14,
  },
  pendingStatus: {
    fontSize: 14,
    color: CONST.MAIN_COLOR,
    fontWeight: '500',
  },

  pendingShareButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 0,
    borderRadius: 8,
    backgroundColor: SHARED_STYLES.theme.INTERACTIVE_SECONDARY,
    elevation: 15,
    zIndex: 15,
    shadowColor: CONST.MAIN_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: SHARED_STYLES.theme.INTERACTIVE_BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    minHeight: 36,
  },
  pendingShareButtonText: {
    color: CONST.MAIN_COLOR,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    ...SHARED_STYLES.text.heading,
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateDescription: {
    ...SHARED_STYLES.text.secondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  addFriendButton: {
    backgroundColor: CONST.MAIN_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addFriendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  shareButtonContainer: {
    marginTop: 8,
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  pendingDeleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 0,
    borderRadius: 8,
    backgroundColor: SHARED_STYLES.theme.STATUS_ERROR_BACKGROUND,
    elevation: 15,
    zIndex: 15,
    shadowColor: SHARED_STYLES.theme.STATUS_ERROR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: SHARED_STYLES.theme.STATUS_ERROR_BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    minHeight: 36,
  },
  pendingDeleteButtonText: {
    color: SHARED_STYLES.theme.STATUS_ERROR,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  swipeAction: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    width: 240, // Increased width to fit 3 actions
  },
  rightSwipeAction: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    width: 160, // 2 actions = 160px
  },
  leftSwipeAction: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    width: 80, // 1 action = 80px
  },
  swipeActionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: '100%',
  },
  shareAction: {
    backgroundColor: SHARED_STYLES.theme.STATUS_SUCCESS,
  },
  editAction: {
    backgroundColor: SHARED_STYLES.theme.STATUS_SUCCESS,
  },
  deleteAction: {
    backgroundColor: SHARED_STYLES.theme.STATUS_ERROR,
  },
  swipeActionText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  friendItemContainer: {
    ...SHARED_STYLES.containers.card,
    marginHorizontal: 16,
    marginVertical: 4,
    overflow: 'hidden',
    borderRadius: 12,
    padding: 0, // Override the default padding from shared card style
    elevation: 2,
  },
})

const FriendsList = () => {
  const navigation = useNavigation()

  const [uuid] = useAtom(STATE.uuid)
  const [friendsList, setFriendsList] = useAtom(STATE.friendsList)
  const [triggerAddFriend, setTriggerAddFriend] = useAtom(
    STATE.triggerAddFriend,
  )

  const headerText =
    'Choose a friendly name to help you remember this person when chatting or sharing content.'

  const [showNamePicker, setShowNamePicker] = useState(false)
  const [selectedFriendshipUuid, setSelectedFriendshipUuid] = useState(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareModalData, setShareModalData] = useState(null)
  const [showShareNameModal, setShowShareNameModal] = useState(false)
  const [shareNameModalData, setShareNameModalData] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleAddFriend = async () => {
    setSelectedFriendshipUuid(null) // make sure we are adding a new friend
    setShowNamePicker(true)
  }

  // Handle external trigger for adding friends from header
  useEffect(() => {
    if (triggerAddFriend) {
      handleAddFriend()
      setTriggerAddFriend(false)
    }
  }, [triggerAddFriend, setTriggerAddFriend])

  const handleShareFriend = async ({
    friendshipUuid,
    contactName,
    isPending = true,
  }) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      if (isPending) {
        // Share friendship invitation for pending friends
        setShareModalData({
          friendshipUuid,
          friendName: contactName,
          isPending,
        })
        setShowShareModal(true)
      } else {
        // Share friend name for confirmed friends
        setShareNameModalData({
          friendshipUuid,
          friendName: contactName,
        })
        setShowShareNameModal(true)
      }
    } catch (error) {
      console.error('Error opening share modal:', error)
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Error',
        text2: 'Unable to open sharing options',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 60,
      })
    }
  }

  const handleRemoveFriend = async ({ friendshipUuid }) => {
    try {
      const success = await friendsHelper.removeFriend({
        uuid,
        friendshipUuid,
      })
      if (success) {
        Toast.show({
          type: 'success',
          position: 'top',
          text1: 'Friend removed',
          visibilityTime: 2000,
          autoHide: true,
          topOffset: 60,
        })
        // need to re-load friendships from local storage
        const newFriendsList = await friendsHelper.getEnhancedListOfFriendships(
          {
            uuid,
          },
        )
        setFriendsList(newFriendsList)
      } else {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Error removing friend',
          text2: 'Please try again',
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 60,
        })
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Error removing friend:', error)
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Error removing friend',
        text2: 'Please try again',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 60,
      })
    }
  }

  const handleDeletePendingFriend = async ({ friendshipUuid, contactName }) => {
    Alert.alert(
      'Remove Pending Friend',
      `Are you sure you want to remove the pending friendship with ${contactName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => handleRemoveFriend({ friendshipUuid }),
        },
      ],
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
          autoShare: false, // Don't auto-share, user can share manually later
        })

        if (!friendship) {
          throw new Error('Failed to create friendship on server')
        }

        actualFriendshipUuid = friendship.friendshipUuid
      }

      // Save/update the contact name locally (for both new and existing friendships)
      // eslint-disable-next-line no-console
      console.log(
        `Saving contact name "${contactName}" for friendship ${actualFriendshipUuid}`,
      )

      await friendsHelper.setContactName({
        uuid,
        friendshipUuid: actualFriendshipUuid,
        contactName,
      })

      // reload friendships from server
      const newFriendsList = await friendsHelper.getEnhancedListOfFriendships({
        uuid,
      })
      setFriendsList(newFriendsList)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error in setContactName:', error)
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Error saving friend name',
        text2: 'Please try again',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 60,
      })
    }
  }

  const reload = useCallback(async () => {
    try {
      const newFriendsList = await friendsHelper.getEnhancedListOfFriendships({
        uuid,
      })
      setFriendsList(newFriendsList)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Error loading friendships:', error)
    }
  }, [uuid, setFriendsList])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const newFriendsList = await friendsHelper.getEnhancedListOfFriendships({
        uuid,
      })
      setFriendsList(newFriendsList)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Error refreshing friendships:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [uuid, setFriendsList])

  useEffect(() => {
    // Only load friendships when uuid is properly initialized
    if (uuid && uuid !== '') {
      reload()
    }
  }, [uuid, reload])

  const FriendItem = memo(({ friend }) => {
    const translateX = useRef(new Animated.Value(0)).current
    const [isSwipeOpen, setIsSwipeOpen] = useState(false)
    const [swipeDirection, setSwipeDirection] = useState(null) // 'left' or 'right'

    const displayName = friend?.contact || 'Unnamed Friend'
    const isPending = friend.uuid2 === null
    const hasUnread = friend.unreadCount > 0

    const handleSwipeGesture = (event) => {
      if (isPending) return // Don't allow swipe for pending friends

      const { translationX, state } = event.nativeEvent

      if (state === State.ACTIVE) {
        // Allow swipe in both directions
        if (translationX > 0) {
          // Swipe right - show share and edit actions
          const clampedTranslation = Math.min(translationX, 160) // 2 actions = 160px
          translateX.setValue(clampedTranslation)
        } else if (translationX < 0) {
          // Swipe left - show delete action
          const clampedTranslation = Math.max(translationX, -80) // 1 action = 80px
          translateX.setValue(clampedTranslation)
        }
      } else if (state === State.END || state === State.CANCELLED) {
        // Determine if swipe should be open or closed
        if (translationX > 80) {
          // Open right swipe action (share/edit)
          Animated.spring(translateX, {
            toValue: 160,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start()
          setIsSwipeOpen(true)
          setSwipeDirection('right')
        } else if (translationX < -40) {
          // Open left swipe action (delete)
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start()
          setIsSwipeOpen(true)
          setSwipeDirection('left')
        } else {
          // Close the swipe action
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start()
          setIsSwipeOpen(false)
          setSwipeDirection(null)
        }
      }
    }

    const closeSwipe = () => {
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start()
      setIsSwipeOpen(false)
      setSwipeDirection(null)
    }

    const handleShareName = () => {
      closeSwipe()
      handleShareFriend({
        friendshipUuid: friend.friendshipUuid,
        contactName: displayName,
        isPending: false,
      })
    }

    const handleEditFriend = () => {
      closeSwipe()
      setSelectedFriendshipUuid(friend.friendshipUuid)
      setShowNamePicker(true)
    }

    const handleDeleteFriend = () => {
      closeSwipe()
      Alert.alert(
        'Remove Friend',
        `Are you sure you want to remove ${displayName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () =>
              handleRemoveFriend({ friendshipUuid: friend.friendshipUuid }),
          },
        ],
      )
    }

    return (
      <View style={styles.friendItemContainer}>
        {/* Right Swipe Action Background - Share and Edit */}
        {!isPending && swipeDirection === 'right' && (
          <View style={styles.rightSwipeAction}>
            <TouchableOpacity
              style={[styles.swipeActionButton, styles.shareAction]}
              onPress={handleShareName}
              activeOpacity={0.7}
            >
              <FontAwesome5 name="share-alt" size={18} color="white" />
              <Text style={styles.swipeActionText}>Share{'\n'}Name</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.swipeActionButton, styles.editAction]}
              onPress={handleEditFriend}
              activeOpacity={0.7}
            >
              <FontAwesome5 name="edit" size={18} color="white" />
              <Text style={styles.swipeActionText}>Edit{'\n'}Name</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Left Swipe Action Background - Delete */}
        {!isPending && swipeDirection === 'left' && (
          <View style={styles.leftSwipeAction}>
            <TouchableOpacity
              style={[styles.swipeActionButton, styles.deleteAction]}
              onPress={handleDeleteFriend}
              activeOpacity={0.7}
            >
              <FontAwesome5 name="trash" size={18} color="white" />
              <Text style={styles.swipeActionText}>Delete{'\n'}Friend</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main Friend Item */}
        <PanGestureHandler
          onHandlerStateChange={handleSwipeGesture}
          enabled={!isPending}
          activeOffsetX={[-20, 20]}
          failOffsetY={[-20, 20]}
          shouldCancelWhenOutside={true}
        >
          <Animated.View
            style={[
              styles.friendItem,
              {
                transform: [{ translateX }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.friendContent}
              onPress={() => {
                if (isSwipeOpen) {
                  closeSwipe()
                  return
                }

                if (!isPending) {
                  router.push({
                    pathname: '/chat',
                    params: {
                      chatUuid: friend?.chatUuid,
                      contact: JSON.stringify(friend?.contact),
                      friendshipUuid: friend?.friendshipUuid,
                    },
                  })
                }
              }}
              onLongPress={() => {
                if (isSwipeOpen) {
                  closeSwipe()
                  return
                }

                // Only allow long press for pending friends to share friendship request
                if (isPending) {
                  Haptics.selectionAsync()
                  handleShareFriend({
                    friendshipUuid: friend.friendshipUuid,
                    contactName: displayName,
                    isPending: true,
                  })
                }
              }}
              disabled={isPending}
              activeOpacity={isPending ? 1 : 0.7}
            >
              <View style={styles.friendHeader}>
                <View style={styles.friendInfo}>
                  <Text
                    style={styles.friendName}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {displayName}
                  </Text>
                  {isPending ? (
                    <>
                      <View
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                      >
                        <FontAwesome5
                          name="clock"
                          size={12}
                          color={CONST.MAIN_COLOR}
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.pendingStatus}>
                          Waiting for confirmation
                        </Text>
                      </View>
                      {/* Share and Delete buttons container */}
                      <View style={styles.shareButtonContainer}>
                        <TouchableOpacity
                          style={[styles.pendingShareButton]}
                          onPress={() =>
                            handleShareFriend({
                              friendshipUuid: friend.friendshipUuid,
                              contactName: displayName,
                              isPending: true,
                            })
                          }
                          activeOpacity={0.5}
                          delayPressIn={0}
                          delayPressOut={0}
                          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                          pressRetentionOffset={{
                            top: 20,
                            bottom: 20,
                            left: 20,
                            right: 20,
                          }}
                          importantForAccessibility="yes"
                        >
                          <FontAwesome5
                            name="share-alt"
                            size={12}
                            color={CONST.MAIN_COLOR}
                          />
                          <Text style={styles.pendingShareButtonText}>
                            Share
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.pendingDeleteButton]}
                          onPress={() =>
                            handleDeletePendingFriend({
                              friendshipUuid: friend.friendshipUuid,
                              contactName: displayName,
                            })
                          }
                          activeOpacity={0.5}
                          delayPressIn={0}
                          delayPressOut={0}
                          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                          pressRetentionOffset={{
                            top: 20,
                            bottom: 20,
                            left: 20,
                            right: 20,
                          }}
                          importantForAccessibility="yes"
                        >
                          <FontAwesome5
                            name="trash"
                            size={12}
                            color={SHARED_STYLES.theme.STATUS_ERROR}
                          />
                          <Text style={styles.pendingDeleteButtonText}>
                            Delete
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.friendStatus}>
                        {hasUnread ? `${friend.unreadCount} new messages` : ''}
                      </Text>
                    </>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </PanGestureHandler>
      </View>
    )
  })

  const renderFriend = ({ item: friend }) => {
    return <FriendItem friend={friend} />
  }

  if (!friendsList || friendsList.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
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
        <ShareFriendNameModal
          visible={showShareNameModal}
          onClose={() => setShowShareNameModal(false)}
          friendshipUuid={shareNameModalData?.friendshipUuid}
          friendName={shareNameModalData?.friendName}
          topOffset={60}
        />
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No Friends Yet</Text>
          <Text style={styles.emptyStateDescription}>
            Add your first friend to start sharing photos and chatting
            privately.
          </Text>
          <TouchableOpacity
            style={styles.addFriendButton}
            onPress={handleAddFriend}
          >
            <FontAwesome5 name="user-plus" size={16} color="white" />
            <Text style={styles.addFriendButtonText}>Add a Friend</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
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
      <ShareFriendNameModal
        visible={showShareNameModal}
        onClose={() => setShowShareNameModal(false)}
        friendshipUuid={shareNameModalData?.friendshipUuid}
        friendName={shareNameModalData?.friendName}
        topOffset={60}
      />
      <FlatList
        data={friendsList}
        renderItem={renderFriend}
        keyExtractor={(item) => item.friendshipUuid}
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={15}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: 80, // Approximate height of each friend item
          offset: 80 * index,
          index,
        })}
      />
    </SafeAreaView>
  )
}

export default FriendsList
