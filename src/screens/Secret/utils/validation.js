export const maxNickNameLength = 100
export const minNickNameLength = 5

export const validateNickname = (nickName) => {
  const errors = []

  if (!/^[\u00BF-\u1FFF\u2C00-\uD7FF\w_-]{5,100}$/.test(nickName.toLowerCase())) {
    errors.push('Nickname wrong format.')
  }
  if (nickName?.length < minNickNameLength) {
    errors.push('Nickname too short.')
  }
  if (nickName?.length > maxNickNameLength) {
    errors.push('Nickname too long.')
  }

  return errors.length > 0 ? errors[0] : null
}

export const validateSecret = (secret, strength) => {
  const errors = []

  if (secret.length === 0) {
    return null
  }

  if (secret?.length < minNickNameLength) {
    errors.push('Secret too short.')
  }
  if (secret?.length > maxNickNameLength) {
    errors.push('Secret too long.')
  }
  if (strength < 3) {
    errors.push('Secret is not secure.')
  }

  return errors.length > 0 ? errors[0] : null
}

export const validateSecretConfirm = (secret, secretConfirm) => {
  if (secret !== secretConfirm) {
    return 'Secret does not match Secret Confirm.'
  }
  return null
}

export const validateAllFields = (nickName, secret, secretConfirm, strength) => {
  const errors = new Map()

  const nickNameError = validateNickname(nickName)
  if (nickNameError) {
    errors.set('nickName', nickNameError)
  }

  if (secret.length === 0) {
    return errors
  }

  const secretError = validateSecret(secret, strength)
  if (secretError) {
    errors.set('secret', secretError)
  }

  const secretConfirmError = validateSecretConfirm(secret, secretConfirm)
  if (secretConfirmError) {
    errors.set('secretConfirm', secretConfirmError)
  }

  if (strength < 3) {
    errors.set('strength', 'Secret is not secure.')
  }

  return errors
}
