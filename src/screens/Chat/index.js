import React, { useEffect, useState, useCallback } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"
import { GiftedChat } from 'react-native-gifted-chat'

import {
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

import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

import { gql } from "@apollo/client"

import PropTypes from 'prop-types'

import * as CONST from '../../consts.js'

const Chat = ({ route }) => {
  const { chatUuid } = route.params

  const navigation = useNavigation()
  const dispatch = useDispatch()

  const topOffset = useSelector(state => state.photosList.topOffset)

  const uuid = useSelector(state => state.secret.uuid)

  const [messages, setMessages] = useState([])

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'chat',
      headerTintColor: CONST.MAIN_COLOR,
      headerRight: renderHeaderRight,
      headerLeft: renderHeaderLeft,
      headerBackTitle: '',
      headerStyle: {
        backgroundColor: CONST.NAV_COLOR,
      },
    })

    setMessages([
      // {
      //   _id: 1,
      //   text: 'Hello developer',
      //   createdAt: new Date(),
      //   user: {
      //     _id: 2,
      //     name: 'React Native',
      //     avatar: 'https://placeimg.com/140/140/any',
      //   },
      // },
    ])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
              sendMessage($chatUuid: String!, $uuid: String!, $messageUuid: String!, $text: String!) {
                sendMessage(chatUuid: $chatUuid, uuid: $uuid, messageUuid: $messageUuid,text: $text) {
                    messageUuid
                    createdAt
                  }
              }
              `,
              variables: {
                chatUuid,
                uuid,
                messageUuid,
                text,
              },
            })).data.sendMessage

          // console.log({ message })
          // console.log({ returnedMessage })

          if (message._id === returnedMessage.messageUuid) {
            setMessages(previousMessages => GiftedChat.append(previousMessages, [message]))
          }
        } catch (e) {
          console.log({ e })
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

  return (
    <SafeAreaView style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: uuid,
        }}
        // alwaysShowSend
      />
    </SafeAreaView>
  )
  // return (
  //   <SafeAreaView style={styles.container}>
  //     <ScrollView
  //       contentContainerStyle={styles.scrollView}
  //       showsVerticalScrollIndicator={
  //         false
  //       }>
  //       <Card containerStyle={{ padding: 0 }}>
  //         <ListItem>
  //           <Text>
  //             chats
  //           </Text>
  //         </ListItem>
  //       </Card>
  //     </ScrollView>
  //   </SafeAreaView>
  // )
}

Chat.propTypes = {
  route: PropTypes.object.isRequired,
}

export default Chat
