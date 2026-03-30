import { FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'

const PhotoActionButtons = ({
  photoDetails,
  isOwnPhoto,
  isPhotoBannedByMe,
  theme,
  toastTopOffset,
  onBan,
  onDelete,
  onFlipWatch,
  onWavePress,
  onShare
}) => {
  const styles = createStyles(theme)

  const isBookmarkStatusUnknown = photoDetails?.isPhotoWatched === undefined
  const isBookmarked = Boolean(photoDetails?.isPhotoWatched)
  let bookmarkAccentColor = theme.TEXT_PRIMARY
  if (isBookmarkStatusUnknown) {
    bookmarkAccentColor = theme.TEXT_DISABLED
  } else if (isBookmarked) {
    bookmarkAccentColor = '#FFD700'
  }

  const isBannedOrBookmarked =
    photoDetails?.isPhotoWatched === undefined ||
    photoDetails?.isPhotoWatched ||
    isPhotoBannedByMe()

  return (
    <View style={styles.actionButtonsContainer}>
      {/* Report/Ban button */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          isBannedOrBookmarked && styles.actionButtonDisabled
        ]}
        onPress={() => {
          if (photoDetails?.isPhotoWatched) {
            Toast.show({
              text1: "Can't report bookmarked photo",
              text2: 'Remove bookmark first',
              type: 'error',
              topOffset: toastTopOffset
            })
          } else {
            onBan()
          }
        }}
        activeOpacity={0.7}
        delayPressIn={0}
        delayPressOut={0}
      >
        <FontAwesome
          name='ban'
          color={isBannedOrBookmarked ? theme.TEXT_DISABLED : theme.STATUS_CAUTION}
          size={18}
        />
      </TouchableOpacity>

      {/* Delete button */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          (photoDetails?.isPhotoWatched === undefined || photoDetails?.isPhotoWatched) &&
            styles.actionButtonDisabled
        ]}
        onPress={() => {
          if (photoDetails?.isPhotoWatched) {
            Toast.show({
              text1: "Can't delete bookmarked photo",
              text2: 'Remove bookmark first',
              type: 'error',
              topOffset: toastTopOffset
            })
          } else {
            onDelete()
          }
        }}
        activeOpacity={0.7}
        delayPressIn={0}
        delayPressOut={0}
      >
        <FontAwesome
          name='trash'
          color={
            photoDetails?.isPhotoWatched === undefined || photoDetails?.isPhotoWatched
              ? theme.TEXT_DISABLED
              : theme.STATUS_ERROR
          }
          size={18}
        />
      </TouchableOpacity>

      {/* Bookmark button */}
      <TouchableOpacity
        style={[styles.actionButton, isBookmarkStatusUnknown && styles.actionButtonDisabled]}
        onPress={() => onFlipWatch()}
        activeOpacity={0.7}
        delayPressIn={0}
        delayPressOut={0}
        disabled={isBookmarkStatusUnknown}
      >
        <Ionicons
          name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
          color={bookmarkAccentColor}
          size={18}
        />
      </TouchableOpacity>

      {/* Wave button */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          !isOwnPhoto && styles.actionButtonDisabled
        ]}
        onPress={onWavePress}
        activeOpacity={0.7}
        delayPressIn={0}
        delayPressOut={0}
      >
        <FontAwesome5
          name='water'
          color={isOwnPhoto ? '#4FC3F7' : theme.TEXT_DISABLED}
          size={16}
        />
        {isOwnPhoto && (
          <Text
            numberOfLines={1}
            style={[styles.actionButtonText, { color: '#4FC3F7' }]}
          >
            {photoDetails?.waveName || 'Add to Wave'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Share button */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          photoDetails?.isPhotoWatched === undefined && styles.actionButtonDisabled
        ]}
        onPress={onShare}
        activeOpacity={0.7}
        delayPressIn={0}
        delayPressOut={0}
        disabled={photoDetails?.isPhotoWatched === undefined}
      >
        <Ionicons
          name='share-outline'
          color={
            photoDetails?.isPhotoWatched === undefined
              ? theme.TEXT_DISABLED
              : theme.STATUS_SUCCESS
          }
          size={18}
        />
      </TouchableOpacity>
    </View>
  )
}

const createStyles = (theme) =>
  StyleSheet.create({
    actionButtonsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 2
    },
    actionButton: {
      backgroundColor: `${theme.STATUS_SUCCESS}15`,
      borderRadius: 20,
      paddingHorizontal: 3,
      paddingVertical: 2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: `${theme.STATUS_SUCCESS}40`,
      shadowColor: theme.STATUS_SUCCESS,
      shadowOffset: {
        width: 0,
        height: 3
      },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
      minWidth: 72,
      height: 32,
      gap: 2
    },
    actionButtonDisabled: {
      backgroundColor: theme.BACKGROUND,
      borderColor: theme.BORDER_LIGHT,
      opacity: 0.5,
      shadowOpacity: 0.1,
      elevation: 1,
      minWidth: 32,
      borderRadius: 16
    },
    actionButtonText: {
      color: theme.STATUS_SUCCESS,
      fontSize: 13,
      fontWeight: '600',
      textAlign: 'center',
      letterSpacing: 0.3
    }
  })

export default PhotoActionButtons
