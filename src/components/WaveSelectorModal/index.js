/* global console */
import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useEffect, useState } from 'react'

import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import * as Location from 'expo-location'
import Slider from '@react-native-community/slider'

import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import { isDarkMode, locationAtom } from '../../state'
import { getTheme, SHARED_STYLES } from '../../theme/sharedStyles'
import * as CONST from '../../consts'
import { listWaves } from '../../screens/Waves/reducer'
import * as Crypto from 'expo-crypto'

const MILES_TO_METERS = 1609
const DEFAULT_RADIUS_MILES = 10

const WaveSelectorModal = ({
  visible,
  onClose,
  onSelectWave,
  onRemoveFromWave,
  onCreateWave,
  currentWaveUuid,
  uuid
}) => {
  const [isDark] = useAtom(isDarkMode)
  const theme = getTheme(isDark)
  const locationState = useAtomValue(locationAtom)

  const [waves, setWaves] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showCreateInput, setShowCreateInput] = useState(false)
  const [newWaveName, setNewWaveName] = useState('')
  const [pageNumber, setPageNumber] = useState(0)
  const [batch, setBatch] = useState(Crypto.randomUUID())
  const [noMoreData, setNoMoreData] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  // Location state for wave creation
  const [showLocationSection, setShowLocationSection] = useState(false)
  const [createLat, setCreateLat] = useState(null)
  const [createLon, setCreateLon] = useState(null)
  const [createLocationText, setCreateLocationText] = useState('')
  const [createRadiusMiles, setCreateRadiusMiles] = useState(DEFAULT_RADIUS_MILES)
  const [createAddressInput, setCreateAddressInput] = useState('')

  const fetchWaves = useCallback(async (pageNum, currentBatch, searchTerm, refresh = false) => {
    if (refresh) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }
    try {
      const data = await listWaves({
        pageNumber: pageNum,
        batch: currentBatch,
        uuid,
        searchTerm: searchTerm || undefined
      })
      const newWaves = data.waves || []
      if (refresh) {
        setWaves(newWaves)
      } else {
        setWaves(prev => [...prev, ...newWaves])
      }
      setNoMoreData(data.noMoreData)
      setBatch(data.batch)
    } catch (err) {
      console.error('Failed to load waves:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [uuid])

  // Debounce search text (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText.trim())
    }, 300)
    return () => clearTimeout(timer)
  }, [searchText])

  // When debounced search changes, reset and re-fetch
  useEffect(() => {
    if (!visible) return
    const newBatch = Crypto.randomUUID()
    setPageNumber(0)
    setNoMoreData(false)
    setBatch(newBatch)
    fetchWaves(0, newBatch, debouncedSearch, true)
  }, [debouncedSearch])

  useEffect(() => {
    if (visible) {
      const newBatch = Crypto.randomUUID()
      setPageNumber(0)
      setNoMoreData(false)
      setBatch(newBatch)
      fetchWaves(0, newBatch, '', true)
      setSearchText('')
      setDebouncedSearch('')
      setShowCreateInput(false)
      setNewWaveName('')
      resetCreateLocation()
    }
  }, [visible, fetchWaves])

  const handleLoadMore = () => {
    if (!noMoreData && !loading && !loadingMore) {
      const nextPage = pageNumber + 1
      setPageNumber(nextPage)
      fetchWaves(nextPage, batch, debouncedSearch || undefined)
    }
  }

  const filteredWaves = waves

  const handleCreateSubmit = () => {
    const trimmed = newWaveName.trim()
    if (!trimmed) return
    setShowCreateInput(false)
    setNewWaveName('')
    if (createLat !== null && createLon !== null) {
      onCreateWave(trimmed, { lat: createLat, lon: createLon, radius: createRadiusMiles * MILES_TO_METERS })
    } else {
      onCreateWave(trimmed)
    }
    resetCreateLocation()
  }

  const resetCreateLocation = () => {
    setShowLocationSection(false)
    setCreateLat(null)
    setCreateLon(null)
    setCreateLocationText('')
    setCreateRadiusMiles(DEFAULT_RADIUS_MILES)
    setCreateAddressInput('')
  }

  const handleCreateUseMyLocation = async () => {
    if (locationState.status !== 'ready' || !locationState.coords) {
      Alert.alert('Location Unavailable', 'Your device location is not available.')
      return
    }
    const { latitude, longitude } = locationState.coords
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude })
      const text = results && results.length > 0
        ? [results[0].city, results[0].region, results[0].country].filter(Boolean).join(', ')
        : `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`
      setCreateLat(latitude)
      setCreateLon(longitude)
      setCreateLocationText(text)
    } catch {
      setCreateLat(latitude)
      setCreateLon(longitude)
      setCreateLocationText(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`)
    }
  }

  const handleCreateAddressSubmit = async () => {
    const trimmed = createAddressInput.trim()
    if (!trimmed) return
    try {
      const results = await Location.geocodeAsync(trimmed)
      if (!results || results.length === 0) {
        Alert.alert('Not Found', 'Could not find that address.')
        return
      }
      const { latitude, longitude } = results[0]
      const reverseResults = await Location.reverseGeocodeAsync({ latitude, longitude })
      const text = reverseResults && reverseResults.length > 0
        ? [reverseResults[0].city, reverseResults[0].region, reverseResults[0].country].filter(Boolean).join(', ')
        : `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`
      setCreateLat(latitude)
      setCreateLon(longitude)
      setCreateLocationText(text)
      setCreateAddressInput('')
    } catch (error) {
      Alert.alert('Error', 'Could not geocode address.')
    }
  }

  const styles = makeStyles(theme)

  const renderWaveItem = ({ item }) => {
    const isCurrent = item.waveUuid === currentWaveUuid
    return (
      <TouchableOpacity
        style={[styles.waveItem, isCurrent && styles.waveItemCurrent]}
        onPress={() => onSelectWave(item)}
        activeOpacity={0.7}
      >
        <View style={styles.waveItemContent}>
          <FontAwesome5
            name='water'
            size={16}
            color={isCurrent ? CONST.MAIN_COLOR : theme.TEXT_SECONDARY}
          />
          <Text
            style={[styles.waveName, isCurrent && styles.waveNameCurrent]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
        </View>
        <Text style={styles.wavePhotosCount}>
          {item.photosCount || 0}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior='padding'
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={() => {}}
          >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Select Wave</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name='close' size={24} color={theme.TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons name='search' size={18} color={theme.TEXT_SECONDARY} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder='Search waves...'
              placeholderTextColor={theme.TEXT_SECONDARY}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {/* Create New Wave */}
          {showCreateInput
            ? (
              <>
                <View style={styles.createInputRow}>
                  <TextInput
                    style={styles.createInput}
                    placeholder='Wave name...'
                    placeholderTextColor={theme.TEXT_SECONDARY}
                    value={newWaveName}
                    onChangeText={setNewWaveName}
                    autoFocus
                    onSubmitEditing={handleCreateSubmit}
                    returnKeyType='done'
                  />
                  <TouchableOpacity
                    style={[styles.createSubmitButton, !newWaveName.trim() && { opacity: 0.4 }]}
                    onPress={handleCreateSubmit}
                    disabled={!newWaveName.trim()}
                  >
                    <Ionicons name='checkmark' size={20} color='#fff' />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.createCancelButton}
                    onPress={() => { setShowCreateInput(false); setNewWaveName(''); resetCreateLocation() }}
                  >
                    <Ionicons name='close' size={20} color={theme.TEXT_SECONDARY} />
                  </TouchableOpacity>
                </View>

                {/* Set Location (optional) */}
                <TouchableOpacity
                  style={styles.locationToggle}
                  onPress={() => setShowLocationSection(!showLocationSection)}
                >
                  <MaterialCommunityIcons name='map-marker' size={16} color={theme.TEXT_SECONDARY} />
                  <Text style={[styles.locationToggleText, { color: theme.TEXT_SECONDARY }]}>
                    Set Location (optional)
                  </Text>
                  <Ionicons name={showLocationSection ? 'chevron-up' : 'chevron-down'} size={16} color={theme.TEXT_SECONDARY} />
                </TouchableOpacity>

                {showLocationSection && (
                  <View style={styles.locationSection}>
                    {createLocationText
                      ? (
                        <Text style={[styles.locationDisplayText, { color: theme.TEXT_PRIMARY }]}>
                          {createLocationText}
                        </Text>
                        )
                      : (
                        <Text style={[styles.locationDisplayText, { color: theme.TEXT_SECONDARY }]}>
                          No location set
                        </Text>
                        )}

                    <TouchableOpacity
                      onPress={handleCreateUseMyLocation}
                      style={[styles.useLocationButton, { backgroundColor: CONST.MAIN_COLOR }]}
                    >
                      <MaterialCommunityIcons name='crosshairs-gps' size={14} color='#fff' />
                      <Text style={styles.useLocationText}>Use My Location</Text>
                    </TouchableOpacity>

                    <TextInput
                      style={[styles.addressInput, { backgroundColor: theme.BACKGROUND, borderColor: theme.BORDER_LIGHT, color: theme.TEXT_PRIMARY }]}
                      placeholder='Enter city or address...'
                      placeholderTextColor={theme.TEXT_SECONDARY}
                      value={createAddressInput}
                      onChangeText={setCreateAddressInput}
                      onSubmitEditing={handleCreateAddressSubmit}
                      returnKeyType='search'
                    />

                    {createLat !== null && (
                      <View style={styles.radiusRow}>
                        <Text style={[styles.radiusLabel, { color: theme.TEXT_SECONDARY }]}>
                          Radius: {createRadiusMiles} mi
                        </Text>
                        <Slider
                          style={styles.radiusSlider}
                          minimumValue={1}
                          maximumValue={50}
                          step={1}
                          value={createRadiusMiles}
                          onValueChange={setCreateRadiusMiles}
                          minimumTrackTintColor={CONST.MAIN_COLOR}
                          maximumTrackTintColor={theme.BORDER_LIGHT}
                        />
                      </View>
                    )}
                  </View>
                )}
              </>
              )
            : (
              <TouchableOpacity
                style={styles.createNewButton}
                onPress={() => setShowCreateInput(true)}
                activeOpacity={0.7}
              >
                <Ionicons name='add-circle' size={20} color={CONST.MAIN_COLOR} />
                <Text style={styles.createNewText}>Create New Wave</Text>
              </TouchableOpacity>
              )}

          {/* Remove from wave option */}
          {currentWaveUuid && (
            <TouchableOpacity
              style={styles.removeOption}
              onPress={onRemoveFromWave}
              activeOpacity={0.7}
            >
              <Ionicons name='close-circle-outline' size={18} color={theme.STATUS_CAUTION} />
              <Text style={styles.removeOptionText}>None (remove from wave)</Text>
            </TouchableOpacity>
          )}

          {/* Wave list */}
          {loading
            ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size='large' color={CONST.MAIN_COLOR} />
              </View>
              )
            : (
              <FlatList
                data={filteredWaves}
                renderItem={renderWaveItem}
                keyExtractor={item => item.waveUuid}
                style={styles.list}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={loadingMore ? <ActivityIndicator style={{ padding: 10 }} color={CONST.MAIN_COLOR} /> : null}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <FontAwesome5 name='water' size={32} color={theme.TEXT_DISABLED} />
                    <Text style={styles.emptyText}>No waves yet</Text>
                  </View>
                }
              />
              )}
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const makeStyles = (theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end'
    },
    modalContainer: {
      backgroundColor: theme.CARD_BACKGROUND,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '70%',
      paddingBottom: 30
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12
    },
    headerTitle: {
      ...SHARED_STYLES.text.subheading,
      color: theme.TEXT_PRIMARY,
      fontSize: 18,
      fontWeight: '700'
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginBottom: 8,
      backgroundColor: theme.BACKGROUND,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 40
    },
    searchIcon: {
      marginRight: 8
    },
    searchInput: {
      flex: 1,
      color: theme.TEXT_PRIMARY,
      fontSize: 15
    },
    createNewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      gap: 10
    },
    createNewText: {
      color: CONST.MAIN_COLOR,
      fontSize: 15,
      fontWeight: '600'
    },
    createInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 8
    },
    createInput: {
      flex: 1,
      backgroundColor: theme.BACKGROUND,
      borderRadius: 12,
      paddingHorizontal: 14,
      height: 40,
      color: theme.TEXT_PRIMARY,
      fontSize: 15
    },
    createSubmitButton: {
      backgroundColor: CONST.MAIN_COLOR,
      borderRadius: 20,
      width: 36,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center'
    },
    createCancelButton: {
      width: 36,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center'
    },
    removeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      gap: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.BORDER_LIGHT
    },
    removeOptionText: {
      color: theme.STATUS_CAUTION,
      fontSize: 15,
      fontWeight: '500'
    },
    list: {
      flexGrow: 0
    },
    waveItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 14
    },
    waveItemCurrent: {
      backgroundColor: `${CONST.MAIN_COLOR}15`
    },
    waveItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1
    },
    waveName: {
      color: theme.TEXT_PRIMARY,
      fontSize: 15,
      fontWeight: '500',
      flex: 1
    },
    waveNameCurrent: {
      color: CONST.MAIN_COLOR,
      fontWeight: '700'
    },
    wavePhotosCount: {
      color: theme.TEXT_SECONDARY,
      fontSize: 13,
      marginLeft: 8
    },
    loadingContainer: {
      paddingVertical: 40,
      alignItems: 'center'
    },
    emptyContainer: {
      paddingVertical: 40,
      alignItems: 'center',
      gap: 12
    },
    emptyText: {
      color: theme.TEXT_DISABLED,
      fontSize: 15
    },
    locationToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 8,
      gap: 6
    },
    locationToggleText: {
      fontSize: 13,
      flex: 1
    },
    locationSection: {
      paddingHorizontal: 20,
      paddingBottom: 8,
      gap: 8
    },
    locationDisplayText: {
      fontSize: 13
    },
    useLocationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
      alignSelf: 'flex-start'
    },
    useLocationText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600'
    },
    addressInput: {
      height: 36,
      borderRadius: 8,
      borderWidth: 1,
      paddingHorizontal: 10,
      fontSize: 13
    },
    radiusRow: {
      marginTop: 4
    },
    radiusLabel: {
      fontSize: 12,
      marginBottom: 2
    },
    radiusSlider: {
      width: '100%',
      height: 32
    }
  })

export default WaveSelectorModal
