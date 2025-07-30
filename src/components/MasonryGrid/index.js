import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useRef, useState } from 'react'
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
  const [columns, setColumns] = useState(
    Array(numColumns)
      .fill()
      .map(() => []),
  )
  const [columnHeights, setColumnHeights] = useState(Array(numColumns).fill(0))
  const scrollViewRef = useRef(null)

  // Use provided item width or calculate it based on screen width and spacing
  const itemWidth =
    propItemWidth || (width - spacing * (numColumns + 1)) / numColumns

  useEffect(() => {
    // Reset columns when data changes
    const newColumns = Array(numColumns)
      .fill()
      .map(() => [])
    const newColumnHeights = Array(numColumns).fill(0)

    // Distribute items across columns
    data.forEach((item, index) => {
      // Find the shortest column
      const shortestColumnIndex = newColumnHeights.indexOf(
        Math.min(...newColumnHeights),
      )

      // Add item to the shortest column
      newColumns[shortestColumnIndex].push({ item, index })

      // Estimate height based on image aspect ratio or use default
      const estimatedHeight = getEstimatedHeight(item, itemWidth)
      newColumnHeights[shortestColumnIndex] += estimatedHeight + spacing
    })

    setColumns(newColumns)
    setColumnHeights(newColumnHeights)
  }, [data, numColumns, itemWidth])

  const getEstimatedHeight = useCallback((item, width) => {
    // If the item has width/height info, calculate proportional height
    if (item.width && item.height) {
      return (width * item.height) / item.width
    }

    // Default height estimation - can be adjusted based on your content
    // For photos, we'll use random heights to create masonry effect
    const minHeight = width * 0.8 // 80% of width
    const maxHeight = width * 1.4 // 140% of width

    // Use item id to generate consistent "random" height
    const seed = item.id
      ? item.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
      : 0
    const randomFactor = (seed % 100) / 100

    return minHeight + (maxHeight - minHeight) * randomFactor
  }, [])

  const handleItemLayout = useCallback(
    (columnIndex, itemIndex, height) => {
      // Update column height when actual item height is measured
      setColumnHeights((prevHeights) => {
        const newHeights = [...prevHeights]
        const estimatedHeight = getEstimatedHeight(
          columns[columnIndex][itemIndex].item,
          itemWidth,
        )
        const heightDifference = height - estimatedHeight
        newHeights[columnIndex] += heightDifference
        return newHeights
      })
    },
    [columns, itemWidth, getEstimatedHeight],
  )

  const handleScroll = useCallback(
    (event) => {
      if (onScroll) {
        onScroll(event)
      }

      // Call onViewableItemsChanged if provided - implement proper viewable item tracking
      if (onViewableItemsChanged) {
        const { contentOffset, layoutMeasurement } = event.nativeEvent
        const viewableHeight = layoutMeasurement.height
        const scrollY = contentOffset.y

        // Calculate which items are currently visible
        // Since we have a masonry layout, we need to estimate based on average item height
        const averageItemHeight = itemWidth * 1.2 + spacing // Estimate average height
        const itemsPerColumn = Math.ceil(data.length / numColumns)
        const estimatedRowHeight = averageItemHeight

        // Calculate the approximate row index based on scroll position
        const currentRow = Math.floor(scrollY / estimatedRowHeight)
        const visibleRows = Math.ceil(viewableHeight / estimatedRowHeight)

        // Calculate the last visible item index
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
    [
      onScroll,
      onViewableItemsChanged,
      data.length,
      numColumns,
      itemWidth,
      spacing,
    ],
  )

  const renderColumn = (columnItems, columnIndex) => (
    <View
      key={columnIndex}
      style={{
        flex: 1,
        marginHorizontal: spacing / 2,
      }}
    >
      {columnItems.map((itemData, itemIndex) => (
        <View
          key={keyExtractor ? keyExtractor(itemData.item) : itemData.index}
          style={{ marginBottom: spacing }}
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout
            handleItemLayout(columnIndex, itemIndex, height)
          }}
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
