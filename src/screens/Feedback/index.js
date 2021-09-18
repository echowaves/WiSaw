import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"

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
  Overlay,
} from 'react-native-elements'
// import * as FileSystem from 'expo-file-system'

import { FontAwesome, Ionicons } from '@expo/vector-icons'

import PropTypes from 'prop-types'

import * as CONST from '../../consts.js'

import * as reducer from './reducer'

const maxStringLength = 2000

const FeedbackScreen = () => {
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const loading = useSelector(state => state.feedback.loading)
  const errorMessage = useSelector(state => state.feedback.errorMessage)
  const finished = useSelector(state => state.feedback.finished)
  // const [diskSpace, setDiskSpace] = useState('')
  // const [diskCapacity, setDiskCapacity] = useState('')

  const [inputText, _setInputText] = useState('')

  const inputTextRef = React.useRef(inputText)
  const setInputText = data => {
    inputTextRef.current = data
    _setInputText(data)
  }

  useEffect(() => {
    navigation.setOptions({
      headerTitle: <Text>feedback</Text>,
      headerTintColor: CONST.MAIN_COLOR,
      headerRight: renderHeaderRight,
      headerLeft: renderHeaderLeft,
      headerBackTitle: <Text />,
      headerStyle: {
        backgroundColor: CONST.NAV_COLOR,
      },
    })

    const initState = async () => {
      // setDiskSpace(await FileSystem.getFreeDiskStorageAsync())
      // setDiskCapacity(await FileSystem.getTotalDiskCapacityAsync())
    }
    initState()
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
        <Overlay isVisible>
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
        </Overlay>
      </SafeAreaView>
    )
  }
  return (
    <SafeAreaView style={styles.container}>
      {/* <Text>{diskSpace / 1000 / 1000}</Text> */}
      {/* <Text>{diskSpace}</Text> */}
      {/* <Text>{diskCapacity / 1000 / 1000}</Text> */}
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
