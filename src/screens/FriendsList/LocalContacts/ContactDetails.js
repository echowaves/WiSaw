import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"
import { useDimensions } from '@react-native-community/hooks'
import * as SMS from 'expo-sms'
import * as Contacts from 'expo-contacts'

import validator from 'validator'
import { phone } from 'phone'

import {
  View,
  Alert,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native'

import {
  Text,
  Input,
  LinearProgress,
  Card,
  ListItem,
  Button,
  SearchBar,
} from 'react-native-elements'
// import * as FileSystem from 'expo-file-system'
import Toast from 'react-native-toast-message'

import {
  FontAwesome, Ionicons, MaterialCommunityIcons, SimpleLineIcons, AntDesign, MaterialIcons,
} from '@expo/vector-icons'

import { Col, Row, Grid } from "react-native-easy-grid"

import PropTypes from 'prop-types'

import * as CONST from '../../../consts.js'

import * as reducer from '../reducer'

import * as friendsHelper from '../friends_helper'

const ContactDetails = ({ route }) => {
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const topOffset = useSelector(state => state.photosList.topOffset)

  const { width, height } = useDimensions().window

  const { contactId } = route.params
  const [contact, setContact] = useState(null)

  // const topOffset = useSelector(state => state.photosList.topOffset)

  const uuid = useSelector(state => state.secret.uuid)

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Phone book contact',
      headerTintColor: CONST.MAIN_COLOR,
      headerRight: renderHeaderRight,
      headerLeft: renderHeaderLeft,
      headerBackTitle: '',
      headerStyle: {
        backgroundColor: CONST.NAV_COLOR,
      },
    })
    _reloadContact()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const _reloadContact = async () => {
    setContact(await Contacts.getContactByIdAsync(contactId))
  }

  const renderHeaderRight = () => {}

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

  const _sendFriendshipRequest = async ({ contact, phone }) => {
    // TODO: delete next 3 lines -- debuggin
    // const friendship = await dispatch(reducer.createFriendship({ uuid }))
    // await friendsHelper.addFriendshipLocally({ friendshipUuid: friendship.friendshipUuid, contactId: contact.id })
    // dispatch(reducer.reloadListOfFriends({ uuid }))
    /// /////////////////////////////////////////
    const isSmsAvailable = await SMS.isAvailableAsync()
    if (isSmsAvailable) {
      const friendship = await dispatch(reducer.createFriendship({ uuid }))

      const _branchUniversalObject = await _createBranchUniversalObject({ friendshipUuid: friendship.friendshipUuid })

      // alert(JSON.stringify(_branchUniversalObject))

      const { url } = await _branchUniversalObject.generateShortUrl({}, {})

      const { result } = await SMS.sendSMSAsync(
        [phone.number],
        `You've got WiSaw friendship request.
To confirm, follow the url: 
${url}`,
        {
          // attachments: {
          //   uri: 'path/myfile.png',
          //   mimeType: 'image/png',
          //   filename: 'myfile.png',
          // },
        }
      )
      // console.log({ result })
      if (result === "sent") {
        // console.log({ result })
        // enhanse friendship locally
        await friendsHelper.addFriendshipLocally({ friendshipUuid: friendship.friendshipUuid, contactId: contact.id })
        dispatch(reducer.reloadListOfFriends({ uuid }))
      }
    } else {
      // misfortune... there's no SMS available on this device
      Toast.show({
        text1: "SMS is not available on this devise",
        type: "error",
        topOffset,
      })
    }
    await navigation.popToTop()
    await navigation.navigate('FriendsList')
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

          // title: article.title,
          // contentImageUrl: photo.imgUrl,
          // contentDescription: article.description,
          // This metadata can be used to easily navigate back to this screen
          // when implementing deep linking with `Branch.subscribe`.
          contentMetadata: {
            customMetadata: {
              friendshipUuid, // your userId field would be defined under customMetadata
            },
          },
          // metadata: {
          //   // screen: 'friendshipScreen',
          //   params: { friendshipUuid },
          // },
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={
          false
        }>
        <Text>
          Pick where you want to send your invitation for:
        </Text>
        <Text h3>
          {contact?.name}
        </Text>

        {
          contact?.phoneNumbers?.map((phone, index) => (
            <ListItem
              bottomDivider
              key={phone.id}
              style={{
                paddingBottom: 5,
                paddingLeft: 10,
                paddingRight: 10,
                width: '100%',
              }}
              onPress={() => {
                // console.log({ phone })
                _sendFriendshipRequest({ contact, phone })
              }}>
              <ListItem.Content>
                <ListItem.Title>{phone.number}</ListItem.Title>
                <ListItem.Subtitle>{phone.label}</ListItem.Subtitle>
              </ListItem.Content>
              <ListItem.Chevron size={40} color={CONST.MAIN_COLOR} />
            </ListItem>
          ))
        }
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: 'row',
          }}
          onPress={
            async () => {
              const contact = await Contacts.presentFormAsync(contactId)
              setContact(await Contacts.getContactByIdAsync(contactId))
            }
          }>
          <Col
            size={1}
          />
          <Col
            size={10}
            style={{ flex: 5, justifyContent: "center", alignItems: "center" }}>
            <Text
              style={{
                fontSize: 25,
                color: CONST.MAIN_COLOR,
              }}>
              Edit contact in Phone book
            </Text>
          </Col>
          <Col
            size={1}>
            <MaterialIcons
              name="update" style={
                {
                  fontSize: 45,
                  color: CONST.MAIN_COLOR,
                }
              }
            />
          </Col>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}

ContactDetails.propTypes = {
  route: PropTypes.object.isRequired,
}

export default ContactDetails
