import { gql } from '@apollo/client'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useEffect, useRef } from 'react'
import { AppState } from 'react-native'
import Toast from 'react-native-toast-message'

import * as CONST from '../../consts'
import directSubscriptionClient from '../../directSubscriptionClient'
import * as friendsHelper from '../FriendsList/friends_helper'

/**
 * Custom hook to handle chat subscription
 * @param {Object} params
 * @param {string} params.chatUuid - Chat UUID
 * @param {string} params.uuid - Current user UUID
 * @param {Array} params.friendsList - List of friends
 * @param {Function} params.setMessages - Function to update messages
 * @param {number} params.toastTopOffset - Toast top offset for positioning
 * @returns {Object} Object containing subscription refs
 */
export const useChatSubscription = ({ chatUuid, uuid, friendsList, setMessages, toastTopOffset }) => {
  const subscriptionRef = useRef(null)
  const isSubscribedRef = useRef(false)
  const appStateRef = useRef(AppState.currentState)

  // Subscription setup effect
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(`subscribing to ${chatUuid}`)
    isSubscribedRef.current = false

    const subscriptionQuery = gql`
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
    `

    const subscriptionParameters = {
      next(data) {
        // Check if this is an error object being passed to next
        if (data?.error) {
          // eslint-disable-next-line no-console
          console.error('❌ Error in subscription data:', data.error)
          return
        }

        // eslint-disable-next-line no-unsafe-optional-chaining
        if (!data?.data?.onSendMessage) {
          // eslint-disable-next-line no-console
          console.warn('Invalid subscription data received:', data)
          return
        }

        // Mark subscription as active when we receive first VALID message
        if (!isSubscribedRef.current) {
          // eslint-disable-next-line no-console
          console.log(`✅ Subscription active for ${chatUuid}`)
          isSubscribedRef.current = true
        }

        const { onSendMessage } = data.data
        // eslint-disable-next-line no-console
        console.log('📨 Received message:', {
          messageUuid: onSendMessage.messageUuid,
          text: onSendMessage.text,
          from: onSendMessage.uuid
        })

        setMessages((previousMessages) => {
          const updatedMessages = previousMessages.map((message) => {
            // eslint-disable-next-line no-underscore-dangle
            if (message._id === onSendMessage.messageUuid) {
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
                    friendsList
                  })
                },
                image: onSendMessage?.chatPhotoHash
                  ? `${CONST.PRIVATE_IMG_HOST}${onSendMessage?.chatPhotoHash}-thumb`
                  : '',
                chatPhotoHash: onSendMessage?.chatPhotoHash || ''
              }
            }
            return message
          })

          // this is a new message which was not present in the feed
          if (
            updatedMessages.find(
              // eslint-disable-next-line no-underscore-dangle
              (message) => message._id === onSendMessage.messageUuid
            ) === undefined
          ) {
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
                    friendsList
                  })
                },
                image: onSendMessage?.chatPhotoHash
                  ? `${CONST.PRIVATE_IMG_HOST}${onSendMessage?.chatPhotoHash}-thumb`
                  : '',
                chatPhotoHash: onSendMessage?.chatPhotoHash || ''
              },
              ...updatedMessages
            ]
          }
          return updatedMessages
        })
        // update read counts
        friendsHelper.resetUnreadCount({ chatUuid, uuid })
      },
      error(error) {
        // eslint-disable-next-line no-console
        console.error('❌ observableObject:: subscription error', { error })
        isSubscribedRef.current = false

        Toast.show({
          text1: 'Connection lost. Attempting to reconnect...',
          text2: JSON.stringify({ error }),
          type: 'error',
          topOffset: toastTopOffset
        })
        // eslint-disable-next-line no-console
        console.log('🔄 Attempting to resubscribe after error')

        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe()
        }
        // Resubscribe using the direct client
        subscriptionRef.current = directSubscriptionClient
          .request({
            query: subscriptionQuery,
            variables: { chatUuid }
          })
          .subscribe(subscriptionParameters)
      },
      complete() {
        // eslint-disable-next-line no-console
        console.log('observableObject:: subs. DONE')
        isSubscribedRef.current = false
      }
    }

    // Subscribe using the direct subscription client
    const subscription = directSubscriptionClient
      .request({
        query: subscriptionQuery,
        variables: { chatUuid }
      })
      .subscribe(subscriptionParameters)

    subscriptionRef.current = subscription

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
      isSubscribedRef.current = false
      // eslint-disable-next-line no-console
      console.log(`unsubscribing from ${chatUuid}`)
    }
  }, [chatUuid, friendsList, uuid, toastTopOffset, setMessages])

  // AppState listener to handle app going to background and coming back
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // eslint-disable-next-line no-console
      console.log('AppState changed:', appStateRef.current, '->', nextAppState)

      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // eslint-disable-next-line no-console
        console.log('🔄 App came to foreground, checking subscription health')

        if (!isSubscribedRef.current) {
          // eslint-disable-next-line no-console
          console.warn('⚠️ Subscription not active after returning to foreground')
          Toast.show({
            text1: 'Reconnecting to chat...',
            type: 'info',
            topOffset: toastTopOffset,
            visibilityTime: 2000
          })
        } else {
          // eslint-disable-next-line no-console
          console.log('✅ Subscription still active')
        }
      }

      appStateRef.current = nextAppState
    })

    return () => {
      subscription.remove()
    }
  }, [toastTopOffset])

  // Focus effect to refresh connection when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // eslint-disable-next-line no-console
      console.log('📱 Chat screen focused')
      if (!isSubscribedRef.current) {
        // eslint-disable-next-line no-console
        console.warn('⚠️ Subscription not active on focus')
      }

      return () => {
        // eslint-disable-next-line no-console
        console.log('📱 Chat screen unfocused')
      }
    }, [])
  )

  return { subscriptionRef, isSubscribedRef, appStateRef }
}
