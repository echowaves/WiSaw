/* global console */
import { useAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'

import { FontAwesome5, Ionicons } from '@expo/vector-icons'
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'

import { isDarkMode } from '../../state'
import { getTheme, SHARED_STYLES } from '../../theme/sharedStyles'
import * as CONST from '../../consts'
import { listWaves } from '../../screens/Waves/reducer'

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

  const [waves, setWaves] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [showCreateInput, setShowCreateInput] = useState(false)
  const [newWaveName, setNewWaveName] = useState('')

  const fetchWaves = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listWaves({
        pageNumber: 0,
        batch: String(Math.random()),
        uuid
      })
      setWaves(data.waves || [])
    } catch (err) {
      console.error('Failed to load waves:', err)
    } finally {
      setLoading(false)
    }
  }, [uuid])

  useEffect(() => {
    if (visible) {
      fetchWaves()
      setSearchText('')
      setShowCreateInput(false)
      setNewWaveName('')
    }
  }, [visible, fetchWaves])

  const filteredWaves = searchText
    ? waves.filter(w => w.name.toLowerCase().includes(searchText.toLowerCase()))
    : waves

  const handleCreateSubmit = () => {
    const trimmed = newWaveName.trim()
    if (!trimmed) return
    setShowCreateInput(false)
    setNewWaveName('')
    onCreateWave(trimmed)
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
                  onPress={() => { setShowCreateInput(false); setNewWaveName('') }}
                >
                  <Ionicons name='close' size={20} color={theme.TEXT_SECONDARY} />
                </TouchableOpacity>
              </View>
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
    }
  })

export default WaveSelectorModal
