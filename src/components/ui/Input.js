import { forwardRef } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'

const styles = StyleSheet.create({
  container: {
    width: '100%'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#1C1C1E'
  },
  iconLeft: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconRight: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  disabled: {
    opacity: 0.6
  },
  errorText: {
    marginTop: 6,
    color: '#FF3B30',
    fontSize: 12
  }
})

const flatten = (stylesParam) => {
  if (!stylesParam) return []
  return Array.isArray(stylesParam) ? stylesParam : [stylesParam]
}

const Input = forwardRef(
  (
    {
      containerStyle,
      inputContainerStyle,
      inputStyle,
      leftIcon,
      rightIcon,
      errorMessage,
      errorStyle,
      disabled = false,
      inputProps = {},
      style,
      ...rest
    },
    ref
  ) => (
    <View style={[styles.container, ...flatten(containerStyle)]}>
      <View
        style={[
          styles.inputContainer,
          ...flatten(inputContainerStyle),
          disabled && styles.disabled
        ]}
      >
        {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
        <TextInput
          ref={ref}
          style={[styles.input, ...flatten(inputStyle), style]}
          editable={!disabled}
          placeholderTextColor='rgba(60,60,67,0.6)'
          {...rest}
          {...inputProps}
        />
        {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
      </View>
      {!!errorMessage && (
        <Text style={[styles.errorText, ...flatten(errorStyle)]}>{errorMessage}</Text>
      )}
    </View>
  )
)

Input.displayName = 'Input'

export default Input
