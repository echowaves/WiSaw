import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { router } from 'expo-router'
import { useAtom } from 'jotai'
import React, { useRef, useState } from 'react'

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

import { Divider, LinearProgress, Text } from '@rneui/themed'

import { Col, Grid, Row } from 'react-native-easy-grid'

import PropTypes from 'prop-types'

import { useEvent } from 'expo'
import { useVideoPlayer, VideoView } from 'expo-video'

import * as reducer from './reducer'

import * as friendsHelper from '../../screens/FriendsList/friends_helper'
import * as sharingHelper from '../../utils/sharingHelper'

import * as CONST from '../../consts'
import * as STATE from '../../state'

import ImageView from './ImageView'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
    height: '100%',
    paddingTop: 100, // Account for transparent header
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentContainer: {
    backgroundColor: '#000',
    paddingBottom: 120,
  },
  headerInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 16,
    margin: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  authorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
    marginRight: 12,
  },
  dateText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'right',
    flexShrink: 0,
  },
  statsText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  commentsSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    margin: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  commentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  commentText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  commentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  commentAuthor: {
    color: '#4FC3F7',
    fontSize: 14,
    fontWeight: '500',
  },
  commentDate: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  addCommentButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 195, 247, 0.3)',
    borderStyle: 'dashed',
  },
  addCommentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCommentText: {
    color: '#4FC3F7',
    fontSize: 16,
    fontWeight: '500',
  },
  aiRecognitionContainer: {
    marginHorizontal: 12,
    marginVertical: 8,
  },
  aiRecognitionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  aiRecognitionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  aiRecognitionModerationTitle: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  aiTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  aiTag: {
    backgroundColor: 'rgba(79, 195, 247, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(79, 195, 247, 0.4)',
  },
  aiTagText: {
    color: '#4FC3F7',
    fontSize: 12,
    fontWeight: '500',
  },
  aiModerationTag: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.4)',
  },
  aiModerationTagText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(20px)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 1000,
    zIndex: 1000,
  },
  footerGrid: {
    flex: 1,
    alignItems: 'center',
  },
  footerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#333333',
    marginHorizontal: 4,
    minHeight: 60,
  },
  footerButtonText: {
    fontSize: 11,
    marginTop: 6,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
})

const Photo = ({ photo }) => {
  const [uuid, setUuid] = useAtom(STATE.uuid)
  const [nickName, setNickName] = useAtom(STATE.nickName)
  const [topOffset, setTopOffset] = useAtom(STATE.topOffset)
  const [photosList, setPhotosList] = useAtom(STATE.photosList)
  const [friendsList, setFriendsList] = useAtom(STATE.friendsList)

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

  const navigation = useNavigation()

  const { width, height } = useWindowDimensions()
  const imageHeight = height - 380 // Account for header padding, footer, and content

  useFocusEffect(
    // use this to make the navigastion to a detailed screen faster
    React.useCallback(() => {
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
    }, []),
  )

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
      <View style={styles.headerInfo}>
        <View style={styles.authorRow}>
          <Text
            style={styles.authorName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {authorName}
          </Text>
          <Text style={styles.dateText}>{renderDateTime(photo.createdAt)}</Text>
        </View>

        {(commentsCount > 0 || watchersCount > 0) && (
          <View
            style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}
          >
            {commentsCount > 0 && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginRight: 16,
                }}
              >
                <FontAwesome name="comment" size={14} color="#4FC3F7" />
                <Text style={[styles.statsText, { marginLeft: 6 }]}>
                  {commentsCount} Comment{commentsCount !== 1 ? 's' : ''}
                </Text>
              </View>
            )}

            {watchersCount > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <AntDesign name="star" size={14} color="#FFD700" />
                <Text style={[styles.statsText, { marginLeft: 6 }]}>
                  {watchersCount} Star{watchersCount !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>
        )}
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
      )
    }
    return <View />
  }

  const renderAddCommentsRow = () => {
    if (!photoDetails?.comments) {
      return <Text />
    }
    return (
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
          <Ionicons
            name="add-circle"
            size={24}
            color="#4FC3F7"
            style={{ marginRight: 12 }}
          />
          <Text style={styles.addCommentText}>Add Comment</Text>
        </View>
      </TouchableOpacity>
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
            <Text style={styles.aiRecognitionTitle}>AI Recognized Tags</Text>
            <View style={styles.aiTagsContainer}>
              {labels.map((label) => (
                <View
                  key={label.Name}
                  style={[
                    styles.aiTag,
                    { opacity: Math.min(label.Confidence / 100 + 0.3, 1) },
                  ]}
                >
                  <Text style={styles.aiTagText}>
                    {label.Name} {Math.round(label.Confidence)}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {textDetections?.length > 0 && (
          <View style={styles.aiRecognitionCard}>
            <Text style={styles.aiRecognitionTitle}>AI Recognized Text</Text>
            <View style={styles.aiTagsContainer}>
              {textDetections.map((text) => (
                <View
                  key={text.Id}
                  style={[
                    styles.aiTag,
                    { opacity: Math.min(text.Confidence / 100 + 0.3, 1) },
                  ]}
                >
                  <Text style={styles.aiTagText}>"{text.DetectedText}"</Text>
                </View>
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
                <View
                  key={label.Name}
                  style={[
                    styles.aiModerationTag,
                    { opacity: Math.min(label.Confidence / 100 + 0.3, 1) },
                  ]}
                >
                  <Text style={styles.aiModerationTagText}>
                    {label.Name} {Math.round(label.Confidence)}%
                  </Text>
                </View>
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

  const renderFooter = () => (
    <SafeAreaView style={styles.footer}>
      {photoDetails?.isPhotoWatched === undefined && (
        <LinearProgress
          color="#4FC3F7"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            left: 0,
            height: 2,
          }}
        />
      )}
      {photoDetails?.isPhotoWatched !== undefined && (
        <Grid style={styles.footerGrid}>
          {/* Delete button */}
          <Col>
            <TouchableOpacity
              style={styles.footerButton}
              onPress={() => handleDelete()}
              activeOpacity={0.7}
            >
              <FontAwesome
                name="trash"
                color={photoDetails?.isPhotoWatched ? '#CCCCCC' : '#FF6B6B'}
                size={24}
              />
              <Text
                style={[
                  styles.footerButtonText,
                  {
                    color: photoDetails?.isPhotoWatched ? '#CCCCCC' : '#FF6B6B',
                  },
                ]}
              >
                Delete
              </Text>
            </TouchableOpacity>
          </Col>

          {/* Report/Ban button */}
          <Col>
            <TouchableOpacity
              style={styles.footerButton}
              onPress={() => handleBan()}
              activeOpacity={0.7}
            >
              <FontAwesome
                name="ban"
                color={
                  photoDetails?.isPhotoWatched || isPhotoBannedByMe()
                    ? '#CCCCCC'
                    : '#FF9500'
                }
                size={24}
              />
              <Text
                style={[
                  styles.footerButtonText,
                  {
                    color:
                      photoDetails?.isPhotoWatched || isPhotoBannedByMe()
                        ? '#CCCCCC'
                        : '#FF9500',
                  },
                ]}
              >
                Report
              </Text>
            </TouchableOpacity>
          </Col>

          {/* Star button */}
          <Col>
            <TouchableOpacity
              style={styles.footerButton}
              onPress={() => handleFlipWatch()}
              activeOpacity={0.7}
            >
              <AntDesign
                name={photoDetails?.isPhotoWatched ? 'star' : 'staro'}
                color={photoDetails?.isPhotoWatched ? '#FFD700' : '#FFFFFF'}
                size={24}
              />
              <Text
                style={[
                  styles.footerButtonText,
                  {
                    color: photoDetails?.isPhotoWatched ? '#FFD700' : '#FFFFFF',
                  },
                ]}
              >
                {photoDetails?.isPhotoWatched ? 'Starred' : 'Star'}
              </Text>
            </TouchableOpacity>
          </Col>

          {/* Share button */}
          <Col>
            <TouchableOpacity
              style={styles.footerButton}
              onPress={() => {
                // Use the sharing helper to share the photo
                sharingHelper.shareWithNativeSheet({
                  type: 'photo',
                  photo,
                  photoDetails,
                })
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="share-outline" color="#4FC3F7" size={24} />
              <Text style={[styles.footerButtonText, { color: '#4FC3F7' }]}>
                Share
              </Text>
            </TouchableOpacity>
          </Col>
        </Grid>
      )}
    </SafeAreaView>
  )

  const renderPhotoRow = () => {
    if (!photo.video) {
      return <ImageView width={width} height={imageHeight} photo={photo} />
    }
    return (
      <View style={{ position: 'relative' }}>
        <VideoView
          player={videoPlayer}
          style={{
            flex: 1,
            height: imageHeight,
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
              backgroundColor: 'rgba(0,0,0,0.6)',
              borderRadius: 35,
              width: 70,
              height: 70,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: 'rgba(255,255,255,0.8)',
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
              backgroundColor: 'rgba(0,0,0,0.6)',
              borderRadius: 25,
              width: 50,
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.8)',
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
              right: 20,
              backgroundColor: 'rgba(0,0,0,0.6)',
              borderRadius: 15,
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}
          >
            <Text style={{ color: 'white', fontSize: 12 }}>Loading...</Text>
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
        {renderPhotoRow()}
        <Grid>
          <Row>{renderCommentsStats()}</Row>
        </Grid>
        {renderCommentsRows()}
        {renderAddCommentsRow()}
        <Grid>
          <Divider />
          <Row>{renderRecognitions()}</Row>
          <Row style={{ height: 120 }} />
        </Grid>
      </ScrollView>
      {renderFooter()}
    </View>
  )
}

Photo.propTypes = {
  photo: PropTypes.object.isRequired,
}

export default Photo
