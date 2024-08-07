import { useNavigation } from '@react-navigation/native'
import { useAtom } from 'jotai'
import React, { useEffect, useState } from 'react'

import { Alert, SafeAreaView, ScrollView, StyleSheet } from 'react-native'

import {
  Button,
  Card,
  Input,
  LinearProgress,
  ListItem,
  Text,
} from '@rneui/themed'
// import * as FileSystem from 'expo-file-system'
import Toast from 'react-native-toast-message'

import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons'

import zxcvbn from '../../zxcvbn'

import * as CONST from '../../consts'
import * as STATE from '../../state'

import * as reducer from './reducer'

const maxNickNameLength = 100 // will also use this parameter for the secret length
const minNickNameLength = 5 // will also use this parameter for the secret length

const SecretScreen = () => {
  const navigation = useNavigation()

  const [uuid, setUuid] = useAtom(STATE.uuid)
  const [nickName, setNickName] = useAtom(STATE.nickName)
  const [topOffset, setTopOffset] = useAtom(STATE.topOffset)
  const [photosList, setPhotosList] = useAtom(STATE.photosList)
  const [friendsList, setFriendsList] = useAtom(STATE.friendsList)

  const [nickNameEntered, setNickNameEntered] = useState(false)
  const [nickNameText, setNickNameText] = useState('')

  const [oldSecret, setOldSecret] = useState('')

  const [secret, setSecret] = useState('')
  const [secretConfirm, setSecretConfirm] = useState('')
  const [strength, setStrength] = useState(0)
  const [canSubmit, setCanSubmit] = useState(false)

  const [errorsMap, setErrorsMap] = useState(new Map())

  const strengthColors = ['red', 'orangered', 'orange', 'yellowgreen', 'green']
  const strengthLabel = [
    'This Secret is too obvious -- keep typing.',
    'This Secret is still too weak -- easy to guess.',
    'This Secret takes some effort to guess.',
    'Almost perfect Secret -- can be guessed eventually.',
    'The best Secret -- almost impossible to guess.',
  ]

  const resetFields = async () => {
    const nnn = await reducer.getStoredNickName()
    setNickNameText(nnn)
    setNickNameEntered(nnn.length > 0)
    setOldSecret('')
    setSecret('')
    setSecretConfirm('')
  }
  const handleSubmit = async () => {
    if (nickNameEntered) {
      reducer.updateSecret({
        nickName: nickNameText,
        oldSecret,
        secret,
        uuid,
        topOffset,
      })
    } else {
      await reducer.registerSecret({
        secret,
        topOffset,
        nickName: nickNameText,
        uuid,
      })
    }
    setNickName(nickNameText)

    await resetFields()
  }
  const renderHeaderRight = () => (
    <Ionicons
      onPress={canSubmit ? () => handleSubmit() : null}
      name="send"
      size={30}
      style={{
        marginRight: 10,
        color: canSubmit ? CONST.MAIN_COLOR : CONST.SECONDARY_COLOR,
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
    resetFields()
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
  }, [])

  useEffect(() => {
    resetFields()
  }, [navigation])

  useEffect(() => {
    setStrength(zxcvbn(secret).score) // from 0 to 4
  }, [secret])

  const validate = () => {
    const errors = new Map()

    if (
      !/^[\u00BF-\u1FFF\u2C00-\uD7FF\w_-]{5,100}$/.test(
        nickNameText.toLowerCase(),
      )
    )
      errors.set('nickName', 'Nickname wrong format.')
    if (nickNameText?.length < minNickNameLength)
      errors.set('nickName', 'Nickname too short.')
    if (nickNameText?.length > maxNickNameLength)
      errors.set('nickName', 'Nickname too long.')
    if (secret.length === 0) {
      setErrorsMap(errors)
      return
    }
    if (secret?.length < minNickNameLength)
      errors.set('secret', `Secret too short.`)
    if (secret?.length > maxNickNameLength)
      errors.set('secret', `Secret too long.`)
    if (secret !== secretConfirm)
      errors.set('secretConfirm', 'Secret does not match Secret Confirm.')
    if (strength < 3) errors.set('strength', 'Secret is not secure.')

    setErrorsMap(errors)
  }
  useEffect(() => {
    validate()
  }, [nickNameText, secret, secretConfirm, strength])

  useEffect(() => {
    if (errorsMap.size === 0 && secret.length > 0) {
      setCanSubmit(true)
    } else {
      setCanSubmit(false)
    }
  }, [errorsMap])

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
  }, [canSubmit])

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

  const handleReset = async () => {
    await reducer.resetSecret({ topOffset })
    await resetFields()
    Toast.show({
      text1: 'Secret reset',
      text2: 'enter new Secret',
      topOffset,
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Card containerStyle={{ padding: 0 }}>
          <ListItem>
            <Text
              style={{
                color: CONST.MAIN_COLOR,
                fontSize: 20,
              }}
            >
              The secret allows you to carry incognito identity to a different
              device, or restore it from another phone.
            </Text>
          </ListItem>
        </Card>
        <Input
          placeholder="Nickname"
          autoCorrect={false}
          autoCapitalize="none"
          autoComplete="off"
          disabled={nickNameEntered}
          leftIcon={<FontAwesome name="user" size={24} color="black" />}
          value={nickNameText}
          onChangeText={(text) => setNickNameText(text.toLowerCase())}
          errorStyle={{ color: 'red' }}
          errorMessage={errorsMap.get('nickName')}
        />

        {nickNameEntered && (
          <Input
            placeholder="Current Secret"
            autoCorrect={false}
            autoCapitalize="none"
            autoComplete="off"
            secureTextEntry
            leftIcon={
              <FontAwesome name="user-secret" size={24} color="black" />
            }
            value={oldSecret}
            onChangeText={(text) => setOldSecret(text)}
          />
        )}

        {secret.length > 0 && (
          <LinearProgress
            value={strength / 4}
            color={strengthColors[strength]}
            variant="determinate"
          />
        )}

        <Input
          placeholder="My New Secret"
          autoCorrect={false}
          autoCapitalize="none"
          autoComplete="off"
          secureTextEntry
          leftIcon={<FontAwesome name="user-secret" size={24} color="black" />}
          value={secret}
          onChangeText={(text) => setSecret(text)}
          errorStyle={{ color: strengthColors[strength] }}
          errorMessage={
            secret.length === 0
              ? ''
              : `${strengthLabel[strength]} ${errorsMap.get('secret') || ''}`
          }
        />
        <Input
          placeholder="Confirm Secret"
          autoCorrect={false}
          autoCapitalize="none"
          autoComplete="off"
          secureTextEntry
          leftIcon={<FontAwesome name="user-secret" size={24} color="black" />}
          value={secretConfirm}
          onChangeText={(text) => setSecretConfirm(text)}
          errorStyle={{ color: 'red' }}
          errorMessage={errorsMap.get('secretConfirm')}
        />

        <Card containerStyle={{ padding: 0 }}>
          <ListItem>
            <Text
              style={{
                color: 'red',
                fontSize: 12,
              }}
            >
              Make sure to use only strong secrets. Write it down and store in
              secure place. If you loose it -- we will not be able to help you
              to re-cover it, because we never collect your explicit identity in
              any form (like your email or mobile phone number).
            </Text>
          </ListItem>
        </Card>

        {nickNameEntered && (
          <Card containerStyle={{ padding: 10 }}>
            <Text
              style={{
                color: 'red',
                fontSize: 12,
                paddingBottom: 10,
              }}
            >
              You secret is attached to this device. Wiping the Secret will
              disconnect your current incognito identity from this phone. Before
              clicking the button below, write down your current Secret.
            </Text>

            <Button
              type="outline"
              titleStyle={{
                color: CONST.MAIN_COLOR,
              }}
              icon={
                <MaterialCommunityIcons
                  name="wiper"
                  size={30}
                  style={{
                    color: CONST.MAIN_COLOR,
                  }}
                />
              }
              title="Wipe Secret"
              onPress={() => {
                Alert.alert(
                  'Do you really want to use another NickName?',
                  `It will allow you to create new incognito identity on this device or carry the idenity from another phone. 
Remember to store old NickName and Secret in secure place if you ever intend to get back to it. Are you sure you want to proceed?`,
                  [
                    { text: 'No', onPress: () => null, style: 'cancel' },
                    { text: 'Yes', onPress: () => handleReset() },
                  ],
                  { cancelable: true },
                )
              }}
            />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
export default SecretScreen
