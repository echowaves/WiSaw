import { useAtom } from 'jotai'

import { useNavigation } from '@react-navigation/native'
import { router } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'

import * as MediaLibrary from 'expo-media-library'
import moment from 'moment'
import {
  Bubble,
  GiftedChat,
  InputToolbar,
  Send,
  Time,
} from 'react-native-gifted-chat'
import { v4 as uuidv4 } from 'uuid'

import * as Crypto from 'expo-crypto'
import * as FileSystem from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker'
import * as Linking from 'expo-linking'

import {
  ActivityIndicator,
  Alert,
  Animated,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  // ScrollView,
  View,
} from 'react-native'

import * as Haptics from 'expo-haptics'
import { PanGestureHandler, State } from 'react-native-gesture-handler'

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
import { getTheme } from '../../theme/sharedStyles'

import ModernHeaderButton from '../../components/ModernHeaderButton'
import ChatPhoto from './ChatPhoto'

const Chat = ({ route }) => {
  const [uuid, setUuid] = useAtom(STATE.uuid)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const [topOffset, setTopOffset] = useAtom(STATE.topOffset)
  const [friendsList, setFriendsList] = useAtom(STATE.friendsList)

  const theme = getTheme(isDarkMode)

  const { chatUuid, contact, friendshipUuid } = route.params

  const navigation = useNavigation()

  const [messages, setMessages] = useState([])
  // .format("YYYY-MM-DD HH:mm:ss.SSS")
  // const [lastRead, setLastRead] = useState(moment())

  // Swipe gesture state
  const translateX = useRef(new Animated.Value(0)).current
  const [isSwipeOpen, setIsSwipeOpen] = useState(false)

  const goBack = async () => {
    setFriendsList(
      await friendsHelper.getEnhancedListOfFriendships({
        uuid,
      }),
    )

    router.replace('/friends')
  }

  // Handle swipe gesture for delete chat
  const handleSwipeGesture = (event) => {
    const { translationX, state } = event.nativeEvent

    if (state === State.ACTIVE) {
      // Only allow swipe to the left (negative translation)
      if (translationX < 0) {
        const clampedTranslation = Math.max(translationX, -120)
        translateX.setValue(clampedTranslation)
      }
    } else if (state === State.END || state === State.CANCELLED) {
      // Determine if swipe should trigger delete action
      if (translationX < -60) {
        // Trigger delete chat action
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        handleDeleteChat()
        // Reset swipe position
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start()
      } else {
        // Close the swipe action
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start()
      }
    }
  }

  // Handle delete chat functionality
  const handleDeleteChat = () => {
    // Parse contact name from JSON string if needed
    const contactName =
      typeof contact === 'string' && contact.startsWith('"')
        ? JSON.parse(contact)
        : contact || 'this friend'

    Alert.alert(
      'Delete Chat',
      `Are you sure you want to delete all messages with ${contactName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Remove the friend which will also delete the chat
              const success = await friendsHelper.removeFriend({
                uuid,
                friendshipUuid,
              })

              if (success) {
                // Refresh the friends list
                const newFriendsList =
                  await friendsHelper.getEnhancedListOfFriendships({
                    uuid,
                  })
                setFriendsList(newFriendsList)

                Toast.show({
                  type: 'success',
                  position: 'top',
                  text1: 'Chat Deleted',
                  text2: 'All messages have been deleted',
                  visibilityTime: 2000,
                  autoHide: true,
                  topOffset: topOffset || 60,
                })

                // Navigate back to friends list
                router.replace('/friends')
              } else {
                Toast.show({
                  type: 'error',
                  position: 'top',
                  text1: 'Failed to delete chat',
                  text2: 'Please try again',
                  visibilityTime: 3000,
                  autoHide: true,
                  topOffset: topOffset || 60,
                })
              }
            } catch (error) {
              Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Failed to delete chat',
                text2: 'Please try again',
                visibilityTime: 3000,
                autoHide: true,
                topOffset: topOffset || 60,
              })
            }
          },
        },
      ],
    )
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
      // Clear messages when switching to a different chat
      setMessages([])

      // Remove navigation.setOptions as it's not compatible with Expo Router
      // The header is now controlled by the layout in app/(drawer)/(tabs)/chat.tsx
      // navigation.setOptions({
      //   headerTitle: `chat with: ${contact}`,
      //   headerTintColor: CONST.MAIN_COLOR,
      //   headerRight: renderHeaderRight,
      //   headerLeft: renderHeaderLeft,
      //   headerBackTitle: '',
      //   headerStyle: {
      //     backgroundColor: CONST.HEADER_GRADIENT_END,
      //     borderBottomWidth: 1,
      //     borderBottomColor: CONST.HEADER_BORDER_COLOR,
      //     shadowColor: CONST.HEADER_SHADOW_COLOR,
      //     shadowOffset: {
      //       width: 0,
      //       height: 2,
      //     },
      //     shadowOpacity: 1,
      //     shadowRadius: 4,
      //     elevation: 3,
      //   },
      //   headerTitleStyle: {
      //     fontSize: 18,
      //     fontWeight: '600',
      //     color: CONST.TEXT_COLOR,
      //   },
      // })

      setMessages(await loadMessages({ lastLoaded: moment() }))
      friendsHelper.resetUnreadCount({ chatUuid, uuid })
    })()

    CONST.makeSureDirectoryExists({
      directory: CONST.PENDING_UPLOADS_FOLDER_CHAT,
    })
  }, [chatUuid, uuid]) // Added dependencies to re-run when chat changes

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
  }, [chatUuid, friendsList, uuid]) // Added dependencies to re-run when chat or friends change

  // eslint-disable-next-line no-shadow
  const onSend = useCallback(
    (messages = []) => {
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
    },
    [chatUuid, uuid, friendsList, topOffset],
  )

  const createStyles = (theme) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.BACKGROUND,
      },
      deleteAction: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        width: 120,
        backgroundColor: theme.STATUS_ERROR,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -1,
      },
      deleteActionText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 4,
      },
      chatContainer: {
        flex: 1,
        backgroundColor: theme.BACKGROUND,
      },
    })

  const styles = createStyles(theme)

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
            color: theme.STATUS_SUCCESS,
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
      <ActivityIndicator size="large" color={theme.STATUS_SUCCESS} />
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
        justifyContent: 'space-evenly',
        padding: 16,
        backgroundColor: theme.CARD_BACKGROUND,
        borderTopWidth: 1,
        borderTopColor: theme.CARD_BORDER,
      }}
    >
      <View />
      <FontAwesome
        name="camera"
        size={25}
        style={{
          // marginRight: 10,
          // marginBottom: 10,
          color: theme.STATUS_SUCCESS,
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
          color: theme.STATUS_SUCCESS,
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
      exif: true,
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
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.container}>
        {/* Delete Action Background */}
        <View style={styles.deleteAction}>
          <FontAwesome name="trash" size={24} color="white" />
          <Text style={styles.deleteActionText}>Delete{'\n'}Chat</Text>
        </View>

        {/* Main Chat Container with Swipe */}
        <PanGestureHandler onHandlerStateChange={handleSwipeGesture}>
          <Animated.View
            style={[
              styles.chatContainer,
              {
                transform: [{ translateX }],
              },
            ]}
          >
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

              // Dark mode styling props
              textInputStyle={{
                color: theme.TEXT_PRIMARY,
                backgroundColor: theme.CARD_BACKGROUND,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: theme.CARD_BORDER,
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginHorizontal: 0,
                marginVertical: 4,
                flex: 1,
              }}
              inputToolbarStyle={{
                backgroundColor: theme.BACKGROUND,
                borderTopColor: theme.BORDER,
                borderTopWidth: 1,
                paddingVertical: 8,
                paddingHorizontal: 12,
                minHeight: 60,
              }}
              textInputProps={{
                style: {
                  color: theme.TEXT_PRIMARY,
                  backgroundColor: theme.CARD_BACKGROUND,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: theme.CARD_BORDER,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  marginHorizontal: 0,
                  marginVertical: 4,
                  minHeight: 40,
                  flex: 1,
                },
                placeholderTextColor: theme.TEXT_SECONDARY,
              }}
              inputToolbarProps={{
                containerStyle: {
                  backgroundColor: theme.BACKGROUND,
                  borderTopColor: theme.BORDER,
                  borderTopWidth: 1,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                },
              }}
              composerStyle={{
                backgroundColor: theme.CARD_BACKGROUND,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: theme.CARD_BORDER,
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginHorizontal: 0,
                marginVertical: 4,
                minHeight: 40,
                flex: 1,
              }}
              multilineStyle={{
                backgroundColor: theme.CARD_BACKGROUND,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: theme.CARD_BORDER,
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginHorizontal: 0,
                marginVertical: 4,
                color: theme.TEXT_PRIMARY,
                minHeight: 40,
                flex: 1,
              }}
              placeholderTextColor={theme.TEXT_SECONDARY}
              // Message bubble styling for dark mode
              renderBubble={(props) => (
                <Bubble
                  {...props}
                  wrapperStyle={{
                    right: {
                      backgroundColor: theme.STATUS_SUCCESS, // Sent messages
                    },
                    left: {
                      backgroundColor: theme.CARD_BACKGROUND, // Received messages
                      borderColor: theme.CARD_BORDER,
                      borderWidth: 1,
                    },
                  }}
                  textStyle={{
                    right: {
                      color: '#FFFFFF', // White text on colored background
                    },
                    left: {
                      color: theme.TEXT_PRIMARY, // Themed text color
                    },
                  }}
                />
              )}
              // Custom input toolbar for better dark mode container styling
              renderInputToolbar={(props) => (
                <InputToolbar
                  {...props}
                  containerStyle={{
                    backgroundColor: theme.BACKGROUND,
                    borderTopColor: theme.BORDER,
                    borderTopWidth: 1,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    minHeight: 60,
                  }}
                  primaryStyle={{
                    alignItems: 'center',
                    flex: 1,
                  }}
                />
              )}
              // Time styling
              renderTime={(props) => (
                <Time
                  {...props}
                  timeTextStyle={{
                    right: {
                      color: 'rgba(255, 255, 255, 0.7)', // Light text on sent messages
                    },
                    left: {
                      color: theme.TEXT_SECONDARY, // Themed text for received messages
                    },
                  }}
                />
              )}
              // Performance optimizations
              listViewProps={{
                initialNumToRender: 10,
                maxToRenderPerBatch: 10,
                windowSize: 15,
                updateCellsBatchingPeriod: 50,
                removeClippedSubviews: true,
              }}
            />
          </Animated.View>
        </PanGestureHandler>
      </View>
    </SafeAreaView>
  )
}

Chat.propTypes = {
  route: PropTypes.object.isRequired,
}

export default Chat
