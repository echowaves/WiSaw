/* global __DEV__ */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { router } from 'expo-router'
import { useSetAtom } from 'jotai'
import { ExpoMasonryLayout } from 'expo-masonry-layout'
import ExpandableThumb from '../../../components/ExpandableThumb'
import ScrollToTopFob from '../../../components/ScrollToTopFob'
import { validateFrozenPhotosList, COMMENT_SECTION_HEIGHT } from '../../../utils/photoListHelpers'
import { photoDetailAtom } from '../../../state'

const SCROLL_THRESHOLD = 200
const SCROLL_DELTA_MIN = 5
const INACTIVITY_TIMEOUT = 3000

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
  removePhoto
}) => {
  const prevScrollY = useRef(0)
  const [showFob, setShowFob] = useState(false)
  const inactivityTimer = useRef(null)
  const setPhotoDetail = useSetAtom(photoDetailAtom)

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
        masonryRef.current.scrollToOffset({ offset: 0, animated: true })
      } else if (typeof masonryRef.current.scrollTo === 'function') {
        masonryRef.current.scrollTo({ y: 0, animated: true })
      }
    }
  }, [masonryRef])

  const handlePhotoPress = useCallback((item) => {
    setPhotoDetail({ photo: item, removePhoto: removePhoto || (() => {}) })
    router.push('/photo-detail')
  }, [setPhotoDetail, removePhoto])

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
    ({ item, index, dimensions, extraHeight }) => {
      const shouldShowComments = activeSegment === 1

      return (
        <ExpandableThumb
          item={item}
          index={index}
          thumbWidth={dimensions.width}
          thumbHeight={dimensions.height}
          activeSegment={activeSegment}
          showComments={shouldShowComments}
          extraHeight={extraHeight || 0}
          onPress={handlePhotoPress}
          onLongPress={onPhotoLongPress}
        />
      )
    },
    [
      activeSegment,
      handlePhotoPress,
      onPhotoLongPress
    ]
  )

  return (
    <View style={{ flex: 1 }}>
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
        columns={2}
        renderItem={renderMasonryItem}
        spacing={segmentConfig.spacing}
        getExtraHeight={getExtraHeight}
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
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={9}
        updateCellsBatchingPeriod={32}
        style={{
          ...styles.container,
          flex: 1
        }}
        contentContainerStyle={{
          paddingTop: 5,
          paddingBottom: FOOTER_HEIGHT + 20
        }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
      />
      {theme && <ScrollToTopFob visible={showFob} onPress={handleScrollToTop} theme={theme} />}
    </View>
  )
}

export default PhotosListMasonry
