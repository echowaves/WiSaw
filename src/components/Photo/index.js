import { router } from 'expo-router'
import { useAtom } from 'jotai'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'

import { FontAwesome, Ionicons } from '@expo/vector-icons'
import moment from 'moment'
import {
  Alert,
  InteractionManager,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

import PropTypes from 'prop-types'
import PhotosListContext from '../../contexts/PhotosListContext'

import { useEvent } from 'expo'
import { useVideoPlayer, VideoView } from 'expo-video'

import CloseButton from '../ui/CloseButton'
import LinearProgress from '../ui/LinearProgress'

import * as reducer from './reducer'

import useToastTopOffset from '../../hooks/useToastTopOffset'
import * as friendsHelper from '../../screens/FriendsList/friends_helper'
import * as sharingHelper from '../../utils/simpleSharingHelper'
import usePhotoActions from '../../hooks/usePhotoActions'
import PhotoActionButtons from '../PhotoActionButtons'
import WaveSelectorModal from '../WaveSelectorModal'

import * as CONST from '../../consts'
import * as STATE from '../../state'
import { isDarkMode } from '../../state'
import { getTheme, SHARED_STYLES } from '../../theme/sharedStyles'

import { subscribeToPhotoRefresh, emitPhotoRefresh } from '../../events/photoRefreshBus'

import ImageView from './ImageView'

const VideoSection = ({ photo, screenWidth, screenHeight, isDevBuild, imageCardContainerStyle, embedded }) => {
  const videoPlayer = useVideoPlayer(photo.videoUrl, (player) => {
    player.loop = true
  })

  const { isPlaying } = useEvent(videoPlayer, 'playingChange', {
    isPlaying: videoPlayer?.playing || false
  })

  const { status } = useEvent(videoPlayer, 'statusChange', {
    status: videoPlayer?.status || 'idle',
    error: null
  })

  const handleVideoToggle = () => {
    if (videoPlayer) {
      if (isPlaying) {
        videoPlayer.pause()
      } else {
        videoPlayer.play()
      }
    }
  }

  const aspectRatio = photo.width / photo.height
  const maxVideoHeight = screenHeight * 0.8
  let videoHeight = maxVideoHeight
  let videoWidth = videoHeight * aspectRatio

  if (videoWidth > screenWidth) {
    videoWidth = screenWidth
    videoHeight = videoWidth / aspectRatio
  }

  const controlsHeight = 60
  const cardHeight = videoHeight + controlsHeight

  return (
    <View
      style={[
        imageCardContainerStyle,
        {
          width: videoWidth,
          height: cardHeight,
          alignSelf: 'center'
        }
      ]}
    >
      <View
        style={{
          width: '100%',
          height: videoHeight,
          borderRadius: embedded ? 0 : 20,
          overflow: 'hidden'
        }}
      >
        <VideoView
          player={videoPlayer}
          style={{
            width: '100%',
            height: '100%'
          }}
          nativeControls={false}
          contentFit='cover'
          allowsFullscreen
          allowsPictureInPicture
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 12,
          backgroundColor: 'rgba(0,0,0,0.8)'
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 25,
            width: 50,
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.3)'
          }}
          onPress={handleVideoToggle}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={24}
            color='white'
            style={!isPlaying ? { marginLeft: 3 } : {}}
          />
        </TouchableOpacity>

        {status === 'loading' && (
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 15,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)'
            }}
          >
            <Text style={{ color: 'white', fontSize: 12, fontWeight: '500' }}>Loading...</Text>
          </View>
        )}

        {isDevBuild && (
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 4
            }}
          >
            <Text style={{ color: 'white', fontSize: 10 }}>
              {photo?.width || 'W?'} × {photo?.height || 'H?'} → {Math.round(screenWidth)} ×{' '}
              {Math.round(videoHeight)}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.BACKGROUND,
      paddingTop: 0,
      paddingBottom: 0
    },
    // Enhanced card container for all content sections
    cardContainer: {
      ...SHARED_STYLES.containers.card
    },
    // Image card container without padding
    imageCardContainer: {
      // Full-bleed container to maximize image area
      marginHorizontal: 0,
      padding: 0,
      backgroundColor: 'transparent',
      borderRadius: 0,
      overflow: 'hidden'
    },
    // Photo info card
    photoInfoCard: {
      ...SHARED_STYLES.containers.infoCard,
      backgroundColor: theme.CARD_BACKGROUND,
      borderColor: theme.CARD_BORDER,
      // Match recognition card spacing
      marginVertical: 6,
      paddingVertical: 8,
      paddingHorizontal: 10
    },
    headerInfo: {
      backgroundColor: 'transparent',
      padding: 0,
      margin: 0,
      borderRadius: 0,
      borderWidth: 0
    },
    authorRow: {
      ...SHARED_STYLES.layout.spaceBetween,
      // Tighten separator spacing to match recognition headers
      marginVertical: 2,
      paddingBottom: 2
    },
    authorName: {
      ...SHARED_STYLES.text.heading,
      flexShrink: 1,
      marginRight: 12
    },
    dateText: {
      ...SHARED_STYLES.text.secondary,
      textAlign: 'right',
      flexShrink: 0,
      fontWeight: '500'
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
      paddingTop: 2
    },
    statItem: {
      ...SHARED_STYLES.interactive.statItem,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginRight: 12
    },
    statsText: {
      ...SHARED_STYLES.interactive.statText,
      fontSize: 12,
      marginLeft: 4
    },
    // Enhanced comments section
    commentsCard: {
      ...SHARED_STYLES.containers.card,
      backgroundColor: theme.CARD_BACKGROUND,
      borderColor: theme.CARD_BORDER,
      marginVertical: 8,
      paddingVertical: 8,
      paddingHorizontal: 10
    },
    commentsHeader: {
      ...SHARED_STYLES.layout.row,
      ...SHARED_STYLES.layout.separator
    },
    commentsTitle: {
      ...SHARED_STYLES.text.heading,
      marginLeft: 8
    },
    commentsSection: {
      backgroundColor: 'transparent',
      margin: 0,
      borderRadius: 0,
      overflow: 'visible'
    },
    commentCard: {
      backgroundColor: theme.CARD_BACKGROUND,
      borderRadius: 12,
      marginVertical: 6,
      paddingVertical: 6,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor: theme.CARD_BORDER,
      borderLeftWidth: 3,
      borderLeftColor: theme.STATUS_SUCCESS
    },
    commentText: {
      ...SHARED_STYLES.text.primary,
      lineHeight: 20,
      marginBottom: 6
    },
    commentMeta: {
      ...SHARED_STYLES.layout.spaceBetween,
      marginTop: 6,
      paddingTop: 6,
      borderTopWidth: 1,
      borderTopColor: theme.CARD_BORDER
    },
    commentAuthor: {
      ...SHARED_STYLES.text.subheading,
      color: theme.STATUS_SUCCESS
    },
    commentDate: {
      ...SHARED_STYLES.text.caption
    },
    addCommentCard: {
      marginVertical: 6,
      marginHorizontal: 12,
      alignItems: 'center'
    },
    addCommentButton: {
      backgroundColor: `${theme.STATUS_SUCCESS}15`,
      borderRadius: 25,
      paddingHorizontal: 8,
      paddingVertical: 6,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: `${theme.STATUS_SUCCESS}40`,
      shadowColor: theme.STATUS_SUCCESS,
      shadowOffset: {
        width: 0,
        height: 3
      },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 6,
      minWidth: 120,
      height: 36,
      gap: 6
    },
    addCommentContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },
    addCommentText: {
      color: theme.STATUS_SUCCESS,
      fontSize: 13,
      fontWeight: '600',
      textAlign: 'center',
      letterSpacing: 0.3
    },
    inlineCommentInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${theme.STATUS_SUCCESS}15`,
      borderRadius: 25,
      borderWidth: 1.5,
      borderColor: `${theme.STATUS_SUCCESS}40`,
      paddingHorizontal: 12,
      paddingVertical: 4,
      gap: 8,
      minHeight: 36
    },
    inlineCommentInput: {
      flex: 1,
      color: theme.TEXT_PRIMARY,
      fontSize: 14,
      paddingVertical: 4
    },
    // Enhanced AI recognition cards
    aiRecognitionContainer: {
      marginVertical: 0,
      marginHorizontal: 0,
      // Flow cards horizontally and wrap onto new lines
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      gap: 0
    },
    aiRecognitionCard: {
      ...SHARED_STYLES.containers.card,
      backgroundColor: theme.CARD_BACKGROUND,
      borderColor: theme.CARD_BORDER,
      // Use same margins as other cards for consistency
      marginVertical: 2,
      marginHorizontal: 16,
      paddingVertical: 6,
      paddingHorizontal: 0,
      alignSelf: 'flex-start'
    },
    aiRecognitionHeader: {
      ...SHARED_STYLES.layout.row,
      // Minimize top/bottom spacing for header area
      marginVertical: 4,
      paddingBottom: 4,
      // Make header row size to its content width (like tags), not stretch full width
      alignSelf: 'flex-start'
    },
    // Compact separator variant to remove space below the line when collapsed
    aiHeaderTight: {
      marginBottom: 0,
      paddingBottom: 0
    },
    aiRecognitionHeaderTitle: {
      ...SHARED_STYLES.text.heading,
      fontWeight: '400',
      marginLeft: 8,
      textAlign: 'left',
      marginTop: 0,
      marginBottom: 0,
      // Keep header text compact vertically
      lineHeight: 20
    },
    aiRecognitionTitle: {
      ...SHARED_STYLES.text.heading,
      textAlign: 'center',
      marginBottom: 16
    },
    aiRecognitionModerationTitle: {
      ...SHARED_STYLES.text.heading,
      color: theme.STATUS_ERROR,
      textAlign: 'center',
      marginBottom: 16
    },
    aiTagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6
    },
    aiTag: {
      backgroundColor: `${theme.STATUS_SUCCESS}15`,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: `${theme.STATUS_SUCCESS}30`,
      shadowColor: theme.STATUS_SUCCESS,
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4
    },
    aiTagText: {
      color: theme.STATUS_SUCCESS,
      fontSize: 12,
      fontWeight: '600'
    },
    aiModerationTag: {
      backgroundColor: `${theme.STATUS_ERROR}15`,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: `${theme.STATUS_ERROR}30`,
      shadowColor: theme.STATUS_ERROR,
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4
    },
    aiModerationTagText: {
      color: theme.STATUS_ERROR,
      fontSize: 12,
      fontWeight: '600'
    },
    // Action card styles
    actionCard: {
      ...SHARED_STYLES.containers.card,
      backgroundColor: theme.SURFACE,
      marginVertical: 4,
      marginTop: 8,
      padding: 6
    },
    actionHeader: {
      ...SHARED_STYLES.layout.row,
      ...SHARED_STYLES.layout.separator
    },
    actionTitle: {
      ...SHARED_STYLES.text.subheading,
      marginLeft: 8
    },
    actionButtonsWrapper: {
      marginTop: 18
    },
    loadingProgress: {
      marginHorizontal: 12,
      marginVertical: 6,
      height: 4,
      borderRadius: 2
    },
    // Outer card wrapper for embedded (masonry-expanded) mode
    expandedCardContainer: {
      backgroundColor: theme.CARD_BACKGROUND,
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 0,
      borderColor: 'transparent',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 8,
      marginVertical: 0,
      marginHorizontal: 0
    },
    // Flattened variants for inner sections when inside the outer card
    photoInfoCardFlat: {
      backgroundColor: 'transparent',
      marginHorizontal: 0,
      marginVertical: 0,
      borderRadius: 0,
      borderWidth: 0,
      shadowColor: 'transparent',
      shadowOpacity: 0,
      elevation: 0,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderTopWidth: 1,
      borderTopColor: theme.CARD_BORDER
    },
    commentsCardFlat: {
      backgroundColor: 'transparent',
      marginHorizontal: 0,
      marginVertical: 0,
      borderRadius: 0,
      borderWidth: 0,
      shadowColor: 'transparent',
      shadowOpacity: 0,
      elevation: 0,
      paddingVertical: 8,
      paddingHorizontal: 12
    },
    actionCardFlat: {
      backgroundColor: 'transparent',
      marginHorizontal: 0,
      marginVertical: 0,
      marginTop: 0,
      borderRadius: 0,
      borderWidth: 0,
      shadowColor: 'transparent',
      shadowOpacity: 0,
      elevation: 0,
      padding: 6,
      borderTopWidth: 1,
      borderTopColor: theme.CARD_BORDER
    },
    aiRecognitionCardFlat: {
      backgroundColor: 'transparent',
      marginHorizontal: 0,
      marginVertical: 2,
      borderRadius: 0,
      borderWidth: 0,
      shadowColor: 'transparent',
      shadowOpacity: 0,
      elevation: 0,
      paddingVertical: 6,
      paddingHorizontal: 0,
      alignSelf: 'flex-start'
    }
  })

const Photo = ({
  photo,
  refreshKey = 0,
  embedded = true,
  containerWidth: containerWidthProp,
  onRequestEnsureVisible,
  onTriggerSearch
}) => {
  const [isDark] = useAtom(isDarkMode)
  const theme = getTheme(isDark)
  const styles = createStyles(theme)
  const isDevBuild = process.env.NODE_ENV !== 'production'

  const [uuid, setUuid] = useAtom(STATE.uuid)
  const [nickName, setNickName] = useAtom(STATE.nickName)
  const { removePhoto } = useContext(PhotosListContext)
  const [friendsList, setFriendsList] = useAtom(STATE.friendsList)

  const toastTopOffset = useToastTopOffset()

  // Get dynamic safe area and window dimensions
  const insets = useSafeAreaInsets()
  const dimensions = useWindowDimensions()
  const screenWidth = containerWidthProp || dimensions.width
  const screenHeight = dimensions.height || 800 // Fallback to reasonable height

  // Header offset: use safe area when not embedded
  const headerOffset = embedded === false ? Math.max(insets.top, 8) : 0

  const componentIsMounted = useRef(true)

  // No height measurement cycles - let flex layout handle everything

  // State for photo details and refresh triggers
  const [photoDetails, setPhotoDetails] = useState(null)
  const [internalRefreshKey, setInternalRefreshKey] = useState(0)
  // Collapsible state for AI sections (default collapsed when embedded/expanded)
  const [aiTagsCollapsed, setAiTagsCollapsed] = useState(embedded)
  const [aiTextCollapsed, setAiTextCollapsed] = useState(embedded)
  const [aiModerationCollapsed, setAiModerationCollapsed] = useState(embedded)
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [commentInputText, setCommentInputText] = useState('')
  const isSubmittingCommentRef = useRef(false)
  const commentInputRef = useRef(null)

  const {
    handleBan,
    handleDelete,
    handleFlipWatch,
    handleWaveButtonPress,
    handleWaveSelect,
    handleWaveRemove,
    handleCreateWave,
    isPhotoBannedByMe,
    isOwnPhoto,
    waveModalVisible,
    setWaveModalVisible
  } = usePhotoActions({
    photo,
    photoDetails,
    setPhotoDetails,
    uuid,
    toastTopOffset,
    onDeleted: (photoId) => {
      removePhoto(photoId)
    },
    onRemovedFromWave: (photoId) => {
      removePhoto(photoId)
    }
  })

  // Reset collapse state when a different photo is shown or embedding mode changes
  useEffect(() => {
    setAiTagsCollapsed(embedded)
    setAiTextCollapsed(embedded)
    setAiModerationCollapsed(embedded)
  }, [photo?.id, embedded])

  const { width, height } = useWindowDimensions()

  // Refs for recognition section headers to target scrolling to them
  const aiTagsHeaderRef = useRef(null)
  const aiTextHeaderRef = useRef(null)
  const aiModerationHeaderRef = useRef(null)

  // Main data loading effect
  useEffect(() => {
    componentIsMounted.current = true

    const task = InteractionManager.runAfterInteractions(async () => {
      if (componentIsMounted.current) {
        const loadedPhotoDetails = await reducer.getPhotoDetails({
          photoId: photo?.id,
          uuid
        })

        if (componentIsMounted.current) {
          const newPhotoDetails = {
            ...loadedPhotoDetails,
            watchersCount: photo.watchersCount,
            lastUpdated: Date.now()
          }

          setPhotoDetails(newPhotoDetails)
        }
      }
    })

    return () => {
      componentIsMounted.current = false
      task.cancel()
    }
  }, [photo?.id, uuid, refreshKey, internalRefreshKey])

  // Subscribe to photoRefreshBus for cross-screen comment refresh
  useEffect(() => {
    const unsubscribe = subscribeToPhotoRefresh(({ photoId }) => {
      if (photoId === photo?.id) {
        setInternalRefreshKey((prev) => prev + 1)
      }
    })
    return unsubscribe
  }, [photo?.id])

  // Reset component state when photo content changes (no height tracking)
  useEffect(() => {
    // Component setup that doesn't involve height measurements
  }, [photo?.id, refreshKey])

  // useEffect(() => {
  //   if (videoRef?.current) {
  //     // console.log({ videoRef })
  //     // videoRef.current.presentFullscreenPlayer()
  //     // videoRef.current.playAsync()
  //   }
  // }, [videoRef])// eslint-disable-line react-hooks/exhaustive-deps

  const renderDateTime = (dateString) => {
    if (!dateString) {
      return 'Just now' // Fallback for missing dates
    }
    try {
      const dateTime = moment(new Date(dateString), 'YYYY-MM-DD-HH-mm-ss-SSS').format('LLL')
      return dateTime
    } catch (err) {
      if (isDevBuild && err) {
        // Optionally surface diagnosis in development builds without console usage
        Toast.show({
          text1: 'Invalid photo timestamp',
          type: 'info',
          topOffset: toastTopOffset
        })
      }
      return 'Just now'
    }
  }

  const renderCommentsStats = () => {
    const authorName = friendsHelper.getLocalContactName({
      uuid,
      friendUuid: photo.uuid,
      friendsList
    })

    const commentsCount = photoDetails?.comments?.length || 0
    const watchersCount = photoDetails?.watchersCount || 0

    return (
      <View style={embedded ? styles.photoInfoCardFlat : styles.photoInfoCard}>
        <View style={styles.headerInfo}>
          <View style={styles.authorRow}>
            <Text style={styles.authorName} numberOfLines={1} ellipsizeMode='tail'>
              {authorName}
            </Text>
            <Text style={styles.dateText}>{renderDateTime(photo.createdAt)}</Text>
          </View>

          {(commentsCount > 0 || watchersCount > 0) && (
            <View style={styles.statsRow}>
              {commentsCount > 0 && (
                <View style={styles.statItem}>
                  <FontAwesome name='comment' size={16} color='#4FC3F7' />
                  <Text style={styles.statsText}>
                    {commentsCount} Comment{commentsCount !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}

              {watchersCount > 0 && (
                <View style={styles.statItem}>
                  <Ionicons name='bookmark' size={16} color='#FFD700' />
                  <Text style={styles.statsText}>
                    {watchersCount}
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
        <TouchableOpacity
          style={{
            alignSelf: 'flex-end',
            marginTop: 8,
            padding: 8
          }}
          onPress={() => {
            if (photo?.waveIsFrozen && photo?.waveViewerRole !== 'owner') {
              Toast.show({
                text1: 'Wave is frozen',
                text2: 'Only the wave owner can delete comments in frozen waves',
                type: 'info',
                topOffset: toastTopOffset
              })
              return
            }
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
                      topOffset: toastTopOffset
                    })
                    // reload comments to re-render in the photo details screen
                    const updatedPhotoDetails = await reducer.getPhotoDetails({
                      photoId: photo.id,
                      uuid
                    })
                    setPhotoDetails({
                      ...photoDetails,
                      ...updatedPhotoDetails
                    })
                    // Notify other mounted Photo instances via bus
                    emitPhotoRefresh({ photoId: photo.id })
                  }
                }
              ],
              { cancelable: true }
            )
          }}
          activeOpacity={0.7}
        >
          <FontAwesome
            name='trash'
            style={{
              color: CONST.MAIN_COLOR
            }}
            size={20}
          />
        </TouchableOpacity>
      )
    }
    return null
  }

  const renderCommentsRows = useMemo(() => {
    const allComments = photoDetails?.comments || []

    if (allComments.length > 0) {
      return (
        <View style={embedded ? styles.commentsCardFlat : styles.commentsCard}>
          <View style={styles.commentsSection}>
            {allComments.map((comment) => (
              <TouchableOpacity
                key={comment.id}
                onPress={() => {
                  setPhotoDetails(
                    reducer.toggleCommentButtons({
                      photoDetails,
                      commentId: comment.id
                    })
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
                          friendsList
                        })}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.commentDate}>{renderDateTime(comment.updatedAt)}</Text>
                        {renderCommentButtons({ comment })}
                      </View>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )
    }
    return <View />
  }, [
    photoDetails?.comments,
    uuid,
    friendsList,
    photoDetails
  ])

  const renderAddCommentsRow = () => {
    if (!photoDetails?.comments) {
      return <Text />
    }
    const commentsLocked = photo?.waveIsFrozen && photo?.waveViewerRole !== 'owner'

    if (embedded && showCommentInput) {
      return (
        <View style={styles.addCommentCard} ref={commentInputRef}>
          <View style={styles.inlineCommentInputRow}>
            <TextInput
              style={styles.inlineCommentInput}
              placeholder='Add a comment...'
              placeholderTextColor={theme.TEXT_SECONDARY}
              value={commentInputText}
              onChangeText={setCommentInputText}
              autoFocus
              returnKeyType='send'
              onSubmitEditing={async () => {
                if (!commentInputText.trim()) return
                isSubmittingCommentRef.current = true
                const text = commentInputText.trim()
                setShowCommentInput(false)
                setCommentInputText('')
                const newComment = await reducer.submitComment({
                  inputText: text,
                  uuid,
                  photo,
                  topOffset: toastTopOffset
                })
                if (newComment && photoDetails) {
                  setPhotoDetails({
                    ...photoDetails,
                    comments: [...(photoDetails.comments || []), newComment]
                  })
                }
                emitPhotoRefresh(photo?.id)
                isSubmittingCommentRef.current = false
              }}
            />
            <TouchableOpacity
              onPress={() => {
                setShowCommentInput(false)
                setCommentInputText('')
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name='close-circle' size={20} color={theme.TEXT_SECONDARY} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                if (!commentInputText.trim()) return
                isSubmittingCommentRef.current = true
                const text = commentInputText.trim()
                setShowCommentInput(false)
                setCommentInputText('')
                const newComment = await reducer.submitComment({
                  inputText: text,
                  uuid,
                  photo,
                  topOffset: toastTopOffset
                })
                if (newComment && photoDetails) {
                  setPhotoDetails({
                    ...photoDetails,
                    comments: [...(photoDetails.comments || []), newComment]
                  })
                }
                emitPhotoRefresh(photo?.id)
                isSubmittingCommentRef.current = false
              }}
              disabled={!commentInputText.trim()}
              style={{ opacity: commentInputText.trim() ? 1 : 0.4 }}
            >
              <Ionicons name='send' size={20} color={theme.STATUS_SUCCESS} />
            </TouchableOpacity>
          </View>
        </View>
      )
    }

    return (
      <View style={styles.addCommentCard}>
        <TouchableOpacity
          style={[styles.addCommentButton, commentsLocked && { opacity: 0.5 }]}
          onPress={() => {
            if (commentsLocked) {
              Toast.show({
                text1: 'Wave is frozen',
                text2: 'Comments are locked for frozen waves',
                type: 'info',
                topOffset: toastTopOffset
              })
              return
            }
            if (embedded) {
              setShowCommentInput(true)
              // Scroll the input into view once the keyboard has fully appeared
              const keyboardSub = Keyboard.addListener('keyboardDidShow', (e) => {
                try {
                  if (typeof onRequestEnsureVisible === 'function' && commentInputRef.current) {
                    commentInputRef.current.measureInWindow((x, y, w, h) => {
                      if (h > 0) {
                        onRequestEnsureVisible({ y, height: h, keyboardTop: e.endCoordinates.screenY })
                      }
                    })
                  }
                } catch (err) {
                  // best-effort
                }
                keyboardSub.remove()
              })
            } else {
              router.push({
                pathname: '/modal-input',
                params: {
                  photo: JSON.stringify(photo),
                  uuid,
                  topOffset: toastTopOffset
                }
              })
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons name='add-circle' size={18} color={theme.STATUS_SUCCESS} />
          <Text numberOfLines={1} style={styles.addCommentText}>
            Add Comment
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  const renderRecognitions = () => {
    if (!photoDetails || !photoDetails?.recognitions || photoDetails?.recognitions?.length === 0) {
      return <View />
    }

    const parsedMetaData = JSON.parse(photoDetails?.recognitions[0].metaData)
    const labels = parsedMetaData.Labels
    const textDetections = Array.isArray(parsedMetaData.TextDetections)
      ? parsedMetaData.TextDetections.filter((text) => text.Type === 'LINE')
      : []
    const moderationLabels = parsedMetaData.ModerationLabels

    return (
      <View style={styles.aiRecognitionContainer}>
        {labels?.length > 0 && (
          <View style={embedded ? styles.aiRecognitionCardFlat : styles.aiRecognitionCard}>
            <TouchableOpacity
              ref={aiTagsHeaderRef}
              style={[styles.aiRecognitionHeader, aiTagsCollapsed && styles.aiHeaderTight]}
              onPress={() => {
                // Suppress auto-scroll for a short window to cover multiple height reports
                const now = Date.now()
                global.suppressEnsureVisibleUntil = global.suppressEnsureVisibleUntil || new Map()
                global.suppressEnsureVisibleUntil.set(photo?.id, now + 600)
                setAiTagsCollapsed((v) => !v)
                // After layout update, scroll to the header only
                setTimeout(() => {
                  try {
                    if (typeof onRequestEnsureVisible === 'function') {
                      const view = aiTagsHeaderRef.current
                      if (view && view.measureInWindow) {
                        view.measureInWindow((x, y, w, h) => {
                          if (h > 0) {
                            onRequestEnsureVisible({
                              id: photo?.id,
                              y,
                              height: h,
                              alignTop: true,
                              topPadding: h
                            })
                          }
                        })
                      }
                    }
                  } catch (e) {
                    // ignore
                  }
                }, 80)
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.aiRecognitionHeaderTitle}>AI Tags</Text>
              <Ionicons
                name={aiTagsCollapsed ? 'chevron-forward' : 'chevron-down'}
                size={18}
                color={theme.TEXT_SECONDARY}
              />
            </TouchableOpacity>
            {!aiTagsCollapsed && (
              <View style={styles.aiTagsContainer}>
                {labels.map((label) => (
                  <TouchableOpacity
                    key={label.Name}
                    style={[styles.aiTag, { opacity: Math.min(label.Confidence / 100 + 0.3, 1) }]}
                    onPress={() => {
                      if (typeof onTriggerSearch === 'function') {
                        onTriggerSearch(label.Name)
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.aiTagText}>
                      {label.Name} {Math.round(label.Confidence)}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {textDetections?.length > 0 && (
          <View style={embedded ? styles.aiRecognitionCardFlat : styles.aiRecognitionCard}>
            <TouchableOpacity
              ref={aiTextHeaderRef}
              style={[styles.aiRecognitionHeader, aiTextCollapsed && styles.aiHeaderTight]}
              onPress={() => {
                const now = Date.now()
                global.suppressEnsureVisibleUntil = global.suppressEnsureVisibleUntil || new Map()
                global.suppressEnsureVisibleUntil.set(photo?.id, now + 600)
                setAiTextCollapsed((v) => !v)
                setTimeout(() => {
                  try {
                    if (typeof onRequestEnsureVisible === 'function') {
                      const view = aiTextHeaderRef.current
                      if (view && view.measureInWindow) {
                        view.measureInWindow((x, y, w, h) => {
                          if (h > 0) {
                            onRequestEnsureVisible({
                              id: photo?.id,
                              y,
                              height: h,
                              alignTop: true,
                              topPadding: h
                            })
                          }
                        })
                      }
                    }
                  } catch (e) {
                    // ignore
                  }
                }, 80)
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.aiRecognitionHeaderTitle}>AI Text</Text>
              <Ionicons
                name={aiTextCollapsed ? 'chevron-forward' : 'chevron-down'}
                size={18}
                color={theme.TEXT_SECONDARY}
              />
            </TouchableOpacity>
            {!aiTextCollapsed && (
              <View style={styles.aiTagsContainer}>
                {textDetections.map((text) => (
                  <TouchableOpacity
                    key={text.Id}
                    style={[styles.aiTag, { opacity: Math.min(text.Confidence / 100 + 0.3, 1) }]}
                    onPress={() => {
                      if (typeof onTriggerSearch === 'function') {
                        onTriggerSearch(text.DetectedText)
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.aiTagText}>
                      {text.DetectedText} {Math.round(text.Confidence)}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {moderationLabels?.length > 0 && (
          <View style={embedded ? styles.aiRecognitionCardFlat : styles.aiRecognitionCard}>
            <TouchableOpacity
              ref={aiModerationHeaderRef}
              style={[styles.aiRecognitionHeader, aiModerationCollapsed && styles.aiHeaderTight]}
              onPress={() => {
                const now = Date.now()
                global.suppressEnsureVisibleUntil = global.suppressEnsureVisibleUntil || new Map()
                global.suppressEnsureVisibleUntil.set(photo?.id, now + 600)
                setAiModerationCollapsed((v) => !v)
                setTimeout(() => {
                  try {
                    if (typeof onRequestEnsureVisible === 'function') {
                      const view = aiModerationHeaderRef.current
                      if (view && view.measureInWindow) {
                        view.measureInWindow((x, y, w, h) => {
                          if (h > 0) {
                            onRequestEnsureVisible({
                              id: photo?.id,
                              y,
                              height: h,
                              alignTop: true,
                              topPadding: h
                            })
                          }
                        })
                      }
                    }
                  } catch (e) {
                    // ignore
                  }
                }, 80)
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.aiRecognitionHeaderTitle, { color: theme.STATUS_ERROR }]}>
                Moderation
              </Text>
              <Ionicons
                name={aiModerationCollapsed ? 'chevron-forward' : 'chevron-down'}
                size={18}
                color={theme.TEXT_SECONDARY}
              />
            </TouchableOpacity>
            {!aiModerationCollapsed && (
              <View style={styles.aiTagsContainer}>
                {moderationLabels.map((label) => (
                  <TouchableOpacity
                    key={label.Name}
                    style={[
                      styles.aiModerationTag,
                      { opacity: Math.min(label.Confidence / 100 + 0.3, 1) }
                    ]}
                    onPress={() => {
                      if (typeof onTriggerSearch === 'function') {
                        onTriggerSearch(label.Name)
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.aiModerationTagText}>
                      {label.Name} {Math.round(label.Confidence)}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    )
  }

  const renderActionCard = () => {
    return (
      <View
        style={[
          embedded ? styles.actionCardFlat : styles.actionCard,
          !embedded && {
            // Add top margin when close button is visible (standalone mode)
            marginTop: Math.max(insets.top, 8)
          }
        ]}
      >
        <View style={embedded ? { marginTop: 8 } : styles.actionButtonsWrapper}>
          <PhotoActionButtons
            photoDetails={photoDetails}
            isOwnPhoto={isOwnPhoto}
            isPhotoBannedByMe={isPhotoBannedByMe}
            theme={theme}
            toastTopOffset={toastTopOffset}
            onBan={handleBan}
            onDelete={handleDelete}
            onFlipWatch={handleFlipWatch}
            onWavePress={handleWaveButtonPress}
            onShare={() => sharingHelper.sharePhoto(photo, photoDetails, toastTopOffset)}
          />
        </View>
      </View>
    )
  }

  const renderPhotoRow = () => {
    if (!photo.video) {
      // Calculate available width after horizontal margins only (no card padding)
      // Card has marginHorizontal: 16, so total reduction is 32px
      const containerWidth = screenWidth

      return (
        <View style={[styles.imageCardContainer, { width: screenWidth, maxWidth: screenWidth }]}>
          <ImageView photo={photo} containerWidth={containerWidth} embedded={embedded} />
        </View>
      )
    }

    return (
      <VideoSection
        photo={photo}
        screenWidth={screenWidth}
        screenHeight={height}
        isDevBuild={isDevBuild}
        imageCardContainerStyle={styles.imageCardContainer}
        embedded={embedded}
      />
    )
  }

  // Render close button for embedded mode
  const renderCloseButton = () => {
    if (embedded) return null

    return (
      <CloseButton
        style={{ right: 20 }}
        onPress={() => {
          router.back()
        }}
      />
    )
  }

  const renderContent = () => (
    <>
      {photoDetails?.isPhotoWatched === undefined && (
        <LinearProgress
          color='#4FC3F7'
          style={[
            styles.loadingProgress,
            {
              marginHorizontal: 12,
              marginVertical: 0,
              height: 4,
              borderRadius: 2,
              shadowColor: '#4FC3F7',
              shadowOffset: {
                width: 0,
                height: 2
              },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5
            }
          ]}
        />
      )}
      {renderPhotoRow()}
      {renderActionCard()}
      {renderCommentsStats()}
      {renderCommentsRows}
      {renderAddCommentsRow()}
      {renderRecognitions()}
    </>
  )

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: !embedded ? headerOffset : 0,
          width: screenWidth,
          maxWidth: screenWidth,
          ...(embedded
            ? { backgroundColor: 'transparent' }
            : { overflow: 'hidden' })
        }
      ]}
    >
      {renderCloseButton()}
      {embedded
        ? (
          <View style={styles.expandedCardContainer}>
            {renderContent()}
          </View>
          )
        : (
          <>
            {renderContent()}
          </>
          )}
      <WaveSelectorModal
        visible={waveModalVisible}
        onClose={() => setWaveModalVisible(false)}
        onSelectWave={handleWaveSelect}
        onRemoveFromWave={handleWaveRemove}
        onCreateWave={handleCreateWave}
        currentWaveUuid={photoDetails?.waveUuid}
        uuid={uuid}
      />
    </View>
  )
}

Photo.propTypes = {
  photo: PropTypes.object.isRequired,
  refreshKey: PropTypes.number,
  embedded: PropTypes.bool,
  containerWidth: PropTypes.number,
  onRequestEnsureVisible: PropTypes.func,
  onTriggerSearch: PropTypes.func
}

export default Photo
