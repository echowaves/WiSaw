import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
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
import { getWave, updateWave } from '../Waves/reducer'

const WaveSettings = ({ waveUuid, waveName }) => {
  const [uuid] = useAtom(STATE.uuid)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const theme = getTheme(isDarkMode)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Settings state
  const [isOpen, setIsOpen] = useState(false)
  const [isFrozen, setIsFrozen] = useState(false)
  const [splashDate, setSplashDate] = useState(null)
  const [freezeDate, setFreezeDate] = useState(null)

  // Load current settings via getWave query
  const loadSettings = useCallback(async () => {
    setLoading(true)
    try {
      const wave = await getWave({ waveUuid, uuid })
      setIsOpen(wave.open === true)
      setIsFrozen(wave.isFrozen === true)
      setSplashDate(wave.splashDate ? new Date(wave.splashDate) : null)
      setFreezeDate(wave.freezeDate ? new Date(wave.freezeDate) : null)
    } catch (error) {
      console.error(error)
      Toast.show({ type: 'error', text1: 'Error loading settings', text2: error.message })
    } finally {
      setLoading(false)
    }
  }, [waveUuid, uuid])

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

  const handleSplashDateChange = async (_event, selectedDate) => {
    if (selectedDate) {
      setSaving(true)
      try {
        await updateWave({ waveUuid, uuid, splashDate: selectedDate.toISOString() })
        setSplashDate(selectedDate)
        Toast.show({ type: 'success', text1: 'Splash date updated' })
      } catch (error) {
        Toast.show({ type: 'error', text1: 'Error updating splash date', text2: error.message })
      } finally {
        setSaving(false)
      }
    }
  }

  const handleFreezeDateChange = async (_event, selectedDate) => {
    if (selectedDate) {
      setSaving(true)
      try {
        const result = await updateWave({ waveUuid, uuid, freezeDate: selectedDate.toISOString() })
        setFreezeDate(selectedDate)
        setIsFrozen(result.isFrozen === true)
        Toast.show({ type: 'success', text1: 'Freeze date updated' })
      } catch (error) {
        Toast.show({ type: 'error', text1: 'Error updating freeze date', text2: error.message })
      } finally {
        setSaving(false)
      }
    }
  }

  const clearSplashDate = async () => {
    setSaving(true)
    try {
      await updateWave({ waveUuid, uuid, splashDate: null })
      setSplashDate(null)
      Toast.show({ type: 'success', text1: 'Splash date cleared' })
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error clearing splash date', text2: error.message })
    } finally {
      setSaving(false)
    }
  }

  const clearFreezeDate = async () => {
    setSaving(true)
    try {
      const result = await updateWave({ waveUuid, uuid, freezeDate: null })
      setFreezeDate(null)
      setIsFrozen(result.isFrozen === true)
      Toast.show({ type: 'success', text1: 'Freeze date cleared' })
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error clearing freeze date', text2: error.message })
    } finally {
      setSaving(false)
    }
  }

  const handleSetSplashDate = async () => {
    const today = new Date()
    setSaving(true)
    try {
      await updateWave({ waveUuid, uuid, splashDate: today.toISOString() })
      setSplashDate(today)
      Toast.show({ type: 'success', text1: 'Splash date set' })
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error setting splash date', text2: error.message })
    } finally {
      setSaving(false)
    }
  }

  const handleSetFreezeDate = async () => {
    const today = new Date()
    setSaving(true)
    try {
      const result = await updateWave({ waveUuid, uuid, freezeDate: today.toISOString() })
      setFreezeDate(today)
      setIsFrozen(result.isFrozen === true)
      Toast.show({ type: 'success', text1: 'Freeze date set' })
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error setting freeze date', text2: error.message })
    } finally {
      setSaving(false)
    }
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
            Wave is frozen. Set a future freeze date to unfreeze.
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

      {/* Splash Date */}
      <View style={[styles.section, { backgroundColor: theme.CARD_BACKGROUND }]}>
        <View style={styles.row}>
          <View style={styles.rowLabel}>
            <MaterialCommunityIcons name='calendar-start' size={20} color={theme.TEXT_PRIMARY} />
            <View style={styles.labelText}>
              <Text style={[styles.settingTitle, { color: theme.TEXT_PRIMARY }]}>Splash Date</Text>
              <Text style={[styles.settingDescription, { color: theme.TEXT_SECONDARY }]}>
                Wave goes live on this date
              </Text>
            </View>
          </View>
          <View style={styles.dateActions}>
            {splashDate
              ? (
                <>
                  <DateTimePicker
                    value={splashDate}
                    mode='date'
                    display={Platform.OS === 'ios' ? 'compact' : 'default'}
                    onChange={handleSplashDateChange}
                    disabled={saving || isFrozen}
                  />
                  <TouchableOpacity onPress={clearSplashDate} disabled={saving || isFrozen} style={styles.clearButton}>
                    <MaterialCommunityIcons name='close-circle' size={20} color={theme.TEXT_SECONDARY} />
                  </TouchableOpacity>
                </>
                )
              : (
                <TouchableOpacity
                  onPress={handleSetSplashDate}
                  disabled={saving || isFrozen}
                  style={[styles.setDateButton, { backgroundColor: theme.INTERACTIVE_BACKGROUND, borderColor: theme.INTERACTIVE_BORDER }]}
                >
                  <Text style={[styles.setDateText, { color: CONST.MAIN_COLOR }]}>Set Date</Text>
                </TouchableOpacity>
                )}
          </View>
        </View>
      </View>

      {/* Freeze Date */}
      <View style={[styles.section, { backgroundColor: theme.CARD_BACKGROUND }]}>
        <View style={styles.row}>
          <View style={styles.rowLabel}>
            <MaterialCommunityIcons name='calendar-end' size={20} color={theme.TEXT_PRIMARY} />
            <View style={styles.labelText}>
              <Text style={[styles.settingTitle, { color: theme.TEXT_PRIMARY }]}>Freeze Date</Text>
              <Text style={[styles.settingDescription, { color: theme.TEXT_SECONDARY }]}>
                Wave auto-freezes after this date
              </Text>
            </View>
          </View>
          <View style={styles.dateActions}>
            {freezeDate
              ? (
                <>
                  <DateTimePicker
                    value={freezeDate}
                    mode='date'
                    display={Platform.OS === 'ios' ? 'compact' : 'default'}
                    onChange={handleFreezeDateChange}
                    disabled={saving}
                  />
                  <TouchableOpacity onPress={clearFreezeDate} disabled={saving} style={styles.clearButton}>
                    <MaterialCommunityIcons name='close-circle' size={20} color={theme.TEXT_SECONDARY} />
                  </TouchableOpacity>
                </>
                )
              : (
                <TouchableOpacity
                  onPress={handleSetFreezeDate}
                  disabled={saving}
                  style={[styles.setDateButton, { backgroundColor: theme.INTERACTIVE_BACKGROUND, borderColor: theme.INTERACTIVE_BORDER }]}
                >
                  <Text style={[styles.setDateText, { color: CONST.MAIN_COLOR }]}>Set Date</Text>
                </TouchableOpacity>
                )}
          </View>
        </View>
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
  setDateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1
  },
  setDateText: {
    fontSize: 13,
    fontWeight: '600'
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
