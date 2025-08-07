import { useNavigation } from '@react-navigation/native'
import { router } from 'expo-router'
import { useAtom } from 'jotai'
import { useCallback, useEffect, useRef, useState } from 'react'

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
import QRCodeModal from '../../components/QRCodeModal'
import * as friendsHelper from './friends_helper'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  friendItem: {
    backgroundColor: 'white',
    flex: 1,
  },
  friendContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flex: 1,
  },
  friendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  friendInfo: {
    marginRight: 12,
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  friendStatus: {
    fontSize: 14,
    color: '#666',
  },
  pendingStatus: {
    fontSize: 14,
    color: '#ff6b35',
    fontWeight: '500',
  },

  pendingShareButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 0,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    elevation: 15,
    zIndex: 15,
    shadowColor: '#ff6b35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    minHeight: 36,
  },
  pendingShareButtonText: {
    color: '#ff6b35',
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#666',
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
    backgroundColor: 'rgba(220, 53, 69, 0.15)',
    elevation: 15,
    zIndex: 15,
    shadowColor: '#dc3545',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(220, 53, 69, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    minHeight: 36,
  },
  pendingDeleteButtonText: {
    color: '#dc3545',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  swipeAction: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    width: 100,
  },
  swipeActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  friendItemContainer: {
    marginHorizontal: 16,
    marginVertical: 4,
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrFriendshipData, setQrFriendshipData] = useState(null)

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

  const handleShareFriend = async ({ friendshipUuid, contactName }) => {
    try {
      const result = await friendsHelper.shareFriendship({
        uuid,
        friendshipUuid,
        contactName,
      })

      if (result) {
        Toast.show({
          type: 'success',
          position: 'top',
          text1: 'Friendship shared!',
          text2: `Shared ${contactName}'s friendship request`,
          visibilityTime: 2000,
          autoHide: true,
          topOffset: 60,
        })
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error sharing friend:', error)
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Error sharing friendship',
        text2: 'Please try again',
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

  const handleGenerateQR = async ({ friendshipUuid, friendName }) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

      setQrFriendshipData({
        friendshipUuid,
        friendName,
      })
      setShowQRModal(true)

      Toast.show({
        type: 'info',
        position: 'top',
        text1: 'QR Code Generated',
        text2: `Share ${friendName}'s name with your other devices`,
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 60,
      })
    } catch (error) {
      console.error('Error generating QR:', error)
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'QR Generation Failed',
        text2: 'Unable to generate QR code',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 60,
      })
    }
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

  useEffect(() => {
    // Only load friendships when uuid is properly initialized
    if (uuid && uuid !== '') {
      reload()
    }
  }, [uuid, reload])

  const FriendItem = ({ friend }) => {
    const translateX = useRef(new Animated.Value(0)).current
    const [isSwipeOpen, setIsSwipeOpen] = useState(false)

    const displayName = friend?.contact || 'Unnamed Friend'
    const isPending = friend.uuid2 === null
    const hasUnread = friend.unreadCount > 0

    const handleSwipeGesture = (event) => {
      if (isPending) return // Don't allow swipe for pending friends

      const { translationX, state } = event.nativeEvent

      if (state === State.ACTIVE) {
        // Only allow swipe to the right (positive translation)
        if (translationX > 0) {
          const clampedTranslation = Math.min(translationX, 100)
          translateX.setValue(clampedTranslation)
        }
      } else if (state === State.END || state === State.CANCELLED) {
        // Determine if swipe should be open or closed
        if (translationX > 50) {
          // Open the swipe action
          Animated.spring(translateX, {
            toValue: 100,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start()
          setIsSwipeOpen(true)
        } else {
          // Close the swipe action
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start()
          setIsSwipeOpen(false)
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
    }

    const handleShareName = () => {
      closeSwipe()
      handleGenerateQR({
        friendshipUuid: friend.friendshipUuid,
        friendName: displayName,
      })
    }

    return (
      <View style={styles.friendItemContainer}>
        {/* Swipe Action Background - only show for confirmed friends */}
        {!isPending && (
          <TouchableOpacity
            style={styles.swipeAction}
            onPress={handleShareName}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="qrcode" size={20} color="white" />
            <Text style={styles.swipeActionText}>Share{'\n'}Name</Text>
          </TouchableOpacity>
        )}

        {/* Main Friend Item */}
        <PanGestureHandler
          onHandlerStateChange={handleSwipeGesture}
          enabled={!isPending}
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
                          color="#ff6b35"
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
                            color="#ff6b35"
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
                            color="#dc3545"
                          />
                          <Text style={styles.pendingDeleteButtonText}>
                            Delete
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <Text style={styles.friendStatus}>
                      {hasUnread
                        ? `${friend.unreadCount} new messages`
                        : isSwipeOpen
                          ? 'Swipe left to close'
                          : 'Tap to chat • Swipe right to share name'}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </PanGestureHandler>
      </View>
    )
  }

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
        <QRCodeModal
          visible={showQRModal}
          onClose={() => setShowQRModal(false)}
          friendshipUuid={qrFriendshipData?.friendshipUuid}
          friendName={qrFriendshipData?.friendName}
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
      <QRCodeModal
        visible={showQRModal}
        onClose={() => setShowQRModal(false)}
        friendshipUuid={qrFriendshipData?.friendshipUuid}
        friendName={qrFriendshipData?.friendName}
        topOffset={60}
      />
      <FlatList
        data={friendsList}
        renderItem={renderFriend}
        keyExtractor={(item) => item.friendshipUuid}
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshing={false}
        onRefresh={reload}
      />
    </SafeAreaView>
  )
}

export default FriendsList
