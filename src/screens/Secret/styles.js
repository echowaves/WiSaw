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
    creationHeader: {
      backgroundColor: theme.CARD_BACKGROUND,
      borderRadius: 24,
      padding: 32,
      alignItems: 'center',
      marginBottom: 24,
      shadowColor: theme.CARD_SHADOW,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: 8,
      borderWidth: 1,
      borderColor: theme.BORDER_LIGHT
    },
    creationIconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: 'rgba(234, 94, 61, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20
    },
    creationTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.TEXT_PRIMARY,
      textAlign: 'center',
      marginBottom: 12,
      lineHeight: 28
    },
    creationSubtitle: {
      fontSize: 16,
      color: theme.TEXT_SECONDARY,
      textAlign: 'center',
      lineHeight: 22
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
    actionsContainer: {
      marginBottom: 24
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
