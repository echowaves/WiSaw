import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  RefreshControl,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native'

const MasonryGrid = ({
  data,
  numColumns = 2,
  itemWidth: propItemWidth,
  spacing = 3,
  renderItem,
  onScroll,
  scrollEventThrottle = 16,
  refreshing = false,
  onRefresh,
  onViewableItemsChanged,
  style,
  showsVerticalScrollIndicator = false,
  keyExtractor,
}) => {
  const { width } = useWindowDimensions()
  const scrollViewRef = useRef(null)

  const itemWidth =
    propItemWidth || (width - spacing * (numColumns + 1)) / numColumns

  const getEstimatedHeight = useCallback((item) => {
    if (item.width && item.height) {
      return (itemWidth * item.height) / item.width
    }
    const minHeight = itemWidth * 0.8
    const maxHeight = itemWidth * 1.4
    const seed = item.id
      ? item.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
      : 0
    const randomFactor = (seed % 100) / 100
    return minHeight + (maxHeight - minHeight) * randomFactor
  }, [itemWidth])

  const columns = useMemo(() => {
    const newColumns = Array(numColumns).fill().map(() => [])
    const columnHeights = Array(numColumns).fill(0)

    data.forEach((item, index) => {
      const shortestColumnIndex = columnHeights.indexOf(
        Math.min(...columnHeights),
      )
      newColumns[shortestColumnIndex].push({ item, index })
      const estimatedHeight = getEstimatedHeight(item)
      columnHeights[shortestColumnIndex] += estimatedHeight + spacing
    })

    return newColumns
  }, [data, numColumns, getEstimatedHeight, spacing])

  const handleScroll = useCallback(
    (event) => {
      if (onScroll) {
        onScroll(event)
      }

      if (onViewableItemsChanged) {
        const { contentOffset, layoutMeasurement } = event.nativeEvent
        const viewableHeight = layoutMeasurement.height
        const scrollY = contentOffset.y

        const averageItemHeight = itemWidth * 1.2 + spacing
        const itemsPerColumn = Math.ceil(data.length / numColumns)
        const estimatedRowHeight = averageItemHeight

        const currentRow = Math.floor(scrollY / estimatedRowHeight)
        const visibleRows = Math.ceil(viewableHeight / estimatedRowHeight)

        const lastVisibleRow = currentRow + visibleRows
        const lastVisibleIndex = Math.min(
          lastVisibleRow * numColumns,
          data.length - 1,
        )

        onViewableItemsChanged({
          changed: [{ index: Math.max(0, lastVisibleIndex) }],
        })
      }
    },
    [onScroll, onViewableItemsChanged, data.length, numColumns, itemWidth, spacing],
  )

  const renderColumn = (columnItems, columnIndex) => (
    <View
      key={columnIndex}
      style={{
        flex: 1,
        marginHorizontal: spacing / 2,
      }}
    >
      {columnItems.map((itemData) => (
        <View
          key={keyExtractor ? keyExtractor(itemData.item, itemData.index) : itemData.index}
          style={{ marginBottom: spacing }}
        >
          {renderItem({
            item: itemData.item,
            index: itemData.index,
            columnIndex,
            itemWidth,
          })}
        </View>
      ))}
    </View>
  )

  return (
    <ScrollView
      ref={scrollViewRef}
      style={style}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      onScroll={handleScroll}
      scrollEventThrottle={scrollEventThrottle}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
    >
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: spacing / 2,
          paddingTop: spacing,
        }}
      >
        {columns.map((columnItems, columnIndex) =>
          renderColumn(columnItems, columnIndex),
        )}
      </View>
    </ScrollView>
  )
}

MasonryGrid.propTypes = {
  data: PropTypes.array.isRequired,
  numColumns: PropTypes.number,
  itemWidth: PropTypes.number,
  spacing: PropTypes.number,
  renderItem: PropTypes.func.isRequired,
  onScroll: PropTypes.func,
  scrollEventThrottle: PropTypes.number,
  refreshing: PropTypes.bool,
  onRefresh: PropTypes.func,
  onViewableItemsChanged: PropTypes.func,
  style: PropTypes.object,
  showsVerticalScrollIndicator: PropTypes.bool,
  keyExtractor: PropTypes.func,
}

export default MasonryGrid
