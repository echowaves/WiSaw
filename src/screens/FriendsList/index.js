import { useNavigation } from '@react-navigation/native'
import { router } from 'expo-router'
import { useAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'

import * as Haptics from 'expo-haptics'

import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import Toast from 'react-native-toast-message'

import { FontAwesome5 } from '@expo/vector-icons'
import PropTypes from 'prop-types'

import * as CONST from '../../consts'
import * as STATE from '../../state'

import NamePicker from '../../components/NamePicker'
import * as friendsHelper from './friends_helper'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  friendItem: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  editButton: {
    backgroundColor: '#e6f5ff',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
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
  headerButton: {
    paddingHorizontal: 12,
  },
  shareButtonContainer: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
})

const FriendsList = ({ triggerAddFriend, setTriggerAddFriend }) => {
  const navigation = useNavigation()

  const [uuid] = useAtom(STATE.uuid)
  const [friendsList, setFriendsList] = useAtom(STATE.friendsList)

  const headerText =
    'Choose a friendly name to help you remember this person when chatting or sharing content.'

  const [showNamePicker, setShowNamePicker] = useState(false)
  const [selectedFriendshipUuid, setSelectedFriendshipUuid] = useState(null)

  const handleAddFriend = async () => {
    setSelectedFriendshipUuid(null) // make sure we are adding a new friend
    setShowNamePicker(true)
  }

  // Handle external trigger for adding friends
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

  const renderHeaderRight = useCallback(
    () => (
      <TouchableOpacity style={styles.headerButton} onPress={handleAddFriend}>
        <FontAwesome5 name="user-plus" size={18} color={CONST.MAIN_COLOR} />
      </TouchableOpacity>
    ),
    [],
  )

  const renderHeaderLeft = useCallback(
    () => (
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => router.back()}
      >
        <FontAwesome5 name="arrow-left" size={18} color={CONST.MAIN_COLOR} />
      </TouchableOpacity>
    ),
    [navigation],
  )

  // Remove navigation.setOptions as it's not compatible with Expo Router
  // The header is now controlled by the layout in app/(drawer)/friends.tsx
  // useEffect(() => {
  //   navigation.setOptions({
  //     headerTitle: 'friends',
  //     headerTintColor: CONST.MAIN_COLOR,
  //     headerRight: renderHeaderRight,
  //     headerLeft: renderHeaderLeft,
  //     headerBackTitle: '',
  //     headerStyle: {
  //       backgroundColor: CONST.NAV_COLOR,
  //     },
  //   })
  // }, [])

  useEffect(() => {
    // Only load friendships when uuid is properly initialized
    if (uuid && uuid !== '') {
      reload()
    }
  }, [uuid, navigation, renderHeaderRight, renderHeaderLeft, reload])

  const renderFriend = ({ item: friend }) => {
    const displayName = friend?.contact || 'Unnamed Friend'
    const isPending = friend.uuid2 === null
    const hasUnread = friend.unreadCount > 0

    return (
      <View style={styles.friendItem}>
        <TouchableOpacity
          style={styles.friendContent}
          onPress={() => {
            if (!isPending) {
              router.push({
                pathname: '/chat',
                params: {
                  chatUuid: friend?.chatUuid,
                  contact: JSON.stringify(friend?.contact),
                },
              })
            }
          }}
          onLongPress={() => {
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
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                  {/* Share button on its own line */}
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
                      <Text style={styles.pendingShareButtonText}>Share</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <Text style={styles.friendStatus}>
                  {hasUnread
                    ? `${friend.unreadCount} new messages`
                    : 'Tap to chat'}
                </Text>
              )}
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => {
                  setSelectedFriendshipUuid(friend.friendshipUuid)
                  setShowNamePicker(true)
                }}
              >
                <FontAwesome5 name="edit" size={14} color="#007bff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => {
                  Alert.alert(
                    'Remove Friend',
                    `Are you sure you want to remove ${displayName}?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: () =>
                          handleRemoveFriend({
                            friendshipUuid: friend.friendshipUuid,
                          }),
                      },
                    ],
                  )
                }}
              >
                <FontAwesome5 name="trash" size={14} color="#dc3545" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    )
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

FriendsList.propTypes = {
  triggerAddFriend: PropTypes.bool,
  setTriggerAddFriend: PropTypes.func,
}

FriendsList.defaultProps = {
  triggerAddFriend: false,
  setTriggerAddFriend: () => {},
}

export default FriendsList
