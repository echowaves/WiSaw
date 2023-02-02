import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
// import Toast from 'react-native-toast-message'

import {
  Alert,
  SafeAreaView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'

import { Text, Card, ListItem, Badge } from 'react-native-elements'

// import Toast from 'react-native-toast-message'
import FlatGrid from 'react-native-super-grid'

import {
  FontAwesome,
  FontAwesome5,
  // Ionicons,
  // MaterialCommunityIcons,
  // SimpleLineIcons,
  // AntDesign,
} from '@expo/vector-icons'

import PropTypes from 'prop-types'

import * as CONST from '../../consts'

import * as reducer from './reducer'

import * as friendsHelper from './friends_helper'
import NamePicker from '../../components/NamePicker'

const FriendsList = () => {
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const {
    width,
    // height,
  } = useWindowDimensions()
  // const topOffset = useSelector(state => state.photosList.topOffset)

  // const topOffset = useSelector(state => state.photosList.topOffset)
  const headerText = 'What is your friend name?'

  const uuid = useSelector((state) => state.secret.uuid)
  const friendsList = useSelector((state) => state.friendsList.friendsList)

  const [showNamePicker, setShowNamePicker] = useState(false)
  const [friendshipUuid, setFriendshipUuid] = useState(null)

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
      _reload()
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const _reload = async () => {
    dispatch(reducer.reloadFriendsList({ uuid }))
    dispatch(reducer.reloadUnreadCountsList({ uuid })) // the list of enhanced friends list has to be loaded earlier on
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  })

  const setContactName = async (contactName) => {
    // this is edit existing name
    if (!friendshipUuid) {
      // this is new friendship, let's create it and then send the invite
      const friendship = await _sendFriendshipRequest({ contactName })
      await friendsHelper.addFriendshipLocally({
        friendshipUuid: friendship.friendshipUuid,
        contactName,
      })
    } else {
      await friendsHelper.addFriendshipLocally({ friendshipUuid, contactName })
    }

    // alert(JSON.stringify({ friendship }))
    // await setFriendshipUuid(friendship.friendshipUuid)

    // alert(JSON.stringify({ friendshipUuid, contactName }))
    await setShowNamePicker(false)
    setFriendshipUuid(null) // reset friendshipUuid for next request

    dispatch(reducer.reloadFriendsList({ uuid }))
    dispatch(reducer.reloadUnreadCountsList({ uuid })) // the list of enhanced friends list has to be loaded earlier on
  }

  const _sendFriendshipRequest = async ({ contactName }) => {
    const friendship = await dispatch(
      reducer.createFriendship({ uuid, contactName }),
    )
    return friendship
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
        _handleAddFriend()
      }}
    />
  )

  const renderHeaderRight = () => renderAddFriendButton()

  const renderHeaderLeft = () => (
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
  )

  const _renderFriend = (
    { friend }, // eslint-disable-line react/no-multi-comp, react/prop-types
  ) => (
    <ListItem
      style={{
        height: 70,
      }}
      onPress={() => {
        // eslint-disable-next-line react/prop-types
        navigation.navigate('Chat', {
          chatUuid: friend?.chatUuid,
          contact: friend?.contact,
        })
      }}
    >
      {
        // eslint-disable-next-line react/prop-types
        friend.unreadCount > 0 && (
          <Badge
            value={
              // eslint-disable-next-line react/prop-types
              friend.unreadCount
            }
            badgeStyle={{
              backgroundColor: CONST.MAIN_COLOR,
            }}
            containerStyle={{ marginTop: -20 }}
          />
        )
      }
      <FontAwesome5
        name="user-edit"
        size={30}
        style={{
          color: CONST.MAIN_COLOR,
        }}
        onPress={async () => {
          // eslint-disable-next-line react/prop-types
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
        onPress={
          // eslint-disable-next-line react/prop-types
          () => _handleRemoveFriend({ friendshipUuid: friend.friendshipUuid })
        }
      />
      <ListItem.Content>
        <ListItem.Title>
          <Text>
            {
              // eslint-disable-next-line react/prop-types
              `${friend?.contact}`
            }
          </Text>
        </ListItem.Title>
        {
          // eslint-disable-next-line react/prop-types
          friend.uuid2 === null && (
            <ListItem.Subtitle>
              <Text
                style={{
                  color: 'red',
                }}
              >
                pending confirmation
              </Text>
            </ListItem.Subtitle>
          )
        }
      </ListItem.Content>

      <ListItem.Chevron size={40} color={CONST.MAIN_COLOR} />
    </ListItem>
  )

  const _handleAddFriend = async () => {
    await setFriendshipUuid(null) // make sure we are adding a new friend
    await setShowNamePicker(true)
  }

  // const _handleAssociateLocalFriend = ({ friendshipUuid }) => {
  //   navigation.navigate('LocalContacts', { friendshipUuid })
  // }

  const _handleRemoveFriend = ({ friendshipUuid }) => {
    Alert.alert(
      'Delete Friendship?',
      "This can't be undone. Are you sure? ",
      [
        { text: 'No', onPress: () => null, style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            dispatch(reducer.deleteFriendship({ friendshipUuid }))
          },
        },
      ],
      { cancelable: true },
    )
  }

  if (!friendsList || friendsList?.length === 0) {
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
        renderItem={({ item }) => _renderFriend({ friend: item })}
        keyExtractor={(item) => item.friendshipUuid}
        style={{
          ...styles.container,
          marginBottom: 95,
        }}
        showsVerticalScrollIndicator
        horizontal={false}
        refreshing={false}
        onRefresh={() => {
          _reload()
        }}
      />
    </SafeAreaView>
  )
}

export default FriendsList
