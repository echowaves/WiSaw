import { useNavigation } from '@react-navigation/native'
import { useAtom } from 'jotai'
import React, { useEffect, useState } from 'react'

import {
  Alert,
  Animated,
  Keyboard,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native'

import { Button, Input, Text } from '@rneui/themed'
import * as Haptics from 'expo-haptics'
import Toast from 'react-native-toast-message'

import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons'

import zxcvbn from '../../zxcvbn'

import * as CONST from '../../consts'
import * as STATE from '../../state'
import { getTheme } from '../../theme/sharedStyles'

import * as reducer from './reducer'

const maxNickNameLength = 100 // will also use this parameter for the secret length
const minNickNameLength = 5 // will also use this parameter for the secret length

const SecretScreen = () => {
  const navigation = useNavigation()

  const [uuid, setUuid] = useAtom(STATE.uuid)
  const [nickName, setNickName] = useAtom(STATE.nickName)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const [topOffset, setTopOffset] = useAtom(STATE.topOffset)
  const [photosList, setPhotosList] = useAtom(STATE.photosList)
  const [friendsList, setFriendsList] = useAtom(STATE.friendsList)

  const theme = getTheme(isDarkMode)

  const [nickNameEntered, setNickNameEntered] = useState(false)
  const [nickNameText, setNickNameText] = useState('')

  const [oldSecret, setOldSecret] = useState('')

  const [secret, setSecret] = useState('')
  const [secretConfirm, setSecretConfirm] = useState('')
  const [strength, setStrength] = useState(0)
  const [canSubmit, setCanSubmit] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)

  const [errorsMap, setErrorsMap] = useState(new Map())

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const scaleAnim = React.useRef(new Animated.Value(1)).current

  const strengthValues = [0, 25, 50, 75, 100]

  const strengthColors = ['#FF6B6B', '#FF9500', '#FFD93D', '#4FC3F7', '#50E3C2']
  const strengthLabels = [
    'Too weak - easily guessed',
    'Weak - needs improvement',
    'Fair - getting better',
    'Good - almost there',
    'Excellent - very secure',
  ]
  const strengthIcons = [
    'exclamation-triangle',
    'exclamation-circle',
    'shield-alt',
    'shield-alt',
    'user-shield',
  ]

  // Animate components on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const resetFields = async () => {
    const nnn = await reducer.getStoredNickName()
    setNickNameText(nnn)
    setNickNameEntered(nnn.length > 0)
    setOldSecret('')
    setSecret('')
    setSecretConfirm('')
  }
  const handleSubmit = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    try {
      if (nickNameEntered) {
        await reducer.updateSecret({
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

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      Toast.show({
        text1: 'Success! 🎉',
        text2: 'Your identity has been secured.',
        topOffset,
        type: 'success',
      })

      await resetFields()
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)

      // Parse error message for more specific feedback
      let errorTitle = 'Error'
      let errorMessage = 'Failed to save your identity. Please try again.'

      if (error.message) {
        if (
          error.message.includes('network') ||
          error.message.includes('Network')
        ) {
          errorTitle = 'Connection Error'
          errorMessage = 'Please check your internet connection and try again.'
        } else if (
          error.message.includes('invalid') ||
          error.message.includes('Invalid')
        ) {
          errorTitle = 'Invalid Data'
          errorMessage = 'Please check your information and try again.'
        } else if (
          error.message.includes('exists') ||
          error.message.includes('duplicate')
        ) {
          errorTitle = 'Name Already Taken'
          errorMessage =
            'This nickname is already in use. Please choose a different one.'
        } else if (
          error.message.includes('unauthorized') ||
          error.message.includes('Unauthorized')
        ) {
          errorTitle = 'Authentication Error'
          errorMessage =
            'Your current secret is incorrect. Please verify and try again.'
        } else {
          errorMessage = error.message
        }
      }

      Toast.show({
        text1: errorTitle,
        text2: errorMessage,
        type: 'error',
        topOffset,
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  // Header actions are now handled by parent component using AppHeader

  useEffect(() => {
    resetFields()
  }, [])

  // Remove duplicate resetFields call
  useEffect(() => {
    try {
      setStrength(zxcvbn(secret).score) // from 0 to 4
    } catch (error) {
      setStrength(0)
    }
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
    // Remove navigation.setOptions as it's not compatible with Expo Router
    // The header is now controlled by the layout in app/(drawer)/identity.tsx
    // navigation.setOptions({
    //   headerTitle: nickNameEntered ? 'Update Identity' : 'Create Identity',
    //   headerTintColor: CONST.MAIN_COLOR,
    //   headerRight: renderHeaderRight,
    //   headerLeft: renderHeaderLeft,
    //   headerBackTitle: '',
    //   headerStyle: {
    //     backgroundColor: CONST.NAV_COLOR,
    //     borderBottomWidth: 1,
    //     borderBottomColor: CONST.HEADER_BORDER_COLOR,
    //     shadowColor: CONST.HEADER_SHADOW_COLOR,
    //     shadowOffset: {
    //       width: 0,
    //       height: 2,
    //     },
    //     shadowOpacity: 1,
    //     shadowRadius: 4,
    //     elevation: 3,
    //   },
    //   headerTitleStyle: {
    //     fontSize: 18,
    //     fontWeight: '600',
    //     color: CONST.TEXT_COLOR,
    //   },
    // })
  }, [canSubmit, isSubmitting, nickNameEntered])

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.BACKGROUND,
    },
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      padding: 20,
      paddingTop: 30,
    },
    headerCard: {
      backgroundColor: theme.CARD_BACKGROUND,
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      shadowColor: theme.CARD_SHADOW,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: theme.BORDER_LIGHT,
    },
    iconContainer: {
      alignSelf: 'center',
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(234, 94, 61, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.TEXT_PRIMARY,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.TEXT_SECONDARY,
      textAlign: 'center',
      lineHeight: 22,
    },
    formCard: {
      backgroundColor: theme.CARD_BACKGROUND,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      shadowColor: theme.CARD_SHADOW,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: theme.BORDER_LIGHT,
    },
    inputContainer: {
      marginBottom: 16,
    },
    passwordToggle: {
      position: 'absolute',
      right: 12,
      top: 12,
      padding: 8,
    },
    strengthContainer: {
      marginTop: 8,
      marginBottom: 16,
    },
    strengthHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    strengthText: {
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
    },
    warningCard: {
      backgroundColor: 'rgba(255, 107, 107, 0.1)',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 107, 107, 0.2)',
      marginBottom: 20,
    },
    warningTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FF6B6B',
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    warningText: {
      fontSize: 14,
      color: theme.TEXT_SECONDARY,
      lineHeight: 20,
    },
    resetCard: {
      backgroundColor: 'rgba(255, 149, 0, 0.1)',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 149, 0, 0.2)',
    },
    resetTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FF9500',
      marginBottom: 12,
    },
    resetText: {
      fontSize: 14,
      color: theme.TEXT_PRIMARY,
      lineHeight: 20,
      marginBottom: 16,
    },
    resetButton: {
      backgroundColor: 'transparent',
      borderColor: '#FF9500',
      borderWidth: 2,
      borderRadius: 12,
      paddingVertical: 12,
    },
    resetButtonText: {
      color: '#FF9500',
      fontSize: 16,
      fontWeight: '600',
    },
    strengthBar: {
      height: 8,
      backgroundColor: theme.BACKGROUND_DISABLED,
      borderRadius: 4,
      overflow: 'hidden',
    },
    strengthFill: {
      height: '100%',
      borderRadius: 4,
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }}
          >
            {/* Header Card */}
            <View style={styles.headerCard}>
              <View style={styles.iconContainer}>
                <FontAwesome5
                  name="user-shield"
                  size={32}
                  color={CONST.MAIN_COLOR}
                />
              </View>
              <Text style={styles.title}>
                {nickNameEntered
                  ? 'Update Your Identity'
                  : 'Create Your Identity'}
              </Text>
              <Text style={styles.subtitle}>
                {nickNameEntered
                  ? 'Change your secret to update your incognito identity across devices.'
                  : 'Create a secure incognito identity that you can restore on any device.'}
              </Text>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              {/* Nickname Input */}
              <View style={styles.inputContainer}>
                <Input
                  placeholder="Choose a nickname"
                  autoCorrect={false}
                  autoCapitalize="none"
                  autoComplete="off"
                  spellCheck={false}
                  textContentType="none"
                  disabled={nickNameEntered}
                  leftIcon={
                    <FontAwesome5
                      name="user"
                      size={20}
                      color={
                        nickNameEntered ? theme.TEXT_DISABLED : CONST.MAIN_COLOR
                      }
                    />
                  }
                  value={nickNameText}
                  onChangeText={(text) => setNickNameText(text.toLowerCase())}
                  errorStyle={{ color: '#FF6B6B' }}
                  errorMessage={errorsMap.get('nickName')}
                  inputStyle={{
                    fontSize: 16,
                    color: nickNameEntered
                      ? theme.TEXT_DISABLED
                      : theme.TEXT_PRIMARY,
                  }}
                  containerStyle={{ paddingHorizontal: 0 }}
                />
              </View>

              {/* Current Secret (only for existing users) */}
              {nickNameEntered && (
                <View style={styles.inputContainer}>
                  <Input
                    placeholder="Current secret"
                    autoCorrect={false}
                    autoCapitalize="none"
                    autoComplete="off"
                    spellCheck={false}
                    textContentType="none"
                    passwordRules=""
                    keyboardType="default"
                    secureTextEntry={!showOldPassword}
                    leftIcon={
                      <FontAwesome5
                        name="key"
                        size={20}
                        color={CONST.MAIN_COLOR}
                      />
                    }
                    rightIcon={
                      <FontAwesome5
                        name={showOldPassword ? 'eye-slash' : 'eye'}
                        size={20}
                        color={theme.TEXT_SECONDARY}
                        onPress={() => setShowOldPassword(!showOldPassword)}
                        style={styles.passwordToggle}
                      />
                    }
                    value={oldSecret}
                    onChangeText={(text) => setOldSecret(text)}
                    inputStyle={{ fontSize: 16 }}
                    containerStyle={{ paddingHorizontal: 0 }}
                  />
                </View>
              )}

              {/* New Secret */}
              <View style={styles.inputContainer}>
                <Input
                  placeholder="New secret"
                  autoCorrect={false}
                  autoCapitalize="none"
                  autoComplete="off"
                  spellCheck={false}
                  textContentType="none"
                  passwordRules=""
                  keyboardType="default"
                  inputProps={{
                    'data-form-type': 'other',
                    'data-lpignore': 'true',
                  }}
                  secureTextEntry={!showPassword}
                  leftIcon={
                    <FontAwesome5
                      name="shield-alt"
                      size={20}
                      color={CONST.MAIN_COLOR}
                    />
                  }
                  rightIcon={
                    <FontAwesome5
                      name={showPassword ? 'eye-slash' : 'eye'}
                      size={20}
                      color={theme.TEXT_SECONDARY}
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.passwordToggle}
                    />
                  }
                  value={secret}
                  onChangeText={(text) => setSecret(text)}
                  inputStyle={{ fontSize: 16 }}
                  containerStyle={{ paddingHorizontal: 0 }}
                />

                {/* Password Strength Indicator */}
                {secret.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthHeader}>
                      <FontAwesome5
                        name={strengthIcons[strength]}
                        size={16}
                        color={strengthColors[strength]}
                      />
                      <Text
                        style={[
                          styles.strengthText,
                          { color: strengthColors[strength] },
                        ]}
                      >
                        {strengthLabels[strength]}
                      </Text>
                    </View>
                    <View style={styles.strengthBar}>
                      <View
                        style={[
                          styles.strengthFill,
                          {
                            width: `${strengthValues[strength]}%`,
                            backgroundColor: strengthColors[strength],
                          },
                        ]}
                      />
                    </View>
                    {errorsMap.get('secret') && (
                      <Text
                        style={{
                          color: '#FF6B6B',
                          fontSize: 12,
                          marginTop: 4,
                        }}
                      >
                        {errorsMap.get('secret')}
                      </Text>
                    )}
                  </View>
                )}
              </View>

              {/* Confirm Secret */}
              <View style={styles.inputContainer}>
                <Input
                  placeholder="Confirm secret"
                  autoCorrect={false}
                  autoCapitalize="none"
                  autoComplete="off"
                  spellCheck={false}
                  textContentType="none"
                  passwordRules=""
                  keyboardType="default"
                  inputProps={{
                    'data-form-type': 'other',
                    'data-lpignore': 'true',
                  }}
                  secureTextEntry={!showConfirmPassword}
                  leftIcon={
                    <FontAwesome5
                      name="check-circle"
                      size={20}
                      color={CONST.MAIN_COLOR}
                    />
                  }
                  rightIcon={
                    <FontAwesome5
                      name={showConfirmPassword ? 'eye-slash' : 'eye'}
                      size={20}
                      color={theme.TEXT_SECONDARY}
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={styles.passwordToggle}
                    />
                  }
                  value={secretConfirm}
                  onChangeText={(text) => setSecretConfirm(text)}
                  errorStyle={{ color: '#FF6B6B' }}
                  errorMessage={errorsMap.get('secretConfirm')}
                  inputStyle={{ fontSize: 16 }}
                  containerStyle={{ paddingHorizontal: 0 }}
                />
              </View>
            </View>

            {/* Security Warning */}
            <View style={styles.warningCard}>
              <View style={styles.warningTitle}>
                <FontAwesome5
                  name="exclamation-triangle"
                  size={16}
                  color="#FF6B6B"
                />
                <Text
                  style={{
                    color: '#FF6B6B',
                    fontSize: 16,
                    fontWeight: '600',
                    marginLeft: 8,
                  }}
                >
                  Important Security Notice
                </Text>
              </View>
              <Text style={styles.warningText}>
                • Use a strong, unique secret you'll remember{'\n'}• Write it
                down and store it securely{'\n'}• We cannot recover lost secrets
                - no email or phone required{'\n'}• Your identity is completely
                anonymous and secure
              </Text>
            </View>

            {/* Reset Section (only for existing users) */}
            {nickNameEntered && (
              <View style={styles.resetCard}>
                <Text style={styles.resetTitle}>⚠️ Reset Identity</Text>
                <Text style={styles.resetText}>
                  This will disconnect your current identity from this device.
                  Make sure to save your current secret before proceeding if you
                  want to restore it later.
                </Text>
                <Button
                  type="outline"
                  buttonStyle={styles.resetButton}
                  titleStyle={styles.resetButtonText}
                  icon={
                    <MaterialCommunityIcons
                      name="refresh"
                      size={20}
                      color="#FF9500"
                      style={{ marginRight: 8 }}
                    />
                  }
                  title="Reset Identity"
                  onPress={() => {
                    Alert.alert(
                      'Reset Your Identity?',
                      'This will create a new identity or allow you to restore from another device. Your current identity will be disconnected from this phone.\n\nMake sure you have your current secret saved if you want to restore it later.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Reset',
                          style: 'destructive',
                          onPress: handleReset,
                        },
                      ],
                      { cancelable: true },
                    )
                  }}
                />
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  )
}
export default SecretScreen
