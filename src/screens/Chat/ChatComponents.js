import { MaterialCommunityIcons } from '@expo/vector-icons'
import PropTypes from 'prop-types'
import { ActivityIndicator, TextInput, View } from 'react-native'
import { Bubble, InputToolbar, Send, Time } from 'react-native-gifted-chat'

/**
 * Custom Send button component for GiftedChat
 */
export const ChatSend = ({ theme, ...props }) => (
  <Send {...props}>
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <MaterialCommunityIcons
        name='send-circle'
        size={35}
        style={{
          marginRight: 10,
          marginBottom: 10,
          color: theme.STATUS_SUCCESS
        }}
      />
    </View>
  </Send>
)

ChatSend.propTypes = {
  theme: PropTypes.object.isRequired
}

/**
 * Custom Composer component for text input
 */
export const ChatComposer = ({ theme, text, onChangeText }) => (
  <TextInput
    style={{
      color: theme.TEXT_PRIMARY,
      backgroundColor: theme.CARD_BACKGROUND,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.CARD_BORDER,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      minHeight: 44,
      maxHeight: 100,
      flex: 1,
      marginHorizontal: 8,
      marginVertical: 8
    }}
    placeholder='Type a message...'
    placeholderTextColor={theme.TEXT_MUTED}
    value={text}
    onChangeText={onChangeText}
    multiline
    textAlignVertical='center'
  />
)

ChatComposer.propTypes = {
  theme: PropTypes.object.isRequired,
  text: PropTypes.string.isRequired,
  onChangeText: PropTypes.func.isRequired
}

/**
 * Custom Loading indicator component
 */
export const ChatLoading = ({ theme }) => (
  <View
    style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <ActivityIndicator size='large' color={theme.STATUS_SUCCESS} />
  </View>
)

ChatLoading.propTypes = {
  theme: PropTypes.object.isRequired
}

/**
 * Custom Bubble component for messages
 */
export const ChatBubble = (props) => {
  const { theme } = props
  return (
    <Bubble
      {...props}
      wrapperStyle={{
        right: {
          backgroundColor: theme.STATUS_SUCCESS
        },
        left: {
          backgroundColor: theme.CARD_BACKGROUND,
          borderColor: theme.CARD_BORDER,
          borderWidth: 1
        }
      }}
      textStyle={{
        right: {
          color: '#FFFFFF'
        },
        left: {
          color: theme.TEXT_PRIMARY
        }
      }}
    />
  )
}

ChatBubble.propTypes = {
  theme: PropTypes.object.isRequired
}

/**
 * Custom InputToolbar component
 */
export const ChatInputToolbar = (props) => {
  const { theme } = props
  return (
    <InputToolbar
      {...props}
      containerStyle={{
        backgroundColor: theme.BACKGROUND,
        borderTopColor: theme.BORDER,
        borderTopWidth: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        minHeight: 60
      }}
      primaryStyle={{
        alignItems: 'center',
        flex: 1
      }}
    />
  )
}

ChatInputToolbar.propTypes = {
  theme: PropTypes.object.isRequired
}

/**
 * Custom Time component
 */
export const ChatTime = (props) => {
  const { theme } = props
  return (
    <Time
      {...props}
      timeTextStyle={{
        right: {
          color: 'rgba(255, 255, 255, 0.7)'
        },
        left: {
          color: theme.TEXT_SECONDARY
        }
      }}
    />
  )
}

ChatTime.propTypes = {
  theme: PropTypes.object.isRequired
}
