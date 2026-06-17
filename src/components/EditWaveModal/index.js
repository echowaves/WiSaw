import React, { useState, useEffect } from 'react'
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'

/**
 * Generic modal for creating or editing a wave.
 *
 * Props:
 * - title: Modal title (e.g., "Create New Wave", "Edit Wave")
 * - visible: Whether modal is shown
 * - initialName: Initial wave name value
 * - initialDescription: Initial wave description value
 * - onCancel: Called when cancel button pressed or modal dismissed
 * - onSave: Called with { name, description } when save button pressed
 * - saving: Whether a save operation is in progress
 * - saveLabel: Button label (default: "Save", use "Create" for creation)
 * - theme: Theme object from useTheme or getTheme
 */
const EditWaveModal = ({
  title,
  visible,
  initialName = '',
  initialDescription = '',
  onCancel,
  onSave,
  saving = false,
  saveLabel = 'Save',
  theme = {}
}) => {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)

  // Reset local state when modal opens with new initial values
  useEffect(() => {
    if (visible) {
      setName(initialName)
      setDescription(initialDescription)
    }
  }, [visible, initialName, initialDescription])

  const handleCancel = () => {
    onCancel?.()
  }

  const handleSave = () => {
    onSave?.({ name, description })
  }

  return (
    <Modal
      animationType='slide'
      transparent
      visible={visible}
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView style={styles.modalOverlay} behavior='padding'>
        <View style={[styles.modalContent, { backgroundColor: theme.CARD_BACKGROUND || '#FFF' }]}>
          <Text style={[styles.modalTitle, { color: theme.TEXT_PRIMARY || '#000' }]}>{title}</Text>
          <TextInput
            style={[styles.input, { color: theme.TEXT_PRIMARY || '#000', borderColor: theme.INTERACTIVE_BORDER || '#CCC' }]}
            placeholder='Wave Name'
            placeholderTextColor={theme.TEXT_SECONDARY || '#999'}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[styles.input, styles.textArea, { color: theme.TEXT_PRIMARY || '#000', borderColor: theme.INTERACTIVE_BORDER || '#CCC' }]}
            placeholder='Description (optional)'
            placeholderTextColor={theme.TEXT_SECONDARY || '#999'}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.INTERACTIVE_BACKGROUND || '#F0F0F0' }]}
              onPress={handleCancel}
            >
              <Text style={[styles.buttonText, { color: theme.TEXT_PRIMARY || '#000' }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.INTERACTIVE_BACKGROUND || '#F0F0F0' }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color='#FFF' />
                : <Text style={[styles.buttonText, { color: theme.TEXT_PRIMARY || '#000' }]}>{saveLabel}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    width: '85%',
    borderRadius: 20,
    padding: 24
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 16
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16
  }
})

export default EditWaveModal
