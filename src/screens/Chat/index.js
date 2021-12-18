import React, { useEffect, useState, useCallback } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"
import { GiftedChat, Send } from 'react-native-gifted-chat'
import moment from 'moment'

import {
  Alert,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  ActivityIndicator,
} from 'react-native'

import {
  Text,
  Input,
  LinearProgress,
  Card,
  ListItem,
  Button,
  Icon,
} from 'react-native-elements'
// import * as FileSystem from 'expo-file-system'
import Toast from 'react-native-toast-message'

import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

import { gql } from "@apollo/client"

import PropTypes from 'prop-types'

import * as friendsHelper from '../FriendsList/friends_helper'

import * as CONST from '../../consts.js'
import subscriptionClient from '../../subscriptionClient'

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
        headerTitle: `chat with: ${contact?.name}`,
        headerTintColor: CONST.MAIN_COLOR,
        headerRight: renderHeaderRight,
        headerLeft: renderHeaderLeft,
        headerBackTitle: '',
        headerStyle: {
          backgroundColor: CONST.NAV_COLOR,
        },
      })

      setMessages(await _loadMessages({ chatUuid, lastLoaded: moment() }))
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // console.log(`subscribing to ${chatUuid}`)
    // add subscription listener
    const subscription = subscriptionClient
      .subscribe({
        query: gql`
        subscription onSendMessage($chatUuid: String!) {
          onSendMessage (chatUuid: $chatUuid) {
            chatUuid
            createdAt
            messageUuid
            text
            updatedAt
            uuid          }
        }
        `,
        variables: {
          chatUuid,
        },
      })
      .subscribe({
        next(data) {
          const { onSendMessage } = data?.data
          // console.log({ onSendMessage })

          setMessages(previousMessages => GiftedChat.append(previousMessages, [_messageAdapter(onSendMessage)]))

          // update read counts
          CONST.gqlClient
            .mutate({
              mutation: gql`
              mutation
              resetUnreadCount($chatUuid: String!, $uuid: String!) {
                resetUnreadCount(chatUuid: $chatUuid, uuid: $uuid)                   
              }
              `,
              variables: {
                chatUuid,
                uuid,
              },
            })
        },
        error({ error }) {
          console.log({ error })
        },
        complete() { console.log("subs. DONE") }, // never printed
      })

    // console.log({ subscription })

    // subscription.subscribe(
    //   next => {
    //     console.log({ next })
    //   },
    //   error => {
    //     console.log({ error })
    //   }
    // )

    return () => {
      // console.log(`unsubscribing from ${chatUuid}`)
      subscription.unsubscribe()
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
        _messageAdapter(message)
      ))
    } catch (e) {
      Toast.show({
        text1: `Failed to load messages:`,
        text2: `${e}`,
        type: "error",
        topOffset,
      })
      // console.log({ e })
    }
  }

  const _messageAdapter = message => ({
    _id: message.messageUuid,
    text: message.text,
    createdAt: message.createdAt,
    user: {
      _id: message.uuid,
      name: friendsHelper.getLocalContactName({ uuid, friendUuid: message.uuid, friendsList }),
      // avatar: 'https://placeimg.com/140/140/any',
    },
  })

  const onSend = useCallback((messages = []) => {
    messages.forEach(message => {
      (async () => {
        try {
          const { _id, text } = message
          const messageUuid = _id

          const returnedMessage = (await CONST.gqlClient
            .mutate({
              mutation: gql`
              mutation
              sendMessage($chatUuidArg: String!, $uuidArg: String!, $messageUuidArg: String!, $textArg: String!) {
                sendMessage(chatUuidArg: $chatUuidArg, uuidArg: $uuidArg, messageUuidArg: $messageUuidArg,textArg: $textArg) {
                  chatUuid
                  createdAt
                  messageUuid
                  text
                  updatedAt
                  uuid
                  }
              }
              `,
              variables: {
                chatUuidArg: chatUuid,
                uuidArg: uuid,
                messageUuidArg: messageUuid,
                textArg: text,
              },
            })).data.sendMessage

          // console.log({ message })
          // console.log({ returnedMessage })

          // if (message._id === returnedMessage.messageUuid) {
          //   setMessages(previousMessages => GiftedChat.append(previousMessages, [message]))
          // }
        } catch (e) {
          Toast.show({
            text1: `Failed to send message:`,
            text2: `${e}`,
            type: "error",
            topOffset,
          })
          // console.log({ e })
        }
      })()
    })
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

  const scrollToBottomComponent = () => (
    <View style={{
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      {/* <MaterialCommunityIcons
        name="send-circle"
        size={35}
        style={
          {
            marginRight: 10,
            marginBottom: 10,
            color: CONST.MAIN_COLOR,
          }
        }
      /> */}
      <Icon
        reverse
        name="angle-double-down"
        type="font-awesome"
        color={CONST.MAIN_COLOR}
        size={36}
      />
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
        scrollToBottomComponent={scrollToBottomComponent}
        infiniteScroll
        loadEarlier
        onLoadEarlier={onLoadEarlier}
        renderUsernameOnMessage
      />
    </SafeAreaView>
  )
}

Chat.propTypes = {
  route: PropTypes.object.isRequired,
}

export default Chat
