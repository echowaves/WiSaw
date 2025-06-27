import { useNavigation } from '@react-navigation/native'
import { router } from 'expo-router'
import React, { useState } from 'react'

import {
  StatusBar,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button, Icon, Text } from '@rneui/themed'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { Ionicons } from '@expo/vector-icons'

import PropTypes from 'prop-types'

import CachedImage from 'expo-cached-image'

import * as CONST from '../../consts'

import * as reducer from '../../components/Photo/reducer'

const maxStringLength = 140

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 8,
  },
  headerIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  photoContainer: {
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  inputContainer: {
    margin: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  textInput: {
    color: '#fff',
    fontSize: 16,
    padding: 20,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  characterCount: {
    position: 'absolute',
    top: 12,
    right: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '500',
  },
  submitButton: {
    margin: 20,
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: CONST.MAIN_COLOR,
    shadowColor: CONST.MAIN_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingRight: 8,
  },
})

const ModalInputText = ({ route }) => {
  const navigation = useNavigation()
  const { photo, topOffset, uuid, onTextChange } = route.params
  const { height } = useWindowDimensions()
  const insets = useSafeAreaInsets()

  const [inputText, _setInputText] = useState('')

  const inputTextRef = React.useRef(inputText)
  const setInputText = (data) => {
    inputTextRef.current = data
    _setInputText(data)
    // Notify parent component of text changes
    if (onTextChange) {
      onTextChange(data)
    }
  }

  const renderHeaderLeft = () => (
    <View style={styles.headerButton}>
      <Ionicons
        name="chevron-back"
        size={24}
        color="#fff"
        style={styles.headerIcon}
        onPress={() => router.back()}
      />
    </View>
  )

  const handleSubmit = async () => {
    await reducer.submitComment({
      inputText: inputTextRef.current.trim(),
      uuid,
      photo,
      topOffset,
    })
    router.back()
  }

  const renderHeaderRight = () => (
    <View style={styles.headerButton}>
      <Ionicons
        onPress={() => {
          handleSubmit()
        }}
        name="send"
        size={24}
        color="#fff"
        style={styles.headerIcon}
      />
    </View>
  )

  const renderHeaderTitle = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Ionicons
        name="chatbubble-outline"
        size={20}
        color="#fff"
        style={styles.headerIcon}
      />
      <Text style={[styles.headerTitle, { marginLeft: 8 }]}>Add Comment</Text>
    </View>
  )

  // Remove navigation.setOptions as it's not compatible with Expo Router
  // The header is now controlled by the layout in app/(drawer)/(tabs)/modal-input.tsx
  // useEffect(() => {
  //   navigation.setOptions({
  //     headerTitle: renderHeaderTitle,
  //     headerLeft: renderHeaderLeft,
  //     headerRight: renderHeaderRight,
  //     headerStyle: {
  //       backgroundColor: 'rgba(0, 0, 0, 0.9)',
  //       borderBottomWidth: 0,
  //       elevation: 0,
  //       shadowOpacity: 0,
  //     },
  //     headerTitleAlign: 'center',
  //     headerTransparent: true,
  //   })
  // }, [])

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingTop: insets.top + 60, // Account for header height
          paddingBottom: insets.bottom + 20,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <CachedImage
          source={{ uri: `${photo.thumbUrl}` }}
          cacheKey={`${photo.id}t`}
          style={[
            styles.photoContainer,
            {
              width: height < 700 ? 100 : 150,
              height: height < 700 ? 100 : 150,
            },
          ]}
        />

        <View style={styles.inputContainer}>
          <TextInput
            autoFocus
            blurOnSubmit={false}
            multiline
            numberOfLines={6}
            placeholder="Share your thoughts about this photo..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            maxLength={maxStringLength}
            style={[styles.textInput, { height: height < 700 ? 120 : 150 }]}
            onChangeText={(inputValue) => {
              setInputText(inputValue.slice(0, maxStringLength))
            }}
            value={inputText}
          />
          <Text style={styles.characterCount}>
            {maxStringLength - inputText.length}
          </Text>
        </View>

        <Button
          onPress={() => handleSubmit()}
          size="lg"
          buttonStyle={styles.submitButton}
          titleStyle={styles.submitButtonTitle}
          disabled={!inputText.trim()}
        >
          Submit Comment
          <Icon name="send" color="white" size={20} style={{ marginLeft: 8 }} />
        </Button>
      </KeyboardAwareScrollView>
    </View>
  )
}

ModalInputText.propTypes = {
  photo: PropTypes.object,
  route: PropTypes.object.isRequired,
}

export default ModalInputText
