import FontAwesome5 from '@react-native-vector-icons/fontawesome5'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import Input from '../../../components/ui/Input'
import * as CONST from '../../../consts'
import { fa5IconStyle } from '../../../utils/fa5IconStyle'

const SecretInputField = ({
  placeholder,
  value,
  onChangeText,
  showPassword,
  setShowPassword,
  theme,
  errorMessage,
  leftIconName = 'shield-alt'
}) => {
  const styles = StyleSheet.create({
    inputContainer: {
      marginBottom: 16
    },
    passwordToggle: {
      padding: 8
    }
  })

  return (
    <View style={styles.inputContainer}>
      <Input
        placeholder={placeholder}
        autoCorrect={false}
        autoCapitalize='none'
        autoComplete='off'
        spellCheck={false}
        textContentType='none'
        passwordRules=''
        keyboardType='default'
        inputProps={{
          'data-form-type': 'other',
          'data-lpignore': 'true'
        }}
        secureTextEntry={!showPassword}
        leftIcon={<FontAwesome5 name={leftIconName} iconStyle={fa5IconStyle(leftIconName)} size={20} color={CONST.MAIN_COLOR} />}
        rightIcon={
          <FontAwesome5
            name={showPassword ? 'eye-slash' : 'eye'}
            iconStyle='regular'
            size={20}
            color={theme.TEXT_SECONDARY}
            onPress={() => setShowPassword(!showPassword)}
            style={styles.passwordToggle}
          />
        }
        value={value}
        onChangeText={onChangeText}
        errorStyle={{ color: '#FF6B6B' }}
        errorMessage={errorMessage}
        inputStyle={{ fontSize: 16 }}
        containerStyle={{ paddingHorizontal: 0 }}
      />
    </View>
  )
}

export default SecretInputField
