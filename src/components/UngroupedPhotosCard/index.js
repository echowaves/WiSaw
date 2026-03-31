import React, { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons'
import * as Crypto from 'expo-crypto'

import * as CONST from '../../consts'
import { requestUngroupedPhotos } from '../../screens/Waves/reducer'
import { emitAutoGroup } from '../../events/autoGroupBus'
import WavePhotoStrip from '../WavePhotoStrip'

const UngroupedPhotosCard = ({ ungroupedCount, uuid, theme }) => {
  const [initialPhotos, setInitialPhotos] = useState([])
  const batchRef = useRef(Crypto.randomUUID())
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current || !uuid) return
    fetchedRef.current = true
    requestUngroupedPhotos({ uuid, pageNumber: 0, batch: batchRef.current })
      .then(result => {
        setInitialPhotos(result.photos || [])
      })
      .catch(err => console.error('UngroupedPhotosCard fetch error:', err))
  }, [uuid])

  const fetchFn = useCallback(async (pageNumber, batch) => {
    return requestUngroupedPhotos({ uuid, pageNumber, batch })
  }, [uuid])

  return (
    <View style={[styles.card, { backgroundColor: `${CONST.MAIN_COLOR}1A`, borderColor: CONST.MAIN_COLOR }]}>
      <View style={styles.header}>
        <FontAwesome5 name='images' size={18} color={CONST.MAIN_COLOR} />
        <Text style={[styles.title, { color: theme.TEXT_PRIMARY }]}>
          Ungrouped Photos ({ungroupedCount})
        </Text>
      </View>

      <WavePhotoStrip
        initialPhotos={initialPhotos}
        fetchFn={fetchFn}
        theme={theme}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => emitAutoGroup(ungroupedCount)}
        activeOpacity={0.8}
      >
        <FontAwesome5 name='magic' size={16} color='white' style={{ marginRight: 8 }} />
        <View>
          <Text style={styles.buttonTitle}>Auto Group Into Waves</Text>
          <Text style={styles.buttonSubtitle}>You can fine-tune waves later</Text>
        </View>
      </TouchableOpacity>
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
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CONST.MAIN_COLOR,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12
  },
  buttonTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600'
  },
  buttonSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2
  }
})

export default UngroupedPhotosCard
