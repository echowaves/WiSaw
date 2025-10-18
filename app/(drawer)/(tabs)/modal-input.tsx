import { Ionicons } from '@expo/vector-icons'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { TouchableOpacity, useWindowDimensions } from 'react-native'
import AppHeader from '../../../src/components/AppHeader'
import * as reducer from '../../../src/components/Photo/reducer'
import ModalInputText from '../../../src/screens/ModalInputText'
import { SHARED_STYLES } from '../../../src/theme/sharedStyles'

export default function ModalInputScreen () {
  const params = useLocalSearchParams()
  const router = useRouter()
  const { photo, uuid, topOffset } = params
  const [inputText, setInputText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { width } = useWindowDimensions()
  const isSmallDevice = width < 768

  // Parse the photo back from JSON string
  const parsedPhoto = photo ? JSON.parse(photo as string) : {}

  const routeParams = {
    photo: parsedPhoto,
    uuid,
    topOffset: Number(topOffset),
    onTextChange: setInputText,
    inputText
  }

  const handleSubmit = async () => {
    if (isSubmitting || !inputText.trim()) return

    setIsSubmitting(true)
    try {
      await reducer.submitComment({
        inputText: inputText.trim(),
        uuid,
        photo: parsedPhoto,
        topOffset: Number(topOffset)
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
          headerShown: true,
          header: () => (
            <AppHeader
              onBack={() => router.back()}
              title='Add Comment'
              rightSlot={
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isSubmitting || !inputText.trim()}
                  style={[
                    SHARED_STYLES.interactive.headerButton,
                    { opacity: isSubmitting || !inputText.trim() ? 0.6 : 1 }
                  ]}
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
              }
            />
          )
        }}
      />
      <ModalInputText route={{ params: routeParams }} />
    </>
  )
}
