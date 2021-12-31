import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"
import Toast from 'react-native-toast-message'

import {
  Alert,
  SafeAreaView,
  StyleSheet,
} from 'react-native'

import {
  Text,
  Card,
  ListItem,
  Badge,
} from 'react-native-elements'

// import Toast from 'react-native-toast-message'
import FlatGrid from 'react-native-super-grid'
import { useDimensions } from '@react-native-community/hooks'

import {
  FontAwesome,
  // Ionicons,
  // MaterialCommunityIcons,
  // SimpleLineIcons,
  // AntDesign,
} from '@expo/vector-icons'

import PropTypes from 'prop-types'

import * as CONST from '../../consts.js'

import * as reducer from './reducer'

import * as friendsHelper from './friends_helper'
import NamePicker from '../../components/NamePicker'

const FriendsList = () => {
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const {
    width,
    // height,
  } = useDimensions().window
  const topOffset = useSelector(state => state.photosList.topOffset)

  // const topOffset = useSelector(state => state.photosList.topOffset)
  const headerText = "What is the name of your friend to whom you want to connect?"

  const uuid = useSelector(state => state.secret.uuid)
  const friendsList = useSelector(state => state.friendsList.friendsList)

  const [showNamePicker, setShowNamePicker] = useState(false)
  const [friendshipUuid, setFriendshipUuid] = useState(null)

  useEffect(() => {
    (
      async () => {
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
      }
    )()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const _reload = async () => {
    dispatch(reducer.reloadFriendsList({ uuid }))
    dispatch(reducer.reloadUnreadCountsList({ uuid }))// the list of enhanced friends list has to be loaded earlier on
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  })
  const setContactName = async contactName => {
    if (!friendshipUuid) {
      // this is new friendship, let's create it and then send the invite
      const friendship = await _sendFriendshipRequest({ contactName })
      alert(JSON.stringify({ friendship }))
      await setFriendshipUuid(friendship.friendshipUuid)
    }
    // console.log({ contactName })
    await friendsHelper.addFriendshipLocally({ friendshipUuid, contactName })
    await setFriendshipUuid(null)
    dispatch(reducer.reloadFriendsList({ uuid }))
    dispatch(reducer.reloadUnreadCountsList({ uuid }))// the list of enhanced friends list has to be loaded earlier on
  }

  const _sendFriendshipRequest = async ({ contactName }) => {
    const friendship = await dispatch(reducer.createFriendship({ uuid }))

    // alert(JSON.stringify({ friendship }))
    if (!friendship) {
      // await navigation.popToTop()
      // await navigation.navigate('FriendsList')
      return // was not able to create friendship
    }

    const _branchUniversalObject = await _createBranchUniversalObject({ friendshipUuid: friendship?.friendshipUuid })

    // const linkProperties = { feature: 'friendship_request', channel: 'RNApp' }

    const messageBody = `${contactName}, You've got WiSaw friendship request.
To confirm, follow the url:`

    const shareOptions = {
      messageHeader: "What I Saw today...",
      messageBody,
      emailSubject: 'What I Saw today friendship request...',
    }

    await _branchUniversalObject.showShareSheet(shareOptions)

    // alert(JSON.stringify({ url }))
    return friendship
  }

  const _createBranchUniversalObject = async ({ friendshipUuid }) => {
    // eslint-disable-next-line
    if (!__DEV__) {
      // import Branch, { BranchEvent } from 'expo-branch'
      const ExpoBranch = await import('expo-branch')
      const Branch = ExpoBranch.default

      // console.log({ friendship })

      const _branchUniversalObject = await Branch.createBranchUniversalObject(
        `${friendshipUuid}`,
        {
          locallyIndex: false,
          title: 'Inviting friend to collaborate on WiSaw',
          // contentImageUrl: photo.imgUrl,
          contentDescription: "Let's talk.",
          // This metadata can be used to easily navigate back to this screen
          // when implementing deep linking with `Branch.subscribe`.
          contentMetadata: {
            customMetadata: {
              friendshipUuid, // your userId field would be defined under customMetadata
            },
          },
        }
      )
      return _branchUniversalObject
    }
    Toast.show({
      text1: "Branch is not available in DEV mode",
      type: "error",
      topOffset,
    })
    return null
  }

  const renderAddFriendButton = () => (
    <FontAwesome
      name="user-plus"
      size={30}
      style={
        {
          marginRight: 10,
          color: CONST.MAIN_COLOR,
          width: 60,
        }
      }
      onPress={
        () => {
          _handleAddFriend()
        }

      }
    />
  )

  const renderHeaderRight = () => (
    renderAddFriendButton()
  )

  const renderHeaderLeft = () => (
    <FontAwesome
      name="chevron-left"
      size={30}
      style={
        {
          marginLeft: 10,
          color: CONST.MAIN_COLOR,
          width: 60,
        }
      }
      onPress={
        () => navigation.goBack()
      }
    />
  )

  const _renderFriend = ({ friend }) => ( // eslint-disable-line react/no-multi-comp, react/prop-types
    <ListItem
      style={{
        height: 70,
      }}
      onPress={() => {
        // eslint-disable-next-line react/prop-types
        if (!friend?.contact) {
          Alert.alert(
            'This is unnamed connection.',
            'Do you want to give your friend a name?',
            [
              {
                text: 'No',
                onPress: () => {
                  // eslint-disable-next-line react/prop-types
                  navigation.navigate('Chat', { chatUuid: friend.chatUuid, contact: friend?.contact })
                },
              },
              {
                text: 'Yes',
                onPress: () => {
                  // eslint-disable-next-line react/prop-types
                  setFriendshipUuid(friend.friendshipUuid)
                  setShowNamePicker(true)
                },
              },
            ],
            { cancelable: false }
          )
        } else {
        // eslint-disable-next-line react/prop-types
          navigation.navigate('Chat', { chatUuid: friend.chatUuid, contact: friend?.contact })
        }
      }}>
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
              <Text style={{
                color: "red",
              }}>
                pending confirmation
              </Text>
            </ListItem.Subtitle>
          )
        }
      </ListItem.Content>
      <FontAwesome
        name="user-times"
        size={30}
        style={
          {
            color: CONST.MAIN_COLOR,
          }
        }
        onPress={
          // eslint-disable-next-line react/prop-types
          () => _handleRemoveFriend({ friendshipUuid: friend.friendshipUuid })
        }
      />
      <ListItem.Chevron size={40} color={CONST.MAIN_COLOR} />
    </ListItem>
  )

  const _handleAddFriend = () => {
    // console.log('adding friend')
    setFriendshipUuid(null)// make sure we are adding a new friend
    setShowNamePicker(true)
    // const friend = await dispatch(reducer.createFriendship({ uuid }))
  }

  // const _handleAssociateLocalFriend = ({ friendshipUuid }) => {
  //   navigation.navigate('LocalContacts', { friendshipUuid })
  // }

  const _handleRemoveFriend = ({ friendshipUuid }) => {
    Alert.alert(
      'Delete Friendship?',
      'This can\'t be undone. Are you sure? ',
      [
        { text: 'No', onPress: () => null, style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            dispatch(reducer.deleteFriendship({ friendshipUuid }))
          },
        },
      ],
      { cancelable: true }
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
          }}>
          <Text style={{
            fontSize: 20,
            textAlign: 'center',
            margin: 10,
          }}>
            You don&apos;t have any friends yet. To start a conversation, send invitation to a friend.
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
        itemDimension={
          width
        }
        // spacing={3}
        data={
          friendsList
        }
        renderItem={
          ({ item }) => _renderFriend({ friend: item })
        }
        keyExtractor={item => item.friendshipUuid}
        style={{
          ...styles.container,
          marginBottom: 95,
        }}
        showsVerticalScrollIndicator={
          false
        }
        horizontal={
          false
        }
        refreshing={
          false
        }
        onRefresh={
          () => {
            _reload()
          }
        }
      />
    </SafeAreaView>
  )
}

export default FriendsList
