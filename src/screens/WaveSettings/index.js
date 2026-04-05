import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform
} from 'react-native'
import { useAtom } from 'jotai'
import Toast from 'react-native-toast-message'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'

import * as STATE from '../../state'
import * as CONST from '../../consts'
import { getTheme } from '../../theme/sharedStyles'
import { updateWave } from '../Waves/reducer'

const WaveSettings = ({ waveUuid, waveName }) => {
  const [uuid] = useAtom(STATE.uuid)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const theme = getTheme(isDarkMode)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Settings state
  const [isOpen, setIsOpen] = useState(false)
  const [isFrozen, setIsFrozen] = useState(false)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)

  // Date picker visibility
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)

  // Load current settings via a no-change update call
  const loadSettings = useCallback(async () => {
    setLoading(true)
    try {
      const wave = await updateWave({ waveUuid, uuid, name: waveName })
      setIsOpen(wave.open === true)
      setIsFrozen(wave.frozen === true || wave.isFrozen === true)
      setStartDate(wave.startDate ? new Date(wave.startDate) : null)
      setEndDate(wave.endDate ? new Date(wave.endDate) : null)
    } catch (error) {
      console.error(error)
      Toast.show({ type: 'error', text1: 'Error loading settings', text2: error.message })
    } finally {
      setLoading(false)
    }
  }, [waveUuid, uuid, waveName])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleToggleOpen = async (value) => {
    setSaving(true)
    try {
      await updateWave({ waveUuid, uuid, open: value })
      setIsOpen(value)
      Toast.show({ type: 'success', text1: value ? 'Wave is now open' : 'Wave is now invite-only' })
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error updating setting', text2: error.message })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleFrozen = async (value) => {
    if (value) {
      Alert.alert(
        'Freeze Wave?',
        'Freezing prevents all new photos, edits, and deletions (except by the owner). Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Freeze',
            onPress: async () => {
              setSaving(true)
              try {
                await updateWave({ waveUuid, uuid, frozen: true })
                setIsFrozen(true)
                Toast.show({ type: 'success', text1: 'Wave frozen' })
              } catch (error) {
                Toast.show({ type: 'error', text1: 'Error freezing wave', text2: error.message })
              } finally {
                setSaving(false)
              }
            }
          }
        ]
      )
    } else {
      setSaving(true)
      try {
        await updateWave({ waveUuid, uuid, frozen: false })
        setIsFrozen(false)
        Toast.show({ type: 'success', text1: 'Wave unfrozen' })
      } catch (error) {
        Toast.show({ type: 'error', text1: 'Error unfreezing wave', text2: error.message })
      } finally {
        setSaving(false)
      }
    }
  }

  const handleStartDateChange = async (_event, selectedDate) => {
    setShowStartPicker(Platform.OS === 'ios')
    if (selectedDate) {
      setSaving(true)
      try {
        await updateWave({ waveUuid, uuid, startDate: selectedDate.toISOString() })
        setStartDate(selectedDate)
        Toast.show({ type: 'success', text1: 'Start date updated' })
      } catch (error) {
        Toast.show({ type: 'error', text1: 'Error updating start date', text2: error.message })
      } finally {
        setSaving(false)
      }
    }
  }

  const handleEndDateChange = async (_event, selectedDate) => {
    setShowEndPicker(Platform.OS === 'ios')
    if (selectedDate) {
      setSaving(true)
      try {
        await updateWave({ waveUuid, uuid, endDate: selectedDate.toISOString() })
        setEndDate(selectedDate)
        Toast.show({ type: 'success', text1: 'End date updated' })
      } catch (error) {
        Toast.show({ type: 'error', text1: 'Error updating end date', text2: error.message })
      } finally {
        setSaving(false)
      }
    }
  }

  const clearStartDate = async () => {
    setSaving(true)
    try {
      await updateWave({ waveUuid, uuid, startDate: null })
      setStartDate(null)
      Toast.show({ type: 'success', text1: 'Start date cleared' })
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error clearing start date', text2: error.message })
    } finally {
      setSaving(false)
    }
  }

  const clearEndDate = async () => {
    setSaving(true)
    try {
      await updateWave({ waveUuid, uuid, endDate: null })
      setEndDate(null)
      Toast.show({ type: 'success', text1: 'End date cleared' })
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error clearing end date', text2: error.message })
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return 'Not set'
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.INTERACTIVE_BACKGROUND, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size='large' color={CONST.MAIN_COLOR} />
      </View>
    )
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.INTERACTIVE_BACKGROUND }]}>
      {isFrozen && (
        <View style={styles.frozenNotice}>
          <MaterialCommunityIcons name='snowflake' size={16} color='#60A5FA' />
          <Text style={styles.frozenNoticeText}>
            Wave is frozen. Only the freeze toggle can be changed.
          </Text>
        </View>
      )}

      {/* Open / Invite-Only Toggle */}
      <View style={[styles.section, { backgroundColor: theme.CARD_BACKGROUND }]}>
        <View style={styles.row}>
          <View style={styles.rowLabel}>
            <MaterialCommunityIcons name='lock-open-variant-outline' size={20} color={theme.TEXT_PRIMARY} />
            <View style={styles.labelText}>
              <Text style={[styles.settingTitle, { color: theme.TEXT_PRIMARY }]}>Open Wave</Text>
              <Text style={[styles.settingDescription, { color: theme.TEXT_SECONDARY }]}>
                Anyone with the link can join without an invite
              </Text>
            </View>
          </View>
          <Switch
            value={isOpen}
            onValueChange={handleToggleOpen}
            disabled={saving || isFrozen}
            trackColor={{ false: theme.INTERACTIVE_BORDER, true: CONST.MAIN_COLOR }}
          />
        </View>
      </View>

      {/* Freeze Toggle */}
      <View style={[styles.section, { backgroundColor: theme.CARD_BACKGROUND }]}>
        <View style={styles.row}>
          <View style={styles.rowLabel}>
            <MaterialCommunityIcons name='snowflake' size={20} color={theme.TEXT_PRIMARY} />
            <View style={styles.labelText}>
              <Text style={[styles.settingTitle, { color: theme.TEXT_PRIMARY }]}>Freeze Wave</Text>
              <Text style={[styles.settingDescription, { color: theme.TEXT_SECONDARY }]}>
                Prevent all new photos, edits, and deletions (except by owner)
              </Text>
            </View>
          </View>
          <Switch
            value={isFrozen}
            onValueChange={handleToggleFrozen}
            disabled={saving}
            trackColor={{ false: theme.INTERACTIVE_BORDER, true: '#60A5FA' }}
          />
        </View>
      </View>

      {/* Start Date */}
      <View style={[styles.section, { backgroundColor: theme.CARD_BACKGROUND }]}>
        <View style={styles.row}>
          <View style={styles.rowLabel}>
            <MaterialCommunityIcons name='calendar-start' size={20} color={theme.TEXT_PRIMARY} />
            <View style={styles.labelText}>
              <Text style={[styles.settingTitle, { color: theme.TEXT_PRIMARY }]}>Start Date</Text>
              <Text style={[styles.settingDescription, { color: theme.TEXT_SECONDARY }]}>
                Wave becomes active on this date
              </Text>
            </View>
          </View>
          <View style={styles.dateActions}>
            <TouchableOpacity
              onPress={() => setShowStartPicker(true)}
              disabled={saving || isFrozen}
              style={[styles.dateButton, { backgroundColor: theme.INTERACTIVE_BACKGROUND, borderColor: theme.INTERACTIVE_BORDER }]}
            >
              <Text style={[styles.dateText, { color: theme.TEXT_PRIMARY }]}>{formatDate(startDate)}</Text>
            </TouchableOpacity>
            {startDate && (
              <TouchableOpacity onPress={clearStartDate} disabled={saving || isFrozen} style={styles.clearButton}>
                <MaterialCommunityIcons name='close-circle' size={20} color={theme.TEXT_SECONDARY} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {showStartPicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode='date'
            display='default'
            onChange={handleStartDateChange}
          />
        )}
      </View>

      {/* End Date */}
      <View style={[styles.section, { backgroundColor: theme.CARD_BACKGROUND }]}>
        <View style={styles.row}>
          <View style={styles.rowLabel}>
            <MaterialCommunityIcons name='calendar-end' size={20} color={theme.TEXT_PRIMARY} />
            <View style={styles.labelText}>
              <Text style={[styles.settingTitle, { color: theme.TEXT_PRIMARY }]}>End Date</Text>
              <Text style={[styles.settingDescription, { color: theme.TEXT_SECONDARY }]}>
                Wave auto-freezes after this date
              </Text>
            </View>
          </View>
          <View style={styles.dateActions}>
            <TouchableOpacity
              onPress={() => setShowEndPicker(true)}
              disabled={saving || isFrozen}
              style={[styles.dateButton, { backgroundColor: theme.INTERACTIVE_BACKGROUND, borderColor: theme.INTERACTIVE_BORDER }]}
            >
              <Text style={[styles.dateText, { color: theme.TEXT_PRIMARY }]}>{formatDate(endDate)}</Text>
            </TouchableOpacity>
            {endDate && (
              <TouchableOpacity onPress={clearEndDate} disabled={saving || isFrozen} style={styles.clearButton}>
                <MaterialCommunityIcons name='close-circle' size={20} color={theme.TEXT_SECONDARY} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {showEndPicker && (
          <DateTimePicker
            value={endDate || new Date()}
            mode='date'
            display='default'
            onChange={handleEndDateChange}
          />
        )}
      </View>

      {saving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size='small' color={CONST.MAIN_COLOR} />
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  frozenNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8
  },
  frozenNoticeText: {
    flex: 1,
    fontSize: 13,
    color: '#60A5FA',
    fontWeight: '500'
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  rowLabel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 12
  },
  labelText: {
    flex: 1
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600'
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2
  },
  dateActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  dateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500'
  },
  clearButton: {
    padding: 4
  },
  savingOverlay: {
    position: 'absolute',
    top: 8,
    right: 16
  }
})

export default WaveSettings
