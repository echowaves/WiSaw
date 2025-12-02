import React, { useEffect, useState, useCallback, useRef, memo } from 'react'
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
  Animated
} from 'react-native'
import { useAtom } from 'jotai'
import { FontAwesome5 } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PanGestureHandler, State } from 'react-native-gesture-handler'
import * as Haptics from 'expo-haptics'

import * as STATE from '../../state'
import * as CONST from '../../consts'
import { getTheme, SHARED_STYLES } from '../../theme/sharedStyles'
import * as reducer from './reducer'
import EmptyStateCard from '../../components/EmptyStateCard'
import { subscribeToAddWave } from '../../events/waveAddBus'
import { saveActiveWave } from '../../utils/waveStorage'

const Waves = () => {
  const [uuid] = useAtom(STATE.uuid)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const [activeWave, setActiveWave] = useAtom(STATE.activeWave)

  const [waves, setWaves] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [pageNumber, setPageNumber] = useState(0)
  const [batch, setBatch] = useState(String(Math.random()))
  const [noMoreData, setNoMoreData] = useState(false)

  const [modalVisible, setModalVisible] = useState(false)
  const [newWaveName, setNewWaveName] = useState('')
  const [newWaveDescription, setNewWaveDescription] = useState('')
  const [creating, setCreating] = useState(false)

  // Edit modal state
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingWave, setEditingWave] = useState(null)
  const [editWaveName, setEditWaveName] = useState('')
  const [editWaveDescription, setEditWaveDescription] = useState('')
  const [updating, setUpdating] = useState(false)

  const theme = getTheme(isDarkMode)
  const insets = useSafeAreaInsets()

  const styles = createStyles(theme, insets, isDarkMode)

  const handleAddWave = useCallback(() => {
    setModalVisible(true)
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeToAddWave(() => {
      handleAddWave()
    })

    return unsubscribe
  }, [handleAddWave])

  const loadWaves = useCallback(async (pageNum, currentBatch, refresh = false) => {
    if (loading) return
    setLoading(true)
    try {
      const data = await reducer.listWaves({
        pageNumber: pageNum,
        batch: currentBatch,
        uuid
      })
      
      if (refresh) {
        setWaves(data.waves)
      } else {
        setWaves(prev => [...prev, ...data.waves])
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
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadWaves(0, String(Math.random()), true)
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    setPageNumber(0)
    const newBatch = String(Math.random())
    setBatch(newBatch)
    loadWaves(0, newBatch, true)
  }

  const handleLoadMore = () => {
    if (!noMoreData && !loading) {
      const nextPage = pageNumber + 1
      setPageNumber(nextPage)
      loadWaves(nextPage, batch)
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
      setWaves(prev => [newWave, ...prev])
      setModalVisible(false)
      setNewWaveName('')
      setNewWaveDescription('')
      Toast.show({
        type: 'success',
        text1: 'Wave created'
      })
    } catch (error) {
      console.error(error)
      Toast.show({
        type: 'error',
        text1: 'Error creating wave',
        text2: error.message
      })
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteWave = async (waveId) => {
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
              await reducer.deleteWave({ waveUuid: waveId, uuid })
              setWaves(prev => prev.filter(w => w.waveUuid !== waveId))
              if (activeWave?.waveUuid === waveId) {
                setActiveWave(null)
                saveActiveWave(null)
              }
              Toast.show({
                type: 'success',
                text1: 'Wave deleted'
              })
            } catch (error) {
              console.error(error)
              Toast.show({
                type: 'error',
                text1: 'Error deleting wave',
                text2: error.message
              })
            }
          }
        }
      ]
    )
  }

  const toggleActiveWave = (wave) => {
    if (activeWave?.waveUuid === wave.waveUuid) {
      setActiveWave(null)
      saveActiveWave(null)
    } else {
      setActiveWave(wave)
      saveActiveWave(wave)
    }
  }

  // Placeholder handler for sharing a wave
  const handleShareWave = async ({ waveUuid, waveName }) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    // TODO: Implement actual share functionality
    Toast.show({
      type: 'info',
      text1: 'Share Wave',
      text2: `Sharing "${waveName}" - Coming soon!`,
      visibilityTime: 2000
    })
  }

  // Handler for editing a wave
  const handleEditWave = ({ waveUuid, waveName, waveDescription }) => {
    setEditingWave({ waveUuid, name: waveName, description: waveDescription })
    setEditWaveName(waveName)
    setEditWaveDescription(waveDescription || '')
    setEditModalVisible(true)
  }

  // Handler to save edited wave
  const handleSaveEditWave = async () => {
    if (!editWaveName.trim()) {
      Alert.alert('Error', 'Wave name is required')
      return
    }
    setUpdating(true)
    try {
      // TODO: Implement actual update API call
      // await reducer.updateWave({ waveUuid: editingWave.waveUuid, name: editWaveName, description: editWaveDescription, uuid })
      setWaves(prev => prev.map(w =>
        w.waveUuid === editingWave.waveUuid
          ? { ...w, name: editWaveName, description: editWaveDescription }
          : w
      ))
      // Update activeWave if it's the one being edited
      if (activeWave?.waveUuid === editingWave.waveUuid) {
        const updatedWave = { ...activeWave, name: editWaveName, description: editWaveDescription }
        setActiveWave(updatedWave)
        saveActiveWave(updatedWave)
      }
      setEditModalVisible(false)
      setEditingWave(null)
      Toast.show({
        type: 'success',
        text1: 'Wave updated'
      })
    } catch (error) {
      console.error(error)
      Toast.show({
        type: 'error',
        text1: 'Error updating wave',
        text2: error.message
      })
    } finally {
      setUpdating(false)
    }
  }

  // WaveItem component with swipe gestures (similar to FriendItem in FriendsList)
  const WaveItem = memo(({ wave }) => {
    const isActive = activeWave?.waveUuid === wave.waveUuid
    const isOwner = wave.createdBy === uuid

    // Animation values
    const translateX = useRef(new Animated.Value(0)).current
    const currentTranslateXRef = useRef(0)
    const gestureStartOffsetRef = useRef(0)
    const [isSwipeOpen, setIsSwipeOpen] = useState(false)

    // Keep current value in a ref to compute offsets across gestures
    useEffect(() => {
      const id = translateX.addListener(({ value }) => {
        currentTranslateXRef.current = value
      })
      return () => {
        translateX.removeListener(id)
      }
    }, [translateX])

    const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

    const handleSwipeGesture = (event) => {
      if (!isOwner) return // Don't allow swipe for non-owners

      const { translationX, state } = event.nativeEvent

      // When a new gesture begins, capture current offset so we continue from it
      if (state === State.BEGAN) {
        gestureStartOffsetRef.current = currentTranslateXRef.current || 0
        return
      }

      // Update position continuously while swiping (onGestureEvent has no state)
      if (state === undefined || state === State.ACTIVE) {
        // Desired position is prior offset + live translation
        const desired = gestureStartOffsetRef.current + translationX
        translateX.setValue(clamp(desired, -80, 160))
      } else if (state === State.END || state === State.CANCELLED) {
        // Determine if swipe should be open or closed
        const final = gestureStartOffsetRef.current + translationX
        if (final > 80) {
          // Open right swipe action (share/edit)
          Animated.spring(translateX, {
            toValue: 160,
            useNativeDriver: false,
            tension: 100,
            friction: 8
          }).start()
          setIsSwipeOpen(true)
        } else if (final < -40) {
          // Open left swipe action (delete)
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: false,
            tension: 100,
            friction: 8
          }).start()
          setIsSwipeOpen(true)
        } else {
          // Close the swipe action
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: false,
            tension: 100,
            friction: 8
          }).start()
          setIsSwipeOpen(false)
        }
      }
    }

    // Animated stripes (RIGHT SWIPE): sequential expansion
    // Green (share) grows first from 8px to 80px as you swipe 0->80px,
    // Yellow (edit) stays visible at 8px and starts growing only after green is full.
    const shareStripeWidth = translateX.interpolate({
      inputRange: [0, 80, 160],
      outputRange: [8, 80, 80],
      extrapolate: 'clamp'
    })
    const editStripeWidth = translateX.interpolate({
      inputRange: [0, 80, 160],
      outputRange: [8, 8, 80],
      extrapolate: 'clamp'
    })

    // Fade in content (icon + text) when there's enough space
    const shareContentOpacity = translateX.interpolate({
      inputRange: [0, 24, 40],
      outputRange: [0, 0, 1],
      extrapolate: 'clamp'
    })
    const editContentOpacity = translateX.interpolate({
      inputRange: [0, 96, 112, 128],
      outputRange: [0, 0, 0, 1],
      extrapolate: 'clamp'
    })

    // Increase left padding when actions are minimized (at rest)
    const contentPaddingLeft = translateX.interpolate({
      inputRange: [-80, 0, 160],
      outputRange: [16, 28, 16],
      extrapolate: 'clamp'
    })

    // Show left overlay stripes only for right-swipe (hide on left-swipe)
    const leftOverlayOpacity = translateX.interpolate({
      inputRange: [-1, 0, 160],
      outputRange: [0, 1, 1],
      extrapolate: 'clamp'
    })

    // LEFT SWIPE: Expand delete stripe width from 8 -> 80 while content stays put
    const deleteStripeWidth = translateX.interpolate({
      inputRange: [-80, 0],
      outputRange: [80, 8],
      extrapolate: 'clamp'
    })
    const deleteContentOpacity = translateX.interpolate({
      inputRange: [-80, -56, -40, 0],
      outputRange: [1, 1, 0, 0],
      extrapolate: 'clamp'
    })

    // Show action backgrounds only when swiping starts to avoid showing through when minimized
    const rightActionsOpacity = translateX.interpolate({
      inputRange: [-80, 0, 10, 160],
      outputRange: [0, 0, 1, 1],
      extrapolate: 'clamp'
    })
    const leftActionsOpacity = translateX.interpolate({
      inputRange: [-80, -10, 0, 160],
      outputRange: [1, 1, 0, 0],
      extrapolate: 'clamp'
    })

    const closeSwipe = () => {
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: false,
        tension: 100,
        friction: 8
      }).start(() => {
        currentTranslateXRef.current = 0
        gestureStartOffsetRef.current = 0
      })
      setIsSwipeOpen(false)
    }

    const handleShareAction = () => {
      closeSwipe()
      handleShareWave({
        waveUuid: wave.waveUuid,
        waveName: wave.name
      })
    }

    const handleEditAction = () => {
      closeSwipe()
      handleEditWave({
        waveUuid: wave.waveUuid,
        waveName: wave.name,
        waveDescription: wave.description
      })
    }

    const handleDeleteAction = () => {
      closeSwipe()
      handleDeleteWave(wave.waveUuid)
    }

    return (
      <View style={styles.waveItemContainer}>
        {/* Right Swipe Action Background - Share and Edit (only for owners) */}
        {isOwner && (
          <Animated.View
            style={[styles.rightSwipeAction, { opacity: rightActionsOpacity }]}
            pointerEvents='box-none'
          >
            <TouchableOpacity
              style={[styles.swipeActionButton, styles.shareAction]}
              onPress={handleShareAction}
              activeOpacity={0.7}
            >
              <FontAwesome5 name='share-alt' size={18} color='white' />
              <Text style={styles.swipeActionText}>Share{'\n'}Wave</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.swipeActionButton, styles.editAction]}
              onPress={handleEditAction}
              activeOpacity={0.7}
            >
              <FontAwesome5 name='edit' size={18} color='white' />
              <Text style={styles.swipeActionText}>Edit{'\n'}Wave</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Left Swipe Action Background - Delete (only for owners) */}
        {isOwner && (
          <Animated.View
            style={[styles.leftSwipeAction, { opacity: leftActionsOpacity }]}
            pointerEvents='box-none'
          >
            <TouchableOpacity
              style={[styles.swipeActionButton, styles.deleteAction]}
              onPress={handleDeleteAction}
              activeOpacity={0.7}
            >
              <FontAwesome5 name='trash' size={18} color='white' />
              <Text style={styles.swipeActionText}>Delete{'\n'}Wave</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Main Wave Item */}
        <PanGestureHandler
          onGestureEvent={handleSwipeGesture}
          onHandlerStateChange={handleSwipeGesture}
          enabled={isOwner}
          activeOffsetX={[-20, 20]}
          failOffsetY={[-20, 20]}
          shouldCancelWhenOutside
        >
          <Animated.View
            style={[
              styles.waveItem,
              isActive && styles.activeWaveItem,
              {
                transform: [
                  {
                    translateX: translateX.interpolate({
                      inputRange: [-80, 0, 160],
                      outputRange: [0, 0, 160],
                      extrapolate: 'clamp'
                    })
                  }
                ]
              }
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                if (isSwipeOpen) {
                  closeSwipe()
                  return
                }
                toggleActiveWave(wave)
              }}
              onLongPress={() => {
                if (isSwipeOpen) {
                  closeSwipe()
                  return
                }
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              }}
              activeOpacity={0.9}
              style={{ flex: 1 }}
            >
              <Animated.View style={[styles.waveContent, { paddingLeft: isOwner ? contentPaddingLeft : 16 }]}>
                <View style={styles.waveHeader}>
                  <View style={styles.waveInfo}>
                    <Text style={[styles.waveName, isActive && styles.activeWaveText]} numberOfLines={1} ellipsizeMode='tail'>
                      {wave.name}
                    </Text>
                    {wave.description
                      ? (
                        <Text style={[styles.waveDescription, isActive && styles.activeWaveText]} numberOfLines={2} ellipsizeMode='tail'>
                          {wave.description}
                        </Text>
                        )
                      : null}
                    <Text style={[styles.waveMeta, isActive && styles.activeWaveText]}>
                      {isActive ? '✓ Active • ' : ''}Created by {isOwner ? 'You' : 'Someone else'}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        </PanGestureHandler>

        {/* Overlay stripes that hint at swipe actions and expand with swipe */}
        {isOwner && (
          <>
            {/* Left edge (for right swipe -> share/edit) */}
            <Animated.View
              pointerEvents='none'
              style={[styles.stripeOverlayLeft, { opacity: leftOverlayOpacity }]}
            >
              <View style={{ flexDirection: 'row', height: '100%' }}>
                <Animated.View
                  style={[styles.shareAction, { width: shareStripeWidth, height: '100%' }]}
                >
                  <Animated.View
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: shareContentOpacity
                    }}
                  >
                    <FontAwesome5 name='share-alt' size={18} color='white' />
                    <Text style={styles.swipeActionText}>Share{'\n'}Wave</Text>
                  </Animated.View>
                </Animated.View>
                <Animated.View
                  style={[styles.editAction, { width: editStripeWidth, height: '100%' }]}
                >
                  <Animated.View
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: editContentOpacity
                    }}
                  >
                    <FontAwesome5 name='edit' size={18} color='white' />
                    <Text style={styles.swipeActionText}>Edit{'\n'}Wave</Text>
                  </Animated.View>
                </Animated.View>
              </View>
            </Animated.View>

            {/* Right edge (for left swipe -> delete) */}
            <Animated.View
              pointerEvents='auto'
              style={[styles.stripeOverlayRight, { width: deleteStripeWidth }]}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onPress={handleDeleteAction}
                activeOpacity={0.7}
              >
                <Animated.View
                  style={{
                    alignItems: 'center',
                    opacity: deleteContentOpacity
                  }}
                >
                  <FontAwesome5 name='trash' size={18} color='white' />
                  <Text style={styles.swipeActionText}>Delete{'\n'}Wave</Text>
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>
          </>
        )}
      </View>
    )
  })

  const renderItem = ({ item }) => <WaveItem wave={item} />

  return (
    <View style={styles.container}>
      <FlatList
        data={waves}
        renderItem={renderItem}
        keyExtractor={item => item.waveUuid}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading && (
            <EmptyStateCard
              icon='water'
              iconType='FontAwesome5'
              title='No Waves Yet'
              subtitle='Create your first wave to start sharing photos with a specific group of people.'
              actionText='Create a Wave'
              onActionPress={() => setModalVisible(true)}
              iconColor={theme.TEXT_PRIMARY}
            />
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Wave</Text>

            <TextInput
              style={styles.input}
              placeholder='Wave Name'
              placeholderTextColor={theme.TEXT_SECONDARY}
              value={newWaveName}
              onChangeText={setNewWaveName}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder='Description (optional)'
              placeholderTextColor={theme.TEXT_SECONDARY}
              value={newWaveDescription}
              onChangeText={setNewWaveDescription}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={handleCreateWave}
                disabled={creating}
              >
                {creating
                  ? <ActivityIndicator color='#FFF' />
                  : <Text style={styles.buttonText}>Create</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Wave Modal */}
      <Modal
        animationType='slide'
        transparent
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Wave</Text>

            <TextInput
              style={styles.input}
              placeholder='Wave Name'
              placeholderTextColor={theme.TEXT_SECONDARY}
              value={editWaveName}
              onChangeText={setEditWaveName}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder='Description (optional)'
              placeholderTextColor={theme.TEXT_SECONDARY}
              value={editWaveDescription}
              onChangeText={setEditWaveDescription}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setEditModalVisible(false)
                  setEditingWave(null)
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={handleSaveEditWave}
                disabled={updating}
              >
                {updating
                  ? <ActivityIndicator color='#FFF' />
                  : <Text style={styles.buttonText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const createStyles = (theme, insets, isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.INTERACTIVE_BACKGROUND
  },
  listContent: {
    paddingVertical: 16
  },
  // Container for wave item with swipe actions (matches FriendsList)
  waveItemContainer: {
    backgroundColor: theme.CARD_BACKGROUND,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 20,
    overflow: 'visible',
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: isDark ? 1.5 : 0,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'transparent'
  },
  waveItem: {
    backgroundColor: theme.CARD_BACKGROUND,
    flex: 1,
    position: 'relative',
    zIndex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 0
  },
  activeWaveItem: {
    backgroundColor: CONST.MAIN_COLOR,
    borderColor: CONST.MAIN_COLOR
  },
  waveContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flex: 1
  },
  waveHeader: {
    ...SHARED_STYLES.layout.spaceBetween
  },
  waveInfo: {
    marginRight: 12,
    flex: 1
  },
  waveName: {
    ...SHARED_STYLES.text.subheading,
    fontSize: 16,
    marginBottom: 4
  },
  waveDescription: {
    ...SHARED_STYLES.text.secondary,
    fontSize: 14,
    marginBottom: 4
  },
  waveMeta: {
    fontSize: 12,
    color: theme.TEXT_SECONDARY,
    fontStyle: 'italic'
  },
  activeWaveText: {
    color: '#FFF'
  },
  // Swipe action styles (matches FriendsList)
  rightSwipeAction: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    width: 160,
    zIndex: 0
  },
  leftSwipeAction: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    width: 80,
    zIndex: 0
  },
  stripeOverlayLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    overflow: 'hidden',
    width: 160,
    zIndex: 2
  },
  stripeOverlayRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    backgroundColor: theme.STATUS_ERROR,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    width: 80,
    zIndex: 2
  },
  swipeActionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: '100%'
  },
  shareAction: {
    backgroundColor: theme.STATUS_SUCCESS,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20
  },
  editAction: {
    backgroundColor: theme.STATUS_EDIT,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20
  },
  deleteAction: {
    backgroundColor: theme.STATUS_ERROR,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20
  },
  swipeActionText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center'
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: theme.CARD_BACKGROUND,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.TEXT_PRIMARY,
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    backgroundColor: theme.BACKGROUND,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: theme.TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: theme.BORDER_LIGHT
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelButton: {
    backgroundColor: theme.STATUS_ERROR,
    marginRight: 10
  },
  createButton: {
    backgroundColor: CONST.MAIN_COLOR,
    marginLeft: 10
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16
  }
})

export default Waves
