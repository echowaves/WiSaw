import React from 'react'
import { View, ScrollView } from 'react-native'
import EmptyStateCard from '../../../components/EmptyStateCard'

const PhotosListEmptyState = ({
  theme,
  activeSegment,
  loading,
  stopLoading,
  photosList,
  renderCustomHeader,
  renderPendingPhotos,
  renderFooter,
  renderSearchFab,
  unreadCount,
  reload,
  updateIndex,
  isSearchActive,
  searchTerm,
  onClearSearch,
  FOOTER_HEIGHT
}) => {
  const getEmptyStateProps = () => {
    if (isSearchActive) {
      return {
        icon: 'search',
        title: `No results for '${searchTerm}'`,
        subtitle: 'Try different keywords or clear the search.',
        actionText: 'Clear Search',
        onActionPress: onClearSearch
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
            updateIndex(0)
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
        {renderSearchFab()}
        {renderFooter()}
      </View>
    )
  }
  return null
}

export default PhotosListEmptyState
