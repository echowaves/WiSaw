import { useNavigation } from '@react-navigation/native'
import { router, useFocusEffect } from 'expo-router'
import { useAtom } from 'jotai'
import React, { useCallback, useEffect, useState } from 'react'

import {
  Animated,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'

import { gql } from '@apollo/client'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Toast from 'react-native-toast-message'

import { FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'

import AppHeader from '../../components/AppHeader'
import * as CONST from '../../consts'
import * as STATE from '../../state'
import { getTheme } from '../../theme/sharedStyles'

const maxStringLength = 2000

const FeedbackScreen = () => {
  const navigation = useNavigation()
  const [uuid, setUuid] = useAtom(STATE.uuid)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const [topOffset, setTopOffset] = useAtom(STATE.topOffset)

  const theme = getTheme(isDarkMode)

  const [inputText, _setInputText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current

  const inputTextRef = React.useRef(inputText)
  const setInputText = (data) => {
    inputTextRef.current = data
    _setInputText(data)
  }

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

  // Clear form when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Reset form state when navigating to the screen
      setInputText('')
      setIsSubmitting(false)
      setIsFocused(false)
    }, []),
  )

  const submitFeedback = async ({ feedbackText }) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    try {
      if (feedbackText.trim().length < 10) {
        throw Error(
          'Please provide more detailed feedback (at least 10 characters)',
        )
      }

      await CONST.gqlClient.mutate({
        mutation: gql`
          mutation createContactForm($uuid: String!, $description: String!) {
            createContactForm(uuid: $uuid, description: $description) {
              createdAt
              id
              updatedAt
              uuid
            }
          }
        `,
        variables: {
          uuid,
          description: feedbackText,
        },
      })

      // Success haptic and navigation
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

      // Clear the form
      setInputText('')
      setIsSubmitting(false)
      setIsFocused(false)

      router.back()
      Toast.show({
        text1: 'Thank you! 🎉',
        text2: 'Your feedback has been submitted successfully.',
        topOffset,
        type: 'success',
      })
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Toast.show({
        text1: 'Oops! Something went wrong',
        text2: err.toString(),
        type: 'error',
        topOffset,
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  const handleSubmit = () => {
    if (inputTextRef.current.trim().length < 10) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      Toast.show({
        text1: 'More details needed',
        text2: 'Please provide at least 10 characters of feedback.',
        type: 'error',
        topOffset,
      })
      return
    }
    submitFeedback({ feedbackText: inputTextRef.current.trim() })
  }

  const getCharacterCountColor = () => {
    const remaining = maxStringLength - inputText.length
    if (remaining < 100) return '#FF6B6B' // Red when very few characters left
    if (remaining < 300) return '#FFD93D' // Yellow when getting low
    return CONST.TEXT_COLOR // Use the app's standard text color
  }

  const getInputBorderColor = () => {
    if (isFocused) return CONST.MAIN_COLOR
    if (inputText.length > 0) return 'rgba(255, 255, 255, 0.3)'
    return 'rgba(255, 255, 255, 0.1)'
  }

  const renderHeaderRight = () => (
    <TouchableOpacity
      onPress={handleSubmit}
      disabled={isSubmitting || inputText.trim().length < 10}
      style={{
        marginRight: 10,
        opacity: isSubmitting || inputText.trim().length < 10 ? 0.5 : 1,
      }}
    >
      {isSubmitting ? (
        <Ionicons name="hourglass" size={24} color={CONST.MAIN_COLOR} />
      ) : (
        <Ionicons name="send" size={24} color={CONST.MAIN_COLOR} />
      )}
    </TouchableOpacity>
  )
  const renderHeaderLeft = () => (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{
        marginLeft: 10,
        padding: 8,
      }}
    >
      <FontAwesome name="chevron-left" size={24} color={CONST.MAIN_COLOR} />
    </TouchableOpacity>
  )

  // Remove navigation.setOptions as it's not compatible with Expo Router
  // The header is now controlled by the layout in app/(drawer)/feedback.tsx
  // useEffect(() => {
  //   navigation.setOptions({
  //     headerTitle: 'Share Your Feedback',
  //     headerTintColor: CONST.MAIN_COLOR,
  //     headerRight: renderHeaderRight,
  //     headerLeft: renderHeaderLeft,
  //     headerBackTitle: '',
  //     headerStyle: {
  //       backgroundColor: CONST.NAV_COLOR,
  //       borderBottomWidth: 1,
  //       borderBottomColor: CONST.HEADER_BORDER_COLOR,
  //       shadowColor: CONST.HEADER_SHADOW_COLOR,
  //       shadowOffset: {
  //         width: 0,
  //         height: 2,
  //       },
  //       shadowOpacity: 1,
  //       shadowRadius: 4,
  //       elevation: 3,
  //     },
  //     headerTitleStyle: {
  //       fontSize: 18,
  //       fontWeight: '600',
  //       color: CONST.TEXT_COLOR,
  //     },
  //   })
  // }, [inputText, isSubmitting])
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.BACKGROUND,
    },
    scrollContainer: {
      flex: 1,
      backgroundColor: theme.BACKGROUND,
    },
    contentContainer: {
      backgroundColor: theme.BACKGROUND,
      paddingBottom: 100,
      padding: 20,
      paddingTop: 30,
    },
    headerCard: {
      backgroundColor: theme.CARD_BACKGROUND,
      borderRadius: 20,
      marginVertical: 8,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.CARD_BORDER,
      shadowColor: theme.CARD_SHADOW,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      marginBottom: 20,
      marginHorizontal: 0,
    },
    iconContainer: {
      alignSelf: 'center',
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.interactiveBackground,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      color: theme.TEXT_PRIMARY,
      fontSize: 24,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      color: theme.TEXT_SECONDARY,
      fontSize: 16,
      fontWeight: '400',
      textAlign: 'center',
      lineHeight: 22,
    },
    inputCard: {
      backgroundColor: theme.CARD_BACKGROUND,
      borderRadius: 20,
      marginVertical: 8,
      borderWidth: 2,
      borderColor: theme.CARD_BORDER,
      shadowColor: theme.CARD_SHADOW,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      padding: 0,
      marginBottom: 20,
      marginHorizontal: 0,
      overflow: 'hidden',
    },
    textInput: {
      fontSize: 16,
      color: theme.TEXT_PRIMARY,
      padding: 20,
      paddingTop: 20,
      paddingBottom: 60,
      textAlignVertical: 'top',
      minHeight: 180,
      lineHeight: 24,
    },
    inputFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: theme.inputFooterBackground,
      borderTopWidth: 1,
      borderTopColor: theme.BORDER_LIGHT,
    },
    characterCount: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.TEXT_PRIMARY,
    },
    validationText: {
      fontSize: 12,
      color: theme.TEXT_SECONDARY,
    },
    submitButton: {
      backgroundColor: CONST.MAIN_COLOR,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: CONST.MAIN_COLOR,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      marginBottom: 20,
    },
    submitButtonDisabled: {
      backgroundColor: theme.disabledBackground,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadowOpacity: 0.1,
      marginBottom: 20,
    },
    submitButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: '600',
      marginLeft: 8,
    },
    helpCard: {
      backgroundColor: theme.helpCardBackground,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.helpCardBorder,
    },
    helpTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#4FC3F7',
      marginBottom: 8,
    },
    helpText: {
      fontSize: 14,
      color: theme.TEXT_PRIMARY,
      lineHeight: 20,
    },
    bulletPoint: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 6,
    },
    bulletText: {
      fontSize: 14,
      color: theme.TEXT_PRIMARY,
      lineHeight: 20,
      marginLeft: 8,
      flex: 1,
    },
  })

  return (
    <>
      <AppHeader title="Feedback" onBack={() => router.back()} />
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAwareScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="automatic"
            enableOnAndroid={true}
            extraScrollHeight={20}
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
                    name="comments"
                    size={32}
                    color={CONST.MAIN_COLOR}
                  />
                </View>
                <Text style={styles.title}>We'd Love Your Feedback!</Text>
                <Text style={styles.subtitle}>
                  Help us improve WiSaw by sharing your thoughts, suggestions,
                  or reporting any issues you've encountered.
                </Text>
              </View>

              {/* Input Card */}
              <View
                style={[
                  styles.inputCard,
                  { borderColor: getInputBorderColor() },
                ]}
              >
                <TextInput
                  multiline
                  numberOfLines={8}
                  placeholder="Tell us what's on your mind... What features would you like to see? Any bugs to report? How can we make WiSaw better for you?"
                  placeholderTextColor={CONST.PLACEHOLDER_TEXT_COLOR}
                  maxLength={maxStringLength}
                  style={styles.textInput}
                  onChangeText={(inputValue) => {
                    setInputText(inputValue.slice(0, maxStringLength))
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  value={inputText}
                  editable={!isSubmitting}
                />
                <View style={styles.inputFooter}>
                  <Text style={styles.validationText}>
                    {inputText.length < 10
                      ? 'At least 10 characters needed'
                      : 'Looking good! 👍'}
                  </Text>
                  <Text
                    style={[
                      styles.characterCount,
                      { color: getCharacterCountColor() },
                    ]}
                  >
                    {maxStringLength - inputText.length}
                  </Text>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (isSubmitting || inputText.trim().length < 10) &&
                    styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting || inputText.trim().length < 10}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <Ionicons name="hourglass" size={20} color="white" />
                ) : (
                  <FontAwesome5 name="paper-plane" size={18} color="white" />
                )}
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Sending...' : 'Send Feedback'}
                </Text>
              </TouchableOpacity>

              {/* Help Card */}
              <View style={styles.helpCard}>
                <Text style={styles.helpTitle}>
                  💡 What to include in your feedback:
                </Text>

                <View style={styles.bulletPoint}>
                  <Text style={{ color: '#4FC3F7' }}>•</Text>
                  <Text style={styles.bulletText}>
                    Bug reports with steps to reproduce the issue
                  </Text>
                </View>

                <View style={styles.bulletPoint}>
                  <Text style={{ color: '#4FC3F7' }}>•</Text>
                  <Text style={styles.bulletText}>
                    Feature requests and improvement suggestions
                  </Text>
                </View>

                <View style={styles.bulletPoint}>
                  <Text style={{ color: '#4FC3F7' }}>•</Text>
                  <Text style={styles.bulletText}>
                    General thoughts about your WiSaw experience
                  </Text>
                </View>

                <View style={styles.bulletPoint}>
                  <Text style={{ color: '#4FC3F7' }}>•</Text>
                  <Text style={styles.bulletText}>
                    UI/UX feedback and usability improvements
                  </Text>
                </View>
              </View>
            </Animated.View>
          </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>
      </View>
    </>
  )
}

export default FeedbackScreen
