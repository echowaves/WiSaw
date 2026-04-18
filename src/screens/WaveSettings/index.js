import React, { useEffect, useState, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  TextInput,
  Alert
} from 'react-native'
import { useAtom, useAtomValue } from 'jotai'
import Toast from 'react-native-toast-message'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import Slider from '@react-native-community/slider'
import * as Location from 'expo-location'

import * as STATE from '../../state'
import * as CONST from '../../consts'
import { getTheme } from '../../theme/sharedStyles'
import { getWave, updateWave } from '../Waves/reducer'

const MILES_TO_METERS = 1609
const DEFAULT_RADIUS_MILES = 10

const WaveSettings = ({ waveUuid, waveName }) => {
  const [uuid] = useAtom(STATE.uuid)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const theme = getTheme(isDarkMode)
  const locationState = useAtomValue(STATE.locationAtom)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Settings state
  const [isOpen, setIsOpen] = useState(false)
  const [isFrozen, setIsFrozen] = useState(false)
  const [freezeMode, setFreezeMode] = useState('AUTO')
  const [splashDate, setSplashDate] = useState(null)
  const [freezeDate, setFreezeDate] = useState(null)

  // Location state
  const [lat, setLat] = useState(null)
  const [lon, setLon] = useState(null)
  const [locationText, setLocationText] = useState('')
  const [radiusMiles, setRadiusMiles] = useState(DEFAULT_RADIUS_MILES)
  const [addressInput, setAddressInput] = useState('')

  // Compute date-frozen: matches backend logic for gating editable settings
  const isDateFrozen = useMemo(() => {
    const now = new Date()
    if (splashDate && now < splashDate) return true
    if (freezeDate && now > freezeDate) return true
    return false
  }, [splashDate, freezeDate])

  // Load current settings via getWave query
  const loadSettings = useCallback(async () => {
    setLoading(true)
    try {
      const wave = await getWave({ waveUuid, uuid })
      setIsOpen(wave.open === true)
      setIsFrozen(wave.isFrozen === true)
      setFreezeMode(wave.freezeMode || 'AUTO')
      setSplashDate(wave.splashDate ? new Date(wave.splashDate) : null)
      setFreezeDate(wave.freezeDate ? new Date(wave.freezeDate) : null)

      // Load location/radius
      if (wave.location) {
        try {
          const loc = JSON.parse(wave.location)
          setLat(loc.lat)
          setLon(loc.lon)
          const results = await Location.reverseGeocodeAsync({ latitude: loc.lat, longitude: loc.lon })
          if (results && results.length > 0) {
            const addr = results[0]
            setLocationText([addr.city, addr.region, addr.country].filter(Boolean).join(', '))
          } else {
            setLocationText(`${loc.lat.toFixed(2)}, ${loc.lon.toFixed(2)}`)
          }
        } catch {
          setLocationText('Location set')
        }
      }
      if (wave.radius) {
        setRadiusMiles(Math.round(wave.radius / MILES_TO_METERS))
      }
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

  const handleFreezeModeChange = async (mode) => {
    if (mode === freezeMode) return
    setSaving(true)
    try {
      const result = await updateWave({ waveUuid, uuid, freezeMode: mode })
      setFreezeMode(mode)
      setIsFrozen(result.isFrozen === true)
      Toast.show({ type: 'success', text1: `Freeze mode set to ${mode === 'AUTO' ? 'Auto' : mode === 'FROZEN' ? 'Frozen' : 'Unlocked'}` })
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error updating freeze mode', text2: error.message })
    } finally {
      setSaving(false)
    }
  }

  const handleUseMyLocation = async () => {
    if (locationState.status !== 'ready' || !locationState.coords) {
      Alert.alert('Location Unavailable', 'Your device location is not available. Please enable location services.')
      return
    }
    const { latitude, longitude } = locationState.coords
    setSaving(true)
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude })
      const text = results && results.length > 0
        ? [results[0].city, results[0].region, results[0].country].filter(Boolean).join(', ')
        : `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`
      setLat(latitude)
      setLon(longitude)
      setLocationText(text)
      await updateWave({ waveUuid, uuid, lat: latitude, lon: longitude, radius: radiusMiles * MILES_TO_METERS })
      Toast.show({ type: 'success', text1: 'Location updated' })
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error setting location', text2: error.message })
    } finally {
      setSaving(false)
    }
  }

  const handleAddressSubmit = async () => {
    const trimmed = addressInput.trim()
    if (!trimmed) return
    setSaving(true)
    try {
      const results = await Location.geocodeAsync(trimmed)
      if (!results || results.length === 0) {
        Alert.alert('Not Found', 'Could not find that address. Try a different city or address.')
        setSaving(false)
        return
      }
      const { latitude, longitude } = results[0]
      const reverseResults = await Location.reverseGeocodeAsync({ latitude, longitude })
      const text = reverseResults && reverseResults.length > 0
        ? [reverseResults[0].city, reverseResults[0].region, reverseResults[0].country].filter(Boolean).join(', ')
        : `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`
      setLat(latitude)
      setLon(longitude)
      setLocationText(text)
      setAddressInput('')
      await updateWave({ waveUuid, uuid, lat: latitude, lon: longitude, radius: radiusMiles * MILES_TO_METERS })
      Toast.show({ type: 'success', text1: 'Location updated' })
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error geocoding address', text2: error.message })
    } finally {
      setSaving(false)
    }
  }

  const handleRadiusChange = async (value) => {
    setRadiusMiles(value)
  }

  const handleRadiusSave = async (value) => {
    if (lat === null || lon === null) return
    setSaving(true)
    try {
      await updateWave({ waveUuid, uuid, lat, lon, radius: value * MILES_TO_METERS })
      Toast.show({ type: 'success', text1: `Radius set to ${value} mi` })
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error updating radius', text2: error.message })
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
            Wave is frozen. Change freeze mode or set a future freeze date to unfreeze.
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
            disabled={saving || isDateFrozen}
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
                    disabled={saving || isDateFrozen}
                  />
                  <TouchableOpacity onPress={clearSplashDate} disabled={saving || isDateFrozen} style={styles.clearButton}>
                    <MaterialCommunityIcons name='close-circle' size={20} color={theme.TEXT_SECONDARY} />
                  </TouchableOpacity>
                </>
                )
              : (
                <TouchableOpacity
                  onPress={handleSetSplashDate}
                  disabled={saving || isDateFrozen}
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

      {/* Freeze Mode */}
      <View style={[styles.section, { backgroundColor: theme.CARD_BACKGROUND }]}>
        <View style={styles.rowLabel}>
          <MaterialCommunityIcons name='snowflake' size={20} color={theme.TEXT_PRIMARY} />
          <View style={styles.labelText}>
            <Text style={[styles.settingTitle, { color: theme.TEXT_PRIMARY }]}>Freeze Mode</Text>
            <Text style={[styles.settingDescription, { color: theme.TEXT_SECONDARY }]}>
              Override automatic freeze behavior
            </Text>
          </View>
        </View>
        <View style={styles.freezeModeRow}>
          {[
            { value: 'AUTO', label: 'Auto', icon: 'autorenew' },
            { value: 'FROZEN', label: 'Frozen', icon: 'snowflake' },
            { value: 'UNFROZEN', label: 'Unlocked', icon: 'lock-open-variant-outline' }
          ].map((mode) => (
            <TouchableOpacity
              key={mode.value}
              onPress={() => handleFreezeModeChange(mode.value)}
              disabled={saving}
              style={[
                styles.freezeModeButton,
                {
                  backgroundColor: freezeMode === mode.value
                    ? theme.INTERACTIVE_PRIMARY
                    : theme.INTERACTIVE_BACKGROUND,
                  borderColor: theme.INTERACTIVE_BORDER
                }
              ]}
            >
              <MaterialCommunityIcons
                name={mode.icon}
                size={16}
                color={freezeMode === mode.value ? '#FFFFFF' : CONST.MAIN_COLOR}
              />
              <Text
                style={[
                  styles.freezeModeText,
                  { color: freezeMode === mode.value ? '#FFFFFF' : CONST.MAIN_COLOR }
                ]}
              >
                {mode.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Location */}
      <View style={[styles.section, { backgroundColor: theme.CARD_BACKGROUND }]}>
        <View style={styles.rowLabel}>
          <MaterialCommunityIcons name='map-marker' size={20} color={theme.TEXT_PRIMARY} />
          <View style={styles.labelText}>
            <Text style={[styles.settingTitle, { color: theme.TEXT_PRIMARY }]}>Location</Text>
            <Text style={[styles.settingDescription, { color: theme.TEXT_SECONDARY }]}>
              Geo-fence to restrict posting by distance
            </Text>
          </View>
        </View>

        <Text style={[styles.locationDisplay, { color: theme.TEXT_PRIMARY }]}>
          {locationText || 'No location set'}
        </Text>

        <TouchableOpacity
          onPress={handleUseMyLocation}
          disabled={saving || isDateFrozen}
          style={[styles.locationButton, { backgroundColor: CONST.MAIN_COLOR }]}
        >
          <MaterialCommunityIcons name='crosshairs-gps' size={16} color='#fff' />
          <Text style={styles.locationButtonText}>Use My Location</Text>
        </TouchableOpacity>

        <View style={styles.addressRow}>
          <TextInput
            style={[styles.addressInput, { backgroundColor: theme.INTERACTIVE_BACKGROUND, borderColor: theme.INTERACTIVE_BORDER, color: theme.TEXT_PRIMARY }]}
            placeholder='Enter city or address...'
            placeholderTextColor={theme.TEXT_SECONDARY}
            value={addressInput}
            onChangeText={setAddressInput}
            onSubmitEditing={handleAddressSubmit}
            returnKeyType='search'
            editable={!saving && !isDateFrozen}
          />
        </View>

        {lat !== null && (
          <View style={styles.radiusContainer}>
            <Text style={[styles.radiusLabel, { color: theme.TEXT_SECONDARY }]}>
              Radius: {radiusMiles} mi
            </Text>
            <Slider
              style={styles.radiusSlider}
              minimumValue={1}
              maximumValue={50}
              step={1}
              value={radiusMiles}
              onValueChange={handleRadiusChange}
              onSlidingComplete={handleRadiusSave}
              minimumTrackTintColor={CONST.MAIN_COLOR}
              maximumTrackTintColor={theme.INTERACTIVE_BORDER}
              disabled={saving || isDateFrozen}
            />
          </View>
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
  freezeModeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 4
  },
  freezeModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6
  },
  freezeModeText: {
    fontSize: 13,
    fontWeight: '600'
  },
  locationDisplay: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 8
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600'
  },
  addressRow: {
    marginBottom: 4
  },
  addressInput: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14
  },
  radiusContainer: {
    marginTop: 12
  },
  radiusLabel: {
    fontSize: 13,
    marginBottom: 4
  },
  radiusSlider: {
    width: '100%',
    height: 36
  },
  savingOverlay: {
    position: 'absolute',
    top: 8,
    right: 16
  }
})

export default WaveSettings
