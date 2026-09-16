import React, { useCallback, useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import Ionicons from '@react-native-vector-icons/ionicons'
import FontAwesome5 from '@react-native-vector-icons/fontawesome5'
import CachedImage from 'expo-cached-image'
import * as Haptics from 'expo-haptics'

import * as STATE from '../../state'
import { getTheme, SHARED_STYLES } from '../../theme/sharedStyles'
import * as CONST from '../../consts'
import showConfirmAlert from '../../utils/showConfirmAlert'
import showToast from '../../utils/showToast'

const DESTRUCTIVE_COLOR = '#FF3B30'

const formatCount = (count, singular, plural) =>
  count > 0 ? `${count} ${count === 1 ? singular : plural}` : null

/**
 * Queue management modal opened from the GlobalUploadBanner (3-dots button or
 * long-press). Opening the modal is the manage intent, so it is always in
 * selection mode — there is no "Select photos" / "Cancel" toggle. The
 * selection model mirrors UngroupedPhotosCard: "Delete (N)" is enabled at
 * >=1 selection, "Delete All" is enabled only at 0 selection (dimmed
 * otherwise, never hidden), and the whole-queue action is gated by a
 * confirm alert.
 *
 * The in-flight item (photoId === activeUploadId) is always shown but never
 * selectable — it renders dimmed with a spinner.
 *
 * Closing the modal (button or overlay) resumes the queue.
 */
const UploadQueueModal = ({
  visible,
  pendingPhotos = [],
  activeUploadId = null,
  clearPendingQueue,
  removePendingItem,
  resumeUploads,
  toastTopOffset = 0,
  onClose
}) => {
  const [isDark] = useAtom(STATE.isDarkMode)
  const theme = getTheme(isDark)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [deleting, setDeleting] = useState(false)

  // Selection is local and modal-scoped: reset whenever the modal opens.
  useEffect(() => {
    if (visible) {
      setSelectedIds(new Set())
      setDeleting(false)
    }
  }, [visible])

  // Prune selected ids whose items have left the queue (e.g., the in-flight
  // item finished and was removed on confirmed success).
  useEffect(() => {
    const currentIds = new Set(pendingPhotos.map((item) => item.photoId))
    setSelectedIds((prev) => {
      const pruned = new Set([...prev].filter((id) => currentIds.has(id)))
      return pruned.size === prev.size ? prev : pruned
    })
  }, [pendingPhotos])

  const imageCount = pendingPhotos.filter((item) => item.type === 'image').length
  const videoCount = pendingPhotos.filter((item) => item.type === 'video').length
  const clearBreakdown = [
    formatCount(imageCount, 'photo', 'photos'),
    formatCount(videoCount, 'video', 'videos')
  ].filter(Boolean).join(' and ') || `${pendingPhotos.length} item${pendingPhotos.length === 1 ? '' : 's'}`

  const togglePhoto = useCallback((photoId) => {
    Haptics.selectionAsync()
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(photoId)) {
        next.delete(photoId)
      } else {
        next.add(photoId)
      }
      return next
    })
  }, [])

  const handleClose = useCallback(() => {
    // A delete still running owns the flow; ignore close/overlay taps.
    if (deleting) return
    setSelectedIds(new Set())
    onClose()
    // Closing the modal resumes the queue (the single exit path).
    resumeUploads()
  }, [deleting, onClose, resumeUploads])

  const handleDeleteSelected = useCallback(async () => {
    if (selectedIds.size === 0 || deleting) return
    setDeleting(true)
    try {
      for (const item of pendingPhotos) {
        if (!selectedIds.has(item.photoId)) continue
        // eslint-disable-next-line no-await-in-loop
        await removePendingItem(item)
      }
      setSelectedIds(new Set())
      showToast('Removed from queue', {
        text2: `${selectedIds.size} item${selectedIds.size === 1 ? '' : 's'} cancelled`,
        type: 'success',
        topOffset: toastTopOffset
      })
    } catch (error) {
      console.error('Failed to remove selected items from queue', error)
      showToast('Could not remove items', {
        text2: 'The items remain in the queue. Try again.',
        type: 'error',
        topOffset: toastTopOffset
      })
    } finally {
      setDeleting(false)
    }
  }, [pendingPhotos, selectedIds, deleting, removePendingItem, toastTopOffset])

  const handleDeleteAll = useCallback(() => {
    if (selectedIds.size > 0 || deleting) return
    showConfirmAlert(
      'Clear Upload Queue',
      `Are you sure you want to cancel all ${clearBreakdown}? This cannot be undone.`,
      async () => {
        setDeleting(true)
        try {
          await clearPendingQueue()
          setSelectedIds(new Set())
          showToast('Upload queue cleared', {
            text2: 'All pending uploads have been cancelled',
            type: 'success',
            topOffset: toastTopOffset
          })
        } catch (error) {
          console.error('Failed to clear upload queue', error)
        } finally {
          setDeleting(false)
        }
      },
      { destructiveText: 'Clear All' }
    )
  }, [clearBreakdown, clearPendingQueue, selectedIds, deleting, toastTopOffset])

  const renderThumb = useCallback((item) => {
    const thumbUri = item.localThumbUrl || item.localImgUrl || item.originalCameraUrl
    if (!thumbUri) {
      return <View style={[styles.thumb, { backgroundColor: theme.INTERACTIVE_BACKGROUND }]} />
    }
    if (thumbUri.startsWith('file:')) {
      // expo-cached-image downloads via FileSystem.downloadFileAsync,
      // which rejects file:// URIs; local thumbs use the native Image.
      return <Image source={{ uri: thumbUri }} style={styles.thumb} resizeMode='cover' />
    }
    return (
      <CachedImage
        source={{ uri: thumbUri }}
        cacheKey={`${item.photoId}-queue-thumb`}
        style={styles.thumb}
        resizeMode='cover'
      />
    )
  }, [theme])

  const renderItem = useCallback(({ item }) => {
    const isActive = item.photoId === activeUploadId
    const isSelected = selectedIds.has(item.photoId)

    return (
      <TouchableOpacity
        testID={`queue-row-${item.photoId}`}
        style={[
          styles.row,
          {
            backgroundColor: theme.BACKGROUND,
            borderColor: isSelected ? CONST.MAIN_COLOR : theme.CARD_BORDER,
            opacity: isActive ? 0.55 : 1
          }
        ]}
        onPress={isActive ? undefined : () => togglePhoto(item.photoId)}
        disabled={isActive}
        activeOpacity={0.6}
      >
        {renderThumb(item)}
        <Text numberOfLines={1} style={[styles.rowLabel, { color: theme.TEXT_PRIMARY }]}>
          {item.type === 'video' ? 'Video' : 'Photo'}
          {item.unrecoverable ? ' · cannot be uploaded' : ''}
        </Text>
        {isActive
          ? <ActivityIndicator size='small' color={CONST.MAIN_COLOR} />
          : (
            <FontAwesome5
              name={isSelected ? 'check-square' : 'square'}
              iconStyle={isSelected ? 'solid' : 'regular'}
              size={20}
              color={isSelected ? CONST.MAIN_COLOR : theme.TEXT_DISABLED}
              style={styles.checkbox}
            />
            )}
      </TouchableOpacity>
    )
  }, [activeUploadId, selectedIds, renderThumb, theme, togglePhoto])

  // An empty queue disables both actions (there is nothing to delete).
  const canDeleteSelected = selectedIds.size > 0 && !deleting
  const canDeleteAll = selectedIds.size === 0 && !deleting && pendingPhotos.length > 0

  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleClose}
      >
        <TouchableOpacity
          style={[styles.modalContainer, { backgroundColor: theme.CARD_BACKGROUND }]}
          activeOpacity={1}
          onPress={() => {}}
        >
          <View style={styles.header}>
            <Text style={[SHARED_STYLES.text.subheading, styles.headerTitle, { color: theme.TEXT_PRIMARY }]}>
              Upload queue
              {selectedIds.size > 0 ? ` · ${selectedIds.size} selected` : ''}
            </Text>
            <TouchableOpacity testID='queue-close-button' onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name='close' size={24} color={theme.TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>

          {pendingPhotos.length === 0
            ? (
              <View style={styles.emptyState}>
                <Text style={{ color: theme.TEXT_SECONDARY, fontSize: 15 }}>No pending uploads</Text>
              </View>
              )
            : (
              <FlatList
                data={pendingPhotos}
                renderItem={renderItem}
                keyExtractor={(item) => item.photoId}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps='handled'
              />
              )}

          <View style={styles.footer}>
            <TouchableOpacity
              testID='queue-delete-selected-button'
              onPress={handleDeleteSelected}
              disabled={!canDeleteSelected}
              style={[
                styles.footerButton,
                {
                  backgroundColor: canDeleteSelected ? theme.INTERACTIVE_BACKGROUND : theme.BACKGROUND_DISABLED,
                  opacity: canDeleteSelected ? 1 : 0.5
                }
              ]}
            >
              <Text style={{ color: canDeleteSelected ? DESTRUCTIVE_COLOR : theme.TEXT_SECONDARY, fontWeight: '600', fontSize: 15 }}>
                Delete{canDeleteSelected ? ` (${selectedIds.size})` : ''}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID='queue-delete-all-button'
              onPress={handleDeleteAll}
              disabled={!canDeleteAll}
              style={[
                styles.footerButton,
                {
                  backgroundColor: canDeleteAll ? theme.INTERACTIVE_BACKGROUND : theme.BACKGROUND_DISABLED,
                  opacity: canDeleteAll ? 1 : 0.5
                }
              ]}
            >
              <Text style={{ color: canDeleteAll ? theme.TEXT_PRIMARY : theme.TEXT_SECONDARY, fontWeight: '600', fontSize: 15 }}>
                Delete All
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
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
    fontSize: 18,
    fontWeight: '700'
  },
  list: {
    flexGrow: 0
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 8
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 8,
    paddingRight: 12,
    marginBottom: 8,
    gap: 12
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#00000022'
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500'
  },
  checkbox: {
    marginLeft: 4
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center'
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8
  },
  footerButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center'
  }
})

export default UploadQueueModal
