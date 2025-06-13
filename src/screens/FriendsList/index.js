import { useNavigation } from '@react-navigation/native'
import { useAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'

import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'

import FlatGrid from 'react-native-super-grid'
import Toast from 'react-native-toast-message'

import { FontAwesome, FontAwesome5 } from '@expo/vector-icons'

import * as CONST from '../../consts'
import * as STATE from '../../state'

import * as reducer from './reducer'

import NamePicker from '../../components/NamePicker'
import * as friendsHelper from './friends_helper'

const FriendsList = () => {
  const navigation = useNavigation()

  const [uuid, setUuid] = useAtom(STATE.uuid)
  const [topOffset, setTopOffset] = useAtom(STATE.topOffset)
  const [friendsList, setFriendsList] = useAtom(STATE.friendsList)

  const {
    width,
    // height,
  } = useWindowDimensions()

  const headerText = 'What is your friend name?'

  const [showNamePicker, setShowNamePicker] = useState(false)
  const [friendshipUuid, setFriendshipUuid] = useState(null)

  const handleAddFriend = async () => {
    await setFriendshipUuid(null) // make sure we are adding a new friend
    await setShowNamePicker(true)
  }

  const renderAddFriendButton = () => (
    <FontAwesome
      name="user-plus"
      size={30}
      style={{
        marginRight: 10,
        color: CONST.MAIN_COLOR,
        width: 60,
      }}
      onPress={() => {
        handleAddFriend()
      }}
    />
  )

  const renderHeaderRight = useCallback(() => renderAddFriendButton(), [])

  const renderHeaderLeft = useCallback(
    () => (
      <FontAwesome
        name="chevron-left"
        size={30}
        style={{
          marginLeft: 10,
          color: CONST.MAIN_COLOR,
          width: 60,
        }}
        onPress={() => navigation.goBack()}
      />
    ),
    [navigation],
  )
  const reload = useCallback(async () => {
    try {
      const result = await friendsHelper.getEnhancedListOfFriendships({
        uuid,
      })
      setFriendsList(result)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading friends list:', error)
      Toast.show({
        text1: 'Failed to load friends',
        text2: 'Please try again',
        type: 'error',
        topOffset,
      })
    }
  }, [uuid, topOffset])

  useEffect(() => {
    ;(async () => {
      navigation.setOptions({
        headerTitle: 'friends',
        headerTintColor: CONST.MAIN_COLOR,
        headerRight: renderHeaderRight,
        headerLeft: renderHeaderLeft,
        headerBackTitle: '',
        headerStyle: {
          backgroundColor: CONST.NAV_COLOR,
        },
      })
      // a friendship with no locally assigned contact can never show in the list on the screen
      // await friendsHelper.cleanupAbandonedFriendships({ uuid })

      // Only load friendships when uuid is properly initialized
      if (uuid && uuid !== '') {
        reload()
      }
    })()
  }, [uuid])

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
      // flex: 1, // Remove this again - it causes the name rendering issue
      marginRight: 12,
      maxWidth: '70%', // Keep this to ensure space for buttons
      // minWidth: 1, // Remove this too
    },
    friendName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1a1a1a',
      marginBottom: 4,
      // flex: 1, // Remove this too
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
      gap: 12,
    },
    actionButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: '#f5f5f5',
    },
    unreadBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: CONST.MAIN_COLOR,
      justifyContent: 'center',
      alignItems: 'center',
    },
    unreadText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: '600',
      color: '#1a1a1a',
      marginBottom: 12,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 32,
    },
    addFriendButton: {
      backgroundColor: CONST.MAIN_COLOR,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    addFriendText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  })

  const sendFriendshipRequest = async ({ contactName }) => {
    try {
      const friendship = await reducer.createFriendship({
        uuid,
        topOffset,
        contactName,
      })
      return friendship
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating friendship:', error)
      Toast.show({
        text1: 'Failed to create friendship request',
        text2: error.message || 'Please try again',
        type: 'error',
        topOffset,
      })
      return null
    }
  }

  const setContactName = async (contactName) => {
    try {
      // this is edit existing name
      if (!friendshipUuid) {
        // this is new friendship, let's create it and then send the invite
        const friendship = await sendFriendshipRequest({ contactName })
        if (friendship) {
          await friendsHelper.addFriendshipLocally({
            friendshipUuid: friendship.friendshipUuid,
            contactName,
          })
        }
      } else {
        await friendsHelper.addFriendshipLocally({
          friendshipUuid,
          contactName,
        })
      }

      await setShowNamePicker(false)
      setFriendshipUuid(null) // reset friendshipUuid for next request

      setFriendsList(
        await friendsHelper.getEnhancedListOfFriendships({
          uuid,
        }),
      )
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error setting contact name:', error)
      Toast.show({
        text1: 'Failed to save friend name',
        text2: error.message || 'Please try again',
        type: 'error',
        topOffset,
      })
    }
  }

  // eslint-disable-next-line no-shadow
  const handleRemoveFriend = ({ friendshipUuid }) => {
    Alert.alert(
      'Delete Friendship?',
      "This can't be undone. Are you sure? ",
      [
        { text: 'No', onPress: () => null, style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            await friendsHelper.deleteFriendship({ friendshipUuid, topOffset })
            reload()
          },
        },
      ],
      { cancelable: true },
    )
  }

  const renderFriend = ({ friend }) => {
    const displayName = friend?.contact || 'Unnamed Friend'
    const isPending = friend.uuid2 === null
    const hasUnread = friend.unreadCount > 0

    // console.log('Rendering friend object:', JSON.stringify(friend, null, 2));
    // console.log('Value of friend.contact:', friend?.contact);
    // console.log('Calculated displayName:', displayName);

    return (
      <View style={styles.friendItem}>
        <TouchableOpacity
          style={styles.friendContent}
          onPress={() => {
            if (!isPending) {
              navigation.navigate('Chat', {
                chatUuid: friend?.chatUuid,
                contact: friend?.contact,
              })
            }
          }}
          disabled={isPending}
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
              ) : (
                <Text style={styles.friendStatus}>
                  {hasUnread
                    ? `${friend.unreadCount} new messages`
                    : 'Tap to chat'}
                </Text>
              )}
            </View>

            <View style={styles.actionButtons}>
              {hasUnread && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>
                    {friend.unreadCount > 99 ? '99+' : friend.unreadCount}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.actionButton}
                onPress={async () => {
                  await setFriendshipUuid(friend?.friendshipUuid)
                  setShowNamePicker(true)
                }}
              >
                <FontAwesome5
                  name="user-edit"
                  size={18}
                  color={CONST.MAIN_COLOR}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  handleRemoveFriend({ friendshipUuid: friend.friendshipUuid })
                }
              >
                <FontAwesome name="user-times" size={18} color="#dc3545" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  // const _handleAssociateLocalFriend = ({ friendshipUuid }) => {
  //   navigation.navigate('LocalContacts', { friendshipUuid })
  // }

  if (friendsList.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <NamePicker
          show={showNamePicker}
          setShow={setShowNamePicker}
          setContactName={setContactName}
          headerText={headerText}
        />
        <View style={styles.emptyContainer}>
          <FontAwesome5
            name="user-friends"
            size={64}
            color="#e0e0e0"
            style={{ marginBottom: 24 }}
          />
          <Text style={styles.emptyTitle}>No Friends Yet</Text>
          <Text style={styles.emptySubtitle}>
            Start connecting with friends by sending them an invitation.
            {'\n'}They will receive a link to accept your friendship request.
          </Text>
          <TouchableOpacity
            style={styles.addFriendButton}
            onPress={handleAddFriend}
          >
            <FontAwesome name="user-plus" size={16} color="white" />
            <Text style={styles.addFriendText}>Add Your First Friend</Text>
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
      />
      <FlatGrid
        itemDimension={width}
        // spacing={3}
        data={friendsList}
        renderItem={({ item }) => renderFriend({ friend: item })}
        keyExtractor={(item) => item.friendshipUuid}
        style={{
          ...styles.container,
          marginBottom: 95,
        }}
        showsVerticalScrollIndicator
        horizontal={false}
        refreshing={false}
        onRefresh={() => {
          reload()
        }}
      />
    </SafeAreaView>
  )
}

export default FriendsList
