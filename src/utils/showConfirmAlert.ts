import { Alert, AlertButton } from 'react-native'

export interface ConfirmAlertOptions {
  /** Cancel button text (default: 'Cancel') */
  cancelText?: string
  /** Destructive button text (default: 'Delete') */
  destructiveText?: string
  /** Custom button configuration */
  buttons?: AlertButton[]
}

/**
 * Standardized confirmation dialog utility.
 * Replaces Alert.alert() calls with a consistent Cancel + destructive button pattern.
 *
 * Usage:
 *   // Basic confirmation (Cancel + Delete)
 *   showConfirmAlert('Delete Wave', 'Are you sure?')
 *
 *   // With custom callback
 *   showConfirmAlert('Delete Wave', 'Are you sure?', async () => { await deleteWave() })
 *
 *   // Custom button labels
 *   showConfirmAlert('Merge Waves', 'Proceed?', handleMerge, { cancelText: 'Never mind', destructiveText: 'Merge' })
 *
 *   // Non-confirmation alert (title + message only, with OK button)
 *   showConfirmAlert('Not Found', 'Could not find that address.')
 *
 *   // Custom buttons (full control)
 *   showConfirmAlert('Share', '', undefined, {
 *     buttons: [
 *       { text: 'Copy Link', onPress: copyLink },
 *       { text: 'Cancel', style: 'cancel' }
 *     ]
 *   })
 */
export default function showConfirmAlert (
  title: string,
  message: string,
  onConfirm?: () => void | Promise<void>,
  options?: ConfirmAlertOptions
): void {
  const defaultButtons: AlertButton[] = [
    { text: 'Cancel', style: 'cancel' }
  ]

  if (onConfirm) {
    defaultButtons.push({
      text: options?.destructiveText ?? 'Delete',
      style: 'destructive',
      onPress: () => {
        if (typeof onConfirm === 'function') {
          onConfirm()
        }
      }
    })
  }

  Alert.alert(
    title,
    message,
    options?.buttons ?? defaultButtons
  )
}
