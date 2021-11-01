import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"

import {
  SafeAreaView,
  StyleSheet,
} from 'react-native'

import {
  Text,
  Input,
  LinearProgress,
  Card,
  ListItem,
} from 'react-native-elements'
// import * as FileSystem from 'expo-file-system'

import { FontAwesome, Ionicons } from '@expo/vector-icons'

import PropTypes from 'prop-types'

import * as CONST from '../../consts.js'

import * as reducer from './reducer'

const maxStringLength = 2000

const SecretScreen = () => {
  const navigation = useNavigation()
  const dispatch = useDispatch()

  // const [inputText, _setInputText] = useState('')

  // const inputTextRef = React.useRef(inputText)
  // const setInputText = data => {
  //   inputTextRef.current = data
  //   _setInputText(data)
  // }

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'my secret',
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
    // dispatch(reducer.submitFeedback({ feedbackText: inputTextRef.current.trim() }))
  }

  return (
    <SafeAreaView style={styles.container}>

      <Card containerStyle={{ padding: 0 }}>
        <ListItem>
          <Text style={
            {
              color: CONST.MAIN_COLOR,
              fontSize: 20,
            }
          }>The secret allows you to carry incognito identity to a different device, or restore it from another phone.
          </Text>
        </ListItem>
      </Card>
      <Input
        placeholder="User Name"
        leftIcon={(
          <FontAwesome
            name="user"
            size={24}
            color="black"
          />
        )}
      />

      <Input
        placeholder="User Secret"
        secureTextEntry
        leftIcon={(
          <FontAwesome
            name="user-secret"
            size={24}
            color="black"
          />
        )}
      />

      <Input
        placeholder="Confirm Secret"
        secureTextEntry
        leftIcon={(
          <FontAwesome
            name="user-secret"
            size={24}
            color="black"
          />
        )}
      />
      <LinearProgress color="primary" />

      <Card containerStyle={{ padding: 0 }}>
        <ListItem>
          <Text style={{
            color: "red",
            fontSize: 12,
          }}>Make sure to use only strong secrets.

            Write it down and store in secure location.
            We will not be able to help you to re-cover it,
            because we never collect your explicit identity in any form (like your email or mobile phone number), we would not know how to send it to you.
          </Text>
        </ListItem>
      </Card>

      {/* <TextInput
        rowSpan={5}
        onChangeText={inputValue => {
          // setInputText(inputValue.slice(0, maxStringLength))
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
      /> */}
    </SafeAreaView>
  )
}
export default SecretScreen
