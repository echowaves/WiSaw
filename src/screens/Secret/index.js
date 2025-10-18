import { useAtom } from 'jotai'
import React, { useEffect, useState } from 'react'

import {
  Animated,
  Keyboard,
  SafeAreaView,
  TouchableWithoutFeedback,
  View
} from 'react-native'

import * as Haptics from 'expo-haptics'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Toast from 'react-native-toast-message'

import { FontAwesome5 } from '@expo/vector-icons'

import zxcvbn from '../../zxcvbn'

import * as STATE from '../../state'
import { getTheme } from '../../theme/sharedStyles'

import { useSafeAreaViewStyle } from '../../hooks/useStatusBarHeight'
import useToastTopOffset from '../../hooks/useToastTopOffset'

import Button from '../../components/ui/Button'
import * as reducer from './reducer'

// Import extracted components
import HeaderCard from './components/HeaderCard'
import NicknameInputField from './components/NicknameInputField'
import PasswordStrengthIndicator from './components/PasswordStrengthIndicator'
import ResetCard from './components/ResetCard'
import SecretInputField from './components/SecretInputField'
import WarningCard from './components/WarningCard'

// Import utilities
import { getStyles } from './styles'
import { validateAllFields } from './utils/validation'

const SecretScreen = () => {
  const [uuid] = useAtom(STATE.uuid)
  const [, setNickName] = useAtom(STATE.nickName)
  const [isDarkMode] = useAtom(STATE.isDarkMode)

  const toastTopOffset = useToastTopOffset()

  const theme = getTheme(isDarkMode)

  // Get safe area view style for proper status bar handling on Android
  const safeAreaViewStyle = useSafeAreaViewStyle()

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

  // Animate components on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true
      })
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
          topOffset: toastTopOffset
        })
      } else {
        await reducer.registerSecret({
          secret,
          topOffset: toastTopOffset,
          nickName: nickNameText,
          uuid
        })
      }
      setNickName(nickNameText)

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      Toast.show({
        text1: 'Success! 🎉',
        text2: 'Your identity has been secured.',
        topOffset: toastTopOffset,
        type: 'success'
      })

      await resetFields()
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)

      // Parse error message for more specific feedback
      let errorTitle = 'Error'
      let errorMessage = 'Failed to save your identity. Please try again.'

      if (error.message) {
        if (error.message.includes('network') || error.message.includes('Network')) {
          errorTitle = 'Connection Error'
          errorMessage = 'Please check your internet connection and try again.'
        } else if (error.message.includes('invalid') || error.message.includes('Invalid')) {
          errorTitle = 'Invalid Data'
          errorMessage = 'Please check your information and try again.'
        } else if (error.message.includes('exists') || error.message.includes('duplicate')) {
          errorTitle = 'Name Already Taken'
          errorMessage = 'This nickname is already in use. Please choose a different one.'
        } else if (
          error.message.includes('unauthorized') ||
          error.message.includes('Unauthorized')
        ) {
          errorTitle = 'Authentication Error'
          errorMessage = 'Your current secret is incorrect. Please verify and try again.'
        } else {
          errorMessage = error.message
        }
      }

      Toast.show({
        text1: errorTitle,
        text2: errorMessage,
        type: 'error',
        topOffset: toastTopOffset
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  // Header actions are now handled by parent component using AppHeader

  useEffect(() => {
    resetFields()
  }, [])

  // Calculate password strength
  useEffect(() => {
    try {
      setStrength(zxcvbn(secret).score) // from 0 to 4
    } catch (error) {
      setStrength(0)
    }
  }, [secret])

  // Validate all fields
  useEffect(() => {
    const errors = validateAllFields(nickNameText, secret, secretConfirm, strength)
    setErrorsMap(errors)
  }, [nickNameText, secret, secretConfirm, strength])

  useEffect(() => {
    if (errorsMap.size === 0 && secret.length > 0) {
      setCanSubmit(true)
    } else {
      setCanSubmit(false)
    }
  }, [errorsMap])

  const styles = getStyles(theme)

  const handleReset = async () => {
    await reducer.resetSecret({ topOffset: toastTopOffset })
    await resetFields()
    Toast.show({
      text1: 'Secret reset',
      text2: 'enter new Secret',
      topOffset: toastTopOffset
    })
  }

  return (
    <SafeAreaView style={[styles.container, safeAreaViewStyle]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
          contentInsetAdjustmentBehavior='automatic'
          enableOnAndroid
          extraScrollHeight={20}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }}
          >
            <HeaderCard nickNameEntered={nickNameEntered} theme={theme} />

            <View style={styles.formCard}>
              <NicknameInputField
                value={nickNameText}
                onChangeText={setNickNameText}
                disabled={nickNameEntered}
                theme={theme}
                errorMessage={errorsMap.get('nickName')}
              />

              {nickNameEntered && (
                <SecretInputField
                  placeholder='Current secret'
                  value={oldSecret}
                  onChangeText={setOldSecret}
                  showPassword={showOldPassword}
                  setShowPassword={setShowOldPassword}
                  theme={theme}
                  leftIconName='key'
                />
              )}

              <SecretInputField
                placeholder='New secret'
                value={secret}
                onChangeText={setSecret}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                theme={theme}
              />

              {secret.length > 0 && (
                <PasswordStrengthIndicator
                  strength={strength}
                  theme={theme}
                  errorMessage={errorsMap.get('secret')}
                />
              )}

              <SecretInputField
                placeholder='Confirm secret'
                value={secretConfirm}
                onChangeText={setSecretConfirm}
                showPassword={showConfirmPassword}
                setShowPassword={setShowConfirmPassword}
                theme={theme}
                errorMessage={errorsMap.get('secretConfirm')}
                leftIconName='check-circle'
              />
            </View>

            <Button
              title={
                isSubmitting
                  ? nickNameEntered
                    ? 'Updating...'
                    : 'Creating...'
                  : nickNameEntered
                    ? 'Update Identity'
                    : 'Create Identity'
              }
              icon={
                isSubmitting
                  ? (
                    <FontAwesome5
                      name='hourglass'
                      size={18}
                      color='white'
                      style={{ marginRight: 8 }}
                    />
                    )
                  : (
                    <FontAwesome5
                      name={nickNameEntered ? 'edit' : 'user-shield'}
                      size={18}
                      color='white'
                      style={{ marginRight: 8 }}
                    />
                    )
              }
              size='lg'
              buttonStyle={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
              titleStyle={styles.submitButtonTitle}
              onPress={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              loading={isSubmitting}
            />

            <WarningCard theme={theme} />

            {nickNameEntered && <ResetCard theme={theme} onReset={handleReset} />}
          </Animated.View>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  )
}
export default SecretScreen
