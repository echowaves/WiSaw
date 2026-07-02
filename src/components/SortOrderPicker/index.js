import { useMemo } from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

/**
 * SortOrderPicker — segmented pill toggle, 2x2 grid, or arrow-toggle in a bottom-sheet modal.
 *
 * Props:
 *   visible         — boolean, whether to show
 *   onClose         — () => void, called on Done tap or overlay tap
 *   title           — string, header label (default "Sort By")
 *   mode            — "segmented" | "grid" | "arrows"
 *   sortBy          — string, current sort key
 *   sortDirection   — "asc" | "desc", current direction
 *   options         — Array<{ key, label, sortBy?, sortDirection? }>
 *   onSortChange    — ({ sortBy, sortDirection }) => void
 *   isDarkMode      — boolean
 */
const SortOrderPicker = ({
  visible,
  onClose,
  title = 'Sort By',
  mode = 'segmented',
  sortBy,
  sortDirection,
  options = [],
  onSortChange,
  isDarkMode = false
}) => {
  const styles = useMemo(() => createStyles(isDarkMode), [isDarkMode])

  const isActive = (opt) => {
    const oSortBy = opt.sortBy || sortBy
    const oDir = opt.sortDirection || sortDirection
    return oSortBy === sortBy && oDir === sortDirection
  }

  const handlePress = (opt) => {
    const newSortBy = opt.sortBy || sortBy
    const newDir = opt.sortDirection || sortDirection
    onSortChange?.({ sortBy: newSortBy, sortDirection: newDir })
  }

  if (!visible) return null

  const renderOption = (opt) => {
    const active = isActive(opt)

    if (mode === 'grid') {
      return (
        <TouchableOpacity
          key={opt.key}
          onPress={() => handlePress(opt)}
          style={[
            styles.gridCell,
            active && styles.gridCellActive,
            { borderColor: active ? '#007AFF' : (isDarkMode ? '#3A3A3C' : '#D1D1D6') }
          ]}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.gridCellLabel,
              active && styles.gridCellLabelActive
            ]}
            numberOfLines={2}
          >
            {opt.label}
          </Text>
        </TouchableOpacity>
      )
    }

    if (mode === 'arrows') {
      const oSortBy = opt.sortBy || sortBy
      const fieldActive = sortBy === oSortBy
      // Use the ACTUAL current direction (from props), not the option's default direction
      const currentDir = sortDirection === 'asc' ? 'asc' : 'desc'
      const arrowIcon = currentDir === 'asc' ? 'chevron-up' : 'chevron-down'
      const borderColor = fieldActive ? '#007AFF' : (isDarkMode ? '#3A3A3C' : '#D1D1D6')

      return (
        <TouchableOpacity
          key={opt.key}
          onPress={() => {
            const newDir = currentDir === 'asc' ? 'desc' : 'asc'
            onSortChange?.({ sortBy: oSortBy, sortDirection: newDir })
          }}
          style={[
            styles.arrowCell,
            fieldActive && styles.arrowCellActive,
            { borderColor }
          ]}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.arrowCellLabel,
              fieldActive && styles.arrowCellLabelActive
            ]}
          >
            {opt.label}
          </Text>
          <Ionicons
            name={arrowIcon}
            size={22}
            color={fieldActive ? '#007AFF' : (isDarkMode ? '#8E8E93' : '#8E8E93')}
          />
        </TouchableOpacity>
      )
    }

    // segmented mode
    const idx = options.findIndex((o) => o.key === opt.key)
    return (
      <TouchableOpacity
        key={opt.key}
        onPress={() => handlePress(opt)}
        style={[
          styles.segment,
          active && styles.segmentActive,
          idx > 0 && styles.segmentBorder
        ]}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.segmentLabel,
            active ? styles.segmentLabelActive : styles.segmentLabelInactive
          ]}
        >
          {opt.label}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.touchableArea}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={styles.sheet}>
            {/* Header */}
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose} hitSlop={10}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </View>

            {/* Content: segmented, grid, or arrows */}
            {mode === 'grid' ? (
              <View style={styles.grid}>
                {options.map(renderOption)}
              </View>
            ) : mode === 'arrows' ? (
              <View style={styles.arrowContainer}>
                {options.map(renderOption)}
              </View>
            ) : (
              <View style={styles.segmentContainer}>
                {options.map(renderOption)}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

const createStyles = (isDark) => {
  const surface = isDark ? '#1C1C1E' : '#FFFFFF'
  const trackBg = isDark ? '#2C2C2E' : '#E5E5EA'
  const activeBg = isDark ? '#3A3A3C' : '#FFFFFF'
  const textPrimary = isDark ? '#FFFFFF' : '#000000'
  const textSecondary = isDark ? '#8E8E93' : '#8E8E93'

  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)'
    },
    touchableArea: {
      flex: 1,
      justifyContent: 'flex-end'
    },
    sheet: {
      backgroundColor: surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingHorizontal: 16,
      paddingBottom: 24,
      paddingTop: 16
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: textPrimary
    },
    doneText: {
      fontSize: 17,
      fontWeight: '600',
      color: '#007AFF'
    },
    // Segmented mode
    segmentContainer: {
      flexDirection: 'row',
      backgroundColor: trackBg,
      borderRadius: 10,
      padding: 3,
      gap: 0
    },
    segment: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
      borderRadius: 8
    },
    segmentActive: {
      backgroundColor: activeBg
    },
    segmentBorder: {
      borderLeftWidth: 0.5,
      borderLeftColor: trackBg
    },
    segmentLabel: {
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center'
    },
    segmentLabelActive: {
      color: textPrimary
    },
    segmentLabelInactive: {
      color: textSecondary
    },
    // Grid mode
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10
    },
    gridCell: {
      width: '48%',
      aspectRatio: 1.4,
      borderRadius: 12,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 8,
      backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7'
    },
    gridCellActive: {
      backgroundColor: isDark ? 'rgba(0,122,255,0.15)' : 'rgba(0,122,255,0.1)'
    },
    gridCellLabel: {
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center',
      color: textSecondary
    },
    gridCellLabelActive: {
      color: textPrimary,
      fontWeight: '600'
    },
    // Arrow mode
    arrowContainer: {
      flexDirection: 'row',
      gap: 12
    },
    arrowCell: {
      flex: 1,
      height: 72,
      borderRadius: 12,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
      backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7'
    },
    arrowCellActive: {
      backgroundColor: isDark ? 'rgba(0,122,255,0.15)' : 'rgba(0,122,255,0.1)'
    },
    arrowCellLabel: {
      fontSize: 13,
      fontWeight: '500',
      color: textSecondary
    },
    arrowCellLabelActive: {
      color: textPrimary,
      fontWeight: '600'
    }
  })
}

export default SortOrderPicker