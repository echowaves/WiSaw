import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"

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
import LocalContacts from '../../components/LocalContacts'

const FriendsList = () => {
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const {
    width,
    // height,
  } = useDimensions().window

  // const topOffset = useSelector(state => state.photosList.topOffset)
  const headerText = "SMS confirmation message for your friend will be send to the number you pick from the list. Make sure to pick a correct number."

  const uuid = useSelector(state => state.secret.uuid)
  const friendsList = useSelector(state => state.friendsList.friendsList)

  const [showLocalContacts, setShowLocalContacts] = useState(false)
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
  const setContactId = contactId => {
    if (friendshipUuid) {
      friendsHelper.addFriendshipLocally({ friendshipUuid, contactId })
      setFriendshipUuid(null)
      dispatch(reducer.reloadFriendsList({ uuid }))
      dispatch(reducer.reloadUnreadCountsList({ uuid }))// the list of enhanced friends list has to be loaded earlier on
    } else {
      navigation.navigate('ContactDetails', { contactId })
    }
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
        if (!friend?.contact?.name) {
          Alert.alert(
            'Do you want to associate this friend with contract from address book?',
            'Pick the right contact.',
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
                  setShowLocalContacts(true)
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
              `${friend?.contact?.name}`
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
    setShowLocalContacts(true)
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
        <LocalContacts
          show={showLocalContacts}
          setShow={setShowLocalContacts}
          setContactId={setContactId}
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
            You don&apos;t have any friends yet. To start a conversation, send invitation to a friend from your phone book.
          </Text>
          {renderAddFriendButton()}
        </Card>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <LocalContacts
        show={showLocalContacts}
        setShow={setShowLocalContacts}
        setContactId={setContactId}
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
