import React, { useEffect, useState, useCallback } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"
import { GiftedChat, Send } from 'react-native-gifted-chat'
import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'

import * as ImagePicker from 'expo-image-picker'
import * as Linking from 'expo-linking'
import * as Crypto from 'expo-crypto'
import * as FileSystem from 'expo-file-system'
import CachedImage from 'expo-cached-image'

import {
  Alert,
  SafeAreaView,
  StyleSheet,
  // ScrollView,
  View,
  ActivityIndicator,
  TouchableHighlight,
} from 'react-native'

import {
  Text,
  // Input,
  // LinearProgress,
  // Card,
  // ListItem,
  // Button,
  Icon,
} from 'react-native-elements'
// import * as FileSystem from 'expo-file-system'
import Toast from 'react-native-toast-message'

import {
  FontAwesome,
  // Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons'

import { gql } from "@apollo/client"

import PropTypes from 'prop-types'

import * as reducer from './reducer'

import * as friendsHelper from '../FriendsList/friends_helper'

import * as friendsListReducer from '../FriendsList/reducer'

import * as CONST from '../../consts.js'
import subscriptionClient from '../../subscriptionClientWs'

const Chat = ({ route }) => {
  const { chatUuid, contact } = route.params

  const navigation = useNavigation()
  const dispatch = useDispatch()

  const topOffset = useSelector(state => state.photosList.topOffset)

  const uuid = useSelector(state => state.secret.uuid)
  const friendsList = useSelector(state => state.friendsList.friendsList)

  const [messages, setMessages] = useState([])
  // .format("YYYY-MM-DD HH:mm:ss.SSS")
  // const [lastRead, setLastRead] = useState(moment())

  useEffect(() => {
    (async () => {
      navigation.setOptions({
        headerTitle: `chat with: ${contact}`,
        headerTintColor: CONST.MAIN_COLOR,
        headerRight: renderHeaderRight,
        headerLeft: renderHeaderLeft,
        headerBackTitle: '',
        headerStyle: {
          backgroundColor: CONST.NAV_COLOR,
        },
      })

      setMessages(await _loadMessages({ chatUuid, lastLoaded: moment() }))
      friendsHelper.resetUnreadCount({ chatUuid, uuid })
    })()

    CONST._makeSureDirectoryExists({ directory: CONST.PENDING_UPLOADS_FOLDER_CHAT })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    console.log(`subscribing to ${chatUuid}`)
    // add subscription listener
    const observableObject = subscriptionClient
      .subscribe({
        query: gql`
        subscription onSendMessage($chatUuid: String!) {
          onSendMessage (chatUuid: $chatUuid) {
            chatUuid
            createdAt
            messageUuid
            text
            pending
            chatPhotoHash
            updatedAt
            uuid
          }
        }`,
        variables: {
          chatUuid,
        },
      })
    // console.log({ observableObject })
    const subscriptionParameters = {
      // onmessage() {
      //   console.log("onMessage")
      // },
      // start() {
      //   console.log('observableObject:: Start')
      // },
      next(data) {
        // console.log('observableObject:: ', { data })
        const { onSendMessage } = data?.data
        // console.log({ onSendMessage })
        setMessages(previousMessages => {
          const updatedMessages = previousMessages.map(message => {
            if (message._id === onSendMessage.messageUuid) { // this is the update of the message which is already in the feed
              return {
                _id: onSendMessage.messageUuid,
                text: onSendMessage.text,
                pending: onSendMessage.pending,
                createdAt: onSendMessage.createdAt,
                user: {
                  _id: onSendMessage.uuid,
                  name: friendsHelper.getLocalContactName({ uuid, friendUuid: onSendMessage.uuid, friendsList }),
                  // avatar: 'https://placeimg.com/140/140/any',
                },
                image: onSendMessage?.chatPhotoHash ? `${CONST.PRIVATE_IMG_HOST}${onSendMessage?.chatPhotoHash}-thumb` : '',
                chatPhotoHash: onSendMessage?.chatPhotoHash || '',
              }
            }
            return message
          })

          // this is a new message which was not present in the feed, let's append it to the end
          if (updatedMessages.find(message => message._id === onSendMessage.messageUuid) === undefined) {
            // console.log({ onSendMessage })
            return [
              {
                _id: onSendMessage.messageUuid,
                text: onSendMessage.text,
                pending: onSendMessage.pending,
                createdAt: onSendMessage.createdAt,
                user: {
                  _id: onSendMessage.uuid,
                  name: friendsHelper.getLocalContactName({ uuid, friendUuid: onSendMessage.uuid, friendsList }),
                  // avatar: 'https://placeimg.com/140/140/any',
                },
                image: onSendMessage?.chatPhotoHash ? `${CONST.PRIVATE_IMG_HOST}${onSendMessage?.chatPhotoHash}-thumb` : '',
                chatPhotoHash: onSendMessage?.chatPhotoHash || '',
              },
              ...updatedMessages,
            ]
          } // if this is the new message
          // console.log({ updatedMessages })
          return updatedMessages
        })
        // update read counts
        friendsHelper.resetUnreadCount({ chatUuid, uuid })
      },
      error(error) {
        console.error("observableObject:: subscription error", { error })

        Toast.show({
          text1: 'Trying to re-connect, chat may not function properly.',
          // text2: 'You may want to leave this screen and come back to it again, to make it work.',
          text2: JSON.stringify({ error }),
          type: "error",
          topOffset,
        })
        console.log('------------------------- this is the whole new begining --------------------------------------')
        subscription.unsubscribe()
        observableObject.subscribe(subscriptionParameters)
        // // _return({ uuid })
      },
      complete() {
        console.log("observableObject:: subs. DONE")
      }, // never printed
    }
    // console.log({ observableObject })
    // console.log(Object.entries(observableObject))

    const subscription = observableObject.subscribe(subscriptionParameters)

    // const subscription = observableObject.subscribe(result => {
    //   console.log('Subscription data => ', { result })
    // })

    return () => {
      subscription.unsubscribe()
      console.log(`unsubscribing from ${chatUuid}`)
    }
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  const _loadMessages = async ({ chatUuid, lastLoaded }) => {
    try {
      const messagesList = (await CONST.gqlClient
        .query({
          query: gql`
        query getMessagesList($chatUuid: String!, $lastLoaded: AWSDateTime!) {
          getMessagesList(chatUuid: $chatUuid, lastLoaded: $lastLoaded){
            uuid,
            messageUuid, 
            text, 
            pending, 
            chatPhotoHash,
            createdAt,
            updatedAt
          }
        }`,
          variables: {
            chatUuid,
            lastLoaded,
          },
          // fetchPolicy: "network-only",
        })).data.getMessagesList
      return messagesList.map(message => (
        {
          _id: message.messageUuid,
          text: message.text,
          pending: message.pending,
          createdAt: message.createdAt,
          user: {
            _id: message.uuid,
            name: friendsHelper.getLocalContactName({ uuid, friendUuid: message.uuid, friendsList }),
            // avatar: 'https://placeimg.com/140/140/any',
          },
          image: message?.chatPhotoHash ? `${CONST.PRIVATE_IMG_HOST}${message?.chatPhotoHash}-thumb` : null,
          chatPhotoHash: message?.chatPhotoHash,
        }
      ))
    } catch (e) {
      console.log("failed to load messages: ", { e })
      Toast.show({
        text1: `Failed to load messages:`,
        text2: `${e}`,
        type: "error",
        topOffset,
      })
      // console.log({ e })
    }
  }

  const onSend = useCallback((messages = []) => {
    messages.forEach(message => {
      (async () => {
        try {
          const { _id, text } = message
          const messageUuid = _id

          setMessages(previousMessages => GiftedChat.append(previousMessages,
            [{
              _id,
              text,
              pending: true,
              createdAt: moment(),
              user: {
                _id: uuid,
                name: friendsHelper.getLocalContactName({ uuid, friendUuid: uuid, friendsList }),
                // avatar: 'https://placeimg.com/140/140/any',
              },
              image: message?.chatPhotoHash ? `${CONST.PRIVATE_IMG_HOST}${message?.chatPhotoHash}-thumb` : null,
              chatPhotoHash: message?.chatPhotoHash,
            }]))

          const returnedMessage = await reducer.sendMessage({
            chatUuid, uuid, messageUuid, text, pending: false, chatPhotoHash: '',
          })
        } catch (e) {
          console.log("failed to send message: ", { e })
          Toast.show({
            text1: `Failed to send message:`,
            text2: `${e}`,
            type: "error",
            topOffset,
          })
        }
      })()
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    // scrollView: {
  //     alignItems: 'center',
  //     marginHorizontal: 0,
  //     paddingBottom: 300,
  //   },
  //   thumbnail: {
  //     // flex: 1,
  //     // alignSelf: 'stretch',
  //     width: '100%',
  //     height: '100%',
  //     borderRadius: 10,
  //   },
  })

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
        () => {
          _return({ uuid })
        }
      }
    />
  )
  const _return = ({ uuid }) => {
    dispatch(friendsListReducer.reloadFriendsList({ uuid }))
    dispatch(friendsListReducer.reloadUnreadCountsList({ uuid }))// the list of enhanced friends list has to be loaded earlier on
    navigation.goBack()
  }
  const renderSend = props => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Send {...props}>
      <View style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <MaterialCommunityIcons
          name="send-circle"
          size={35}
          style={
            {
              marginRight: 10,
              marginBottom: 10,
              color: CONST.MAIN_COLOR,
            }
          }
        />
      </View>
    </Send>
  )

  const renderLoading = () => (
    <View style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <ActivityIndicator size="large" color={CONST.MAIN_COLOR} />
    </View>
  )

  const onLoadEarlier = async () => {
    // console.log('onLoadEarlier')
    // setMessages([...messages, await _loadMessages({ chatUuid, pageNumber: pageNumber + 1 })])
    const earlierMessages = await _loadMessages({ chatUuid, lastLoaded: messages[messages.length - 1].createdAt })
    setMessages(previousMessages => GiftedChat.prepend(previousMessages, earlierMessages))
    // setMessages([(await _loadMessages({ chatUuid, pageNumber: pageNumber + 1 })), ...messages])

    // setLastRead(earlierMessages[0].createdAt)
  }

  const renderAccessory = () => (
    <View style={{
      flexDirection: 'row',
      // alignItems: 'center',
      justifyContent: 'space-evenly',
      padding: 10,
    }}>
      <View />
      {/* <FontAwesome
        name="camera"
        size={25}
        style={
          {
            // marginRight: 10,
            // marginBottom: 10,
            color: CONST.MAIN_COLOR,
          }
        }
      /> */}
      <FontAwesome
        name="image"
        size={25}
        style={
          {
            // marginRight: 10,
            // marginBottom: 10,
            color: CONST.MAIN_COLOR,
          }
        }
        onPress={async () => pickAsset()}
      />
      <View />
    </View>
  )

  const pickAsset = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (permissionResult.granted === false) {
      Alert.alert(
        "Do you want to use photos from your albom?",
        "Why don't you enable this permission in settings?",
        [
          {
            text: 'Open Settings',
            onPress: () => {
              Linking.openSettings()
            },
          },
        ],
      )
      return
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync()
    const fileContents = await FileSystem.readAsStringAsync(pickerResult.uri, { encoding: FileSystem.EncodingType.Base64 })
    const chatPhotoHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      fileContents
    )
    // console.log('photoHash: ', chatPhotoHash)
    const messageUuid = uuidv4()

    await dispatch(reducer.queueFileForUpload({ assetUrl: pickerResult.uri, chatPhotoHash, messageUuid }))

    setMessages(previousMessages => GiftedChat.append(previousMessages,
      [{
        _id: messageUuid,
        text: '',
        pending: true,
        createdAt: moment(),
        user: {
          _id: uuid,
          name: friendsHelper.getLocalContactName({ uuid, friendUuid: uuid, friendsList }),
          // avatar: 'https://placeimg.com/140/140/any',
        },
        image: `${CONST.PRIVATE_IMG_HOST}${chatPhotoHash}-thumb`,
        chatPhotoHash,
      }]))

    const returnedMessage = await reducer.sendMessage({
      chatUuid, uuid, messageUuid, text: "", pending: true, chatPhotoHash,
    })

    dispatch(reducer.uploadPendingPhotos({ chatUuid }))
  }

  const renderMessageImage = props => {
    console.log()
    const { currentMessage: { image, chatPhotoHash } } = props
    // console.log({ image, chatPhotoHash })

    return (
      <TouchableHighlight
        // onPress={() => onThumbPress(item)}
        style={
          {
            width: 200,
            height: 200,
            // borderRadius: 10,
            // flex: 1,
            alignSelf: 'stretch',
          }

        }>

        <CachedImage
          source={{ uri: `${image}` }}
          cacheKey={`${chatPhotoHash}-thumb`}
          resizeMode="contain"
          style={{
            width: '100%',
            height: '100%',
            // borderRadius: 10,
          }}
        />
      </TouchableHighlight>

    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: uuid,
        }}
        // alwaysShowSend
        renderSend={renderSend}
        renderLoading={renderLoading}
        renderMessageImage={renderMessageImage}
        // scrollToBottomComponent={scrollToBottomComponent}
        infiniteScroll
        loadEarlier
        onLoadEarlier={onLoadEarlier}
        renderUsernameOnMessage
        renderAccessory={renderAccessory}
      />
    </SafeAreaView>
  )
}

Chat.propTypes = {
  route: PropTypes.object.isRequired,
}

export default Chat
