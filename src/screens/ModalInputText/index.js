import { useNavigation } from '@react-navigation/native'
import { router } from 'expo-router'
import React from 'react'

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

import PropTypes from 'prop-types'

import CachedImage from 'expo-cached-image'

import { SHARED_STYLES } from '../../theme/sharedStyles'

import * as reducer from '../../components/Photo/reducer'

const maxStringLength = 140

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SHARED_STYLES.theme.BACKGROUND,
  },
  photoContainer: {
    alignSelf: 'center',
    marginBottom: 10,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  inputContainer: {
    marginHorizontal: 20,
    marginTop: 0,
    marginBottom: 20,
    backgroundColor: SHARED_STYLES.theme.CARD_BACKGROUND,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SHARED_STYLES.theme.CARD_BORDER,
    overflow: 'hidden',
    shadowColor: SHARED_STYLES.theme.CARD_SHADOW,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  textInput: {
    color: SHARED_STYLES.theme.TEXT_PRIMARY,
    fontSize: 16,
    padding: 20,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  characterCount: {
    position: 'absolute',
    top: 12,
    right: 16,
    color: SHARED_STYLES.theme.TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: '500',
  },
  submitButton: {
    ...SHARED_STYLES.interactive.primaryButton,
    margin: 20,
    marginTop: 10,
  },
  submitButtonTitle: {
    ...SHARED_STYLES.interactive.primaryButtonTitle,
  },
})

const ModalInputText = ({ route }) => {
  const navigation = useNavigation()
  const { photo, topOffset, uuid, onTextChange, inputText } = route.params
  const { height, width } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const isSmallDevice = width < 768

  // Calculate photo dimensions with fixed height of 200px
  const calculatePhotoDimensions = () => {
    const targetHeight = 200
    if (photo?.width && photo?.height) {
      const aspectRatio = photo.width / photo.height
      const scaledWidth = targetHeight * aspectRatio
      return {
        width: scaledWidth,
        height: targetHeight,
      }
    }
    // Fallback to square if dimensions not available
    return {
      width: targetHeight,
      height: targetHeight,
    }
  }

  const photoDimensions = calculatePhotoDimensions()

  const handleSubmit = async () => {
    await reducer.submitComment({
      inputText: inputText.trim(),
      uuid,
      photo,
      topOffset,
    })
    router.back()
  }

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
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingTop: 16,
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
              width: photoDimensions.width,
              height: photoDimensions.height,
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
            placeholderTextColor={SHARED_STYLES.theme.TEXT_SECONDARY}
            maxLength={maxStringLength}
            style={[styles.textInput, { height: height < 700 ? 120 : 150 }]}
            onChangeText={(inputValue) => {
              onTextChange(inputValue.slice(0, maxStringLength))
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
