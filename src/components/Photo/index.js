import { router } from 'expo-router'
import { useAtom } from 'jotai'
import { useEffect, useMemo, useRef, useState } from 'react'

import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons'
import moment from 'moment'
import {
  Alert,
  InteractionManager,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

import { LinearProgress, Text as ThemedText } from '@rneui/themed'

import PropTypes from 'prop-types'

import { useEvent } from 'expo'
import { useVideoPlayer, VideoView } from 'expo-video'

import * as reducer from './reducer'

import * as friendsHelper from '../../screens/FriendsList/friends_helper'
import * as sharingHelper from '../../utils/simpleSharingHelper'

import * as CONST from '../../consts'
import * as STATE from '../../state'
import { isDarkMode } from '../../state'
import { getTheme, SHARED_STYLES } from '../../theme/sharedStyles'

import ImageView from './ImageView'

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.BACKGROUND,
      paddingTop: 16,
      paddingBottom: 40,
    },
    // Enhanced card container for all content sections
    cardContainer: {
      ...SHARED_STYLES.containers.card,
    },
    // Photo info card
    photoInfoCard: {
      ...SHARED_STYLES.containers.infoCard,
      backgroundColor: theme.CARD_BACKGROUND,
      borderColor: theme.CARD_BORDER,
    },
    headerInfo: {
      backgroundColor: 'transparent',
      padding: 0,
      margin: 0,
      borderRadius: 0,
      borderWidth: 0,
    },
    authorRow: {
      ...SHARED_STYLES.layout.spaceBetween,
      ...SHARED_STYLES.layout.separator,
    },
    authorName: {
      ...SHARED_STYLES.text.heading,
      flexShrink: 1,
      marginRight: 12,
    },
    dateText: {
      ...SHARED_STYLES.text.secondary,
      textAlign: 'right',
      flexShrink: 0,
      fontWeight: '500',
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      paddingTop: 8,
    },
    statItem: {
      ...SHARED_STYLES.interactive.statItem,
    },
    statsText: {
      ...SHARED_STYLES.interactive.statText,
    },
    // Enhanced comments section
    commentsCard: {
      ...SHARED_STYLES.containers.card,
      backgroundColor: theme.CARD_BACKGROUND,
      borderColor: theme.CARD_BORDER,
    },
    commentsHeader: {
      ...SHARED_STYLES.layout.row,
      ...SHARED_STYLES.layout.separator,
    },
    commentsTitle: {
      ...SHARED_STYLES.text.heading,
      marginLeft: 8,
    },
    commentsSection: {
      backgroundColor: 'transparent',
      margin: 0,
      borderRadius: 0,
      overflow: 'visible',
    },
    commentCard: {
      backgroundColor: theme.CARD_BACKGROUND,
      borderRadius: 16,
      marginVertical: 8,
      padding: 18,
      borderWidth: 1,
      borderColor: theme.CARD_BORDER,
      borderLeftWidth: 4,
      borderLeftColor: theme.STATUS_SUCCESS,
    },
    commentText: {
      ...SHARED_STYLES.text.primary,
      lineHeight: 24,
      marginBottom: 12,
    },
    commentMeta: {
      ...SHARED_STYLES.layout.spaceBetween,
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.CARD_BORDER,
    },
    commentAuthor: {
      ...SHARED_STYLES.text.subheading,
      color: theme.STATUS_SUCCESS,
    },
    commentDate: {
      ...SHARED_STYLES.text.caption,
    },
    addCommentCard: {
      backgroundColor: `${theme.STATUS_SUCCESS}05`,
      borderRadius: 20,
      marginVertical: 8,
      marginHorizontal: 16,
      padding: 20,
      borderWidth: 2,
      borderColor: `${theme.STATUS_SUCCESS}20`,
      borderStyle: 'dashed',
      shadowColor: theme.STATUS_SUCCESS,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    addCommentButton: {
      backgroundColor: 'transparent',
      borderRadius: 0,
      margin: 0,
      padding: 0,
      borderWidth: 0,
    },
    addCommentContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    addCommentText: {
      color: theme.STATUS_SUCCESS,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    // Enhanced AI recognition cards
    aiRecognitionContainer: {
      marginVertical: 8,
      marginHorizontal: 16,
    },
    aiRecognitionCard: {
      ...SHARED_STYLES.containers.card,
      backgroundColor: theme.CARD_BACKGROUND,
      borderColor: theme.CARD_BORDER,
    },
    aiRecognitionTitle: {
      ...SHARED_STYLES.text.heading,
      textAlign: 'center',
      marginBottom: 16,
    },
    aiRecognitionModerationTitle: {
      ...SHARED_STYLES.text.heading,
      color: theme.STATUS_ERROR,
      textAlign: 'center',
      marginBottom: 16,
    },
    aiTagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
    },
    aiTag: {
      backgroundColor: `${theme.STATUS_SUCCESS}15`,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: `${theme.STATUS_SUCCESS}30`,
      shadowColor: theme.STATUS_SUCCESS,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    aiTagText: {
      color: theme.STATUS_SUCCESS,
      fontSize: 13,
      fontWeight: '600',
    },
    aiModerationTag: {
      backgroundColor: `${theme.STATUS_ERROR}15`,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: `${theme.STATUS_ERROR}30`,
      shadowColor: theme.STATUS_ERROR,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    aiModerationTagText: {
      color: theme.STATUS_ERROR,
      fontSize: 13,
      fontWeight: '600',
    },
    // Action card styles
    actionCard: {
      ...SHARED_STYLES.containers.card,
      backgroundColor: theme.SURFACE, // Use darker surface color for action card
      marginVertical: 4,
      marginTop: 24, // Increase space from header significantly
      padding: 8,
    },
    actionHeader: {
      ...SHARED_STYLES.layout.row,
      ...SHARED_STYLES.layout.separator,
    },
    actionTitle: {
      ...SHARED_STYLES.text.subheading,
      marginLeft: 8,
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 4,
    },
    actionButton: {
      flex: 1,
      backgroundColor: theme.CARD_BACKGROUND,
      borderRadius: 12,
      paddingVertical: 8,
      paddingHorizontal: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.CARD_BORDER,
      shadowColor: theme.CARD_SHADOW,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      minHeight: 48,
    },
    actionButtonDisabled: {
      backgroundColor: theme.BACKGROUND,
      borderColor: theme.BORDER_LIGHT,
      opacity: 0.5,
      shadowOpacity: 0.1,
      elevation: 1,
    },
    actionButtonText: {
      ...SHARED_STYLES.text.caption,
      fontSize: 11,
      marginTop: 4,
      fontWeight: '600',
      textAlign: 'center',
      letterSpacing: 0.3,
      color: theme.TEXT_PRIMARY,
    },
    loadingProgress: {
      marginHorizontal: 16,
      marginVertical: 8,
      height: 4,
      borderRadius: 2,
    },
  })

const Photo = ({
  photo,
  refreshKey = 0,
  isEmbedded = false,
  onHeightMeasured,
}) => {
  const [isDark] = useAtom(isDarkMode)
  const theme = getTheme(isDark)
  const styles = createStyles(theme)

  const [uuid, setUuid] = useAtom(STATE.uuid)
  const [nickName, setNickName] = useAtom(STATE.nickName)
  const [topOffset, setTopOffset] = useAtom(STATE.topOffset)
  const [photosList, setPhotosList] = useAtom(STATE.photosList)
  const [friendsList, setFriendsList] = useAtom(STATE.friendsList)
  const [triggerSearch, setTriggerSearch] = useAtom(STATE.triggerSearch)

  // Get dynamic safe area and window dimensions
  const insets = useSafeAreaInsets()
  const dimensions = useWindowDimensions()
  const screenWidth = dimensions.width
  const screenHeight = dimensions.height || 800 // Fallback to reasonable height

  // Calculate dynamic header offset using shared function
  const headerOffset = useMemo(() => {
    // If embedded in another component (like ExpandableThumb), don't add header offset
    if (isEmbedded) {
      return 0
    }
    // For overlay headers using AppHeader with safeTopOnly,
    // we just need safe area + content height (56)
    return insets.top + 56
  }, [insets.top, isEmbedded])

  const componentIsMounted = useRef(true)

  // Create video player instance
  const videoPlayer = useVideoPlayer(
    photo?.video ? photo.videoUrl : null,
    (player) => {
      if (player && photo?.video) {
        // Configure the player
        player.loop = true // eslint-disable-line no-param-reassign
        // Don't auto-play the video - let user control playback
      }
    },
  )

  // Track video playing state
  const { isPlaying } = useEvent(videoPlayer, 'playingChange', {
    isPlaying: videoPlayer?.playing || false,
  })

  // Track video status for debugging and error handling
  const { status, error } = useEvent(videoPlayer, 'statusChange', {
    status: videoPlayer?.status || 'idle',
    error: null,
  })

  // Handle video play/pause toggle
  const handleVideoToggle = () => {
    if (videoPlayer) {
      if (isPlaying) {
        videoPlayer.pause()
      } else {
        videoPlayer.play()
      }
    }
  }

  // Optional: Handle video errors
  const handleVideoError = () => {
    if (error) {
      Toast.show({
        text1: 'Video Error',
        text2: 'Unable to play video. Please try again.',
        type: 'error',
        topOffset,
      })
    }
  }

  const [bans, setBans] = useState([])

  // const [status, setStatus] = useState({})
  const [photoDetails, setPhotoDetails] = useState(null)

  // Removed navigation as it's not used in this component

  const { width, height } = useWindowDimensions()

  // Calculate optimal photo/video dimensions - always use full screen width
  const photoDimensions = useMemo(() => {
    const topPadding = headerOffset // Use dynamic header offset
    const bottomSpace = isEmbedded ? 20 : 100 // Less bottom space when embedded
    const maxHeight = isEmbedded
      ? screenHeight * 0.6 // When embedded, use a proportion of screen height
      : screenHeight - topPadding - bottomSpace

    // Get photo dimensions or use defaults
    const photoWidth = photo?.width || 1080
    const photoHeight = photo?.height || 1080
    const aspectRatio = photoWidth / photoHeight

    // Always use full screen width
    const calculatedWidth = screenWidth
    const calculatedHeight = screenWidth / aspectRatio

    // If the calculated height exceeds the max height, scale down proportionally
    if (calculatedHeight > maxHeight) {
      const scale = maxHeight / calculatedHeight
      return {
        width: calculatedWidth * scale,
        height: maxHeight,
        aspectRatio,
      }
    }

    return {
      width: calculatedWidth,
      height: calculatedHeight,
      aspectRatio,
    }
  }, [
    screenWidth,
    screenHeight,
    headerOffset,
    photo?.width,
    photo?.height,
    isEmbedded,
  ])

  // Calculate expected total height based on content
  const calculateExpectedHeight = useMemo(() => {
    if (!isEmbedded) return null // Only calculate for embedded use

    const { height: imageHeight } = photoDimensions
    let totalHeight = imageHeight

    // Add heights for different sections
    totalHeight += 120 // Action card base height
    totalHeight += isEmbedded ? 0 : headerOffset // Header offset
    totalHeight += 40 // Bottom spacer

    // Add comment section heights if comments exist
    if (photoDetails?.comments?.length > 0) {
      totalHeight += 60 // Comments header
      totalHeight += photoDetails.comments.length * 80 // Estimated height per comment
    } else {
      totalHeight += 80 // Add comment section placeholder
    }

    // Add recognition section height if recognitions exist
    if (photoDetails?.recognitions?.length > 0) {
      totalHeight += 100 // Recognition section base
      const metaData = JSON.parse(photoDetails.recognitions[0].metaData)
      const labels = metaData.Labels || []
      const textDetections = metaData.TextDetections || []
      const moderationLabels = metaData.ModerationLabels || []

      if (labels.length > 0)
        totalHeight += 60 + Math.ceil(labels.length / 3) * 40
      if (textDetections.length > 0)
        totalHeight += 60 + textDetections.length * 30
      if (moderationLabels.length > 0)
        totalHeight += 60 + moderationLabels.length * 30
    }

    return totalHeight
  }, [
    photoDimensions,
    photoDetails?.comments?.length,
    photoDetails?.recognitions,
    isEmbedded,
    headerOffset,
  ])

  // Height calculation is now handled by onLayout callback in the main container
  // No need for complex pre-calculation since we measure actual rendered height

  useEffect(
    // use this to make the navigation to a detailed screen faster
    () => {
      const task = InteractionManager.runAfterInteractions(async () => {
        if (componentIsMounted) {
          const loadedPhotoDetails = await reducer.getPhotoDetails({
            photoId: photo?.id,
            uuid,
          })
          setPhotoDetails({
            ...loadedPhotoDetails,
            watchersCount: photo.watchersCount,
          })
        }
      })

      return () => {
        componentIsMounted.current = false
        task.cancel()
      }
    },
    [photo?.id, uuid, refreshKey],
  ) // Added refreshKey dependency to refresh comments when returning from add comment

  // useEffect(() => {
  //   if (videoRef?.current) {
  //     // console.log({ videoRef })
  //     // videoRef.current.presentFullscreenPlayer()
  //     // videoRef.current.playAsync()
  //   }
  // }, [videoRef])// eslint-disable-line react-hooks/exhaustive-deps

  const renderDateTime = (dateString) => {
    const dateTime = moment(
      new Date(dateString),
      'YYYY-MM-DD-HH-mm-ss-SSS',
    ).format('LLL')
    return dateTime
  }

  const renderCommentsStats = () => {
    const authorName = friendsHelper.getLocalContactName({
      uuid,
      friendUuid: photo.uuid,
      friendsList,
    })

    const commentsCount = photoDetails?.comments?.length || 0
    const watchersCount = photoDetails?.watchersCount || 0

    return (
      <View style={styles.photoInfoCard}>
        <View style={styles.headerInfo}>
          <View style={styles.authorRow}>
            <ThemedText
              style={styles.authorName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {authorName}
            </ThemedText>
            <ThemedText style={styles.dateText}>
              {renderDateTime(photo.createdAt)}
            </ThemedText>
          </View>

          {(commentsCount > 0 || watchersCount > 0) && (
            <View style={styles.statsRow}>
              {commentsCount > 0 && (
                <View style={styles.statItem}>
                  <FontAwesome name="comment" size={16} color="#4FC3F7" />
                  <ThemedText style={styles.statsText}>
                    {commentsCount} Comment{commentsCount !== 1 ? 's' : ''}
                  </ThemedText>
                </View>
              )}

              {watchersCount > 0 && (
                <View style={styles.statItem}>
                  <AntDesign name="star" size={16} color="#FFD700" />
                  <ThemedText style={styles.statsText}>
                    {watchersCount} Star{watchersCount !== 1 ? 's' : ''}
                  </ThemedText>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    )
  }

  const renderCommentButtons = ({ comment }) => {
    if (!comment?.hiddenButtons) {
      return (
        <View
          style={{
            position: 'absolute',
            right: 1,
            bottom: 1,
          }}
        >
          <FontAwesome
            onPress={() => {
              Alert.alert(
                'Delete Comment?',
                "This can't be undone. Are you sure? ",
                [
                  { text: 'No', onPress: () => null, style: 'cancel' },
                  {
                    text: 'Yes',
                    onPress: async () => {
                      // update commentsCount in global reduce store
                      await reducer.deleteComment({
                        photo,
                        comment,
                        uuid,
                        topOffset,
                      })
                      // bruit force reload comments to re-render in the photo details screen
                      const updatedPhotoDetails = await reducer.getPhotoDetails(
                        { photoId: photo.id, uuid },
                      )
                      setPhotoDetails({
                        ...photoDetails,
                        ...updatedPhotoDetails,
                      })
                    },
                  },
                ],
                { cancelable: true },
              )
            }}
            name="trash"
            style={{
              color: CONST.MAIN_COLOR,
            }}
            size={30}
          />
        </View>
      )
    }
    return <View />
  }

  const renderCommentsRows = () => {
    if (photoDetails?.comments && photoDetails.comments.length > 0) {
      return (
        <View style={styles.commentsCard}>
          <View style={styles.commentsSection}>
            {photoDetails?.comments.map((comment, i) => (
              <TouchableOpacity
                key={comment.id}
                onPress={() => {
                  setPhotoDetails(
                    reducer.toggleCommentButtons({
                      photoDetails,
                      commentId: comment.id,
                    }),
                  )
                }}
                activeOpacity={0.8}
              >
                <View style={styles.commentCard}>
                  <ThemedText style={styles.commentText}>
                    {comment.comment}
                  </ThemedText>

                  {!comment.hiddenButtons && (
                    <View style={styles.commentMeta}>
                      <ThemedText style={styles.commentAuthor}>
                        {friendsHelper.getLocalContactName({
                          uuid,
                          friendUuid: comment.uuid,
                          friendsList,
                        })}
                      </ThemedText>
                      <ThemedText style={styles.commentDate}>
                        {renderDateTime(comment.updatedAt)}
                      </ThemedText>
                    </View>
                  )}
                  {renderCommentButtons({ comment })}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )
    }
    return <View />
  }

  const renderAddCommentsRow = () => {
    if (!photoDetails?.comments) {
      return <ThemedText />
    }
    return (
      <View style={styles.addCommentCard}>
        <TouchableOpacity
          style={styles.addCommentButton}
          onPress={() =>
            router.push({
              pathname: '/modal-input',
              params: {
                photo: JSON.stringify(photo),
                uuid,
                topOffset,
              },
            })
          }
          activeOpacity={0.8}
        >
          <View style={styles.addCommentContent}>
            <Ionicons name="add-circle" size={28} color="#4FC3F7" />
            <ThemedText style={styles.addCommentText}>Add Comment</ThemedText>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  const renderRecognitions = () => {
    if (
      !photoDetails ||
      !photoDetails?.recognitions ||
      photoDetails?.recognitions?.length === 0
    ) {
      return <View />
    }

    const labels = JSON.parse(photoDetails?.recognitions[0].metaData).Labels
    const textDetections = JSON.parse(
      photoDetails?.recognitions[0].metaData,
    ).TextDetections?.filter((text) => text.Type === 'LINE')
    const moderationLabels = JSON.parse(
      photoDetails?.recognitions[0].metaData,
    ).ModerationLabels

    return (
      <View style={styles.aiRecognitionContainer}>
        {labels?.length > 0 && (
          <View style={styles.aiRecognitionCard}>
            <ThemedText style={styles.aiRecognitionTitle}>
              AI Recognized Tags (tap to search)
            </ThemedText>
            <View style={styles.aiTagsContainer}>
              {labels.map((label) => (
                <TouchableOpacity
                  key={label.Name}
                  style={[
                    styles.aiTag,
                    { opacity: Math.min(label.Confidence / 100 + 0.3, 1) },
                  ]}
                  onPress={() => {
                    // Trigger search using global state
                    setTriggerSearch(label.Name)
                    // Navigate back to main screen
                    router.back()
                  }}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.aiTagText}>
                    {label.Name} {Math.round(label.Confidence)}%
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {textDetections?.length > 0 && (
          <View style={styles.aiRecognitionCard}>
            <ThemedText style={styles.aiRecognitionTitle}>
              AI Recognized Text (tap to search)
            </ThemedText>
            <View style={styles.aiTagsContainer}>
              {textDetections.map((text) => (
                <TouchableOpacity
                  key={text.Id}
                  style={[
                    styles.aiTag,
                    { opacity: Math.min(text.Confidence / 100 + 0.3, 1) },
                  ]}
                  onPress={() => {
                    // Trigger search using global state
                    setTriggerSearch(text.DetectedText)
                    // Navigate back to main screen
                    router.back()
                  }}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.aiTagText}>
                    {text.DetectedText} {Math.round(text.Confidence)}%
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {moderationLabels?.length > 0 && (
          <View style={styles.aiRecognitionCard}>
            <ThemedText style={styles.aiRecognitionModerationTitle}>
              AI Moderation Tags
            </ThemedText>
            <View style={styles.aiTagsContainer}>
              {moderationLabels.map((label) => (
                <TouchableOpacity
                  key={label.Name}
                  style={[
                    styles.aiModerationTag,
                    { opacity: Math.min(label.Confidence / 100 + 0.3, 1) },
                  ]}
                  onPress={() => {
                    // Trigger search using global state
                    setTriggerSearch(label.Name)
                    // Navigate back to main screen
                    router.back()
                  }}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.aiModerationTagText}>
                    {label.Name} {Math.round(label.Confidence)}%
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    )
  }

  const isPhotoBannedByMe = () => bans.includes(photo?.id)

  const handleDelete = () => {
    if (photoDetails?.isPhotoWatched) {
      Toast.show({
        text1: 'Unable to delete Starred photo',
        text2: 'Un-Star photo first',
        type: 'error',
        topOffset,
      })
      return
    }
    Alert.alert(
      'Will delete photo for everyone!',
      "This can't be undone. Are you sure? ",
      [
        { text: 'No', onPress: () => null, style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            const deleted = await reducer.deletePhoto({
              photo,
              uuid,
              topOffset,
            })

            if (deleted) {
              setPhotosList([
                ...photosList.filter((item) => item.id !== photo.id),
              ])
            }
            router.back()
          },
        },
      ],
      { cancelable: true },
    )
  }

  const handleBan = () => {
    if (photoDetails?.isPhotoWatched) {
      Toast.show({
        text1: 'Unable to Report Starred photo',
        text2: 'Un-Star photo first',
        type: 'error',
        topOffset,
      })
      return
    }
    if (isPhotoBannedByMe()) {
      Toast.show({
        text1: 'Looks like you already Reported this Photo',
        text2: 'You can only Report same Photo once',
        type: 'error',
        topOffset,
      })
    } else {
      Alert.alert(
        'Report abusive Photo?',
        'The user who posted this photo will be banned. Are you sure?',
        [
          { text: 'No', onPress: () => null, style: 'cancel' },
          {
            text: 'Yes',
            onPress: () => reducer.banPhoto({ photo, uuid, topOffset }),
          },
        ],
        { cancelable: true },
      )
    }
  }

  const handleFlipWatch = async () => {
    try {
      if (photoDetails?.isPhotoWatched) {
        setPhotoDetails({
          ...photoDetails,
          watchersCount: await reducer.unwatchPhoto({ photo, uuid, topOffset }),
          isPhotoWatched: !photoDetails?.isPhotoWatched,
        })
      } else {
        setPhotoDetails({
          ...photoDetails,
          watchersCount: await reducer.watchPhoto({ photo, uuid, topOffset }),
          isPhotoWatched: !photoDetails?.isPhotoWatched,
        })
      }
    } catch (err) {
      Toast.show({
        text1: 'Unable to complete',
        text2: 'Network issue? Try again later',
        type: 'error',
        topOffset,
      })
    }
  }

  const renderActionCard = () => (
    <View style={styles.actionCard}>
      <View style={styles.actionButtonsContainer}>
        {/* Report/Ban button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            (photoDetails?.isPhotoWatched === undefined ||
              photoDetails?.isPhotoWatched ||
              isPhotoBannedByMe()) &&
              styles.actionButtonDisabled,
          ]}
          onPress={() => {
            if (photoDetails?.isPhotoWatched) {
              Toast.show({
                text1: 'Unable to Report Starred photo',
                text2: 'Un-Star photo first',
                type: 'error',
                topOffset,
              })
            } else {
              handleBan()
            }
          }}
          activeOpacity={0.8}
          delayPressIn={0}
          delayPressOut={0}
        >
          <FontAwesome
            name="ban"
            color={
              photoDetails?.isPhotoWatched === undefined ||
              photoDetails?.isPhotoWatched ||
              isPhotoBannedByMe()
                ? theme.TEXT_DISABLED
                : theme.STATUS_CAUTION
            }
            size={18}
          />
          <ThemedText
            style={[
              styles.actionButtonText,
              {
                color:
                  photoDetails?.isPhotoWatched === undefined ||
                  photoDetails?.isPhotoWatched ||
                  isPhotoBannedByMe()
                    ? theme.TEXT_DISABLED
                    : theme.STATUS_CAUTION,
              },
            ]}
          >
            Report
          </ThemedText>
        </TouchableOpacity>

        {/* Delete button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            (photoDetails?.isPhotoWatched === undefined ||
              photoDetails?.isPhotoWatched) &&
              styles.actionButtonDisabled,
          ]}
          onPress={() => {
            if (photoDetails?.isPhotoWatched) {
              Toast.show({
                text1: 'Unable to delete Starred photo',
                text2: 'Un-Star photo first',
                type: 'error',
                topOffset,
              })
            } else {
              handleDelete()
            }
          }}
          activeOpacity={0.8}
          delayPressIn={0}
          delayPressOut={0}
        >
          <FontAwesome
            name="trash"
            color={
              photoDetails?.isPhotoWatched === undefined ||
              photoDetails?.isPhotoWatched
                ? theme.TEXT_DISABLED
                : theme.STATUS_ERROR
            }
            size={18}
          />
          <ThemedText
            style={[
              styles.actionButtonText,
              {
                color:
                  photoDetails?.isPhotoWatched === undefined ||
                  photoDetails?.isPhotoWatched
                    ? theme.TEXT_DISABLED
                    : theme.STATUS_ERROR,
              },
            ]}
          >
            Delete
          </ThemedText>
        </TouchableOpacity>

        {/* Star button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            photoDetails?.isPhotoWatched === undefined &&
              styles.actionButtonDisabled,
          ]}
          onPress={() => handleFlipWatch()}
          activeOpacity={0.8}
          delayPressIn={0}
          delayPressOut={0}
          disabled={photoDetails?.isPhotoWatched === undefined}
        >
          <AntDesign
            name={photoDetails?.isPhotoWatched ? 'star' : 'staro'}
            color={
              photoDetails?.isPhotoWatched === undefined
                ? theme.TEXT_DISABLED
                : photoDetails?.isPhotoWatched
                  ? '#FFD700'
                  : theme.TEXT_PRIMARY
            }
            size={18}
          />
          <ThemedText
            style={[
              styles.actionButtonText,
              {
                color:
                  photoDetails?.isPhotoWatched === undefined
                    ? theme.TEXT_DISABLED
                    : photoDetails?.isPhotoWatched
                      ? '#FFD700'
                      : theme.TEXT_PRIMARY,
              },
            ]}
          >
            {photoDetails?.isPhotoWatched ? 'Starred' : 'Star'}
          </ThemedText>
        </TouchableOpacity>

        {/* Share button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            photoDetails?.isPhotoWatched === undefined &&
              styles.actionButtonDisabled,
          ]}
          onPress={() => {
            sharingHelper.sharePhoto(photo, photoDetails, topOffset)
          }}
          activeOpacity={0.8}
          delayPressIn={0}
          delayPressOut={0}
          disabled={photoDetails?.isPhotoWatched === undefined}
        >
          <Ionicons
            name="share-outline"
            color={
              photoDetails?.isPhotoWatched === undefined
                ? theme.TEXT_DISABLED
                : theme.STATUS_SUCCESS
            }
            size={18}
          />
          <ThemedText
            style={[
              styles.actionButtonText,
              {
                color:
                  photoDetails?.isPhotoWatched === undefined
                    ? theme.TEXT_DISABLED
                    : theme.STATUS_SUCCESS,
              },
            ]}
          >
            Share
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderPhotoRow = () => {
    const { width: photoWidth, height: photoHeight } = photoDimensions

    if (!photo.video) {
      return (
        <View
          style={{
            width: width,
            height: photoHeight,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.CARD_BACKGROUND,
            marginTop: 8,
            marginBottom: 8,
          }}
        >
          <ImageView width={width} height={photoHeight} photo={photo} />
        </View>
      )
    }

    return (
      <View
        style={{
          position: 'relative',
          width: width,
          height: photoHeight,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.CARD_BACKGROUND,
          marginTop: 8,
          marginBottom: 8,
        }}
      >
        <VideoView
          player={videoPlayer}
          style={{
            width: width,
            height: photoHeight,
          }}
          nativeControls={false}
          contentFit="contain"
          allowsFullscreen
          allowsPictureInPicture
        />
        {/* Custom play/pause overlay - show play when paused, pause when playing */}
        {!isPlaying && (
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: [{ translateX: -35 }, { translateY: -35 }],
              backgroundColor: 'rgba(0,0,0,0.7)',
              borderRadius: 35,
              width: 70,
              height: 70,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: 'rgba(255,255,255,0.9)',
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
            onPress={handleVideoToggle}
            activeOpacity={0.8}
          >
            <Ionicons
              name="play"
              size={36}
              color="white"
              style={{ marginLeft: 3 }} // Adjust play icon position
            />
          </TouchableOpacity>
        )}
        {/* Pause button - show when playing */}
        {isPlaying && (
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              backgroundColor: 'rgba(0,0,0,0.7)',
              borderRadius: 25,
              width: 50,
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.9)',
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }}
            onPress={handleVideoToggle}
            activeOpacity={0.8}
          >
            <Ionicons name="pause" size={24} color="white" />
          </TouchableOpacity>
        )}
        {/* Video status indicator */}
        {status === 'loading' && (
          <View
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
              backgroundColor: 'rgba(0,0,0,0.7)',
              borderRadius: 15,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <ThemedText
              style={{ color: 'white', fontSize: 12, fontWeight: '500' }}
            >
              Loading...
            </ThemedText>
          </View>
        )}
        {/* Photo dimensions info for debugging - remove in production */}
        {__DEV__ && (
          <View
            style={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              backgroundColor: 'rgba(0,0,0,0.7)',
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <ThemedText style={{ color: 'white', fontSize: 10 }}>
              {photo?.width || 'W?'} × {photo?.height || 'H?'} →{' '}
              {Math.round(photoWidth)} × {Math.round(photoHeight)}
            </ThemedText>
          </View>
        )}
      </View>
    )
  }

  return (
    <View
      style={[styles.container, { paddingTop: isEmbedded ? 0 : headerOffset }]}
      onLayout={(event) => {
        // Measure the actual rendered height and report it back when embedded
        if (isEmbedded && onHeightMeasured) {
          const { height } = event.nativeEvent.layout
          onHeightMeasured(height)
        }
      }}
    >
      {renderActionCard()}
      {photoDetails?.isPhotoWatched === undefined && (
        <LinearProgress
          color="#4FC3F7"
          style={[
            styles.loadingProgress,
            {
              marginHorizontal: 16,
              marginVertical: 0,
              height: 4,
              borderRadius: 2,
              shadowColor: '#4FC3F7',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            },
          ]}
        />
      )}
      {renderPhotoRow()}
      {renderCommentsStats()}
      {renderCommentsRows()}
      {renderAddCommentsRow()}
      {renderRecognitions()}
    </View>
  )
}

Photo.propTypes = {
  photo: PropTypes.object.isRequired,
  refreshKey: PropTypes.number,
  isEmbedded: PropTypes.bool,
  onHeightMeasured: PropTypes.func,
}

export default Photo
