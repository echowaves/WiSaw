import React, { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import FontAwesome5 from '@react-native-vector-icons/fontawesome5'
import * as Crypto from 'expo-crypto'

import {
  requestUngroupedPhotos,
  autoGroupPhotosIntoWaves,
  addPhotoToWave,
  createWave
} from '../../screens/Waves/reducer'
import { subscribeToIdentityChange } from '../../events/identityChangeBus'
import WavePhotoStrip from '../WavePhotoStrip'
import WaveSelectorModal from '../WaveSelectorModal'
import { showSuccessToast } from '../../utils/showToast'
import showErrorToast from '../../utils/showErrorToast'
import showConfirmAlert from '../../utils/showConfirmAlert'

const DEFAULT_GROUPING_LEVEL = 'CITY'

const UngroupedPhotosCard = ({
  ungroupedCount,
  uuid,
  theme,
  groupingLevel = DEFAULT_GROUPING_LEVEL,
  onGroupingComplete
}) => {
  const [initialPhotos, setInitialPhotos] = useState([])
  const batchRef = useRef(Crypto.randomUUID())
  const fetchedRef = useRef(false)

  // Selection mode + selected photo IDs
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())

  // Auto-group loading state
  const [autoGrouping, setAutoGrouping] = useState(false)

  // WaveSelectorModal visibility + mode + pending waveUuid for manual grouping
  const [selectorVisible, setSelectorVisible] = useState(false)
  const [selectorMode, setSelectorMode] = useState('existing')
  const [manualGrouping, setManualGrouping] = useState(false)

  const openCreateWave = () => { setSelectorMode('create'); setSelectorVisible(true) }
  const openExistingWave = () => { setSelectorMode('existing'); setSelectorVisible(true) }

  useEffect(() => {
    if (fetchedRef.current || !uuid) return
    fetchedRef.current = true
    requestUngroupedPhotos({ uuid, pageNumber: 0, batch: batchRef.current })
      .then(result => {
        setInitialPhotos(result.photos || [])
      })
      .catch(err => console.error('UngroupedPhotosCard fetch error:', err))
  }, [uuid])

  // Re-fetch ungrouped photos when identity changes (e.g., after first attach)
  useEffect(() => {
    if (!uuid) return
    const unsubscribe = subscribeToIdentityChange(() => {
      fetchedRef.current = false
      batchRef.current = Crypto.randomUUID()
      requestUngroupedPhotos({ uuid, pageNumber: 0, batch: batchRef.current })
        .then(result => {
          setInitialPhotos(result.photos || [])
          fetchedRef.current = true
        })
        .catch(err => console.error('UngroupedPhotosCard identity-change fetch error:', err))
    })
    return unsubscribe
  }, [uuid])

  const fetchFn = useCallback(async (pageNumber, batch) => {
    return requestUngroupedPhotos({ uuid, pageNumber, batch })
  }, [uuid])

  // ---- Selection helpers ----
  const enterSelectionMode = () => setSelectionMode(true)
  const exitSelectionMode = () => {
    setSelectionMode(false)
    setSelectedIds(new Set())
  }

  const togglePhoto = (photoId) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(photoId)) {
        next.delete(photoId)
      } else {
        next.add(photoId)
      }
      return next
    })
  }

  const selectAll = () => {
    setSelectedIds(new Set(initialPhotos.map(p => p.id)))
  }

  const canManualGroup = selectedIds.size > 0

  // ---- Manual grouping: loop addPhotoToWave over selected IDs ----
  const groupSelectedIntoWave = async (waveUuid) => {
    const ids = Array.from(selectedIds)
    setManualGrouping(true)
    try {
      for (const id of ids) {
        await addPhotoToWave({ waveUuid, photoId: id, uuid })
      }
      exitSelectionMode()
      setSelectorVisible(false)
      if (onGroupingComplete) onGroupingComplete()
    } catch (err) {
      console.error(err)
      showErrorToast({ title: 'Error grouping photos', message: err.message })
    } finally {
      setManualGrouping(false)
    }
  }

  const handleCreateWave = async (name, geo) => {
    const vars = { name, uuid }
    if (geo) {
      vars.lat = geo.lat
      vars.lon = geo.lon
      vars.radius = geo.radius
    }
    const newWave = await createWave(vars)
    await groupSelectedIntoWave(newWave.waveUuid)
    showSuccessToast('Wave created')
  }

  const handleSelectWave = async (wave) => {
    await groupSelectedIntoWave(wave.waveUuid)
    showSuccessToast('Photos added to wave')
  }

  // ---- Auto-group everything (whole pool) ----
  const handleAutoGroup = () => {
    showConfirmAlert(
      'Auto-Group Everything',
      `You have ${ungroupedCount} ungrouped photos. This will automatically group them all into waves. Continue?`,
      async () => {
        setAutoGrouping(true)
        try {
          const level = groupingLevel || DEFAULT_GROUPING_LEVEL
          // The reducer loops on hasMore internally and groups the whole pool.
          await autoGroupPhotosIntoWaves({ uuid, groupingLevel: level })
          if (onGroupingComplete) onGroupingComplete()
        } catch (err) {
          console.error(err)
          showErrorToast({ title: 'Error auto-grouping photos', message: err.message })
        } finally {
          setAutoGrouping(false)
        }
      }
    )
  }

  const selectionCount = selectedIds.size

  return (
    <View style={[styles.card, { backgroundColor: theme.CARD_BACKGROUND, borderColor: '#EA5E3D' }]}>
      <View style={styles.header}>
        <FontAwesome5 name='images' iconStyle='regular' size={18} color='#EA5E3D' />
        <Text style={[styles.title, { color: theme.TEXT_PRIMARY }]}>
          Ungrouped Photos ({ungroupedCount})
        </Text>
        <View style={styles.headerSpacer} />
        {selectionMode
          ? (
            <TouchableOpacity onPress={exitSelectionMode} style={styles.cancelButton}>
              <Text style={{ color: '#007AFF', fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
            )
          : (
            <TouchableOpacity onPress={enterSelectionMode} style={styles.selectAllButton}>
              <Text style={{ color: '#007AFF', fontWeight: '600' }}>Select photos</Text>
            </TouchableOpacity>
            )}
      </View>

      {/* Selection toolbar */}
      {selectionMode && (
        <View style={styles.toolbar}>
          <TouchableOpacity onPress={selectAll} style={styles.toolbarItem}>
            <Text style={{ color: '#007AFF', fontWeight: '600' }}>Select All</Text>
          </TouchableOpacity>
          <Text style={[styles.toolbarCount, { color: theme.TEXT_SECONDARY }]}>
            {selectionCount} selected
          </Text>
        </View>
      )}

      <WavePhotoStrip
        initialPhotos={initialPhotos}
        fetchFn={fetchFn}
        theme={theme}
        selectionMode={selectionMode}
        selected={selectedIds}
        onPhotoToggle={togglePhoto}
      />

      {/* Manual grouping actions: gated on selection */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          onPress={openCreateWave}
          disabled={!canManualGroup || manualGrouping}
          style={[styles.manualButton, {
            backgroundColor: canManualGroup ? theme.INTERACTIVE_BACKGROUND : theme.BACKGROUND_DISABLED,
            opacity: canManualGroup ? 1 : 0.5
          }]}
        >
          <Text style={{ color: canManualGroup ? '#007AFF' : theme.TEXT_SECONDARY, fontWeight: '600' }}>
            Create a wave
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openExistingWave}
          disabled={!canManualGroup || manualGrouping}
          style={[styles.manualButton, {
            backgroundColor: canManualGroup ? theme.INTERACTIVE_BACKGROUND : theme.BACKGROUND_DISABLED,
            opacity: canManualGroup ? 1 : 0.5
          }]}
        >
          <Text style={{ color: canManualGroup ? '#007AFF' : theme.TEXT_SECONDARY, fontWeight: '600' }}>
            Add to existing wave
          </Text>
        </TouchableOpacity>
      </View>

      {/* Auto-Group action: own row at the bottom with inline explanation */}
      <View style={styles.autoGroupRow}>
        <TouchableOpacity
          onPress={handleAutoGroup}
          disabled={autoGrouping}
          style={[styles.autoGroupButton, { backgroundColor: '#EA5E3D' }]}
        >
          {autoGrouping
            ? <ActivityIndicator color='#FFFFFF' />
            : <Text style={styles.autoGroupText}>Auto-Group everything</Text>}
        </TouchableOpacity>
        <Text
          numberOfLines={3}
          style={[styles.autoGroupExplanation, { color: theme.TEXT_SECONDARY }]}
        >
          Automatically groups all ungrouped photos into waves based on location.
        </Text>
      </View>

      {/* WaveSelectorModal for manual grouping (create or pick existing) */}
      <WaveSelectorModal
        visible={selectorVisible}
        onClose={() => { if (!manualGrouping) setSelectorVisible(false) }}
        onSelectWave={handleSelectWave}
        onCreateWave={handleCreateWave}
        createMode={selectorMode === 'create'}
        uuid={uuid}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    margin: 8,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    padding: 12,
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  headerSpacer: {
    flex: 1
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8
  },
  cancelButton: {
    paddingRight: 4
  },
  selectAllButton: {
    paddingLeft: 4
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  toolbarItem: {
    marginRight: 12
  },
  toolbarCount: {
    fontSize: 13,
    fontWeight: '500'
  },
  actionBar: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8
  },
  autoGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8
  },
  autoGroupButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center'
  },
  autoGroupText: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  autoGroupExplanation: {
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 16
  },
  manualButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center'
  }
})

export default UngroupedPhotosCard
