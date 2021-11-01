import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch } from "react-redux"

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

  const [userName, setUserName] = useState('')
  const [secret, setSecret] = useState('')
  const [secretConfirm, setSecretConfirm] = useState('')

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

  useEffect(() => {
    if (secret?.length > 4 && secret === secretConfirm) {
      console.log('QWE')
    }
  }, [secret, secretConfirm])

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
        placeholder={userName || "User Name"}
        disabled={!!userName}
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
        onChangeText={text => {
          setSecret(text)
        }}
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
        onChangeText={text => {
          setSecretConfirm(text)
        }}
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

    </SafeAreaView>
  )
}
export default SecretScreen
