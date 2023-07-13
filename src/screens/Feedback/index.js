import React, { useEffect, useState, useContext } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'

import { SafeAreaView, TextInput, StyleSheet } from 'react-native'

import { gql } from '@apollo/client'
import Toast from 'react-native-toast-message'

import { FontAwesome, Ionicons } from '@expo/vector-icons'

import PropTypes from 'prop-types'

import * as CONST from '../../consts'

const maxStringLength = 2000

const FeedbackScreen = () => {
  const navigation = useNavigation()
  const { authContext, setAuthContext } = useContext(CONST.AuthContext)

  // const [diskSpace, setDiskSpace] = useState('')
  // const [diskCapacity, setDiskCapacity] = useState('')

  const [inputText, _setInputText] = useState('')

  const inputTextRef = React.useRef(inputText)
  const setInputText = (data) => {
    inputTextRef.current = data
    _setInputText(data)
  }

  const submitFeedback = async ({ feedbackText }) => {
    const { uuid, topOffset, currentBatch } = authContext

    try {
      if (feedbackText.trim().length < 5) {
        throw Error('unable to submit empty feedback')
      }
      // const contactForm =
      await CONST.gqlClient.mutate({
        mutation: gql`
          mutation createContactForm($uuid: String!, $description: String!) {
            createContactForm(uuid: $uuid, description: $description) {
              createdAt
              id
              updatedAt
              uuid
            }
          }
        `,
        variables: {
          uuid,
          description: feedbackText,
        },
      })

      navigation.goBack()
      Toast.show({
        text1: 'Feedback submitted.',
        topOffset,
      })
      // console.log({ contactForm })
    } catch (err) {
      Toast.show({
        text1: 'Error',
        text2: err.toString(),
        type: 'error',
        topOffset,
      })
    }
  }
  const handleSubmit = () => {
    submitFeedback({ feedbackText: inputTextRef.current.trim() })
  }

  const renderHeaderRight = () => (
    <Ionicons
      onPress={() => handleSubmit()}
      name="send"
      size={30}
      style={{
        marginRight: 10,
        color: CONST.MAIN_COLOR,
      }}
    />
  )
  const renderHeaderLeft = () => (
    <FontAwesome
      name="chevron-left"
      size={30}
      style={{
        marginLeft: 10,
        color: CONST.MAIN_COLOR,
        width: 60,
      }}
      onPress={() => navigation.goBack()}
    />
  )

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'feedback',
      headerTintColor: CONST.MAIN_COLOR,
      headerRight: renderHeaderRight,
      headerLeft: renderHeaderLeft,
      headerBackTitle: '',
      headerStyle: {
        backgroundColor: CONST.NAV_COLOR,
      },
    })

    // const initState = async () => {
    //   // setDiskSpace(await FileSystem.getFreeDiskStorageAsync())
    //   // setDiskCapacity(await FileSystem.getTotalDiskCapacityAsync())
    // }
    // initState()
  }, [])
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  })

  return (
    <SafeAreaView style={styles.container}>
      {/* <Text>{diskSpace / 1000 / 1000}</Text> */}
      {/* <Text>{diskSpace}</Text> */}
      {/* <Text>{diskCapacity / 1000 / 1000}</Text> */}

      <TextInput
        rowSpan={5}
        onChangeText={(inputValue) => {
          setInputText(inputValue.slice(0, maxStringLength))
        }}
        placeholder="Type your feedback here and click send."
        placeholderTextColor={CONST.PLACEHOLDER_TEXT_COLOR}
        multiline
        numberOfLines={10}
        maxLength={maxStringLength}
        style={{
          color: CONST.MAIN_COLOR,
          height: 200,
          margin: 12,
          padding: 10,
          borderWidth: 1,
          borderColor: CONST.MAIN_COLOR,
          fontSize: 20,
          textAlignVertical: 'top',
        }}
      />
    </SafeAreaView>
  )
}

export default FeedbackScreen
