/* global __DEV__ */
import React, { useCallback } from 'react'
import { ExpoMasonryLayout } from 'expo-masonry-layout'
import ExpandableThumb from '../../../components/ExpandableThumb'
import { validateFrozenPhotosList } from '../../../utils/photoListHelpers'

const PhotosListMasonry = ({
  activeSegment,
  photosList,
  segmentConfig,
  onScroll,
  masonryRef,
  getCalculatedDimensions,
  isPhotoExpanded,
  searchTerm,
  uuid,
  expandedPhotoIds,
  onToggleExpand,
  updatePhotoHeight,
  onRequestEnsureVisible,
  onTriggerSearch,
  onEndReached,
  onRefresh,
  loading,
  stopLoading,
  setPageNumber,
  setExpandedPhotoIds,
  reload,
  styles,
  FOOTER_HEIGHT,
  justCollapsedId
}) => {
  // Render function for individual masonry items
  const renderMasonryItem = useCallback(
    ({ item, index, dimensions }) => {
      // Removed debug logging to reduce console noise

      // DEFENSIVE FIX: ExpoMasonryLayout sometimes bypasses getItemDimensions and provides corrupted dimensions
      // If the calculated dimensions don't match the aspect ratio, recalculate them properly
      let correctedDimensions = dimensions
      if (item.width && item.height) {
        const originalAspectRatio = item.width / item.height
        const calculatedAspectRatio = dimensions.width / dimensions.height
        const aspectRatioDifference = Math.abs(originalAspectRatio - calculatedAspectRatio)

        // If aspect ratios differ significantly (more than 5%), recalculate
        if (aspectRatioDifference > 0.05) {
          const recalculatedDimensions = getCalculatedDimensions(item)
          // eslint-disable-next-line
          if (__DEV__) {
            console.log(
              `🛠️ DIMENSIONS CORRECTION: Photo ${item.id} had corrupted dimensions ${dimensions.width}x${dimensions.height} (AR: ${calculatedAspectRatio.toFixed(3)}), correcting to ${recalculatedDimensions.width}x${recalculatedDimensions.height} (AR: ${(recalculatedDimensions.width / recalculatedDimensions.height).toFixed(3)})`
            )
          }
          correctedDimensions = recalculatedDimensions
        }
      }

      // Use ExpandableThumb for all segments
      // Show comments overlay for starred (segment 1) and search (segment 2)
      const shouldShowComments = activeSegment === 1 || activeSegment === 2
      const shouldScrollToTop = item.id === justCollapsedId

      return (
        <ExpandableThumb
          item={item}
          index={index}
          thumbWidth={correctedDimensions.width}
          thumbHeight={correctedDimensions.height}
          photosList={photosList}
          searchTerm={searchTerm}
          activeSegment={activeSegment}
          uuid={uuid}
          isExpanded={isPhotoExpanded(item.id)}
          onToggleExpand={onToggleExpand}
          expandedPhotoIds={expandedPhotoIds}
          updatePhotoHeight={updatePhotoHeight}
          onRequestEnsureVisible={onRequestEnsureVisible}
          showComments={shouldShowComments}
          onTriggerSearch={onTriggerSearch}
          shouldScrollToTop={shouldScrollToTop}
        />
      )
    },
    [
      photosList?.length,
      searchTerm,
      activeSegment,
      uuid,
      expandedPhotoIds,
      onToggleExpand,
      isPhotoExpanded,
      updatePhotoHeight,
      onTriggerSearch,
      getCalculatedDimensions,
      justCollapsedId
    ]
  )

  return (
    <ExpoMasonryLayout
      // Force remount per segment to clear internal layout/scroll caches
      key={`segment-${activeSegment}`}
      ref={masonryRef}
      data={(() => {
        // Validate photos before passing to masonry layout
        if (__DEV__) {
          validateFrozenPhotosList(photosList, 'before masonry render')

          // Removed debug logging to reduce console noise
        }
        return photosList
      })()}
      renderItem={renderMasonryItem}
      spacing={segmentConfig.spacing}
      maxItemsPerRow={segmentConfig.maxItemsPerRow}
      baseHeight={segmentConfig.baseHeight}
      aspectRatioFallbacks={segmentConfig.aspectRatioFallbacks}
      keyExtractor={(item) => `${item.id}-${isPhotoExpanded(item.id) ? 'expanded' : 'collapsed'}`}
      // Calculate dimensions dynamically based on expansion state
      getItemDimensions={(item, calculatedDimensions) => {
        // Use our unified dimension calculation
        const dynamicDimensions = getCalculatedDimensions(item)

        // Removed debug logging to reduce console noise

        return {
          width: dynamicDimensions.width,
          height: dynamicDimensions.height
        }
      }}
      onScroll={onScroll}
      onEndReached={() => {
        // Load more when user reaches the end
        if (!loading && !stopLoading) {
          setPageNumber((currentPage) => {
            const newPage = currentPage + 1
            return newPage
          })
        }
      }}
      onEndReachedThreshold={0.2}
      // Remove viewability-driven state updates to reduce re-renders
      // Add validation callback to detect mutations after masonry operations
      onLayout={() => {
        if (__DEV__) {
          // Validate photos are still frozen after layout operations
          setTimeout(() => {
            validateFrozenPhotosList(photosList, 'after masonry layout')
          }, 0)
        }
      }}
      refreshing={false}
      onRefresh={() => {
        // Collapse all expanded photos before refreshing
        setExpandedPhotoIds(new Set())
        reload()
      }}
      scrollEventThrottle={16}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={9}
      updateCellsBatchingPeriod={32}
      style={{
        ...styles.container,
        flex: 1 // Allow the scroll area to take full available height
      }}
      contentContainerStyle={{
        paddingBottom: FOOTER_HEIGHT + 20 // Add padding to ensure content is visible above footer
      }}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews
    />
  )
}

export default PhotosListMasonry
