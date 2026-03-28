import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

const LocationDriftBanner = ({ theme, onPress }) => {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <View
        style={{
          backgroundColor: theme.CARD_BACKGROUND,
          borderRadius: 12,
          padding: 16,
          marginHorizontal: 16,
          marginVertical: 8,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: theme.CARD_BORDER,
          shadowColor: theme.CARD_SHADOW,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 3
        }}
      >
        <MaterialIcons
          name='my-location'
          size={24}
          color={theme.INTERACTIVE_PRIMARY}
          style={{ marginRight: 12 }}
        />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: theme.TEXT_PRIMARY
            }}
          >
            Your location has updated. Tap to refresh for nearby photos.
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default React.memo(LocationDriftBanner)
