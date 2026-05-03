/* global __DEV__ */
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ExpoMasonryLayout } from 'expo-masonry-layout'
import ExpandableThumb from '../../../components/ExpandableThumb'
import Photo from '../../../components/Photo'
import PhotosListContext from '../../../contexts/PhotosListContext'
import ScrollToTopFob from '../../../components/ScrollToTopFob'
import { validateFrozenPhotosList, COMMENT_SECTION_HEIGHT } from '../../../utils/photoListHelpers'

const SCROLL_THRESHOLD = 200
const SCROLL_DELTA_MIN = 5
const INACTIVITY_TIMEOUT = 3000

const FEED_COLUMNS = { 402: 3, 440: 4, 834: 7, 1024: 9, default: 12 }

const PhotosListMasonry = ({
  activeSegment,
  photosList,
  segmentConfig,
  onScroll,
  masonryRef,
  searchTerm,
  uuid,
  onTriggerSearch,
  onEndReached,
  onRefresh,
  loading,
  stopLoading,
  onLoadMore,
  reload,
  styles,
  FOOTER_HEIGHT,
  onPhotoLongPress,
  theme,
  removePhoto,
  expandedItemIds,
  getExpandedHeight,
  toggleExpand,
  columns = FEED_COLUMNS
}) => {
  const prevScrollY = useRef(0)
  const [showFob, setShowFob] = useState(false)
  const inactivityTimer = useRef(null)
  const containerViewRef = useRef(null)

  const removePhotoContext = useMemo(() => ({ removePhoto: removePhoto || (() => {}) }), [removePhoto])

  // The masonry library overwrites item.width and item.height with layout dimensions.
  // We need to preserve the original photo dimensions for aspect-ratio calculations.
  const photosById = useMemo(() => {
    const map = new Map()
    for (const p of photosList || []) {
      if (p?.id) map.set(p.id, p)
    }
    return map
  }, [photosList])

  useEffect(() => {
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    }
  }, [])

  const handleInternalScroll = useCallback((event) => {
    const currentY = event?.nativeEvent?.contentOffset?.y || 0
    const delta = currentY - prevScrollY.current
    prevScrollY.current = currentY

    if (currentY <= SCROLL_THRESHOLD) {
      setShowFob(false)
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    } else if (delta > SCROLL_DELTA_MIN) {
      setShowFob(true)
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
      inactivityTimer.current = setTimeout(() => setShowFob(false), INACTIVITY_TIMEOUT)
    }

    if (onScroll) onScroll(event)
  }, [onScroll])

  const handleScrollToTop = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    setShowFob(false)
    if (masonryRef?.current) {
      if (typeof masonryRef.current.scrollToOffset === 'function') {
        masonryRef.current.scrollToOffset(0, { animated: true })
      } else if (typeof masonryRef.current.scrollTo === 'function') {
        masonryRef.current.scrollTo({ y: 0, animated: true })
      }
    }
  }, [masonryRef])

  const getExtraHeight = useCallback((item) => {
    if (activeSegment !== 1) return 0
    const hasComments = (item.commentsCount || 0) > 0
    const hasWatchers = (item.watchersCount || 0) > 0
    const hasLastComment = item.lastComment && item.lastComment.trim().length > 0
    if (hasComments || hasWatchers || hasLastComment) return COMMENT_SECTION_HEIGHT
    return 0
  }, [activeSegment])

  // Render function for individual masonry items
  const renderMasonryItem = useCallback(
    ({ item, index, dimensions, extraHeight, isExpanded }) => {
      // The masonry mutates item.width/height to be the layout dims; restore originals from photosList
      const originalPhoto = photosById.get(item.id) || item
      if (isExpanded) {
        return (
          <PhotosListContext.Provider value={removePhotoContext}>
            <View style={{ width: dimensions.width, overflow: 'visible' }}>
              <TouchableOpacity
                onPress={() => toggleExpand(item.id)}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  zIndex: 10,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  borderRadius: 16,
                  width: 32,
                  height: 32,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Ionicons name='close' size={20} color='white' />
              </TouchableOpacity>
              <Photo
                photo={originalPhoto}
                embedded
                containerWidth={dimensions.width}
                onRequestEnsureVisible={({ y, height }) => {
                  if (!masonryRef?.current || !containerViewRef?.current) return
                  try {
                    containerViewRef.current.measureInWindow((mx, my, mw, mh) => {
                      if (mh > 0) {
                        const elementBottom = y + height
                        const viewportBottom = my + mh
                        if (elementBottom > viewportBottom) {
                          const currentOffset = prevScrollY.current || 0
                          const scrollBy = elementBottom - viewportBottom + 60
                          if (typeof masonryRef.current.scrollToOffset === 'function') {
                            masonryRef.current.scrollToOffset(currentOffset + scrollBy, { animated: true })
                          }
                        }
                      }
                    })
                  } catch (e) {
                    // best-effort scroll
                  }
                }}
              />
            </View>
          </PhotosListContext.Provider>
        )
      }

      const shouldShowComments = activeSegment === 1

      return (
        <ExpandableThumb
          item={originalPhoto}
          index={index}
          thumbWidth={dimensions.width}
          thumbHeight={dimensions.height}
          activeSegment={activeSegment}
          showComments={shouldShowComments}
          extraHeight={extraHeight || 0}
          onPress={() => toggleExpand(item.id)}
          onLongPress={onPhotoLongPress}
        />
      )
    },
    [
      activeSegment,
      toggleExpand,
      onPhotoLongPress,
      removePhotoContext,
      photosById
    ]
  )

  return (
    <View style={{ flex: 1 }} ref={containerViewRef}>
      <ExpoMasonryLayout
        // Force remount per segment to clear internal layout/scroll caches
        key={`segment-${activeSegment}`}
        ref={masonryRef}
        data={(() => {
          // Validate photos before passing to masonry layout
          if (__DEV__) {
            validateFrozenPhotosList(photosList, 'before masonry render')
          }
          return photosList
        })()}
        layoutMode='column'
        columns={columns}
        renderItem={renderMasonryItem}
        spacing={segmentConfig.spacing}
        getExtraHeight={getExtraHeight}
        expandedItemIds={expandedItemIds}
        getExpandedHeight={getExpandedHeight}
        autoScrollOnExpand={{ animated: true, viewOffset: 8 }}
        keyExtractor={(item) => `${item.id}`}
        onScroll={handleInternalScroll}
        onEndReached={() => {
          // Load more when user reaches the end
          if (!loading && !stopLoading) {
            if (onEndReached) {
              onEndReached()
            } else if (onLoadMore) {
              onLoadMore()
            }
          }
        }}
        onEndReachedThreshold={0.2}
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
          reload()
        }}
        scrollEventThrottle={16}
        initialNumToRender={30}
        maxToRenderPerBatch={30}
        windowSize={99}
        removeClippedSubviews={false}
        updateCellsBatchingPeriod={16}
        style={{
          ...styles.container,
          flex: 1
        }}
        contentContainerStyle={{
          paddingTop: 5,
          paddingBottom: FOOTER_HEIGHT + 20
        }}
        showsVerticalScrollIndicator={false}
      />
      {theme && <ScrollToTopFob visible={showFob} onPress={handleScrollToTop} theme={theme} />}
    </View>
  )
}

export default PhotosListMasonry
