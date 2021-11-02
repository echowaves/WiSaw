import React, { useEffect, useState, useRef } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch } from "react-redux"

import {
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
  const [canSubmit, setCanSubmit] = useState(false)

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

  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (
      userName?.length > 4
      && secret?.length > 4
      && secret === secretConfirm
      && strength > 2
    ) {
      setCanSubmit(true)
    } else {
      setCanSubmit(false)
    }

    setStrength(zxcvbn(secret).score) // from 0 to 4
  }, [secret, secretConfirm])

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
  }, [canSubmit, strength])

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      alignItems: 'center',
      marginHorizontal: 10,
      paddingBottom: 300,
    },
  })

  const renderHeaderRight = () => (
    <Ionicons
      onPress={
        canSubmit ? () => handleSubmit() : null
      }
      name="send"
      size={30}
      style={
        {
          marginRight: 10,
          color: canSubmit ? CONST.MAIN_COLOR : CONST.SECONDARY_COLOR,
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
      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={
          false
        }>
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
          // disabled={!!userName}
          leftIcon={(
            <FontAwesome
              name="user"
              size={24}
              color="black"
            />
          )}
          onChangeText={text => setUserName(text)}
        />
        <Text
          style={{
            color: 'red',
            marginTop: -18,
          }}>
          {`${userName?.length > 4 ? '' : 'too short'}`}
        </Text>
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
          onChangeText={text => setSecret(text)}
        />
        <Text
          style={{
            color: strengthColors[strength],
            marginTop: -18,
          }}>
          {`${strengthLabel[strength]}`}
        </Text>
        <LinearProgress
          value={strength / 4}
          color={strengthColors[strength]}
          // trackColor={CONST.MAIN_COLOR}
          variant="determinate"
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
          onChangeText={text => setSecretConfirm(text)}
        />
        <Text
          style={{
            color: 'red',
            marginTop: -18,
          }}>{`${secret === secretConfirm ? (strength > 2 ? '' : "not strong enough") : 'must match secret'}`}
        </Text>

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
      </ScrollView>
    </SafeAreaView>
  )
}
export default SecretScreen
