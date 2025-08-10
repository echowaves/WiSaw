import { router } from 'expo-router'
import { useAtom } from 'jotai'
import { useEffect, useRef, useState } from 'react'

import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons'
import moment from 'moment'
import {
  Alert,
  InteractionManager,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import Toast from 'react-native-toast-message'

import { LinearProgress, Text } from '@rneui/themed'

import PropTypes from 'prop-types'

import { useEvent } from 'expo'
import { useVideoPlayer, VideoView } from 'expo-video'

import * as reducer from './reducer'

import * as friendsHelper from '../../screens/FriendsList/friends_helper'
import * as sharingHelper from '../../utils/simpleSharingHelper'

import * as CONST from '../../consts'
import * as STATE from '../../state'

import ImageView from './ImageView'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    position: 'relative',
    height: '100%',
    paddingTop: 120, // Increased padding to prevent header overlap
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  contentContainer: {
    backgroundColor: '#0A0A0A',
    paddingBottom: 40,
  },
  // Enhanced card container for all content sections
  cardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    marginVertical: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // Photo info card
  photoInfoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerInfo: {
    backgroundColor: 'transparent',
    padding: 0,
    margin: 0,
    borderRadius: 0,
    borderWidth: 0,
  },
  authorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  authorName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    flexShrink: 1,
    marginRight: 12,
  },
  dateText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
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
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statsText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  // Enhanced comments section
  commentsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  commentsTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  commentsSection: {
    backgroundColor: 'transparent',
    margin: 0,
    borderRadius: 0,
    overflow: 'visible',
  },
  commentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    marginVertical: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderLeftWidth: 4,
    borderLeftColor: '#4FC3F7',
  },
  commentText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
    fontWeight: '400',
  },
  commentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  commentAuthor: {
    color: '#4FC3F7',
    fontSize: 14,
    fontWeight: '600',
  },
  commentDate: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '500',
  },
  addCommentCard: {
    backgroundColor: 'rgba(79, 195, 247, 0.05)',
    borderRadius: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(79, 195, 247, 0.2)',
    borderStyle: 'dashed',
    shadowColor: '#4FC3F7',
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
    color: '#4FC3F7',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  aiRecognitionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  aiRecognitionModerationTitle: {
    color: '#FF6B6B',
    fontSize: 18,
    fontWeight: '700',
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
    backgroundColor: 'rgba(79, 195, 247, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(79, 195, 247, 0.3)',
    shadowColor: '#4FC3F7',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  aiTagText: {
    color: '#4FC3F7',
    fontSize: 13,
    fontWeight: '600',
  },
  aiModerationTag: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  aiModerationTagText: {
    color: '#FF6B6B',
    fontSize: 13,
    fontWeight: '600',
  },
  // Action card styles
  actionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    marginVertical: 4,
    marginHorizontal: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    minHeight: 42,
  },
  actionButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionButtonText: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  loadingProgress: {
    marginHorizontal: 16,
    marginVertical: 8,
    height: 4,
    borderRadius: 2,
  },
})

const Photo = ({ photo, refreshKey = 0 }) => {
  const [uuid, setUuid] = useAtom(STATE.uuid)
  const [nickName, setNickName] = useAtom(STATE.nickName)
  const [topOffset, setTopOffset] = useAtom(STATE.topOffset)
  const [photosList, setPhotosList] = useAtom(STATE.photosList)
  const [friendsList, setFriendsList] = useAtom(STATE.friendsList)
  const [triggerSearch, setTriggerSearch] = useAtom(STATE.triggerSearch)

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

  // Calculate optimal photo/video dimensions based on photo's actual dimensions
  const calculatePhotoDimensions = () => {
    const screenWidth = width
    const headerSpace = 120 // Account for header padding
    const footerSpace = 120 // Account for footer
    const contentSpace = 200 // Account for photo info and other content
    const availableHeight = height - headerSpace - footerSpace - contentSpace
    const minHeight = 300 // Minimum height for photos
    const maxHeight = Math.max(availableHeight * 0.8, minHeight) // Maximum 80% of available screen height

    // Get photo dimensions or use defaults
    const photoWidth = photo?.width || 1080
    const photoHeight = photo?.height || 1080
    const aspectRatio = photoWidth / photoHeight

    // Always use full screen width as the starting point
    let calculatedWidth = screenWidth
    let calculatedHeight = screenWidth / aspectRatio

    // If calculated height is too small, scale up to minimum
    if (calculatedHeight < minHeight) {
      calculatedHeight = minHeight
      calculatedWidth = minHeight * aspectRatio
      // If width exceeds screen width after scaling, use screen width and recalculate height
      if (calculatedWidth > screenWidth) {
        calculatedWidth = screenWidth
        calculatedHeight = screenWidth / aspectRatio
      }
    }

    // If calculated height is too large, scale down to maximum
    if (calculatedHeight > maxHeight) {
      calculatedHeight = maxHeight
      calculatedWidth = maxHeight * aspectRatio
      // If width is less than screen width, scale up to use full width
      if (calculatedWidth < screenWidth) {
        calculatedWidth = screenWidth
        calculatedHeight = screenWidth / aspectRatio
      }
    }

    return {
      width: calculatedWidth,
      height: calculatedHeight,
      aspectRatio,
    }
  }

  const photoDimensions = calculatePhotoDimensions()

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
            <Text
              style={styles.authorName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {authorName}
            </Text>
            <Text style={styles.dateText}>
              {renderDateTime(photo.createdAt)}
            </Text>
          </View>

          {(commentsCount > 0 || watchersCount > 0) && (
            <View style={styles.statsRow}>
              {commentsCount > 0 && (
                <View style={styles.statItem}>
                  <FontAwesome name="comment" size={16} color="#4FC3F7" />
                  <Text style={styles.statsText}>
                    {commentsCount} Comment{commentsCount !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}

              {watchersCount > 0 && (
                <View style={styles.statItem}>
                  <AntDesign name="star" size={16} color="#FFD700" />
                  <Text style={styles.statsText}>
                    {watchersCount} Star{watchersCount !== 1 ? 's' : ''}
                  </Text>
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
    if (photoDetails?.comments) {
      return (
        <View style={styles.commentsCard}>
          <View style={styles.commentsHeader}>
            <FontAwesome name="comment" size={20} color="#4FC3F7" />
            <Text style={styles.commentsTitle}>
              Comments ({photoDetails.comments.length})
            </Text>
          </View>
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
                  <Text style={styles.commentText}>{comment.comment}</Text>

                  {!comment.hiddenButtons && (
                    <View style={styles.commentMeta}>
                      <Text style={styles.commentAuthor}>
                        {friendsHelper.getLocalContactName({
                          uuid,
                          friendUuid: comment.uuid,
                          friendsList,
                        })}
                      </Text>
                      <Text style={styles.commentDate}>
                        {renderDateTime(comment.updatedAt)}
                      </Text>
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
      return <Text />
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
            <Text style={styles.addCommentText}>Add Comment</Text>
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
            <Text style={styles.aiRecognitionTitle}>
              AI Recognized Tags (tap to search)
            </Text>
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
                  <Text style={styles.aiTagText}>
                    {label.Name} {Math.round(label.Confidence)}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {textDetections?.length > 0 && (
          <View style={styles.aiRecognitionCard}>
            <Text style={styles.aiRecognitionTitle}>
              AI Recognized Text (tap to search)
            </Text>
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
                  <Text style={styles.aiTagText}>
                    {text.DetectedText} {Math.round(text.Confidence)}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {moderationLabels?.length > 0 && (
          <View style={styles.aiRecognitionCard}>
            <Text style={styles.aiRecognitionModerationTitle}>
              AI Moderation Tags
            </Text>
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
                  <Text style={styles.aiModerationTagText}>
                    {label.Name} {Math.round(label.Confidence)}%
                  </Text>
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
        {/* Star button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            photoDetails?.isPhotoWatched === undefined &&
              styles.actionButtonDisabled,
          ]}
          onPress={() => handleFlipWatch()}
          activeOpacity={0.7}
          disabled={photoDetails?.isPhotoWatched === undefined}
        >
          <AntDesign
            name={photoDetails?.isPhotoWatched ? 'star' : 'staro'}
            color={
              photoDetails?.isPhotoWatched === undefined
                ? '#666666'
                : photoDetails?.isPhotoWatched
                  ? '#FFD700'
                  : '#FFFFFF'
            }
            size={18}
          />
          <Text
            style={[
              styles.actionButtonText,
              {
                color:
                  photoDetails?.isPhotoWatched === undefined
                    ? '#666666'
                    : photoDetails?.isPhotoWatched
                      ? '#FFD700'
                      : '#FFFFFF',
              },
            ]}
          >
            {photoDetails?.isPhotoWatched ? 'Starred' : 'Star'}
          </Text>
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
          activeOpacity={0.7}
          disabled={photoDetails?.isPhotoWatched === undefined}
        >
          <Ionicons
            name="share-outline"
            color={
              photoDetails?.isPhotoWatched === undefined ? '#666666' : '#4FC3F7'
            }
            size={18}
          />
          <Text
            style={[
              styles.actionButtonText,
              {
                color:
                  photoDetails?.isPhotoWatched === undefined
                    ? '#666666'
                    : '#4FC3F7',
              },
            ]}
          >
            Share
          </Text>
        </TouchableOpacity>

        {/* Report/Ban button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            (photoDetails?.isPhotoWatched === undefined ||
              photoDetails?.isPhotoWatched ||
              isPhotoBannedByMe()) &&
              styles.actionButtonDisabled,
          ]}
          onPress={() => handleBan()}
          activeOpacity={0.7}
          disabled={
            photoDetails?.isPhotoWatched === undefined ||
            photoDetails?.isPhotoWatched ||
            isPhotoBannedByMe()
          }
        >
          <FontAwesome
            name="ban"
            color={
              photoDetails?.isPhotoWatched === undefined ||
              photoDetails?.isPhotoWatched ||
              isPhotoBannedByMe()
                ? '#666666'
                : '#FF9500'
            }
            size={16}
          />
          <Text
            style={[
              styles.actionButtonText,
              {
                color:
                  photoDetails?.isPhotoWatched === undefined ||
                  photoDetails?.isPhotoWatched ||
                  isPhotoBannedByMe()
                    ? '#666666'
                    : '#FF9500',
              },
            ]}
          >
            Report
          </Text>
        </TouchableOpacity>

        {/* Delete button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            (photoDetails?.isPhotoWatched === undefined ||
              photoDetails?.isPhotoWatched) &&
              styles.actionButtonDisabled,
          ]}
          onPress={() => handleDelete()}
          activeOpacity={0.7}
          disabled={
            photoDetails?.isPhotoWatched === undefined ||
            photoDetails?.isPhotoWatched
          }
        >
          <FontAwesome
            name="trash"
            color={
              photoDetails?.isPhotoWatched === undefined ||
              photoDetails?.isPhotoWatched
                ? '#666666'
                : '#FF6B6B'
            }
            size={16}
          />
          <Text
            style={[
              styles.actionButtonText,
              {
                color:
                  photoDetails?.isPhotoWatched === undefined ||
                  photoDetails?.isPhotoWatched
                    ? '#666666'
                    : '#FF6B6B',
              },
            ]}
          >
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderFooter = () => (
    <SafeAreaView
      style={{
        paddingBottom: 20,
        backgroundColor: 'transparent',
      }}
    />
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
            backgroundColor: '#000',
            marginTop: 8,
            marginBottom: 8,
          }}
        >
          <ImageView width={photoWidth} height={photoHeight} photo={photo} />
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
          backgroundColor: '#000',
          marginTop: 8,
          marginBottom: 8,
        }}
      >
        <VideoView
          player={videoPlayer}
          style={{
            width: photoWidth,
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
            <Text style={{ color: 'white', fontSize: 12, fontWeight: '500' }}>
              Loading...
            </Text>
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
            <Text style={{ color: 'white', fontSize: 10 }}>
              {photo?.width || 'W?'} × {photo?.height || 'H?'} →{' '}
              {Math.round(photoWidth)} × {Math.round(photoHeight)}
            </Text>
          </View>
        )}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {renderActionCard()}
        <View style={{ position: 'relative' }}>
          {photoDetails?.isPhotoWatched === undefined && (
            <LinearProgress
              color="#4FC3F7"
              style={[
                styles.loadingProgress,
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  zIndex: 10,
                  marginHorizontal: 0,
                  marginVertical: 0,
                  height: 4,
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
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
        </View>
        {renderCommentsStats()}
        {renderCommentsRows()}
        {renderAddCommentsRow()}
        {renderRecognitions()}
        <View style={{ height: 40 }} />
      </ScrollView>
      {renderFooter()}
    </View>
  )
}

Photo.propTypes = {
  photo: PropTypes.object.isRequired,
  refreshKey: PropTypes.number,
}

export default Photo
