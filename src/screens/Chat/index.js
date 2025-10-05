import { router } from 'expo-router'
import { useAtom } from 'jotai'
import { useCallback, useState } from 'react'

import { GiftedChat } from 'react-native-gifted-chat'

import {
  Animated,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native'

import { FontAwesome } from '@expo/vector-icons'
import PropTypes from 'prop-types'
import { PanGestureHandler } from 'react-native-gesture-handler'

import { useSafeAreaViewStyle } from '../../hooks/useStatusBarHeight'
import useToastTopOffset from '../../hooks/useToastTopOffset'
import * as STATE from '../../state'
import { getTheme } from '../../theme/sharedStyles'
import * as friendsHelper from '../FriendsList/friends_helper'
import ChatPhoto from './ChatPhoto'

// Custom hooks
import { useChatDeletion } from './useChatDeletion'
import { useChatSubscription } from './useChatSubscription'
import { useMediaUpload } from './useMediaUpload'
import { useMessages } from './useMessages'
import { useSwipeGesture } from './useSwipeGesture'

// Custom components
import {
  ChatBubble,
  ChatComposer,
  ChatInputToolbar,
  ChatLoading,
  ChatSend,
  ChatTime
} from './ChatComponents'

const Chat = ({ route }) => {
  const [uuid, setUuid] = useAtom(STATE.uuid)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const [friendsList, setFriendsList] = useAtom(STATE.friendsList)

  const toastTopOffset = useToastTopOffset()
  const theme = getTheme(isDarkMode)
  const safeAreaViewStyle = useSafeAreaViewStyle()

  const { chatUuid, contact, friendshipUuid } = route.params

  const [text, setText] = useState('')

  // Handle text input changes
  const handleTextChange = useCallback((newText) => {
    setText(newText)
  }, [])

  const goBack = async () => {
    setFriendsList(
      await friendsHelper.getEnhancedListOfFriendships({
        uuid
      })
    )
    router.replace('/friends')
  }

  // Custom hooks for chat functionality
  const { handleDeleteChat } = useChatDeletion({
    uuid,
    friendshipUuid,
    contact,
    setFriendsList,
    toastTopOffset
  })

  const { translateX, handleSwipeGesture } = useSwipeGesture({
    onDelete: handleDeleteChat
  })

  const { messages, setMessages, onSend, onLoadEarlier } = useMessages({
    chatUuid,
    uuid,
    friendsList,
    setText,
    toastTopOffset
  })

  const { pickAsset, takePhoto } = useMediaUpload({
    chatUuid,
    uuid,
    friendsList,
    setMessages,
    toastTopOffset
  })

  // Set up subscription
  useChatSubscription({
    chatUuid,
    uuid,
    friendsList,
    setMessages,
    toastTopOffset
  })

  // Styles
  const createStyles = (currentTheme) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: currentTheme.BACKGROUND
      },
      deleteAction: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        width: 120,
        backgroundColor: currentTheme.STATUS_ERROR,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -1
      },
      deleteActionText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 4
      },
      chatContainer: {
        flex: 1,
        backgroundColor: currentTheme.BACKGROUND
      }
    })

  const styles = createStyles(theme)

  return (
    <SafeAreaView style={[styles.container, safeAreaViewStyle]}>
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
                transform: [{ translateX }]
              }
            ]}
          >
            <GiftedChat
              messages={messages}
              onSend={(msgs) => onSend(msgs)}
              user={{
                _id: uuid
              }}
              text={text}
              onInputTextChanged={handleTextChange}
              renderComposer={() => (
                <ChatComposer theme={theme} text={text} onChangeText={handleTextChange} />
              )}
              renderSend={(props) => <ChatSend {...props} theme={theme} />}
              renderLoading={() => <ChatLoading theme={theme} />}
              renderMessageImage={(props) => <ChatPhoto {...props} />}
              infiniteScroll
              loadEarlier
              onLoadEarlier={onLoadEarlier}
              renderUsernameOnMessage
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
                minHeight: 40
              }}
              inputToolbarStyle={{
                backgroundColor: theme.BACKGROUND,
                borderTopColor: theme.BORDER,
                borderTopWidth: 1,
                paddingVertical: 8,
                paddingHorizontal: 12,
                minHeight: 60
              }}
              textInputProps={{
                placeholderTextColor: theme.TEXT_SECONDARY,
                autoFocus: false,
                blurOnSubmit: false,
                multiline: true,
                numberOfLines: 4
              }}
              inputToolbarProps={{
                containerStyle: {
                  backgroundColor: theme.BACKGROUND,
                  borderTopColor: theme.BORDER,
                  borderTopWidth: 1,
                  paddingVertical: 8,
                  paddingHorizontal: 12
                }
              }}
              placeholderTextColor={theme.TEXT_SECONDARY}
              renderBubble={(props) => <ChatBubble {...props} theme={theme} />}
              renderInputToolbar={(props) => <ChatInputToolbar {...props} theme={theme} />}
              renderTime={(props) => <ChatTime {...props} theme={theme} />}
              listViewProps={{
                initialNumToRender: 10,
                maxToRenderPerBatch: 10,
                windowSize: 15,
                updateCellsBatchingPeriod: 50,
                removeClippedSubviews: true
              }}
            />
          </Animated.View>
        </PanGestureHandler>
      </View>
    </SafeAreaView>
  )
}

Chat.propTypes = {
  route: PropTypes.object.isRequired
}

export default Chat
