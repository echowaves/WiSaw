import { Ionicons } from '@expo/vector-icons'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { TouchableOpacity, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as reducer from '../../../src/components/Photo/reducer'
import ModalInputText from '../../../src/screens/ModalInputText'
import { SHARED_STYLES } from '../../../src/theme/sharedStyles'

export default function ModalInputScreen() {
  const params = useLocalSearchParams()
  const router = useRouter()
  const { photo, uuid, topOffset } = params
  const [inputText, setInputText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const isSmallDevice = width < 768

  // Parse the photo back from JSON string
  const parsedPhoto = photo ? JSON.parse(photo as string) : {}

  const routeParams = {
    photo: parsedPhoto,
    uuid,
    topOffset: Number(topOffset),
    onTextChange: setInputText,
    inputText,
  }

  const handleSubmit = async () => {
    if (isSubmitting || !inputText.trim()) return

    setIsSubmitting(true)
    try {
      await reducer.submitComment({
        inputText: inputText.trim(),
        uuid,
        photo: parsedPhoto,
        topOffset: Number(topOffset),
      })
      router.back()
    } catch (error) {
      console.error('Error submitting comment:', error)
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Add Comment',
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                ...SHARED_STYLES.interactive.headerButton,
                backgroundColor: SHARED_STYLES.theme.BUTTON_BACKGROUND,
                borderColor: SHARED_STYLES.theme.BORDER_LIGHT,
              }}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={SHARED_STYLES.theme.TEXT_PRIMARY}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting || !inputText.trim()}
              style={{
                ...SHARED_STYLES.interactive.headerButton,
                backgroundColor:
                  isSubmitting || !inputText.trim()
                    ? SHARED_STYLES.theme.BUTTON_BACKGROUND_DISABLED
                    : SHARED_STYLES.theme.BUTTON_BACKGROUND,
                borderColor:
                  isSubmitting || !inputText.trim()
                    ? SHARED_STYLES.theme.BORDER_DISABLED
                    : SHARED_STYLES.theme.INTERACTIVE_BORDER,
                shadowOpacity: isSubmitting || !inputText.trim() ? 0.1 : 0.2,
              }}
            >
              <Ionicons
                name={isSubmitting ? 'hourglass-outline' : 'send'}
                size={24}
                color={
                  isSubmitting || !inputText.trim()
                    ? SHARED_STYLES.theme.TEXT_DISABLED
                    : SHARED_STYLES.theme.TEXT_PRIMARY
                }
              />
            </TouchableOpacity>
          ),
          headerStyle: {
            ...SHARED_STYLES.header.container,
            height: SHARED_STYLES.header.getDynamicHeight(
              insets.top,
              isSmallDevice,
            ),
          } as any,
          headerTitleStyle: {
            fontSize: SHARED_STYLES.header.title.fontSize,
            fontWeight: SHARED_STYLES.header.title.fontWeight as any,
            color: SHARED_STYLES.header.title.color,
          },
          headerTintColor: SHARED_STYLES.theme.TEXT_PRIMARY,
          headerTransparent: false,
        }}
      />
      <ModalInputText route={{ params: routeParams }} />
    </>
  )
}
