import React, { useEffect, useMemo, useState } from 'react'
import {
  AppState,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View
} from 'react-native'
import { useAtomValue, useSetAtom } from 'jotai'
import { router } from 'expo-router'

import * as STATE from '../../state'
import { getTheme } from '../../theme/sharedStyles'
import AppHeader from '../../components/AppHeader'
import {
  groupingAtom,
  registerGroupingSetter,
  setGroupingEnabled,
  setGroupingLevel
} from '../../utils/groupingAtom'

const GROUPING_LEVEL_OPTIONS = [
  { key: 'DISTRICT', label: 'Near', icon: 'walk', description: 'Same district' },
  { key: 'CITY', label: 'Medium', icon: 'business', description: 'Same city' },
  { key: 'REGION', label: 'Far', icon: 'planet', description: 'Same region' },
  { key: 'COUNTRY', label: 'World', icon: 'map', description: 'Same country' }
]

export default function GroupingSettings () {
  const isDarkMode = useAtomValue(STATE.isDarkMode)
  const grouping = useAtomValue(groupingAtom)
  const setGrouping = useSetAtom(groupingAtom)
  const theme = useMemo(() => getTheme(isDarkMode), [isDarkMode])
  const styles = useMemo(() => createStyles(theme), [theme])

  // Register the Jotai setter ref so external updates propagate
  useEffect(() => {
    registerGroupingSetter(setGrouping)
  }, [])

  const [enabled, setEnabled] = useState(grouping.enabled ?? true)
  const [groupingLevel, setGroupingLevelState] = useState(grouping.groupingLevel || 'CITY')

  // Hydrate from AsyncStorage on mount + react to app foreground
  useEffect(() => {
    STATE.hydrateGroupingAtom?.().then((settings) => {
      setEnabled(settings.enabled ?? true)
      setGroupingLevelState(settings.groupingLevel || 'CITY')
    })
    const sub = AppState.addEventListener('change', () => {
      STATE.hydrateGroupingAtom?.().then((settings) => {
        setEnabled(settings.enabled ?? true)
        setGroupingLevelState(settings.groupingLevel || 'CITY')
      })
    })
    return () => sub.remove()
  }, [])

  const handleToggleEnabled = (value) => {
    setEnabled(value)
    setGroupingEnabled(value)
  }

  const handleGroupingLevelPress = (key) => {
    setGroupingLevelState(key)
    setGroupingLevel(key)
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title='Grouping Settings'
        onBack={() => router.back()}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Auto-Group Toggle */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>⚙️</Text>
            <Text style={styles.sectionTitle}>Auto-Group</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Automatically group your ungrouped photos into waves when you move to a new location.
          </Text>
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: theme.TEXT_PRIMARY }]}>Enable Auto-Group</Text>
            <Switch
              value={enabled}
              onValueChange={handleToggleEnabled}
              trackColor={{ false: theme.BORDER_DISABLED, true: theme.INTERACTIVE_PRIMARY }}
              thumbColor='#FFFFFF'
            />
          </View>
        </View>

        {/* Grouping Level Selector */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🗺️</Text>
            <Text style={styles.sectionTitle}>Grouping Level</Text>
          </View>
          <Text style={styles.sectionDescription}>
            How far should users be to be grouped into the same wave?
          </Text>
          <View style={styles.segmentContainer}>
            {GROUPING_LEVEL_OPTIONS.map((opt) => {
              const isSelected = groupingLevel === opt.key
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => handleGroupingLevelPress(opt.key)}
                  style={[
                    styles.segmentOption,
                    isSelected && styles.segmentOptionSelected,
                    {
                      borderColor: isSelected
                        ? theme.INTERACTIVE_PRIMARY
                        : theme.CARD_BORDER
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentLabel,
                      isSelected
                        ? styles.segmentLabelSelected
                        : styles.segmentLabelUnselected
                    ]}
                  >
                    {opt.label}
                  </Text>
                  <Text
                    style={[
                      styles.segmentDescription,
                      { color: theme.TEXT_SECONDARY }
                    ]}
                  >
                    {opt.description}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: theme.CARD_BACKGROUND }]}>
          <Text style={[styles.infoIcon, { color: theme.INTERACTIVE_PRIMARY }]}>ℹ️</Text>
          <Text style={[styles.infoText, { color: theme.TEXT_SECONDARY }]}>
            Auto-group triggers when you move beyond the selected field-matching and local timestamps.
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.HEADER_BACKGROUND
    },
    scroll: {
      flex: 1
    },
    scrollContent: {
      padding: 16
    },
    section: {
      marginBottom: 24
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8
    },
    sectionIcon: {
      fontSize: 22,
      marginRight: 8
    },
    sectionTitle: {
      color: theme.TEXT_PRIMARY,
      fontSize: 17,
      fontWeight: '700',
      marginLeft: 8
    },
    sectionDescription: {
      color: theme.TEXT_SECONDARY,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 12
    },
    toggleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.CARD_BACKGROUND,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.CARD_BORDER
    },
    toggleLabel: {
      fontSize: 16,
      fontWeight: '600'
    },
    segmentContainer: {
      gap: 12
    },
    segmentOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      borderRadius: 12,
      borderWidth: 1.5,
      backgroundColor: theme.CARD_BACKGROUND
    },
    segmentOptionSelected: {
      borderColor: theme.INTERACTIVE_PRIMARY,
      backgroundColor: theme.INTERACTIVE_BACKGROUND
    },
    segmentLabel: {
      fontSize: 15,
      fontWeight: '600',
      marginLeft: 10,
      minWidth: 60
    },
    segmentLabelSelected: {
      color: theme.INTERACTIVE_PRIMARY
    },
    segmentLabelUnselected: {
      color: theme.TEXT_PRIMARY
    },
    segmentDescription: {
      fontSize: 12,
      marginLeft: 'auto',
      paddingLeft: 8
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      borderRadius: 12,
      padding: 14,
      marginTop: 8,
      gap: 10
    },
    infoIcon: {
      marginTop: 2
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 19
    }
  })
