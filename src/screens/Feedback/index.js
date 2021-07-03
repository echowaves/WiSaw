import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"

import {
  gql,
} from "@apollo/client"

import {
  SafeAreaView,
  TextInput,
  StyleSheet,
} from 'react-native'

import {
  Button,
  Text,
  Card,
  LinearProgress,
} from 'react-native-elements'

import { FontAwesome, Ionicons } from '@expo/vector-icons'

import Modal from "react-native-modal"

import PropTypes from 'prop-types'

import * as CONST from '../../consts.js'

import * as reducer from './reducer'

const maxStringLength = 2000

const query = gql`
query listAbuseReports {
  listAbuseReports {
    createdAt
    id
    photoId
    updatedAt
    uuid
  }
}
`

async function fetchAbuseReorts() {
  const abuseReports = await CONST.gqlClient
    .query({ query })
  console.log({ abuseReports })
}

const FeedbackScreen = () => {
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const loading = useSelector(state => state.feedback.loading)
  const errorMessage = useSelector(state => state.feedback.errorMessage)
  const finished = useSelector(state => state.feedback.finished)

  const [inputText, _setInputText] = useState('')

  const inputTextRef = React.useRef(inputText)
  const setInputText = data => {
    inputTextRef.current = data
    _setInputText(data)
  }

  useEffect(() => {
    fetchAbuseReorts()
    navigation.setOptions({
      headerTitle: <Text>feedback form</Text>,
      headerTintColor: CONST.MAIN_COLOR,
      headerRight: renderHeaderRight,
      headerLeft: renderHeaderLeft,
      headerBackTitle: <Text />,
    })
  }, [])// eslint-disable-line react-hooks/exhaustive-deps
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  })

  const renderHeaderRight = () => (
    <Ionicons
      onPress={
        () => handleSubmit()
      }
      name="send"
      size={30}
      style={
        {
          marginRight: 10,
          color: CONST.MAIN_COLOR,
        }
      }
    />
  )
  const renderHeaderLeft = () => (
    <FontAwesome
      name="chevron-left"
      size={30}
      style={
        {
          backgroundColor: '#ffffff',
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

  const handleSubmit = () => {
    dispatch(reducer.submitFeedback({ feedbackText: inputTextRef.current.trim() }))
  }

  if (finished && errorMessage.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Modal isVisible>
          <Card style={{ borderRadius: 10 }}>
            <Text>Thank you for submitting your feedback.
            </Text>
          </Card>
          <Card style={{ borderRadius: 10 }}>
            <Button
              title="You are Welcome!"
              type="outline"
              onPress={
                () => {
                  navigation.goBack()
                  dispatch(reducer.resetForm())
                }
              }
            />
          </Card>
        </Modal>
      </SafeAreaView>
    )
  }
  return (
    <SafeAreaView style={styles.container}>
      { errorMessage.length !== 0 && (
        <Text>{errorMessage}</Text>
      )}
      <TextInput
        rowSpan={5}
        onChangeText={inputValue => {
          setInputText(inputValue.slice(0, maxStringLength))
        }}
        placeholder="Type your feedback here and click send."
        placeholderTextColor={CONST.PLACEHOLDER_TEXT_COLOR}
        multiline
        numberOfLines={10}
        maxLength={maxStringLength}
        style={
          {
            color: CONST.MAIN_COLOR,
            height: 200,
            margin: 12,
            padding: 10,
            borderWidth: 1,
            borderColor: CONST.MAIN_COLOR,
            fontSize: 20,
            textAlignVertical: 'top',
          }
        }
      />
      { loading && (
        <LinearProgress
          color={
            CONST.MAIN_COLOR
          }
          style={
            {
              flex: 1,
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              left: 0,
            }
          }
        />
      )}
    </SafeAreaView>
  )
}
export default FeedbackScreen
