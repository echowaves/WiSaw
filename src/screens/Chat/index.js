import { useAtom } from 'jotai'

import { useNavigation } from '@react-navigation/native'
import React, { useCallback, useEffect, useState } from 'react'

import * as MediaLibrary from 'expo-media-library'
import moment from 'moment'
import { GiftedChat, Send } from 'react-native-gifted-chat'
import { v4 as uuidv4 } from 'uuid'

import * as Crypto from 'expo-crypto'
import * as FileSystem from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker'
import * as Linking from 'expo-linking'

import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  // ScrollView,
  View,
} from 'react-native'

// import * as FileSystem from 'expo-file-system'
import Toast from 'react-native-toast-message'

import {
  FontAwesome,
  // Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons'

import { gql } from '@apollo/client'

import PropTypes from 'prop-types'

import * as reducer from './reducer'

import * as friendsHelper from '../FriendsList/friends_helper'

import * as CONST from '../../consts'
import * as STATE from '../../state'
import subscriptionClient from '../../subscriptionClientWs'

import ChatPhoto from './ChatPhoto'
import ModernHeaderButton from '../../components/ModernHeaderButton'

const Chat = ({ route }) => {
  const [uuid, setUuid] = useAtom(STATE.uuid)
  const [topOffset, setTopOffset] = useAtom(STATE.topOffset)
  const [friendsList, setFriendsList] = useAtom(STATE.friendsList)

  const { chatUuid, contact } = route.params

  const navigation = useNavigation()

  const [messages, setMessages] = useState([])
  // .format("YYYY-MM-DD HH:mm:ss.SSS")
  // const [lastRead, setLastRead] = useState(moment())

  const goBack = async () => {
    setFriendsList(
      await friendsHelper.getEnhancedListOfFriendships({
        uuid,
      }),
    )

    navigation.pop()
  }

  const renderHeaderRight = () => {}

  const renderHeaderLeft = () => (
    <ModernHeaderButton
      iconName="chevron-left"
      iconSize={18}
      onPress={() => {
        goBack()
      }}
      containerStyle={{ marginLeft: 8 }}
    />
  )

  const loadMessages = async ({ lastLoaded }) => {
    try {
      const messagesList = (
        await CONST.gqlClient.query({
          query: gql`
            query getMessagesList(
              $chatUuid: String!
              $lastLoaded: AWSDateTime!
            ) {
              getMessagesList(chatUuid: $chatUuid, lastLoaded: $lastLoaded) {
                uuid
                messageUuid
                text
                pending
                chatPhotoHash
                createdAt
                updatedAt
              }
            }
          `,
          variables: {
            chatUuid,
            lastLoaded,
          },
          // fetchPolicy: "network-only",
        })
      ).data.getMessagesList
      return messagesList.map((message) => ({
        _id: message.messageUuid,
        text: message.text,
        pending: message.pending,
        createdAt: message.createdAt,
        user: {
          _id: message.uuid,
          name: friendsHelper.getLocalContactName({
            uuid,
            friendUuid: message.uuid,
            friendsList,
          }),
          // avatar: 'https://placeimg.com/140/140/any',
        },
        image: message?.chatPhotoHash
          ? `${CONST.PRIVATE_IMG_HOST}${message?.chatPhotoHash}-thumb`
          : null,
        chatPhotoHash: message?.chatPhotoHash,
      }))
    } catch (e) {
      console.log('failed to load messages: ', { e })
      Toast.show({
        text1: `Failed to load messages:`,
        text2: `${e}`,
        type: 'error',
        topOffset,
      })
      // console.log({ e })
      return []
    }
  }

  useEffect(() => {
    ;(async () => {
      navigation.setOptions({
        headerTitle: `chat with: ${contact}`,
        headerTintColor: CONST.MAIN_COLOR,
        headerRight: renderHeaderRight,
        headerLeft: renderHeaderLeft,
        headerBackTitle: '',
        headerStyle: {
          backgroundColor: CONST.HEADER_GRADIENT_END,
          borderBottomWidth: 1,
          borderBottomColor: CONST.HEADER_BORDER_COLOR,
          shadowColor: CONST.HEADER_SHADOW_COLOR,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 1,
          shadowRadius: 4,
          elevation: 3,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: CONST.TEXT_COLOR,
        },
      })

      setMessages(await loadMessages({ lastLoaded: moment() }))
      friendsHelper.resetUnreadCount({ chatUuid, uuid })
    })()

    CONST.makeSureDirectoryExists({
      directory: CONST.PENDING_UPLOADS_FOLDER_CHAT,
    })
  }, [])

  useEffect(() => {
    console.log(`subscribing to ${chatUuid}`)
    // add subscription listener
    const observableObject = subscriptionClient.subscribe({
      query: gql`
        subscription onSendMessage($chatUuid: String!) {
          onSendMessage(chatUuid: $chatUuid) {
            chatUuid
            createdAt
            messageUuid
            text
            pending
            chatPhotoHash
            updatedAt
            uuid
          }
        }
      `,
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
        // eslint-disable-next-line no-unsafe-optional-chaining
        const { onSendMessage } = data?.data
        // console.log({ onSendMessage })
        setMessages((previousMessages) => {
          const updatedMessages = previousMessages.map((message) => {
            // eslint-disable-next-line no-underscore-dangle
            if (message._id === onSendMessage.messageUuid) {
              // this is the update of the message which is already in the feed
              return {
                _id: onSendMessage.messageUuid,
                text: onSendMessage.text,
                pending: onSendMessage.pending,
                createdAt: onSendMessage.createdAt,
                user: {
                  _id: onSendMessage.uuid,
                  name: friendsHelper.getLocalContactName({
                    uuid,
                    friendUuid: onSendMessage.uuid,
                    friendsList,
                  }),
                  // avatar: 'https://placeimg.com/140/140/any',
                },
                image: onSendMessage?.chatPhotoHash
                  ? `${CONST.PRIVATE_IMG_HOST}${onSendMessage?.chatPhotoHash}-thumb`
                  : '',
                chatPhotoHash: onSendMessage?.chatPhotoHash || '',
              }
            }
            return message
          })

          // this is a new message which was not present in the feed, let's append it to the end
          if (
            updatedMessages.find(
              // eslint-disable-next-line no-underscore-dangle
              (message) => message._id === onSendMessage.messageUuid,
            ) === undefined
          ) {
            // console.log({ onSendMessage })
            return [
              {
                _id: onSendMessage.messageUuid,
                text: onSendMessage.text,
                pending: onSendMessage.pending,
                createdAt: onSendMessage.createdAt,
                user: {
                  _id: onSendMessage.uuid,
                  name: friendsHelper.getLocalContactName({
                    uuid,
                    friendUuid: onSendMessage.uuid,
                    friendsList,
                  }),
                  // avatar: 'https://placeimg.com/140/140/any',
                },
                image: onSendMessage?.chatPhotoHash
                  ? `${CONST.PRIVATE_IMG_HOST}${onSendMessage?.chatPhotoHash}-thumb`
                  : '',
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
        console.error('observableObject:: subscription error', { error })

        Toast.show({
          text1: 'Trying to re-connect, chat may not function properly.',
          // text2: 'You may want to leave this screen and come back to it again, to make it work.',
          text2: JSON.stringify({ error }),
          type: 'error',
          topOffset,
        })
        console.log(
          '------------------------- this is the whole new begining --------------------------------------',
        )
        // eslint-disable-next-line no-use-before-define
        subscription.unsubscribe()
        observableObject.subscribe(subscriptionParameters)
        // // _return({ uuid })
      },
      complete() {
        console.log('observableObject:: subs. DONE')
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
  }, [])

  // eslint-disable-next-line no-shadow
  const onSend = useCallback((messages = []) => {
    messages.forEach((message) => {
      ;(async () => {
        try {
          const { _id, text } = message
          const messageUuid = _id

          setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, [
              {
                _id,
                text,
                pending: true,
                createdAt: moment(),
                user: {
                  _id: uuid,
                  name: friendsHelper.getLocalContactName({
                    uuid,
                    friendUuid: uuid,
                    friendsList,
                  }),
                  // avatar: 'https://placeimg.com/140/140/any',
                },
                image: message?.chatPhotoHash
                  ? `${CONST.PRIVATE_IMG_HOST}${message?.chatPhotoHash}-thumb`
                  : null,
                chatPhotoHash: message?.chatPhotoHash,
              },
            ]),
          )

          const returnedMessage = await reducer.sendMessage({
            chatUuid,
            uuid,
            messageUuid,
            text,
            pending: false,
            chatPhotoHash: '',
          })
        } catch (e) {
          console.log('failed to send message: ', { e })
          Toast.show({
            text1: `Failed to send message:`,
            text2: `${e}`,
            type: 'error',
            topOffset,
          })
        }
      })()
    })
  }, [])

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  })

  const renderSend = (props) => (
    <Send {...props}>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <MaterialCommunityIcons
          name="send-circle"
          size={35}
          style={{
            marginRight: 10,
            marginBottom: 10,
            color: CONST.MAIN_COLOR,
          }}
        />
      </View>
    </Send>
  )

  const renderLoading = () => (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ActivityIndicator size="large" color={CONST.MAIN_COLOR} />
    </View>
  )

  const onLoadEarlier = async () => {
    // console.log('onLoadEarlier')
    // setMessages([...messages, await _loadMessages({ chatUuid, pageNumber: pageNumber + 1 })])
    const earlierMessages = await loadMessages({
      chatUuid,
      lastLoaded: messages[messages.length - 1].createdAt,
    })
    setMessages((previousMessages) =>
      GiftedChat.prepend(previousMessages, earlierMessages),
    )
    // setMessages([(await _loadMessages({ chatUuid, pageNumber: pageNumber + 1 })), ...messages])

    // setLastRead(earlierMessages[0].createdAt)
  }

  const renderAccessory = () => (
    <View
      style={{
        flexDirection: 'row',
        // alignItems: 'center',
        justifyContent: 'space-evenly',
        padding: 10,
      }}
    >
      <View />
      <FontAwesome
        name="camera"
        size={25}
        style={{
          // marginRight: 10,
          // marginBottom: 10,
          color: CONST.MAIN_COLOR,
        }}
        // eslint-disable-next-line no-use-before-define
        onPress={async () => takePhoto()}
      />
      <FontAwesome
        name="image"
        size={25}
        style={{
          // marginRight: 10,
          // marginBottom: 10,
          color: CONST.MAIN_COLOR,
        }}
        // eslint-disable-next-line no-use-before-define
        onPress={async () => pickAsset()}
      />
      <View />
    </View>
  )

  const uploadAsset = async ({ uri }) => {
    const fileContents = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    })
    const chatPhotoHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      fileContents,
    )
    console.log('photoHash: ', chatPhotoHash)

    const messageUuid = uuidv4()

    reducer.queueFileForUpload({ assetUrl: uri, chatPhotoHash, messageUuid })

    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, [
        {
          _id: messageUuid,
          text: '',
          pending: true,
          createdAt: moment(),
          user: {
            _id: uuid,
            name: friendsHelper.getLocalContactName({
              uuid,
              friendUuid: uuid,
              friendsList,
            }),
            // avatar: 'https://placeimg.com/140/140/any',
          },
          image: `${CONST.PRIVATE_IMG_HOST}${chatPhotoHash}-thumb`,
          chatPhotoHash,
        },
      ]),
    )

    const returnedMessage = await reducer.sendMessage({
      chatUuid,
      uuid,
      messageUuid,
      text: '',
      pending: true,
      chatPhotoHash,
    })

    reducer.uploadPendingPhotos({ chatUuid, uuid, topOffset })
  }

  const pickAsset = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (permissionResult.granted === false) {
      Alert.alert(
        'Do you want to use photos from your albom?',
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

    const { uri } = pickerResult
    uploadAsset({ uri })
  }

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync()

    if (permissionResult.granted === false) {
      Alert.alert(
        'Do you want to take photo with wisaw?',
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

    const cameraReturn = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      // allowsEditing: true,
      quality: 1.0,
      // exif: false,
    })

    if (cameraReturn.canceled === true) {
      return
    }

    await MediaLibrary.saveToLibraryAsync(cameraReturn.assets[0].uri)

    const { uri } = cameraReturn.assets[0]
    uploadAsset({ uri })
  }

  return (
    <SafeAreaView style={styles.container}>
      <GiftedChat
        messages={messages}
        // eslint-disable-next-line no-shadow
        onSend={(messages) => onSend(messages)}
        user={{
          _id: uuid,
        }}
        // alwaysShowSend
        renderSend={renderSend}
        renderLoading={renderLoading}
        renderMessageImage={(props) => <ChatPhoto {...props} />}
        // scrollToBottomComponent={scrollToBottomComponent}
        infiniteScroll
        loadEarlier
        onLoadEarlier={onLoadEarlier}
        renderUsernameOnMessage
        // renderAccessory={renderAccessory} // disabled photo taking for now
      />
    </SafeAreaView>
  )
}

Chat.propTypes = {
  route: PropTypes.object.isRequired,
}

export default Chat
