import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Stack, useRouter, useFocusEffect } from 'expo-router'
import { useAtom } from 'jotai'
import AppHeader from '../../../src/components/AppHeader'
import ActionMenu from '../../../src/components/ActionMenu'
import WavesHub from '../../../src/screens/WavesHub'
import { SHARED_STYLES, getTheme } from '../../../src/theme/sharedStyles'
import { emitAutoGroup, subscribeToAutoGroupDone } from '../../../src/events/autoGroupBus'
import { emitAddWave } from '../../../src/events/waveAddBus'
import { getUngroupedPhotosCount } from '../../../src/screens/Waves/reducer'
import * as STATE from '../../../src/state'

export default function WavesScreen() {
  const router = useRouter()
  const [uuid] = useAtom(STATE.uuid)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const [ungroupedCount, setUngroupedCount] = useState(0)
  const [sortBy, setSortBy] = useState('updatedAt')
  const [sortDirection, setSortDirection] = useState('desc')
  const [menuVisible, setMenuVisible] = useState(false)
  const theme = getTheme(isDarkMode)

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
    const unsubscribe = subscribeToAutoGroupDone(() => {
      fetchUngroupedCount()
    })
    return unsubscribe
  }, [fetchUngroupedCount])

  useFocusEffect(
    useCallback(() => {
      fetchUngroupedCount()
    }, [fetchUngroupedCount])
  )

  const autoGroupLabel =
    ungroupedCount > 0
      ? `Auto Group (${ungroupedCount} ungrouped)`
      : 'Auto Group'

  const sortOptions = [
    { label: 'Updated, Newest First', sortBy: 'updatedAt', sortDirection: 'desc', icon: 'sort-descending' },
    { label: 'Updated, Oldest First', sortBy: 'updatedAt', sortDirection: 'asc', icon: 'sort-ascending' },
    { label: 'Created, Newest First', sortBy: 'createdAt', sortDirection: 'desc', icon: 'sort-descending' },
    { label: 'Created, Oldest First', sortBy: 'createdAt', sortDirection: 'asc', icon: 'sort-ascending' },
  ]

  const menuItems = [
    {
      key: 'create',
      icon: 'plus-circle-outline',
      label: 'Create New Wave',
      onPress: () => emitAddWave()
    },
    {
      key: 'autogroup',
      icon: 'view-grid-plus-outline',
      label: autoGroupLabel,
      onPress: () => emitAutoGroup(ungroupedCount)
    },
    'separator',
    ...sortOptions.map((opt, i) => ({
      key: `sort-${i}`,
      icon: opt.icon,
      label: opt.label,
      checked: opt.sortBy === sortBy && opt.sortDirection === sortDirection,
      onPress: () => {
        if (opt.sortBy !== sortBy || opt.sortDirection !== sortDirection) {
          setSortBy(opt.sortBy)
          setSortDirection(opt.sortDirection)
        }
      }
    }))
  ]

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
                  onPress={() => setMenuVisible(true)}
                  style={[
                    SHARED_STYLES.interactive.headerButton,
                    {
                      backgroundColor:
                        theme.INTERACTIVE_BACKGROUND,
                      borderWidth: 1,
                      borderColor: theme.INTERACTIVE_BORDER,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }
                  ]}
                >
                  <MaterialCommunityIcons
                    name='dots-vertical'
                    size={22}
                    color={theme.TEXT_PRIMARY}
                  />
                  {ungroupedCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {ungroupedCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              }
            />
          )
        }}
      />
      <WavesHub ungroupedCount={ungroupedCount} sortBy={sortBy} sortDirection={sortDirection} />
      <ActionMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        items={menuItems}
      />
    </>
  )
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
})
