import React from 'react'
import { View, ScrollView } from 'react-native'
import EmptyStateCard from '../../../components/EmptyStateCard'
import PhotosListSearchBar from './PhotosListSearchBar'

const PhotosListEmptyState = ({
  theme,
  activeSegment,
  loading,
  stopLoading,
  photosList,
  renderCustomHeader,
  renderPendingPhotos,
  renderFooter,
  unreadCount,
  reload,
  updateIndex,
  searchTerm,
  setSearchTerm,
  searchBarRef,
  submitSearch,
  keyboardVisible,
  keyboardOffset,
  FOOTER_HEIGHT,
  activeWave,
  clearActiveWave
}) => {
  const getEmptyStateProps = () => {
    // Check if there's an active wave filter first
    if (activeWave) {
      return {
        icon: 'wave-square',
        iconType: 'FontAwesome5',
        title: `No Photos in "${activeWave.name}"`,
        subtitle: 'This wave doesn\'t have any photos yet. Add photos to this wave or clear the filter to see all photos.',
        actionText: 'Clear Wave Filter',
        onActionPress: () => {
          if (clearActiveWave) {
            clearActiveWave()
          }
        }
      }
    }

    switch (activeSegment) {
      case 0: // Global photos
        return {
          icon: 'globe',
          title: 'No Photos in Your Area',
          subtitle:
            "Be the first to share a moment! Take a photo and let others discover what's happening around you.",
          actionText: 'Take a Photo',
          onActionPress: () => {
            // TODO: Add photo taking functionality
            reload()
          }
        }
      case 1: // Starred photos
        return {
          icon: 'star',
          title: 'No Starred Content Yet',
          subtitle:
            "Start building your collection! Take photos, comment on others' posts, or star content you love.",
          actionText: 'Discover Content',
          onActionPress: () => {
            // Switch to global view to discover content
            updateIndex(0)
          }
        }
      case 2: // Search
        return {
          icon: 'search',
          title: 'No Results Found',
          subtitle: "Try different keywords or explore what's trending in your area.",
          actionText: 'Clear Search',
          onActionPress: () => {
            // Clear search input and focus, same as the clear button inside input box
            setSearchTerm('')
            if (searchBarRef.current) {
              searchBarRef.current.clear()
              searchBarRef.current.focus()
            }
            reload()
          }
        }
      default:
        return {
          icon: 'photo',
          iconType: 'MaterialIcons',
          title: 'No Photos Available',
          subtitle: 'Start your journey by taking your first photo!',
          actionText: 'Get Started',
          onActionPress: reload
        }
    }
  }

  if (photosList?.length === 0 && stopLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.HEADER_BACKGROUND }}>
        {renderCustomHeader()}
        {renderPendingPhotos()}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            justifyContent: 'center',
            paddingHorizontal: 20,
            paddingBottom: FOOTER_HEIGHT + 80
          }}
          showsVerticalScrollIndicator
        >
          <EmptyStateCard {...getEmptyStateProps()} />
        </ScrollView>
        {activeSegment === 2 && (
          <PhotosListSearchBar
            theme={theme}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSubmitSearch={submitSearch}
            keyboardVisible={keyboardVisible}
            keyboardOffset={keyboardOffset}
            autoFocus
          />
        )}
        {renderFooter()}
      </View>
    )
  }
  return null
}

export default PhotosListEmptyState
