import React, { useEffect, useState, useCallback } from 'react'
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
} from 'react-native'
import { useAtom } from 'jotai'
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

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
        uuid: null
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
        uuid,
      })
      setWaves(prev => [newWave, ...prev])
      setModalVisible(false)
      setNewWaveName('')
      setNewWaveDescription('')
      Toast.show({
        type: 'success',
        text1: 'Wave created',
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

  const renderItem = ({ item }) => {
    const isActive = activeWave?.waveUuid === item.waveUuid
    const isOwner = item.createdBy === uuid

    return (
      <TouchableOpacity
        style={[styles.waveItem, isActive && styles.activeWaveItem]}
        onPress={() => toggleActiveWave(item)}
      >
        <View style={styles.waveContent}>
          <Text style={[styles.waveName, isActive && styles.activeWaveText]}>{item.name}</Text>
          {item.description ? (
            <Text style={[styles.waveDescription, isActive && styles.activeWaveText]}>{item.description}</Text>
          ) : null}
          <Text style={[styles.waveMeta, isActive && styles.activeWaveText]}>
            Created by {item.createdBy === uuid ? 'You' : 'Someone else'}
          </Text>
        </View>
        {isOwner && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteWave(item.waveUuid)}
          >
            <MaterialIcons name="delete" size={24} color={isActive ? theme.TEXT_PRIMARY : theme.STATUS_ERROR} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    )
  }

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

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Wave</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Wave Name"
              placeholderTextColor={theme.TEXT_SECONDARY}
              value={newWaveName}
              onChangeText={setNewWaveName}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
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
                {creating ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>Create</Text>
                )}
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
    backgroundColor: theme.INTERACTIVE_BACKGROUND,
  },
  listContent: {
    paddingVertical: 16,
  },
  waveItem: {
    backgroundColor: theme.CARD_BACKGROUND,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: isDark ? 1.5 : 0,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
  },
  activeWaveItem: {
    backgroundColor: CONST.MAIN_COLOR,
    borderColor: CONST.MAIN_COLOR,
  },
  waveContent: {
    flex: 1,
  },
  waveName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.TEXT_PRIMARY,
    marginBottom: 4,
  },
  waveDescription: {
    fontSize: 14,
    color: theme.TEXT_SECONDARY,
    marginBottom: 4,
  },
  waveMeta: {
    fontSize: 12,
    color: theme.TEXT_SECONDARY,
    fontStyle: 'italic',
  },
  activeWaveText: {
    color: '#FFF',
  },
  deleteButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.CARD_BACKGROUND,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.TEXT_PRIMARY,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: theme.BACKGROUND,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: theme.TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: theme.BORDER_LIGHT,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: theme.STATUS_ERROR,
    marginRight: 10,
  },
  createButton: {
    backgroundColor: CONST.MAIN_COLOR,
    marginLeft: 10,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
})

export default Waves
