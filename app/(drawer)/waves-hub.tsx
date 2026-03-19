import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons'
import { Stack, useRouter } from 'expo-router'
import { useAtom } from 'jotai'
import AppHeader from '../../src/components/AppHeader'
import WavesHub from '../../src/screens/WavesHub'
import { SHARED_STYLES } from '../../src/theme/sharedStyles'
import { emitAutoGroup, subscribeToAutoGroupDone } from '../../src/events/autoGroupBus'
import { getUngroupedPhotosCount } from '../../src/screens/Waves/reducer'
import * as STATE from '../../src/state'

export default function WavesHubScreen() {
  const router = useRouter()
  const [uuid] = useAtom(STATE.uuid)
  const [ungroupedCount, setUngroupedCount] = useState(0)

  const fetchUngroupedCount = useCallback(async () => {
    if (!uuid) return
    try {
      const count = await getUngroupedPhotosCount({ uuid })
      setUngroupedCount(count)
    } catch (error) {
      console.error('Failed to fetch ungrouped count:', error)
    }
  }, [uuid])

  useEffect(() => {
    fetchUngroupedCount()
    const unsubscribe = subscribeToAutoGroupDone(() => {
      fetchUngroupedCount()
    })
    return unsubscribe
  }, [fetchUngroupedCount])

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <AppHeader
              onBack={() => router.back()}
              title='Waves'
              rightSlot={
                <TouchableOpacity
                  onPress={() => emitAutoGroup(ungroupedCount)}
                  style={[
                    SHARED_STYLES.interactive.headerButton,
                    {
                      backgroundColor:
                        SHARED_STYLES.theme.INTERACTIVE_BACKGROUND,
                      borderWidth: 1,
                      borderColor: SHARED_STYLES.theme.INTERACTIVE_BORDER
                    }
                  ]}
                >
                  <FontAwesome5
                    name='layer-group'
                    size={18}
                    color={SHARED_STYLES.theme.TEXT_PRIMARY}
                  />
                  {ungroupedCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {ungroupedCount > 99 ? '99+' : ungroupedCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              }
            />
          )
        }}
      />
      <WavesHub />
    </>
  )
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
})
