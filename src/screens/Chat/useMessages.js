import { gql } from '@apollo/client'
import * as Crypto from 'expo-crypto'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import { GiftedChat } from 'react-native-gifted-chat'
import Toast from 'react-native-toast-message'

import * as CONST from '../../consts'
import * as friendsHelper from '../FriendsList/friends_helper'
import * as reducer from './reducer'

/**
 * Custom hook to handle chat messages (loading, sending, pagination)
 * @param {Object} params
 * @param {string} params.chatUuid - Chat UUID
 * @param {string} params.uuid - Current user UUID
 * @param {Array} params.friendsList - List of friends
 * @param {string} params.text - Current text input value
 * @param {Function} params.setText - Function to update text input
 * @param {number} params.toastTopOffset - Toast top offset for positioning
 * @returns {Object} Object containing messages state and handlers
 */
export const useMessages = ({ chatUuid, uuid, friendsList, setText, toastTopOffset }) => {
  const [messages, setMessages] = useState([])

  const loadMessages = async ({ lastLoaded }) => {
    try {
      const messagesList = (
        await CONST.gqlClient.query({
          query: gql`
            query getMessagesList($chatUuid: String!, $lastLoaded: AWSDateTime!) {
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
            lastLoaded
          }
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
            friendsList
          })
        },
        image: message?.chatPhotoHash
          ? `${CONST.PRIVATE_IMG_HOST}${message?.chatPhotoHash}-thumb`
          : null,
        chatPhotoHash: message?.chatPhotoHash
      }))
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('failed to load messages: ', { e })
      Toast.show({
        text1: `Failed to load messages:`,
        text2: `${e}`,
        type: 'error',
        topOffset: toastTopOffset
      })
      return []
    }
  }

  const onLoadEarlier = async () => {
    if (!messages || messages.length === 0) {
      // eslint-disable-next-line no-console
      console.warn('No messages available for pagination')
      return
    }

    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || !lastMessage.createdAt) {
      // eslint-disable-next-line no-console
      console.error('Last message missing createdAt property')
      return
    }

    const earlierMessages = await loadMessages({
      chatUuid,
      lastLoaded: lastMessage.createdAt
    })
    setMessages((previousMessages) => GiftedChat.prepend(previousMessages, earlierMessages))
  }

  const onSend = useCallback(
    (newMessages = []) => {
      newMessages.forEach((message) => {
        (async () => {
          try {
            const { text: messageText } = message
            const messageUuid = Crypto.randomUUID()

            setMessages((previousMessages) =>
              GiftedChat.append(previousMessages, [
                {
                  _id: messageUuid,
                  text: messageText,
                  pending: true,
                  createdAt: moment(),
                  user: {
                    _id: uuid,
                    name: friendsHelper.getLocalContactName({
                      uuid,
                      friendUuid: uuid,
                      friendsList
                    })
                  },
                  image: message?.chatPhotoHash
                    ? `${CONST.PRIVATE_IMG_HOST}${message?.chatPhotoHash}-thumb`
                    : null,
                  chatPhotoHash: message?.chatPhotoHash
                }
              ])
            )

            await reducer.sendMessage({
              chatUuid,
              uuid,
              messageUuid,
              text: messageText,
              pending: false,
              chatPhotoHash: ''
            })
          } catch (e) {
            // eslint-disable-next-line no-console
            console.log('failed to send message: ', { e })
            Toast.show({
              text1: `Failed to send message:`,
              text2: `${e}`,
              type: 'error',
              topOffset: toastTopOffset
            })
          }
        })()
      })
      // Clear input after sending
      setText('')
    },
    [chatUuid, uuid, friendsList, toastTopOffset, setText]
  )

  // Initial load
  useEffect(() => {
    (async () => {
      setMessages([])
      setMessages(await loadMessages({ lastLoaded: moment() }))
      friendsHelper.resetUnreadCount({ chatUuid, uuid })
    })()

    CONST.makeSureDirectoryExists({
      directory: CONST.PENDING_UPLOADS_FOLDER_CHAT
    })
  }, [chatUuid, uuid])

  return { messages, setMessages, onSend, onLoadEarlier }
}
