import { Ionicons } from '@expo/vector-icons'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { TouchableOpacity } from 'react-native'
import ModalInputText from '../../../src/screens/ModalInputText'
import * as reducer from '../../../src/components/Photo/reducer'
import { useRef, useState } from 'react'

export default function ModalInputScreen() {
  const params = useLocalSearchParams()
  const router = useRouter()
  const { photo, uuid, topOffset } = params
  const [inputText, setInputText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
                padding: 12,
                borderRadius: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                marginHorizontal: 8,
              }}
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting || !inputText.trim()}
              style={{
                padding: 12,
                borderRadius: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                marginHorizontal: 8,
                opacity: isSubmitting || !inputText.trim() ? 0.5 : 1,
              }}
            >
              <Ionicons 
                name={isSubmitting ? "hourglass-outline" : "send"} 
                size={24} 
                color="#fff" 
              />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          },
          headerTitleStyle: {
            fontSize: 16,
            fontWeight: '600',
            color: '#fff',
          },
          headerTintColor: '#fff',
          headerTransparent: true,
        }}
      />
      <ModalInputText route={{ params: routeParams }} />
    </>
  )
}
