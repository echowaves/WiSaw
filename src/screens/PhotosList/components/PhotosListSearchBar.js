import React, { useRef } from 'react'
import {
  View,
  TouchableOpacity,
  TextInput,
  Animated
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const FOOTER_HEIGHT = 90
const FOOTER_GAP = 4
const KEYBOARD_GAP = 16

const PhotosListSearchBar = ({
  theme,
  searchTerm,
  setSearchTerm,
  onSubmitSearch,
  keyboardVisible,
  keyboardOffset,
  autoFocus
}) => {
  const searchBarRef = useRef(null)

  // When keyboard is visible, position above keyboard with gap
  // When keyboard is hidden, position above footer
  const bottomOffset = keyboardOffset > 0
    ? keyboardOffset + KEYBOARD_GAP
    : FOOTER_HEIGHT + FOOTER_GAP

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: bottomOffset,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.HEADER_BACKGROUND,
        borderRadius: 24,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: theme.BORDER_LIGHT,
        shadowColor: theme.HEADER_SHADOW,
        shadowOffset: {
          width: 0,
          height: 6
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 20,
        zIndex: 20
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.CARD_BACKGROUND,
          borderRadius: 20,
          paddingHorizontal: 16,
          marginRight: 12,
          borderWidth: 1,
          borderColor: theme.CARD_BORDER,
          shadowColor: theme.CARD_SHADOW,
          shadowOffset: {
            width: 0,
            height: 1
          },
          shadowOpacity: 0.15,
          shadowRadius: 2,
          elevation: 4
        }}
      >
        <Ionicons
          name='search'
          size={20}
          color={theme.TEXT_SECONDARY}
          style={{ marginRight: 8 }}
        />
        <TextInput
          ref={searchBarRef}
          placeholder='Search photos...'
          placeholderTextColor={theme.TEXT_SECONDARY}
          onChangeText={setSearchTerm}
          value={searchTerm}
          onSubmitEditing={onSubmitSearch}
          autoFocus={autoFocus}
          returnKeyType='search'
          style={{
            flex: 1,
            color: theme.TEXT_PRIMARY,
            fontSize: 16,
            fontWeight: '400',
            height: 40,
            paddingHorizontal: 0,
            marginLeft: 0,
            paddingRight: searchTerm ? 30 : 0
          }}
        />
        {searchTerm && (
          <TouchableOpacity
            onPress={() => {
              setSearchTerm('')
              if (searchBarRef.current) {
                searchBarRef.current.clear()
                searchBarRef.current.focus()
              }
            }}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: [{ translateY: -10 }],
              width: 20,
              height: 20,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: theme.INTERACTIVE_SECONDARY,
              borderRadius: 10,
              elevation: 6,
              zIndex: 6
            }}
          >
            <Ionicons name='close' size={12} color={theme.TEXT_PRIMARY} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        onPress={onSubmitSearch}
        style={{
          backgroundColor: theme.INTERACTIVE_PRIMARY,
          borderRadius: 22,
          width: 48,
          height: 48,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: theme.INTERACTIVE_PRIMARY,
          shadowOffset: {
            width: 0,
            height: 4
          },
          shadowOpacity: 0.35,
          shadowRadius: 6,
          elevation: 12,
          zIndex: 22
        }}
      >
        <Ionicons name='send' size={20} color='white' />
      </TouchableOpacity>
    </Animated.View>
  )
}

export default PhotosListSearchBar
