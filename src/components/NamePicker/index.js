import React, { useState } from 'react'
import {
  Keyboard,
  Modal,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button, Text } from '@rneui/themed'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { FontAwesome5, Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'

import PropTypes from 'prop-types'

import * as CONST from '../../consts'

const NamePicker = ({
  show,
  setShow,
  setContactName,
  headerText,
  friendshipUuid,
}) => {
  const { height } = useWindowDimensions()
  const insets = useSafeAreaInsets()

  const [inputText, _setInputText] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const inputTextRef = React.useRef(inputText)
  const setInputText = (data) => {
    inputTextRef.current = data
    _setInputText(data)
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: insets.top + 10,
      paddingBottom: 15,
      backgroundColor: 'transparent',
    },
    headerButton: {
      padding: 12,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerIcon: {
      textShadowColor: 'rgba(0, 0, 0, 0.8)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#fff',
      textShadowColor: 'rgba(0, 0, 0, 0.8)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 20,
    },
    iconContainer: {
      alignSelf: 'center',
      marginBottom: 20,
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    titleText: {
      fontSize: 24,
      fontWeight: '600',
      color: '#fff',
      textAlign: 'center',
      marginBottom: 12,
    },
    subtitleText: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.7)',
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 40,
    },
    inputContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      marginBottom: 20,
    },
    textInput: {
      color: '#fff',
      fontSize: 18,
      padding: 20,
      textAlign: 'center',
      fontWeight: '500',
    },
    characterCount: {
      position: 'absolute',
      top: 12,
      right: 16,
      color: 'rgba(255, 255, 255, 0.5)',
      fontSize: 12,
      fontWeight: '500',
    },
    buttonContainer: {
      marginTop: 20,
    },
    saveButton: {
      borderRadius: 12,
      backgroundColor: CONST.MAIN_COLOR,
      shadowColor: CONST.MAIN_COLOR,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      paddingVertical: 16,
    },
    saveButtonTitle: {
      fontSize: 16,
      fontWeight: '600',
      paddingRight: 8,
    },
    cancelButton: {
      marginTop: 12,
      borderRadius: 12,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      paddingVertical: 14,
    },
    cancelButtonTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: 'rgba(255, 255, 255, 0.8)',
    },
  })

  const handleSave = async () => {
    if (inputText.trim()) {
      setIsSaving(true)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

      try {
        if (friendshipUuid) {
          // Editing an existing friend
          await setContactName({
            friendshipUuid,
            contactName: inputText.trim(),
          })
        } else {
          // Adding a new friend - just pass the contact name
          await setContactName({
            contactName: inputText.trim(),
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
    <Modal
      animationType="slide"
      transparent={false}
      visible={show}
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

        {/* Custom Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerButton}>
            <Ionicons
              name="chevron-back"
              size={24}
              color="#fff"
              style={styles.headerIcon}
              onPress={handleCancel}
            />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <FontAwesome5
              name="user-plus"
              size={18}
              color="#fff"
              style={[styles.headerIcon, { marginRight: 8 }]}
            />
            <Text style={styles.headerTitle}>Save Friend</Text>
          </View>

          <View style={styles.headerButton}>
            <Ionicons
              name="checkmark"
              size={24}
              color={inputText.trim() ? '#fff' : 'rgba(255, 255, 255, 0.3)'}
              style={styles.headerIcon}
              onPress={handleSave}
            />
          </View>
        </View>

        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <FontAwesome5 name="user-friends" size={32} color="#fff" />
              </View>

              {/* Title and Subtitle */}
              <Text style={styles.titleText}>What's your friend's name?</Text>
              <Text style={styles.subtitleText}>
                {headerText ||
                  'Give your friend a memorable name so you can easily find them later.'}
              </Text>

              {/* Input Field */}
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Enter friend's name..."
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  autoFocus
                  style={styles.textInput}
                  maxLength={50}
                  onChangeText={(inputValue) => {
                    setInputText(inputValue.slice(0, 50))
                  }}
                  value={inputText}
                  returnKeyType="done"
                  onSubmitEditing={handleSave}
                />
                <Text style={styles.characterCount}>
                  {50 - inputText.length}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <Button
                  title={isSaving ? 'Adding...' : 'Save Friend'}
                  icon={
                    <FontAwesome5
                      name="user-plus"
                      size={16}
                      color="white"
                      style={{ marginRight: 8 }}
                    />
                  }
                  buttonStyle={styles.saveButton}
                  titleStyle={styles.saveButtonTitle}
                  onPress={handleSave}
                  disabled={!inputText.trim() || isSaving}
                  loading={isSaving}
                />

                <Button
                  title="Cancel"
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
  friendshipUuid: PropTypes.string,
}

export default NamePicker
