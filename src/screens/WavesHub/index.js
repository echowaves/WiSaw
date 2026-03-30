import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  useWindowDimensions
} from 'react-native'
import { useAtom } from 'jotai'
import { FontAwesome5, Ionicons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { router, useFocusEffect } from 'expo-router'
import * as Crypto from 'expo-crypto'
import InteractionHintBanner from '../../components/ui/InteractionHintBanner'
import * as SecureStore from 'expo-secure-store'

import * as STATE from '../../state'
import * as CONST from '../../consts'
import { getTheme } from '../../theme/sharedStyles'
import LinearProgress from '../../components/ui/LinearProgress'
import * as reducer from './reducer'
import WaveCard from '../../components/WaveCard'
import EmptyStateCard from '../../components/EmptyStateCard'
import { KeyboardAvoidingView, KeyboardStickyView } from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MergeWaveModal from '../../components/MergeWaveModal'
import WavesExplainerView from '../../components/WavesExplainerView'
import ActionMenu from '../../components/ActionMenu'
import { subscribeToAutoGroup, emitAutoGroupDone, emitAutoGroup } from '../../events/autoGroupBus'
import { subscribeToAddWave } from '../../events/waveAddBus'
import { subscribeToIdentityChange } from '../../events/identityChangeBus'

const WavesHub = ({ ungroupedCount = 0 }) => {
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const numColumns = width >= 768 ? 2 : 1

  const [uuid] = useAtom(STATE.uuid)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const [sortBy] = useAtom(STATE.waveSortBy)
  const [sortDirection] = useAtom(STATE.waveSortDirection)
  const [, setWavesCount] = useAtom(STATE.wavesCount)
  const [, setUngroupedPhotosCount] = useAtom(STATE.ungroupedPhotosCount)

  const [waves, setWaves] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [pageNumber, setPageNumber] = useState(0)
  const [batch, setBatch] = useState(Crypto.randomUUID())
  const [noMoreData, setNoMoreData] = useState(false)

  const [searchText, setSearchText] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const searchInputRef = useRef(null)

  const [modalVisible, setModalVisible] = useState(false)
  const [newWaveName, setNewWaveName] = useState('')
  const [newWaveDescription, setNewWaveDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const [autoGrouping, setAutoGrouping] = useState(false)
  const [autoGroupProgress, setAutoGroupProgress] = useState({ photosGrouped: 0, wavesCreated: 0 })

  // Edit modal state
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingWave, setEditingWave] = useState(null)
  const [editWaveName, setEditWaveName] = useState('')
  const [editWaveDescription, setEditWaveDescription] = useState('')
  const [updating, setUpdating] = useState(false)

  // Merge state
  const [mergeModalVisible, setMergeModalVisible] = useState(false)
  const [mergingWave, setMergingWave] = useState(null)

  // Context menu state
  const [contextMenuWave, setContextMenuWave] = useState(null)

  const loadingRef = useRef(false)
  const hasMountedRef = useRef(false)

  const theme = getTheme(isDarkMode)

  const loadWaves = useCallback(async (pageNum, currentBatch, refresh = false, searchTerm) => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    try {
      const data = await reducer.listWaves({
        pageNumber: pageNum,
        batch: currentBatch,
        uuid,
        sortBy,
        sortDirection,
        searchTerm
      })

      const newWaves = data.waves || []

      if (refresh) {
        setWaves(newWaves)
      } else {
        setWaves(prev => [...prev, ...newWaves])
      }

      setNoMoreData(data.noMoreData)
      setBatch(data.batch)
    } catch (error) {
      console.error(error)
      Toast.show({
        type: 'error',
        text1: 'Error loading waves',
        text2: error.message
      })
    } finally {
      loadingRef.current = false
      setLoading(false)
      setRefreshing(false)
    }
  }, [uuid, sortBy, sortDirection])

  // Debounce search text → debouncedSearch (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText.trim())
    }, 300)
    return () => clearTimeout(timer)
  }, [searchText])

  // When debounced search changes, reset pagination and re-fetch
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }
    setPageNumber(0)
    setNoMoreData(false)
    const newBatch = Crypto.randomUUID()
    setBatch(newBatch)
    loadWaves(0, newBatch, true, debouncedSearch || undefined)
  }, [debouncedSearch])

  useFocusEffect(
    useCallback(() => {
      setPageNumber(0)
      setNoMoreData(false)
      const newBatch = Crypto.randomUUID()
      setBatch(newBatch)
      loadWaves(0, newBatch, true, debouncedSearch || undefined)
    }, [loadWaves, debouncedSearch])
  )



  const handleRefresh = () => {
    setRefreshing(true)
    setPageNumber(0)
    const newBatch = Crypto.randomUUID()
    setBatch(newBatch)
    loadWaves(0, newBatch, true, debouncedSearch || undefined)
  }

  const handleLoadMore = () => {
    if (!noMoreData && !loading) {
      const nextPage = pageNumber + 1
      setPageNumber(nextPage)
      loadWaves(nextPage, batch, false, debouncedSearch || undefined)
    }
  }

  const handleCreateWave = async () => {
    if (!newWaveName.trim()) {
      Alert.alert('Error', 'Wave name is required')
      return
    }
    setCreating(true)
    try {
      const newWave = await reducer.createWave({
        name: newWaveName,
        description: newWaveDescription,
        uuid
      })
      setWaves(prev => [{ ...newWave, thumbnails: [], photos: [] }, ...prev])
      setWavesCount(prev => (prev ?? 0) + 1)
      setModalVisible(false)
      setNewWaveName('')
      setNewWaveDescription('')
      Toast.show({ type: 'success', text1: 'Wave created' })
    } catch (error) {
      console.error(error)
      Toast.show({ type: 'error', text1: 'Error creating wave', text2: error.message })
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteWave = (waveUuid) => {
    Alert.alert(
      'Delete Wave',
      'Are you sure you want to delete this wave?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const waveToDelete = waves.find(w => w.waveUuid === waveUuid)
              await reducer.deleteWave({ waveUuid, uuid })
              setWaves(prev => prev.filter(w => w.waveUuid !== waveUuid))
              setWavesCount(prev => Math.max((prev ?? 1) - 1, 0))
              setUngroupedPhotosCount(prev => (prev ?? 0) + (waveToDelete?.photosCount ?? 0))
              emitAutoGroupDone()
              Toast.show({ type: 'success', text1: 'Wave deleted' })
            } catch (error) {
              console.error(error)
              Toast.show({ type: 'error', text1: 'Error deleting wave', text2: error.message })
            }
          }
        }
      ]
    )
  }

  const handleEditWave = (wave) => {
    setEditingWave(wave)
    setEditWaveName(wave.name)
    setEditWaveDescription(wave.description || '')
    setEditModalVisible(true)
  }

  const handleSaveEditWave = async () => {
    if (!editWaveName.trim()) {
      Alert.alert('Error', 'Wave name is required')
      return
    }
    setUpdating(true)
    try {
      const updatedWave = await reducer.updateWave({
        waveUuid: editingWave.waveUuid,
        uuid,
        name: editWaveName,
        description: editWaveDescription
      })
      setWaves(prev => prev.map(w =>
        w.waveUuid === editingWave.waveUuid ? { ...updatedWave, thumbnails: w.thumbnails } : w
      ))
      setEditModalVisible(false)
      setEditingWave(null)
      Toast.show({ type: 'success', text1: 'Wave updated' })
    } catch (error) {
      console.error(error)
      Toast.show({ type: 'error', text1: 'Error updating wave', text2: error.message })
    } finally {
      setUpdating(false)
    }
  }

  const handleAutoGroup = useCallback((count) => {
    const countText = count > 0
      ? `You have ${count} ungrouped photo${count !== 1 ? 's' : ''}. This will automatically group them into waves. Continue?`
      : 'This will automatically group your ungrouped photos into waves. Continue?'
    Alert.alert(
      'Auto-Group Photos',
      countText,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Auto-Group',
          onPress: async () => {
            setAutoGroupProgress({ photosGrouped: 0, wavesCreated: 0 })
            setAutoGrouping(true)
            let totalWavesCreated = 0
            let totalPhotosGrouped = 0
            try {
              let result
              do {
                result = await reducer.autoGroupPhotos({ uuid })
                if (result.photosGrouped > 0) {
                  totalWavesCreated += 1
                  totalPhotosGrouped += result.photosGrouped
                  setAutoGroupProgress({ photosGrouped: totalPhotosGrouped, wavesCreated: totalWavesCreated })
                }
              } while (result.hasMore)
              if (totalWavesCreated === 0) {
                Toast.show({ type: 'info', text1: 'No ungrouped photos found', text2: 'All your photos are already in waves' })
              } else {
                Toast.show({
                  type: 'success',
                  text1: 'Photos grouped successfully',
                  text2: `Created ${totalWavesCreated} wave${totalWavesCreated !== 1 ? 's' : ''} with ${totalPhotosGrouped} photo${totalPhotosGrouped !== 1 ? 's' : ''}`
                })
                setWavesCount(prev => (prev ?? 0) + totalWavesCreated)
                setUngroupedPhotosCount(0)
                handleRefresh()
              }
            } catch (error) {
              console.error(error)
              Toast.show({ type: 'error', text1: 'Error auto-grouping photos', text2: error.message })
              if (totalWavesCreated > 0) handleRefresh()
            } finally {
              setAutoGrouping(false)
              emitAutoGroupDone()
            }
          }
        }
      ]
    )
  }, [uuid])

  useEffect(() => {
    const unsubscribe = subscribeToAutoGroup((count) => {
      handleAutoGroup(count)
    })
    return unsubscribe
  }, [handleAutoGroup])

  useEffect(() => {
    const unsubscribe = subscribeToAddWave(() => {
      setModalVisible(true)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeToIdentityChange(() => {
      handleRefresh()
    })
    return unsubscribe
  }, [handleRefresh])

  const handleStartMerge = (wave) => {
    setMergingWave(wave)
    setMergeModalVisible(true)
  }

  const handleMergeTargetSelected = (targetWave) => {
    setMergeModalVisible(false)
    const sourcePhotos = mergingWave?.photosCount ?? 0
    Alert.alert(
      `Merge "${mergingWave?.name}" into "${targetWave.name}"?`,
      `${sourcePhotos} photo${sourcePhotos !== 1 ? 's' : ''} will be moved. "${mergingWave?.name}" will be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Merge',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedTarget = await reducer.mergeWaves({
                targetWaveUuid: targetWave.waveUuid,
                sourceWaveUuid: mergingWave.waveUuid,
                uuid
              })
              setWaves(prev => prev
                .filter(w => w.waveUuid !== mergingWave.waveUuid)
                .map(w => w.waveUuid === targetWave.waveUuid
                  ? { ...w, ...updatedTarget, thumbnails: w.thumbnails }
                  : w
                )
              )
              Toast.show({ type: 'success', text1: 'Waves merged successfully' })
            } catch (error) {
              console.error(error)
              Toast.show({ type: 'error', text1: 'Error merging waves', text2: error.message })
            } finally {
              setMergingWave(null)
            }
          }
        }
      ]
    )
  }

  const showWaveContextMenu = (wave) => {
    setContextMenuWave(wave)
  }

  const contextMenuItems = contextMenuWave && contextMenuWave.createdBy === uuid
    ? [
        {
          key: 'edit-wave',
          icon: 'pencil-outline',
          label: 'Edit Wave',
          onPress: () => handleEditWave(contextMenuWave)
        },
        {
          key: 'merge',
          icon: 'call-merge',
          label: 'Merge Into Another Wave...',
          onPress: () => handleStartMerge(contextMenuWave)
        },
        'separator',
        {
          key: 'delete',
          icon: 'trash-can-outline',
          label: 'Delete Wave',
          destructive: true,
          onPress: () => handleDeleteWave(contextMenuWave.waveUuid)
        }
      ]
    : []

  const handleWavePress = (wave) => {
    router.push({
      pathname: `/waves/${wave.waveUuid}`,
      params: { waveName: wave.name }
    })
  }

  const filteredWaves = waves

  const renderItem = ({ item, index }) => {
    // Add an empty spacer for odd-count last item to keep grid alignment
    return (
      <WaveCard
        wave={item}
        onPress={handleWavePress}
        onLongPress={showWaveContextMenu}
        theme={theme}
      />
    )
  }

  const [netAvailable] = useAtom(STATE.netAvailable)

  if (!netAvailable) {
    return (
      <View style={[styles.container, { backgroundColor: theme.INTERACTIVE_BACKGROUND, justifyContent: 'center', paddingHorizontal: 20 }]}>
        <EmptyStateCard
          icon='wifi-off'
          iconType='MaterialIcons'
          title='No Internet Connection'
          subtitle='Waves require an internet connection. Please check your connection and try again.'
        />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.INTERACTIVE_BACKGROUND }]}>
      <InteractionHintBanner hasContent={waves.length > 0} />

      {loading && (
        <View
          style={{
            height: 3,
            backgroundColor: theme.HEADER_BACKGROUND
          }}
        >
          <LinearProgress
            color={CONST.MAIN_COLOR}
            style={{
              flex: 1,
              height: 3
            }}
          />
        </View>
      )}

      <FlatList
        data={filteredWaves}
        renderItem={renderItem}
        keyExtractor={item => item.waveUuid}
        numColumns={numColumns}
        key={numColumns}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading && (
            searchText.length > 0
              ? (
                <EmptyStateCard
                  icon='search'
                  title='No Results Found'
                  subtitle='Try different keywords.'
                  actionText='Clear Search'
                  onActionPress={() => setSearchText('')}
                />
                )
              : (
                <WavesExplainerView
                  theme={theme}
                  ungroupedCount={ungroupedCount}
                  onAutoGroup={() => emitAutoGroup(ungroupedCount)}
                  onNavigateHome={() => router.navigate('/')}
                />
                )
          )
        }
      />

      {/* Create Wave Modal */}
      <Modal
        animationType='slide'
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView style={styles.modalOverlay} behavior='padding'>
          <View style={[styles.modalContent, { backgroundColor: theme.CARD_BACKGROUND }]}>
            <Text style={[styles.modalTitle, { color: theme.TEXT_PRIMARY }]}>Create New Wave</Text>
            <TextInput
              style={[styles.input, { color: theme.TEXT_PRIMARY, borderColor: theme.INTERACTIVE_BORDER }]}
              placeholder='Wave Name'
              placeholderTextColor={theme.TEXT_SECONDARY}
              value={newWaveName}
              onChangeText={setNewWaveName}
            />
            <TextInput
              style={[styles.input, styles.textArea, { color: theme.TEXT_PRIMARY, borderColor: theme.INTERACTIVE_BORDER }]}
              placeholder='Description (optional)'
              placeholderTextColor={theme.TEXT_SECONDARY}
              value={newWaveDescription}
              onChangeText={setNewWaveDescription}
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.INTERACTIVE_BACKGROUND }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.buttonText, { color: theme.TEXT_PRIMARY }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: CONST.MAIN_COLOR }]}
                onPress={handleCreateWave}
                disabled={creating}
              >
                {creating
                  ? <ActivityIndicator color='#FFF' />
                  : <Text style={[styles.buttonText, { color: '#FFF' }]}>Create</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Wave Modal */}
      <Modal
        animationType='slide'
        transparent
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView style={styles.modalOverlay} behavior='padding'>
          <View style={[styles.modalContent, { backgroundColor: theme.CARD_BACKGROUND }]}>
            <Text style={[styles.modalTitle, { color: theme.TEXT_PRIMARY }]}>Edit Wave</Text>
            <TextInput
              style={[styles.input, { color: theme.TEXT_PRIMARY, borderColor: theme.INTERACTIVE_BORDER }]}
              placeholder='Wave Name'
              placeholderTextColor={theme.TEXT_SECONDARY}
              value={editWaveName}
              onChangeText={setEditWaveName}
            />
            <TextInput
              style={[styles.input, styles.textArea, { color: theme.TEXT_PRIMARY, borderColor: theme.INTERACTIVE_BORDER }]}
              placeholder='Description (optional)'
              placeholderTextColor={theme.TEXT_SECONDARY}
              value={editWaveDescription}
              onChangeText={setEditWaveDescription}
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.INTERACTIVE_BACKGROUND }]}
                onPress={() => { setEditModalVisible(false); setEditingWave(null) }}
              >
                <Text style={[styles.buttonText, { color: theme.TEXT_PRIMARY }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: CONST.MAIN_COLOR }]}
                onPress={handleSaveEditWave}
                disabled={updating}
              >
                {updating
                  ? <ActivityIndicator color='#FFF' />
                  : <Text style={[styles.buttonText, { color: '#FFF' }]}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Auto-Group Progress Overlay */}
      <Modal
        animationType='fade'
        transparent
        visible={autoGrouping}
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.CARD_BACKGROUND, alignItems: 'center' }]}>
            <ActivityIndicator size='large' color={CONST.MAIN_COLOR} style={{ marginBottom: 16 }} />
            <Text style={[styles.modalTitle, { marginBottom: 8 }]}>Auto-Grouping Photos...</Text>
            {autoGroupProgress.photosGrouped > 0 && (
              <>
                <Text style={{ color: theme.TEXT_SECONDARY, fontSize: 16, marginBottom: 4 }}>
                  {autoGroupProgress.photosGrouped} photo{autoGroupProgress.photosGrouped !== 1 ? 's' : ''} grouped
                </Text>
                <Text style={{ color: theme.TEXT_SECONDARY, fontSize: 16 }}>
                  {autoGroupProgress.wavesCreated} wave{autoGroupProgress.wavesCreated !== 1 ? 's' : ''} created
                </Text>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Merge Wave Modal */}
      <MergeWaveModal
        visible={mergeModalVisible}
        onClose={() => { setMergeModalVisible(false); setMergingWave(null) }}
        onSelectTarget={handleMergeTargetSelected}
        sourceWave={mergingWave}
        uuid={uuid}
      />

      <ActionMenu
        visible={!!contextMenuWave}
        onClose={() => setContextMenuWave(null)}
        title={contextMenuWave?.name}
        items={contextMenuItems}
      />

      {/* Search bar - bottom floating */}
      {(waves.length > 0 || searchText.length > 0) && (
        <KeyboardStickyView
          offset={{ closed: -(insets.bottom + 8), opened: 16 }}
        >
          <View style={styles.searchContainer}>
            <TextInput
              ref={searchInputRef}
              style={[styles.searchInput, { color: theme.TEXT_PRIMARY, backgroundColor: theme.CARD_BACKGROUND, borderColor: theme.INTERACTIVE_BORDER, paddingRight: searchText ? 36 : 16 }]}
              placeholder='Search waves...'
              placeholderTextColor={theme.TEXT_SECONDARY}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchText('')
                  if (searchInputRef.current) {
                    searchInputRef.current.clear()
                    searchInputRef.current.focus()
                  }
                }}
                style={styles.clearButton}
              >
                <Ionicons name='close' size={14} color={theme.TEXT_PRIMARY} />
              </TouchableOpacity>
            )}
          </View>
        </KeyboardStickyView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingLeft: 16,
    paddingRight: 16,
    borderWidth: 1,
    fontSize: 14
  },
  clearButton: {
    position: 'absolute',
    right: 24,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(128,128,128,0.2)',
    borderRadius: 11
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 16
  },

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

export default WavesHub
