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

  const isStarStatusUnknown = photoDetails?.isPhotoWatched === undefined
  const isStarred = Boolean(photoDetails?.isPhotoWatched)
  let starAccentColor = theme.TEXT_PRIMARY
  if (isStarStatusUnknown) {
    starAccentColor = theme.TEXT_DISABLED
  } else if (isStarred) {
    starAccentColor = '#FFD700'
  }

  const isBannedOrStarred =
    photoDetails?.isPhotoWatched === undefined ||
    photoDetails?.isPhotoWatched ||
    isPhotoBannedByMe()

  return (
    <View style={styles.actionButtonsContainer}>
      {/* Report/Ban button */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          isBannedOrStarred && styles.actionButtonDisabled
        ]}
        onPress={() => {
          if (photoDetails?.isPhotoWatched) {
            Toast.show({
              text1: 'Unable to Report Starred photo',
              text2: 'Un-Star photo first',
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
          color={isBannedOrStarred ? theme.TEXT_DISABLED : theme.STATUS_CAUTION}
          size={18}
        />
        {!isBannedOrStarred && (
          <Text
            numberOfLines={1}
            style={[styles.actionButtonText, { color: theme.STATUS_CAUTION }]}
          >
            Report
          </Text>
        )}
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
              text1: 'Unable to delete Starred photo',
              text2: 'Un-Star photo first',
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
        {!(photoDetails?.isPhotoWatched === undefined || photoDetails?.isPhotoWatched) && (
          <Text
            numberOfLines={1}
            style={[styles.actionButtonText, { color: theme.STATUS_ERROR }]}
          >
            Delete
          </Text>
        )}
      </TouchableOpacity>

      {/* Star button */}
      <TouchableOpacity
        style={[styles.actionButton, isStarStatusUnknown && styles.actionButtonDisabled]}
        onPress={() => onFlipWatch()}
        activeOpacity={0.7}
        delayPressIn={0}
        delayPressOut={0}
        disabled={isStarStatusUnknown}
      >
        <Ionicons
          name={isStarred ? 'star' : 'star-outline'}
          color={starAccentColor}
          size={18}
        />
        {!isStarStatusUnknown && (
          <Text
            numberOfLines={1}
            style={[styles.actionButtonText, { color: starAccentColor }]}
          >
            {isStarred ? 'Starred' : 'Star'}
          </Text>
        )}
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
        {photoDetails?.isPhotoWatched !== undefined && (
          <Text
            numberOfLines={1}
            style={[styles.actionButtonText, { color: theme.STATUS_SUCCESS }]}
          >
            Share
          </Text>
        )}
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
