import { useAtom } from 'jotai'
import React, { useEffect, useState } from 'react'

import {
  Alert,
  Animated,
  Keyboard,
  SafeAreaView,
  Text,
  TouchableWithoutFeedback,
  View
} from 'react-native'

import * as Haptics from 'expo-haptics'
import { Storage } from 'expo-storage'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import Toast from 'react-native-toast-message'

import { FontAwesome5 } from '@expo/vector-icons'

import zxcvbn from '../../zxcvbn'

import * as STATE from '../../state'
import { getTheme } from '../../theme/sharedStyles'

import { useSafeAreaViewStyle } from '../../hooks/useStatusBarHeight'
import useToastTopOffset from '../../hooks/useToastTopOffset'

import Button from '../../components/ui/Button'
import EmptyStateCard from '../../components/EmptyStateCard'
import { emitIdentityChange } from '../../events/identityChangeBus'
import * as reducer from './reducer'

// Import extracted components
import ActionRow from './components/ActionRow'
import IdentityProfileCard from './components/IdentityProfileCard'
import NicknameInputField from './components/NicknameInputField'
import PasswordStrengthIndicator from './components/PasswordStrengthIndicator'
import PrivacyExplainerView from './components/PrivacyExplainerView'
import PrivacyNoticeCard from './components/PrivacyNoticeCard'
import SecretInputField from './components/SecretInputField'

// Import utilities
import { getStyles } from './styles'
import { validateAllFields } from './utils/validation'

const SecretScreen = () => {
  const [uuid] = useAtom(STATE.uuid)
  const [, setNickName] = useAtom(STATE.nickName)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const [netAvailable] = useAtom(STATE.netAvailable)

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

  const [showChangeSecret, setShowChangeSecret] = useState(false)

  const [hasSeenExplainer, setHasSeenExplainer] = useState(true) // default true to avoid flash

  const [errorsMap, setErrorsMap] = useState(new Map())

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const scaleAnim = React.useRef(new Animated.Value(1)).current

  // Animate components when render branch changes
  useEffect(() => {
    fadeAnim.setValue(0)
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
  }, [hasSeenExplainer])

  const resetFields = async () => {
    const nnn = await reducer.getStoredNickName()
    setNickNameText(nnn)
    setNickNameEntered(nnn.length > 0)
    setOldSecret('')
    setSecret('')
    setSecretConfirm('')
    setShowChangeSecret(false)
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
        text2: nickNameEntered ? 'Your secret has been updated.' : 'Identity attached to this device.',
        topOffset: toastTopOffset,
        type: 'success'
      })

      await resetFields()
      emitIdentityChange()
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

  useEffect(() => {
    resetFields()
  }, [])

  // Check if user has seen privacy explainer
  useEffect(() => {
    const checkExplainer = async () => {
      try {
        const seen = await Storage.getItem({ key: 'identityPrivacyExplainerSeen' })
        setHasSeenExplainer(!!seen)
      } catch { /* noop */ }
    }
    checkExplainer()
  }, [])

  const handleDismissExplainer = async () => {
    setHasSeenExplainer(true)
    try {
      await Storage.setItem({ key: 'identityPrivacyExplainerSeen', value: 'true' })
    } catch { /* noop */ }
  }

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
    Alert.alert(
      'Detach Identity from This Device?',
      'This removes your identity from this device only. Your nickname and secret still work — you can re-attach here or on any other device anytime, as long as you remember them.\n\nIf you forget your nickname or secret, no one can recover them — including us.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Detach',
          style: 'destructive',
          onPress: async () => {
            await reducer.resetSecret({ topOffset: toastTopOffset })
            setNickName('')
            await resetFields()
            emitIdentityChange()
            Toast.show({
              text1: 'Identity detached',
              text2: 'Enter your nickname and secret to re-attach',
              topOffset: toastTopOffset
            })
          }
        }
      ],
      { cancelable: true }
    )
  }

  if (!netAvailable) {
    return (
      <SafeAreaView style={[styles.container, safeAreaViewStyle]}>
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20 }}>
          <EmptyStateCard
            icon='wifi-off'
            iconType='MaterialIcons'
            title='No Internet Connection'
            subtitle='Identity management requires an internet connection. Please check your connection and try again.'
          />
        </View>
      </SafeAreaView>
    )
  }

  // ── Active Identity View ──
  if (nickNameEntered) {
    return (
      <SafeAreaView style={[styles.container, safeAreaViewStyle]}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAwareScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'
            contentInsetAdjustmentBehavior='automatic'
            bottomOffset={20}
          >
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }}
            >
              <IdentityProfileCard nickName={nickNameText} theme={theme} />

              <View style={styles.actionsContainer}>
                <ActionRow
                  icon='key'
                  label='Change Secret'
                  onPress={() => setShowChangeSecret(!showChangeSecret)}
                  theme={theme}
                />

                {showChangeSecret && (
                  <View style={styles.formCard}>
                    <SecretInputField
                      placeholder='Current secret'
                      value={oldSecret}
                      onChangeText={setOldSecret}
                      showPassword={showOldPassword}
                      setShowPassword={setShowOldPassword}
                      theme={theme}
                      leftIconName='key'
                    />

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

                    <Button
                      title={isSubmitting ? 'Updating...' : 'Update Secret'}
                      icon={
                        <FontAwesome5
                          name={isSubmitting ? 'hourglass' : 'edit'}
                          size={18}
                          color='white'
                          style={{ marginRight: 8 }}
                        />
                      }
                      size='lg'
                      buttonStyle={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
                      titleStyle={styles.submitButtonTitle}
                      onPress={handleSubmit}
                      disabled={!canSubmit || isSubmitting}
                      loading={isSubmitting}
                    />
                  </View>
                )}

                <View style={{ height: 12 }} />

                <ActionRow
                  icon='unlink'
                  label='Detach from This Device'
                  onPress={handleReset}
                  destructive
                  theme={theme}
                />
              </View>

              <PrivacyNoticeCard theme={theme} />
            </Animated.View>
          </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    )
  }

  // ── No Identity — Privacy Explainer Gate ──
  if (!hasSeenExplainer) {
    return (
      <SafeAreaView style={[styles.container, safeAreaViewStyle]}>
        <PrivacyExplainerView theme={theme} onDismiss={handleDismissExplainer} />
      </SafeAreaView>
    )
  }

  // ── No Identity — Creation Flow ──
  return (
    <SafeAreaView style={[styles.container, safeAreaViewStyle]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
          contentInsetAdjustmentBehavior='automatic'
          bottomOffset={20}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }}
          >
            <View style={styles.creationHeader}>
              <View style={styles.creationIconContainer}>
                <FontAwesome5 name='user-shield' size={40} color='#EA5E3D' />
              </View>
              <Text style={styles.creationTitle}>Attach Identity to This Device</Text>
              <Text style={styles.creationSubtitle}>
                Enter a nickname and secret. New here? We’ll create your identity. Returning on a new device? We’ll reconnect you to your existing one — same nickname and secret work anywhere.
              </Text>
            </View>

            <View style={styles.formCard}>
              <NicknameInputField
                value={nickNameText}
                onChangeText={setNickNameText}
                disabled={false}
                theme={theme}
                errorMessage={errorsMap.get('nickName')}
              />

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
              title={isSubmitting ? 'Attaching...' : 'Attach Identity'}
              icon={
                <FontAwesome5
                  name={isSubmitting ? 'hourglass' : 'link'}
                  size={18}
                  color='white'
                  style={{ marginRight: 8 }}
                />
              }
              size='lg'
              buttonStyle={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
              titleStyle={styles.submitButtonTitle}
              onPress={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              loading={isSubmitting}
            />

            <PrivacyNoticeCard theme={theme} />
          </Animated.View>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  )
}
export default SecretScreen
