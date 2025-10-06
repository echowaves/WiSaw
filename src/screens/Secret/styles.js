import { StyleSheet } from 'react-native'
import * as CONST from '../../consts'

export const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.BACKGROUND
    },
    scrollView: {
      flex: 1
    },
    contentContainer: {
      padding: 20,
      paddingTop: 30,
      paddingBottom: 100
    },
    formCard: {
      backgroundColor: theme.CARD_BACKGROUND,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      shadowColor: theme.CARD_SHADOW,
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: theme.BORDER_LIGHT
    },
    submitButton: {
      backgroundColor: CONST.MAIN_COLOR,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 24,
      marginVertical: 20,
      shadowColor: CONST.MAIN_COLOR,
      shadowOffset: {
        width: 0,
        height: 4
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8
    },
    submitButtonDisabled: {
      backgroundColor: theme.BACKGROUND_DISABLED,
      shadowOpacity: 0,
      elevation: 0
    },
    submitButtonTitle: {
      color: 'white',
      fontSize: 18,
      fontWeight: '600'
    }
  })
