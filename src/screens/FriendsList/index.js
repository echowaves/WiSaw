import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"

import {
  View,
  Alert,
  SafeAreaView,
  StyleSheet,
  ScrollView,
} from 'react-native'

import {
  Text,
  Input,
  LinearProgress,
  Card,
  ListItem,
  Button,
} from 'react-native-elements'
// import * as FileSystem from 'expo-file-system'
import Toast from 'react-native-toast-message'

import {
  FontAwesome, Ionicons, MaterialCommunityIcons, SimpleLineIcons, AntDesign,
} from '@expo/vector-icons'

import { Col, Row, Grid } from "react-native-easy-grid"

import PropTypes from 'prop-types'

import * as CONST from '../../consts.js'

import * as reducer from './reducer'

const FriendsList = () => {
  const navigation = useNavigation()
  const dispatch = useDispatch()

  // const headerHeight = useSelector(state => state.photosList.headerHeight)

  const uuid = useSelector(state => state.secret.uuid)
  const friendsList = useSelector(state => state.friendsList.friendsList)

  useEffect(() => {
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

    dispatch(reducer.getListOfFriends({ uuid }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // useEffect(() => {
  //   console.log(`friends list updated: ${friendsList.length}`)
  // }, [friendsList])

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      alignItems: 'center',
      marginHorizontal: 0,
      paddingBottom: 300,
    },
  })

  const renderHeaderRight = () => (
    <SimpleLineIcons
      name="user-follow"
      size={30}
      style={
        {
          marginRight: 10,
          color: CONST.MAIN_COLOR,
          width: 60,
        }
      }
      onPress={
        () => _handleAddFriend()
      }
    />
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
    <Grid>
      <Row>
        <Col
          style={{

          }}>
          <Text>
            {`${friend.friendshipUuid}`}
          </Text>
        </Col>
        <Col style={{ width: 40, marginRight: 10, marginLeft: 10 }}>
          <AntDesign
            name="contacts"
            size={30}
            style={
              {
                color: CONST.MAIN_COLOR,
              }
            }
            onPress={
              () => {
                _handleAssociateLocalFriend({ friendshipUuid: friend.friendshipUuid })
              }
            }
          />
        </Col>
        <Col style={{ width: 40, marginRight: 10, marginLeft: 10 }}>
          <SimpleLineIcons
            name="user-unfollow"
            size={30}
            style={
              {
                color: CONST.MAIN_COLOR,
              }
            }
            onPress={
              () => _handleRemoveFriend({ friendshipUuid: friend.friendshipUuid })
            }
          />
        </Col>
        <Col style={{ width: 40, marginRight: 0, marginLeft: 10 }}>
          <FontAwesome
            name="chevron-right"
            size={30}
            style={
              {
                color: CONST.MAIN_COLOR,
              }
            }
            // onPress={
            // () => navigation.goBack()
            // }
          />
        </Col>
      </Row>
    </Grid>
  )

  const _handleAddFriend = async () => {
    const friend = await dispatch(reducer.createFriendship({ uuid }))
    navigation.navigate('LocalContacts', { friendshipUuid: friend.friendshipUuid })
  }

  const _handleAssociateLocalFriend = ({ friendshipUuid }) => {
    navigation.navigate('LocalContacts', { friendshipUuid })
  }

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={
          false
        }>
        {
          friendsList.map((friend, index) => (
            <ListItem
              key={friend.friendshipUuid}
              style={{
                paddingBottom: 5,
                paddingLeft: 10,
                paddingRight: 10,
                width: '100%',
              }}>
              {_renderFriend({ friend })}
            </ListItem>
          ))
        }
      </ScrollView>
    </SafeAreaView>
  )
}

export default FriendsList
