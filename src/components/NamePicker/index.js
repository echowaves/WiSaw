import React, { useState } from 'react'
import {
  Keyboard,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { FontAwesome5, Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'

import { useAtom } from 'jotai'
import PropTypes from 'prop-types'

import { isDarkMode as isDarkModeAtom } from '../../state'
import { getTheme, getThemedStyles, SHARED_STYLES } from '../../theme/sharedStyles'
import AppHeader from '../AppHeader'
import Button from '../ui/Button'

const NamePicker = ({ show, setShow, setContactName, headerText, friendshipUuid }) => {
  const { height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const [isDarkMode] = useAtom(isDarkModeAtom)
  const theme = getTheme(isDarkMode)
  const themedStyles = getThemedStyles(isDarkMode)

  const [inputText, _setInputText] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const inputTextRef = React.useRef(inputText)
  const setInputText = (data) => {
    inputTextRef.current = data
    _setInputText(data)
  }

  const createStyles = (currentTheme) =>
    StyleSheet.create({
      container: {
        ...themedStyles.containers.main
      },
      headerTitle: {
        ...SHARED_STYLES.header.title
      },
      contentContainer: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 16
      },
      iconContainer: {
        alignSelf: 'center',
        marginBottom: 20,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: currentTheme.INTERACTIVE_BACKGROUND,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: currentTheme.INTERACTIVE_BORDER
      },
      titleText: {
        ...themedStyles.text.heading,
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 12
      },
      subtitleText: {
        ...themedStyles.text.secondary,
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40
      },
      inputContainer: {
        backgroundColor: currentTheme.CARD_BACKGROUND,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: currentTheme.CARD_BORDER,
        marginBottom: 20,
        shadowColor: currentTheme.CARD_SHADOW,
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4
      },
      textInput: {
        ...themedStyles.text.primary,
        fontSize: 18,
        padding: 20,
        textAlign: 'center',
        fontWeight: '500'
      },
      characterCount: {
        position: 'absolute',
        top: 12,
        right: 16,
        color: currentTheme.TEXT_SECONDARY,
        fontSize: 12,
        fontWeight: '400'
      },
      buttonContainer: {
        ...(themedStyles.interactive.buttonContainer || SHARED_STYLES.interactive.buttonContainer)
      },
      saveButton: {
        ...SHARED_STYLES.interactive.primaryButton,
        backgroundColor: currentTheme.STATUS_SUCCESS // Use theme color for better dark mode support
      },
      saveButtonTitle: {
        ...SHARED_STYLES.interactive.primaryButtonTitle,
        color: '#FFFFFF' // Ensure white text on colored background
      },
      cancelButton: {
        ...SHARED_STYLES.interactive.secondaryButton,
        backgroundColor: currentTheme.INTERACTIVE_BACKGROUND,
        borderColor: currentTheme.INTERACTIVE_BORDER
      },
      cancelButtonTitle: {
        ...SHARED_STYLES.interactive.secondaryButtonTitle,
        color: currentTheme.TEXT_PRIMARY
      }
    })

  const styles = createStyles(theme)

  const handleSave = async () => {
    if (inputText.trim()) {
      setIsSaving(true)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

      try {
        if (friendshipUuid) {
          // Editing an existing friend
          await setContactName({
            friendshipUuid,
            contactName: inputText.trim()
          })
        } else {
          // Adding a new friend - just pass the contact name
          await setContactName({
            contactName: inputText.trim()
          })
        }
        await setShow(false)
        await setInputText('')
      } finally {
        setIsSaving(false)
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    }
  }

  const handleCancel = () => {
    Haptics.selectionAsync()
    setShow(false)
    setInputText('') // reset for next use
    setIsSaving(false)
  }

  // Reset state when modal is closed
  React.useEffect(() => {
    if (!show) {
      setInputText('')
      setIsSaving(false)
    }
  }, [show])

  return (
    <Modal animationType='slide' transparent={false} visible={show} presentationStyle='fullScreen'>
      <View style={styles.container}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={theme.HEADER_BACKGROUND}
          translucent={false}
        />

        {/* Use AppHeader for consistency */}
        <AppHeader
          onBack={handleCancel}
          title={
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesome5
                name={friendshipUuid ? 'edit' : 'user-plus'}
                size={18}
                color={theme.TEXT_PRIMARY}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.headerTitle}>
                {friendshipUuid ? 'Edit Friend Name' : 'Add Friend'}
              </Text>
            </View>
          }
          rightSlot={
            <TouchableOpacity
              onPress={handleSave}
              disabled={!inputText.trim() || isSaving}
              style={[
                SHARED_STYLES.interactive.headerButton,
                { opacity: inputText.trim() && !isSaving ? 1 : 0.6 }
              ]}
            >
              <Ionicons
                name='checkmark'
                size={24}
                color={inputText.trim() && !isSaving ? theme.TEXT_PRIMARY : theme.TEXT_DISABLED}
              />
            </TouchableOpacity>
          }
          safeTopOnly
        />

        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior='automatic'
          enableOnAndroid
          extraScrollHeight={20}
          enableResetScrollToCoords={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <FontAwesome5 name='users' size={32} color={theme.TEXT_PRIMARY} />
              </View>

              {/* Title and Subtitle */}
              <Text style={styles.titleText}>
                {friendshipUuid ? "Update your friend's name" : "What's your friend's name?"}
              </Text>
              <Text style={styles.subtitleText}>
                {headerText ||
                  'Give your friend a memorable name so you can easily find them later.'}
              </Text>

              {/* Input Field */}
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Enter friend's name..."
                  placeholderTextColor={theme.TEXT_SECONDARY}
                  autoFocus
                  style={styles.textInput}
                  maxLength={50}
                  onChangeText={(inputValue) => {
                    setInputText(inputValue.slice(0, 50))
                  }}
                  value={inputText}
                  returnKeyType='done'
                  onSubmitEditing={handleSave}
                />
                <Text style={styles.characterCount}>{50 - inputText.length}</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <Button
                  title={(() => {
                    if (isSaving) {
                      return friendshipUuid ? 'Updating...' : 'Adding...'
                    }
                    return friendshipUuid ? 'Update Friend' : 'Save Friend'
                  })()}
                  icon={
                    <FontAwesome5
                      name={friendshipUuid ? 'edit' : 'user-plus'}
                      size={16}
                      color='white'
                      style={{ marginRight: 8 }}
                    />
                  }
                  size='lg'
                  buttonStyle={[styles.saveButton, { marginBottom: 12 }]}
                  titleStyle={styles.saveButtonTitle}
                  onPress={handleSave}
                  disabled={!inputText.trim() || isSaving}
                  loading={isSaving}
                />

                <Button
                  title='Cancel'
                  size='lg'
                  buttonStyle={styles.cancelButton}
                  titleStyle={styles.cancelButtonTitle}
                  onPress={handleCancel}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAwareScrollView>
      </View>
    </Modal>
  )
}

NamePicker.propTypes = {
  show: PropTypes.bool.isRequired,
  setShow: PropTypes.func.isRequired,
  setContactName: PropTypes.func.isRequired,
  headerText: PropTypes.string,
  friendshipUuid: PropTypes.string
}

export default NamePicker
