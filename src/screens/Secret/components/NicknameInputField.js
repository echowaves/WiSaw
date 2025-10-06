import { FontAwesome5 } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import Input from '../../../components/ui/Input'
import * as CONST from '../../../consts'

const NicknameInputField = ({ value, onChangeText, disabled, theme, errorMessage }) => {
  const styles = StyleSheet.create({
    inputContainer: {
      marginBottom: 16
    }
  })

  return (
    <View style={styles.inputContainer}>
      <Input
        placeholder="Choose a nickname"
        autoCorrect={false}
        autoCapitalize="none"
        autoComplete="off"
        spellCheck={false}
        textContentType="none"
        disabled={disabled}
        leftIcon={
          <FontAwesome5
            name="user"
            size={20}
            color={disabled ? theme.TEXT_DISABLED : CONST.MAIN_COLOR}
          />
        }
        value={value}
        onChangeText={(text) => onChangeText(text.toLowerCase())}
        errorStyle={{ color: '#FF6B6B' }}
        errorMessage={errorMessage}
        inputStyle={{
          fontSize: 16,
          color: disabled ? theme.TEXT_DISABLED : theme.TEXT_PRIMARY
        }}
        containerStyle={{ paddingHorizontal: 0 }}
      />
    </View>
  )
}

export default NicknameInputField
