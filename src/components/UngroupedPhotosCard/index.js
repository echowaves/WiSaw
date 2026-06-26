import React, { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons'
import * as Crypto from 'expo-crypto'

import { requestUngroupedPhotos } from '../../screens/Waves/reducer'
import { subscribeToIdentityChange } from '../../events/identityChangeBus'
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

  return (
     <View style={[styles.card, { backgroundColor: 'rgba(234, 94, 61, 0.1)', borderColor: '#EA5E3D']}>
        <View style={styles.header}>
          <FontAwesome5 name='images' size={18} color='#EA5E3D' />
          <Text style={[styles.title, { color: theme.TEXT_PRIMARY }]}>
           Ungrouped Photos ({ungroupedCount})
          </Text>
        </View>

        <WavePhotoStrip
         initialPhotos={initialPhotos}
         fetchFn={fetchFn}
         theme={theme}
        />

        <View style={styles.infoBox}>
          <FontAwesome5 name='info-circle' size={14} color={theme.TEXT_SECONDARY} style={{ marginRight: 6 }} />
          <Text style={styles.infoText}>
            Photos will be automatically grouped into waves when you upload new photos.
          </Text>
        </View>
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
   infoBox: {
     flexDirection: 'row',
     alignItems: 'center',
     marginTop: 12,
     padding: 10,
     borderRadius: 8,
     backgroundColor: 'rgba(0,0,0,0.03)'
     },
   infoText: {
     flex: 1,
     fontSize: 12,
     color: 'rgba(0,0,0,0.5)'
     }
 })

export default UngroupedPhotosCard