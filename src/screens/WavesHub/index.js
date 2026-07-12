import React, { useEffect, useState, useCallback, useRef, useContext } from 'react'
import useDebouncedSearch from '../../hooks/useDebouncedSearch'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  useWindowDimensions
} from 'react-native'
import { useAtom, useAtomValue } from 'jotai'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { showSuccessToast, showInfoToast } from '../../utils/showToast'
import showErrorToast from '../../utils/showErrorToast'
import showConfirmAlert from '../../utils/showConfirmAlert'
import { router, useFocusEffect } from 'expo-router'
import * as Crypto from 'expo-crypto'
import InteractionHintBanner from '../../components/ui/InteractionHintBanner'

import * as STATE from '../../state'
import * as CONST from '../../consts'
import { SHARED_STYLES, getTheme } from '../../theme/sharedStyles'
import { ScreenIconTitle } from '../../theme/screenIcons'
import AppHeader from '../../components/AppHeader'
import EditWaveModal from '../../components/EditWaveModal'
import * as reducer from './reducer'
import WaveCard from '../../components/WaveCard'
import EmptyStateCard from '../../components/EmptyStateCard'
import { KeyboardStickyView } from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MergeWaveModal from '../../components/MergeWaveModal'
import WavesExplainerView from '../../components/WavesExplainerView'
import ActionMenu from '../../components/ActionMenu'
import WaveShareModal from '../../components/WaveShareModal'
import { emitAutoGroupDone, subscribeToAutoGroupDone } from '../../events/autoGroupBus'
import { subscribeToAddWave } from '../../events/waveAddBus'
import { subscribeToIdentityChange } from '../../events/identityChangeBus'
import { subscribeToUploadComplete } from '../../events/uploadBus'
import { gql } from '@apollo/client'
import UploadContext from '../../contexts/UploadContext'
import subscriptionClient from '../../subscriptionClientWs'
// Counts are loaded via listWaves GraphQL query
// import { useLocationDrift } from '../../hooks/useLocationDrift' - DISABLED per change proposal
// import { setLastTriggerLocation } from '../../utils/groupingAtom' - DISABLED with location drift trigger

const WavesHub = () => {
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const numColumns = width >= 768 ? 2 : 1

  const [uuid] = useAtom(STATE.uuid)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const [waves, setWaves] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [pageNumber, setPageNumber] = useState(0)
  const [batch, setBatch] = useState(Crypto.randomUUID())
  const [noMoreData, setNoMoreData] = useState(false)

  const [searchText, setSearchText] = useState('')
  const debouncedSearch = useDebouncedSearch(searchText)
  const searchInputRef = useRef(null)

  const [modalVisible, setModalVisible] = useState(false)
  const [newWaveName, setNewWaveName] = useState('')
  const [newWaveDescription, setNewWaveDescription] = useState('')

  // Edit modal state
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingWave, setEditingWave] = useState(null)
  const [editWaveName, setEditWaveName] = useState('')
  const [editWaveDescription, setEditWaveDescription] = useState('')
  const [updating] = useState(false)

  // Merge state
  const [mergeModalVisible, setMergeModalVisible] = useState(false)
  const [mergingWave, setMergingWave] = useState(null)

  // Selection mode state
  const [selectMode, setSelectMode] = useState(false)
  const [selectedWaveUuids, setSelectedWaveUuids] = useState(new Set())

  // Context menu state
  const [contextMenuWave, setContextMenuWave] = useState(null)

  // Share modal state
  const [shareModalWave, setShareModalWave] = useState(null)

  // Upload context
  const { enqueueCapture } = useContext(UploadContext)
  const [netAvailable] = useAtom(STATE.netAvailable)
  const bannerHeight = useAtomValue(STATE.bannerHeightAtom)

  // Auto-group location drift detection - DISABLED per change proposal
  // const { shouldTrigger, isReady: driftReady } = useLocationDrift()
  // const autoGroupTriggeredRef = useRef(false)

  const stopLoading = useRef(false)
  const hasMountedRef = useRef(false)
  const refreshRunningRef = useRef(false)

  const theme = getTheme(isDarkMode)

  const toggleWaveSelection = (waveUuid) => {
    setSelectedWaveUuids(prev => {
      const next = new Set(prev)
      if (next.has(waveUuid)) {
        next.delete(waveUuid)
      } else {
        next.add(waveUuid)
      }
      return next
    })
  }

  const exitSelectionMode = () => {
    setSelectMode(false)
    setSelectedWaveUuids(new Set())
  }

  const getTargetWave = (selectedWaves) => {
    return selectedWaves.reduce((a, b) => {
      if (a.photosCount > b.photosCount) return a
      if (b.photosCount > a.photosCount) return b
      return new Date(a.updatedAt) > new Date(b.updatedAt) ? a : b
    })
  }

  const handleCombine = () => {
    const selectedWaves = waves.filter(w => selectedWaveUuids.has(w.waveUuid))
    if (selectedWaves.length < 2) return

    const target = getTargetWave(selectedWaves)
    const sources = selectedWaves.filter(w => w.waveUuid !== target.waveUuid)
    const totalSourcePhotos = sources.reduce((sum, w) => sum + (w.photosCount || 0), 0)

    showConfirmAlert(
      `Merge ${sources.length + 1} waves?`,
      `All photos will be merged into "${target.name}". ${totalSourcePhotos} photo${totalSourcePhotos !== 1 ? 's' : ''} will be moved. ${sources.length} wave${sources.length !== 1 ? 's' : ''} will be deleted.`,
      async () => {
        try {
          const sourceUuids = sources.map(w => w.waveUuid)
          const updatedTarget = await reducer.mergeWaves({
            targetWaveUuid: target.waveUuid,
            sourceWaveUuids: sourceUuids,
            uuid
          })
          const sourceUuidSet = new Set(sourceUuids)
          setWaves(prev => prev
            .filter(w => !sourceUuidSet.has(w.waveUuid))
            .map(w => w.waveUuid === target.waveUuid
              ? { ...w, ...updatedTarget, thumbnails: w.thumbnails }
              : w
            )
          )
          exitSelectionMode()
          showSuccessToast('Waves merged successfully')
        } catch (error) {
          console.error(error)
          showErrorToast({ title: 'Error merging waves', message: error.message })
        }
      }
    )
  }

  const headerTitle = selectMode
    ? (
        <Text style={{ color: theme.TEXT_PRIMARY, fontSize: 16, fontWeight: '600' }}>
          Count: {selectedWaveUuids.size}
        </Text>
      )
    : <ScreenIconTitle screenKey='waves' />

  const headerRightSlot = selectMode
    ? (
        <TouchableOpacity
          onPress={exitSelectionMode}
          style={[
            SHARED_STYLES.interactive.headerButton,
            {
              backgroundColor: theme.INTERACTIVE_BACKGROUND,
              borderWidth: 1,
              borderColor: theme.INTERACTIVE_BORDER,
              flexDirection: 'row',
              alignItems: 'center'
            }
          ]}
        >
          <Text style={{ color: '#007AFF', fontSize: 16, fontWeight: '600' }}>
            Deselect
          </Text>
        </TouchableOpacity>
      )
    : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            onPress={() => setSelectMode(true)}
            style={[
              SHARED_STYLES.interactive.headerButton,
              {
                backgroundColor: theme.INTERACTIVE_BACKGROUND,
                borderWidth: 1,
                borderColor: theme.INTERACTIVE_BORDER,
                flexDirection: 'row',
                alignItems: 'center'
              }
            ]}
          >
            <Text style={{ color: theme.TEXT_PRIMARY, fontSize: 14, fontWeight: '600' }}>
              Select
            </Text>
          </TouchableOpacity>
        </View>
      )

  const loadWaves = useCallback(async (pageNum, currentBatch, refresh = false, searchTerm) => {
    if (stopLoading.current) return
    stopLoading.current = true
    setLoading(true)
    try {
      const data = await reducer.listWaves({
        pageNumber: pageNum,
        batch: currentBatch,
        uuid,
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
      showErrorToast({
        title: 'Error loading waves',
        message: error.message
      })
    } finally {
      stopLoading.current = false
      setLoading(false)
    }
  }, [uuid])

  // When debounced search changes, reset pagination and re-fetch
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }
    handleRefresh()
  }, [debouncedSearch])

  const handleRefresh = useCallback(async () => {
    // Guard: prevent concurrent refreshes
    if (refreshRunningRef.current) return

    refreshRunningRef.current = true

    stopLoading.current = false
    setRefreshing(true)
    setPageNumber(0)
    setNoMoreData(false)
    const newBatch = Crypto.randomUUID()
    setBatch(newBatch)

    try {
      await loadWaves(0, newBatch, true, debouncedSearch || undefined)
    } finally {
      setRefreshing(false)
      refreshRunningRef.current = false
    }
  }, [loadWaves, debouncedSearch])

  // Reload waves on focus (includes counts in GraphQL response)
  useFocusEffect(
    useCallback(() => {
      stopLoading.current = false
      handleRefresh()
    }, [handleRefresh])
  )

  const handleLoadMore = () => {
    if (!noMoreData && !loading) {
      const nextPage = pageNumber + 1
      setPageNumber(nextPage)
      loadWaves(nextPage, batch, false, debouncedSearch || undefined)
    }
  }

  const handleSaveWave = async ({ name, description }) => {
    if (!name.trim()) {
      Alert.alert('Error', 'Wave name is required')
      return
    }
    const isEditing = !!editingWave
    try {
      if (isEditing) {
        const updatedWave = await reducer.updateWave({
          waveUuid: editingWave.waveUuid,
          uuid,
          name,
          description
        })
        setWaves(prev => prev.map(w =>
          w.waveUuid === editingWave.waveUuid ? { ...updatedWave, thumbnails: w.thumbnails } : w
        ))
        setEditModalVisible(false)
        setEditingWave(null)
        showSuccessToast('Wave updated')
      } else {
        const newWave = await reducer.createWave({
          name,
          description: '',
          uuid
        })
        setWaves(prev => [{ ...newWave, thumbnails: [], photos: [] }, ...prev])
        setModalVisible(false)
        setNewWaveName('')
        setNewWaveDescription('')
        showSuccessToast('Wave created')
      }
    } catch (error) {
      console.error(error)
      showErrorToast({ title: isEditing ? 'Error updating wave' : 'Error creating wave', message: error.message })
    }
  }

  const handleDeleteWave = (waveUuid) => {
    showConfirmAlert(
      'Delete Wave',
      'Are you sure you want to delete this wave?',
      async () => {
        try {
          const waveToDelete = waves.find(w => w.waveUuid === waveUuid)
          await reducer.deleteWave({ waveUuid, uuid })
          setWaves(prev => prev.filter(w => w.waveUuid !== waveUuid))
          // Note: ungrouped count tracking removed - server handles auto-grouping
          emitAutoGroupDone()
          showSuccessToast('Wave deleted')
        } catch (error) {
          console.error(error)
          showErrorToast({ title: 'Error deleting wave', message: error.message })
        }
      }
    )
  }

  const handleEditWave = (wave) => {
    setEditingWave(wave)
    setEditWaveName(wave.name)
    setEditWaveDescription(wave.description || '')
    setEditModalVisible(true)
  }

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

  // Subscribe to photo upload + auto-grouping complete notification from server
  useEffect(() => {
    if (!uuid) return

    const PHOTO_UPLOAD_COMPLETE_SUBSCRIPTION = gql`
      subscription OnPhotoUploadComplete {
        onPhotoUploadComplete {
          photoId
          waveUuid
          photosGrouped
        }
      }
    `

    const observable = subscriptionClient.subscribe({ query: PHOTO_UPLOAD_COMPLETE_SUBSCRIPTION })
    const subscription = observable.subscribe(
      (result) => {
        console.log('[WAVES-HUB] Photo upload + auto-grouping complete:', result)
        // Refresh the entire waves feed when notification is received
        handleRefresh()
      }
    )

    // Subscribe to upload complete for waves feed refresh
    const unsubscribeUpload = subscribeToUploadComplete(() => {
      handleRefresh()
    })

    return () => {
      subscription.unsubscribe()
      unsubscribeUpload()
    }
  }, [handleRefresh, uuid])

  useEffect(() => {
    const unsubscribeAutoGroup = subscribeToAutoGroupDone(() => {
      // Auto-group completed; refresh waves feed for consistency
      setTimeout(() => {
        handleRefresh()
      }, 500)
    })
    return () => {
      unsubscribeAutoGroup()
    }
  }, [handleRefresh])

  // Auto-trigger: when location drift exceeds threshold, trigger auto-group
  // DISABLED: Location drift auto-trigger removed per change proposal.
  // Auto-grouping now only occurs after upload completes or via manual triggers.

  // Reset trigger flag when app goes to background
  // DISABLED: No longer needed since location drift auto-trigger is disabled.
  // useEffect(() => {
  //   const subscription = AppState.addEventListener('change', (state) => {
  //     if (state === 'background') {
  //       autoGroupTriggeredRef.current = false
  //     }
  //   })
  //   return () => subscription.remove()
  // }, [])

  const handleStartMerge = (sourceWave) => {
    setMergingWave(sourceWave)
    setMergeModalVisible(true)
  }

  const handleMergeTargetSelected = async (targetWave) => {
    const sourcePhotos = mergingWave?.photosCount ?? 0
    showConfirmAlert(
      `Merge "${mergingWave?.name}" into "${targetWave.name}"?`,
      `${sourcePhotos} photo${sourcePhotos !== 1 ? 's' : ''} will be moved. "${mergingWave?.name}" will be deleted.`,
      async () => {
        try {
          const updatedTarget = await reducer.mergeWaves({
            targetWaveUuid: targetWave.waveUuid,
            sourceWaveUuids: [mergingWave.waveUuid],
            uuid
          })
          setWaves(prev => prev
            .filter(w => w.waveUuid !== mergingWave.waveUuid)
            .map(w => w.waveUuid === targetWave.waveUuid
              ? { ...w, ...updatedTarget, thumbnails: w.thumbnails }
              : w
            )
          )
          showSuccessToast('Waves merged successfully')
        } catch (error) {
          console.error(error)
          showErrorToast({ title: 'Error merging waves', message: error.message })
        } finally {
          setMergingWave(null)
        }
      }
    )
  }

  const showWaveContextMenu = (wave) => {
    setContextMenuWave(wave)
  }

  const contextMenuItems = contextMenuWave
    ? [
        // Share Wave (owner + facilitator)
        ...(['owner', 'facilitator'].includes(contextMenuWave.myRole)
          ? [{
              key: 'share-wave',
              icon: 'share-variant-outline',
              label: 'Share Wave',
              onPress: () => setShareModalWave(contextMenuWave)
            }]
          : []),
        // Edit Wave (owner only)
        ...(contextMenuWave.myRole === 'owner'
          ? [{
              key: 'edit-wave',
              icon: 'pencil-outline',
              label: 'Edit Wave',
              onPress: () => handleEditWave(contextMenuWave)
            }]
          : []),
        // Merge (owner only)
        ...(contextMenuWave.myRole === 'owner'
          ? [{
              key: 'merge',
              icon: 'call-merge',
              label: 'Merge Into Another Wave...',
              onPress: () => handleStartMerge(contextMenuWave)
            }]
          : []),
        ...(contextMenuWave.myRole === 'owner' ? ['separator'] : []),
        // Delete (owner only)
        ...(contextMenuWave.myRole === 'owner'
          ? [{
              key: 'delete',
              icon: 'trash-can-outline',
              label: 'Delete Wave',
              destructive: true,
              onPress: () => handleDeleteWave(contextMenuWave.waveUuid)
            }]
          : [])
      ]
    : []

  const handleWavePress = (wave) => {
    console.log('handleWavePress:', { waveUuid: wave.waveUuid, waveName: wave.name, myRole: wave.myRole, isFrozen: wave.isFrozen })
    router.push({
      pathname: `/waves/${wave.waveUuid}`,
      params: {
        waveUuid: wave.waveUuid,
        waveName: wave.name,
        myRole: wave.myRole || '',
        isFrozen: wave.isFrozen ? '1' : '0'
      }
    })
  }

  const selectionCount = selectedWaveUuids.size

  const renderItem = ({ item, index }) => {
    return (
      <WaveCard
        wave={item}
        onPress={handleWavePress}
        onLongPress={showWaveContextMenu}
        theme={theme}
        selectMode={selectMode}
        selected={selectedWaveUuids.has(item.waveUuid)}
        onToggleSelection={toggleWaveSelection}
      />
    )
  }

  if (!netAvailable) {
    return (
      <View style={[styles.container, { backgroundColor: theme.INTERACTIVE_BACKGROUND }]}>
        <View style={{ paddingTop: bannerHeight }}>
          <AppHeader
            title={<ScreenIconTitle screenKey='waves' />}
            onBack={() => router.back()}
            rightSlot={headerRightSlot}
            loading={loading}
          />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20 }}>
          <EmptyStateCard
            icon='wifi-off'
            iconType='MaterialIcons'
            title='No Internet Connection'
            subtitle='Waves require an internet connection. Please check your connection and try again.'
          />
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.INTERACTIVE_BACKGROUND }]}>
      <View style={{ paddingTop: bannerHeight }}>
        <AppHeader
          title={headerTitle}
          onBack={() => router.back()}
          rightSlot={headerRightSlot}
          loading={loading}
        />
      </View>
      <InteractionHintBanner hasContent={waves.length > 0} />

      <FlatList
        data={waves}
        renderItem={renderItem}
        keyExtractor={item => item.waveUuid}
        numColumns={numColumns}
        key={numColumns}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={null}
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
                  onNavigateHome={() => router.navigate('/')}
                />
                )
          )
        }
      />

      {/* Create/Edit Wave Modal */}
      <EditWaveModal
        title={editingWave ? 'Edit Wave' : 'Create New Wave'}
        visible={modalVisible || editModalVisible}
        initialName={editingWave ? editWaveName : newWaveName}
        initialDescription={editingWave ? editWaveDescription : newWaveDescription}
        onCancel={() => {
          setModalVisible(false)
          setEditModalVisible(false)
          setEditingWave(null)
        }}
        onSave={handleSaveWave}
        saving={updating}
        saveLabel={editingWave ? 'Save' : 'Create'}
        theme={theme}
      />

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

      <WaveShareModal
        visible={!!shareModalWave}
        onClose={() => setShareModalWave(null)}
        wave={shareModalWave}
        uuid={uuid}
      />

      {/* Floating Combine Action Bar */}
      {selectMode && selectionCount > 0 && (
        <View style={[styles.combineBar, { backgroundColor: theme.CARD_BACKGROUND, borderTopColor: theme.INTERACTIVE_BORDER }]}>
          <TouchableOpacity
            onPress={handleCombine}
            style={[
              styles.combineButton,
              {
                opacity: selectionCount >= 2 ? 1 : 0.4,
                backgroundColor: '#007AFF'
              }
            ]}
            disabled={selectionCount < 2}
          >
            <MaterialCommunityIcons name='call-merge' size={20} color='#FFFFFF' />
            <Text style={styles.combineButtonText}>
              Combine ({selectionCount})
            </Text>
          </TouchableOpacity>
        </View>
      )}

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
  },
  combineBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    zIndex: 100
  },
  combineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28
  },
  combineButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  }
})

export default WavesHub
