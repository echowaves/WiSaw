import React, { useEffect, useState, useRef } from 'react'
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

import zxcvbn from '../../zxcvbn'

import * as CONST from '../../consts.js'

import * as reducer from './reducer'

const maxStringLength = 2000

const SecretScreen = () => {
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const [userName, setUserName] = useState('')
  const [secret, setSecret] = useState('')
  const [secretConfirm, setSecretConfirm] = useState('')
  const [strength, setStrength] = useState(0)

  const strengthColors = [
    'red',
    'orangered',
    'orange',
    'yellowgreen',
    'green',
  ]
  const strengthLabel = [
    'not a secret at all',
    'weak secret easy to guess',
    'takes some effort to guess',
    'takes time but can be guessed eventually',
    'almost impossible to guess',
  ]

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
      console.log(`is good`)
    }

    setStrength(zxcvbn(secret).score) // from 0 to
  }, [secret, secretConfirm])

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
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
      <Text>{`${strengthLabel[strength]}`}</Text>
      <LinearProgress
        value={strength / 4}
        color={strengthColors[strength]}
        // trackColor={CONST.MAIN_COLOR}
        variant="determinate"
      />

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
