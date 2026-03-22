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
import { getTheme } from '../../theme/sharedStyles'
import * as CONST from '../../consts'
import { listWaves } from '../../screens/Waves/reducer'
import * as Crypto from 'expo-crypto'

const MergeWaveModal = ({
  visible,
  onClose,
  onSelectTarget,
  sourceWave,
  uuid
}) => {
  const [isDark] = useAtom(isDarkMode)
  const theme = getTheme(isDark)

  const [waves, setWaves] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')

  const fetchWaves = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listWaves({
        pageNumber: 0,
        batch: Crypto.randomUUID(),
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
    }
  }, [visible, fetchWaves])

  const filteredWaves = (searchText
    ? waves.filter(w => w.name.toLowerCase().includes(searchText.toLowerCase()))
    : waves
  ).filter(w => w.waveUuid !== sourceWave?.waveUuid)

  const styles = makeStyles(theme)

  const renderWaveItem = ({ item }) => (
    <TouchableOpacity
      style={styles.waveItem}
      onPress={() => onSelectTarget(item)}
      activeOpacity={0.7}
    >
      <View style={styles.waveItemContent}>
        <FontAwesome5
          name='water'
          size={16}
          color={theme.TEXT_SECONDARY}
        />
        <Text
          style={styles.waveName}
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
            <Text style={styles.headerTitle}>
              Merge &quot;{sourceWave?.name}&quot; into...
            </Text>
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
                keyExtractor={item => item.waveUuid}
                renderItem={renderWaveItem}
                style={styles.list}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <FontAwesome5 name='water' size={32} color={theme.TEXT_SECONDARY} />
                    <Text style={styles.emptyText}>No waves found</Text>
                  </View>
                }
              />
              )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

const makeStyles = (theme) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    paddingTop: 20,
    paddingBottom: 12
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.TEXT_PRIMARY,
    flex: 1,
    marginRight: 12
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: theme.INTERACTIVE_BACKGROUND,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.TEXT_PRIMARY
  },
  list: {
    paddingHorizontal: 12
  },
  waveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginVertical: 2
  },
  waveItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  waveName: {
    fontSize: 16,
    color: theme.TEXT_PRIMARY,
    marginLeft: 12,
    flex: 1
  },
  wavePhotosCount: {
    fontSize: 14,
    color: theme.TEXT_SECONDARY,
    marginLeft: 8
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center'
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: theme.TEXT_SECONDARY,
    marginTop: 12
  }
})

export default MergeWaveModal
