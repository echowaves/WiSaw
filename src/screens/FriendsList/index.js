import { useNavigation } from '@react-navigation/native'
import { useAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'

import {
  Alert,
  SafeAreaView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'

import { Badge, Card, ListItem, Text } from '@rneui/themed'

import Toast from 'react-native-toast-message'
import FlatGrid from 'react-native-super-grid'

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

  const renderFriend = ({ friend }) => (
    <ListItem
      style={{
        height: 70,
      }}
      onPress={() => {
        navigation.navigate('Chat', {
          chatUuid: friend?.chatUuid,
          contact: friend?.contact,
        })
      }}
    >
      {friend.unreadCount > 0 && (
        <Badge
          value={friend.unreadCount}
          badgeStyle={{
            backgroundColor: CONST.MAIN_COLOR,
          }}
          containerStyle={{ marginTop: -20 }}
        />
      )}
      <FontAwesome5
        name="user-edit"
        size={30}
        style={{
          color: CONST.MAIN_COLOR,
        }}
        onPress={async () => {
          await setFriendshipUuid(friend?.friendshipUuid)
          setShowNamePicker(true)
        }}
      />
      <FontAwesome
        name="user-times"
        size={30}
        style={{
          color: CONST.MAIN_COLOR,
        }}
        onPress={() =>
          handleRemoveFriend({ friendshipUuid: friend.friendshipUuid })
        }
      />
      <ListItem.Content>
        <ListItem.Title>
          <Text>{friend?.contact || 'Unnamed Friend'}</Text>
        </ListItem.Title>
        {friend.uuid2 === null && (
          <ListItem.Subtitle>
            <Text
              style={{
                color: 'red',
              }}
            >
              pending confirmation
            </Text>
          </ListItem.Subtitle>
        )}
      </ListItem.Content>

      <ListItem.Chevron size={40} color={CONST.MAIN_COLOR} />
    </ListItem>
  )

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
        <Card
          borderRadius={5}
          containerStyle={{
            borderWidth: 0,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              textAlign: 'center',
              margin: 10,
            }}
          >
            You don&apos;t have any friends yet. To start a conversation, send
            invitation to a friend.
          </Text>
          {renderAddFriendButton()}
        </Card>
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
