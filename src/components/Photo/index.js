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
      paddingTop: 0,
      paddingBottom: 0,
    },
    // Enhanced card container for all content sections
    cardContainer: {
      ...SHARED_STYLES.containers.card,
    },
    // Image card container without padding
    imageCardContainer: {
      // Full-bleed container to maximize image area
      marginHorizontal: 0,
      padding: 0,
      backgroundColor: 'transparent',
      borderRadius: 0,
      overflow: 'hidden',
    },
    // Photo info card
    photoInfoCard: {
      ...SHARED_STYLES.containers.infoCard,
      backgroundColor: theme.CARD_BACKGROUND,
      borderColor: theme.CARD_BORDER,
      // Match recognition card spacing
      marginVertical: 6,
      paddingVertical: 8,
      paddingHorizontal: 10,
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
      // Tighten separator spacing to match recognition headers
      marginVertical: 6,
      paddingBottom: 6,
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
      marginTop: 6,
      paddingTop: 6,
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
      marginVertical: 6,
      paddingVertical: 8,
      paddingHorizontal: 10,
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
      borderRadius: 12,
      marginVertical: 6,
      paddingVertical: 6,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor: theme.CARD_BORDER,
      borderLeftWidth: 3,
      borderLeftColor: theme.STATUS_SUCCESS,
    },
    commentText: {
      ...SHARED_STYLES.text.primary,
      lineHeight: 20,
      marginBottom: 6,
    },
    commentMeta: {
      ...SHARED_STYLES.layout.spaceBetween,
      marginTop: 6,
      paddingTop: 6,
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
      marginVertical: 6,
      marginHorizontal: 12,
      alignItems: 'center',
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
        height: 3,
      },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 6,
      minWidth: 120,
      height: 36,
      gap: 6,
    },
    addCommentContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    addCommentText: {
      color: theme.STATUS_SUCCESS,
      fontSize: 13,
      fontWeight: '600',
      textAlign: 'center',
      letterSpacing: 0.3,
    },
    // Enhanced AI recognition cards
    aiRecognitionContainer: {
      marginVertical: 6,
      marginHorizontal: 12,
    },
    aiRecognitionCard: {
      ...SHARED_STYLES.containers.card,
      backgroundColor: theme.CARD_BACKGROUND,
      borderColor: theme.CARD_BORDER,
      marginVertical: 6,
      paddingVertical: 8,
      paddingHorizontal: 10,
    },
    aiRecognitionHeader: {
      ...SHARED_STYLES.layout.row,
      ...SHARED_STYLES.layout.separator,
      // Minimize top/bottom spacing for header area
      marginVertical: 6,
      paddingBottom: 6,
    },
    // Compact separator variant to remove space below the line when collapsed
    aiHeaderTight: {
      marginBottom: 0,
      paddingBottom: 0,
    },
    aiRecognitionHeaderTitle: {
      ...SHARED_STYLES.text.heading,
      marginLeft: 8,
      textAlign: 'left',
      flex: 1,
      marginTop: 0,
      marginBottom: 0,
      // Keep header text compact vertically
      lineHeight: 20,
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
      backgroundColor: theme.SURFACE,
      marginVertical: 4,
      marginTop: 8,
      padding: 6,
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
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 2,
      marginTop: 18,
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
        height: 3,
      },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
      minWidth: 72,
      height: 32,
      gap: 2,
    },
    actionButtonDisabled: {
      backgroundColor: theme.BACKGROUND,
      borderColor: theme.BORDER_LIGHT,
      opacity: 0.5,
      shadowOpacity: 0.1,
      elevation: 1,
    },
    actionButtonText: {
      color: theme.STATUS_SUCCESS,
      fontSize: 13,
      fontWeight: '600',
      textAlign: 'center',
      letterSpacing: 0.3,
    },
    loadingProgress: {
      marginHorizontal: 12,
      marginVertical: 6,
      height: 4,
      borderRadius: 2,
    },
  })

const Photo = ({
  photo,
  refreshKey = 0,
  onHeightMeasured,
  embedded = true,
  onRequestEnsureVisible,
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

  // Header offset: use safe area when not embedded
  const headerOffset = embedded === false ? Math.max(insets.top, 8) : 0

  const componentIsMounted = useRef(true)

  // No height measurement cycles - let flex layout handle everything

  // Create video player instance
  const videoPlayer = useVideoPlayer(
    photo?.video ? photo.videoUrl : null,
    (player) => {
      if (player && photo?.video) {
        // Removed screenHeight as it's no longer necessary
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

  // State for photo details and refresh triggers
  const [photoDetails, setPhotoDetails] = useState(null)
  const [internalRefreshKey, setInternalRefreshKey] = useState(0)
  const [optimisticComment, setOptimisticComment] = useState(null)
  // Collapsible state for AI sections (default collapsed when embedded/expanded)
  const [aiTagsCollapsed, setAiTagsCollapsed] = useState(embedded)
  const [aiTextCollapsed, setAiTextCollapsed] = useState(embedded)
  const [aiModerationCollapsed, setAiModerationCollapsed] = useState(embedded)

  // Reset collapse state when a different photo is shown or embedding mode changes
  useEffect(() => {
    setAiTagsCollapsed(embedded)
    setAiTextCollapsed(embedded)
    setAiModerationCollapsed(embedded)
  }, [photo?.id, embedded])

  const { width, height } = useWindowDimensions()

  // Root container ref for measuring height on-demand
  const containerRef = useRef(null)
  // Refs for recognition section headers to target scrolling to them
  const aiTagsHeaderRef = useRef(null)
  const aiTextHeaderRef = useRef(null)
  const aiModerationHeaderRef = useRef(null)

  // Schedule a measurement of the container and report via onHeightMeasured
  const scheduleHeightRecalc = () => {
    // Allow layout to settle
    setTimeout(() => {
      try {
        const view = containerRef.current
        if (!view || !onHeightMeasured) return
        if (view.measure) {
          view.measure((x, y, w, h) => {
            if (h > 0) onHeightMeasured(h)
          })
        } else if (view.measureInWindow) {
          view.measureInWindow((x, y, w, h) => {
            if (h > 0) onHeightMeasured(h)
          })
        }
      } catch (e) {
        // best-effort; onLayout will still catch changes
      }
    }, 40)
  }

  // Main data loading effect
  useEffect(() => {
    componentIsMounted.current = true

    const task = InteractionManager.runAfterInteractions(async () => {
      if (componentIsMounted.current) {
        // If this is a refresh after comment submission, add delay for backend consistency
        const isRefreshAfterComment = internalRefreshKey > 0
        if (isRefreshAfterComment) {
          await new Promise((resolve) => setTimeout(resolve, 1500))
        }

        setPhotoDetails(null)

        const loadedPhotoDetails = await reducer.getPhotoDetails({
          photoId: photo?.id,
          uuid,
        })

        if (componentIsMounted.current) {
          const newPhotoDetails = {
            ...loadedPhotoDetails,
            watchersCount: photo.watchersCount,
            lastUpdated: Date.now(),
          }

          // Check if optimistic comment should be cleared after data loads
          setTimeout(() => {
            if (
              optimisticComment &&
              loadedPhotoDetails?.comments?.some(
                (c) => c.comment === optimisticComment.comment,
              )
            ) {
              setOptimisticComment(null)
            }
          }, 100) // Small delay to prevent flicker

          setPhotoDetails(newPhotoDetails)
        }
      }
    })

    return () => {
      componentIsMounted.current = false
      task.cancel()
    }
  }, [photo?.id, uuid, refreshKey, internalRefreshKey]) // Remove optimisticComment from deps

  // Global refresh trigger polling
  useEffect(() => {
    const checkForRefresh = () => {
      if (
        global.lastCommentSubmission &&
        global.lastCommentSubmission > (global.lastPhotoRefresh || 0)
      ) {
        global.lastPhotoRefresh = global.lastCommentSubmission
        setInternalRefreshKey((prev) => prev + 1)
      }
    }

    checkForRefresh()
    const interval = setInterval(checkForRefresh, 1000)
    return () => clearInterval(interval)
  }, [photo?.id])

  // Register refresh callback for direct triggering
  useEffect(() => {
    const refreshCallback = () => setInternalRefreshKey((prev) => prev + 1)

    if (!global.photoRefreshCallbacks) {
      global.photoRefreshCallbacks = new Map()
    }
    global.photoRefreshCallbacks.set(photo?.id, refreshCallback)

    // Also register optimistic comment callback
    global.photoOptimisticCallbacks =
      global.photoOptimisticCallbacks || new Map()
    global.photoOptimisticCallbacks.set(photo?.id, setOptimisticComment)

    return () => {
      global.photoRefreshCallbacks?.delete(photo?.id)
      global.photoOptimisticCallbacks?.delete(photo?.id)
    }
  }, [photo?.id]) // Reset component state when photo content changes (no height tracking)
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
      const dateTime = moment(
        new Date(dateString),
        'YYYY-MM-DD-HH-mm-ss-SSS',
      ).format('LLL')
      return dateTime
    } catch (error) {
      console.log(
        '📅 Photo: Invalid date format, showing fallback:',
        dateString,
      )
      return 'Just now'
    }
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
        <TouchableOpacity
          style={{
            alignSelf: 'flex-end',
            marginTop: 8,
            padding: 8,
          }}
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
                    const updatedPhotoDetails = await reducer.getPhotoDetails({
                      photoId: photo.id,
                      uuid,
                    })
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
          activeOpacity={0.7}
        >
          <FontAwesome
            name="trash"
            style={{
              color: CONST.MAIN_COLOR,
            }}
            size={20}
          />
        </TouchableOpacity>
      )
    }
    return null
  }

  const renderCommentsRows = useMemo(() => {
    const realComments = photoDetails?.comments || []
    const allComments = optimisticComment
      ? [...realComments, optimisticComment]
      : realComments

    if (allComments.length > 0) {
      return (
        <View style={styles.commentsCard}>
          <View style={styles.commentsSection}>
            {allComments.map((comment, i) => (
              <TouchableOpacity
                key={comment.id || `optimistic-${comment.comment}-${i}`} // More stable key
                onPress={() => {
                  if (comment.id) {
                    // Only allow interaction with real comments
                    setPhotoDetails(
                      reducer.toggleCommentButtons({
                        photoDetails,
                        commentId: comment.id,
                      }),
                    )
                  }
                }}
                activeOpacity={comment.id ? 0.8 : 1} // No press feedback for optimistic comments
              >
                <View
                  style={[
                    styles.commentCard,
                    !comment.id && { opacity: 0.7 },
                    comment.id
                      ? {}
                      : { backgroundColor: theme.CARD_BACKGROUND + '80' }, // Subtle visual difference for optimistic
                  ]}
                >
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
                      <View
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                      >
                        <ThemedText style={styles.commentDate}>
                          {renderDateTime(comment.updatedAt)}
                        </ThemedText>
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
    optimisticComment,
    uuid,
    friendsList,
    theme.CARD_BACKGROUND,
    photoDetails,
  ]) // Added photoDetails to prevent issues with toggleCommentButtons

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
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle" size={18} color={theme.STATUS_SUCCESS} />
          <ThemedText numberOfLines={1} style={styles.addCommentText}>
            Add Comment
          </ThemedText>
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
            <TouchableOpacity
              ref={aiTagsHeaderRef}
              style={[
                styles.aiRecognitionHeader,
                aiTagsCollapsed && styles.aiHeaderTight,
              ]}
              onPress={() => {
                // Suppress auto-scroll for a short window to cover multiple height reports
                const now = Date.now()
                global.suppressEnsureVisibleUntil =
                  global.suppressEnsureVisibleUntil || new Map()
                global.suppressEnsureVisibleUntil.set(photo?.id, now + 600)
                setAiTagsCollapsed((v) => !v)
                scheduleHeightRecalc()
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
                              topPadding: h,
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
              <ThemedText style={styles.aiRecognitionHeaderTitle}>
                AI Recognized Tags
              </ThemedText>
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
                    style={[
                      styles.aiTag,
                      { opacity: Math.min(label.Confidence / 100 + 0.3, 1) },
                    ]}
                    onPress={() => {
                      setTriggerSearch(label.Name)
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
            )}
          </View>
        )}

        {textDetections?.length > 0 && (
          <View style={styles.aiRecognitionCard}>
            <TouchableOpacity
              ref={aiTextHeaderRef}
              style={[
                styles.aiRecognitionHeader,
                aiTextCollapsed && styles.aiHeaderTight,
              ]}
              onPress={() => {
                const now = Date.now()
                global.suppressEnsureVisibleUntil =
                  global.suppressEnsureVisibleUntil || new Map()
                global.suppressEnsureVisibleUntil.set(photo?.id, now + 600)
                setAiTextCollapsed((v) => !v)
                scheduleHeightRecalc()
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
                              topPadding: h,
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
              <ThemedText style={styles.aiRecognitionHeaderTitle}>
                AI Recognized Text
              </ThemedText>
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
                    style={[
                      styles.aiTag,
                      { opacity: Math.min(text.Confidence / 100 + 0.3, 1) },
                    ]}
                    onPress={() => {
                      setTriggerSearch(text.DetectedText)
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
            )}
          </View>
        )}

        {moderationLabels?.length > 0 && (
          <View style={styles.aiRecognitionCard}>
            <TouchableOpacity
              ref={aiModerationHeaderRef}
              style={[
                styles.aiRecognitionHeader,
                aiModerationCollapsed && styles.aiHeaderTight,
              ]}
              onPress={() => {
                const now = Date.now()
                global.suppressEnsureVisibleUntil =
                  global.suppressEnsureVisibleUntil || new Map()
                global.suppressEnsureVisibleUntil.set(photo?.id, now + 600)
                setAiModerationCollapsed((v) => !v)
                scheduleHeightRecalc()
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
                              topPadding: h,
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
              <ThemedText
                style={[
                  styles.aiRecognitionHeaderTitle,
                  { color: theme.STATUS_ERROR },
                ]}
              >
                AI Moderation Tags
              </ThemedText>
              <Ionicons
                name={
                  aiModerationCollapsed ? 'chevron-forward' : 'chevron-down'
                }
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
                      { opacity: Math.min(label.Confidence / 100 + 0.3, 1) },
                    ]}
                    onPress={() => {
                      setTriggerSearch(label.Name)
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
            )}
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
    <View
      style={[
        styles.actionCard,
        {
          // Add top margin when close button is visible (embedded mode)
          marginTop: embedded
            ? Math.max(insets.top * 0.5, 8)
            : Math.max(insets.top, 8),
        },
      ]}
    >
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
          activeOpacity={0.7}
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
            numberOfLines={1}
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
          activeOpacity={0.7}
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
            numberOfLines={1}
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
          activeOpacity={0.7}
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
            numberOfLines={1}
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
          activeOpacity={0.7}
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
            numberOfLines={1}
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
    if (!photo.video) {
      // Calculate available width after horizontal margins only (no card padding)
      // Card has marginHorizontal: 16, so total reduction is 32px
      const containerWidth = screenWidth

      return (
        <View style={styles.imageCardContainer}>
          <ImageView
            photo={photo}
            containerWidth={containerWidth}
            embedded={embedded}
          />
        </View>
      )
    }

    // For videos, calculate dimensions with height constraint and width by aspect ratio
    const maxVideoHeight = height * 0.8
    const aspectRatio = photo.width / photo.height
    let videoHeight = maxVideoHeight
    let videoWidth = videoHeight * aspectRatio

    // If calculated width exceeds container width, scale down
    const containerWidth = screenWidth
    if (videoWidth > containerWidth) {
      videoWidth = containerWidth
      videoHeight = videoWidth / aspectRatio
    }

    // Add extra height for video controls
    const controlsHeight = 60 // Space for video control buttons
    const cardHeight = videoHeight + controlsHeight

    return (
      <View
        style={[
          styles.imageCardContainer,
          {
            width: videoWidth,
            height: cardHeight,
            alignSelf: 'center',
          },
        ]}
      >
        {/* Video container */}
        <View
          style={{
            width: '100%',
            height: videoHeight,
            borderRadius: 20,
            overflow: 'hidden',
          }}
        >
          <VideoView
            player={videoPlayer}
            style={{
              width: '100%',
              height: '100%',
            }}
            nativeControls={false}
            contentFit="cover"
            allowsFullscreen
            allowsPictureInPicture
          />
        </View>

        {/* Video controls using flex layout */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 12,
            backgroundColor: 'rgba(0,0,0,0.8)',
          }}
        >
          {/* Play/Pause button */}
          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 25,
              width: 50,
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.3)',
            }}
            onPress={handleVideoToggle}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color="white"
              style={!isPlaying ? { marginLeft: 3 } : {}}
            />
          </TouchableOpacity>

          {/* Video status indicator */}
          {status === 'loading' && (
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
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

          {/* Debug info in development */}
          {__DEV__ && (
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <ThemedText style={{ color: 'white', fontSize: 10 }}>
                {photo?.width || 'W?'} × {photo?.height || 'H?'} →{' '}
                {Math.round(width)} × {Math.round(videoHeight)}
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    )
  }

  // Render close button for embedded mode
  const renderCloseButton = () => {
    if (!embedded) return null

    return (
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 10,
          right: 20,
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
        }}
        onPress={() => {
          // Check if this is an expandable thumb context and minimize it
          if (global.expandableThumbMinimize) {
            global.expandableThumbMinimize(photo?.id)
          } else {
            // Fallback to router back navigation
            router.back()
          }
        }}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name="close"
          size={24}
          color="rgba(255, 255, 255, 0.95)"
          style={{
            textShadowColor: 'rgba(0, 0, 0, 0.8)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}
        />
      </TouchableOpacity>
    )
  }

  return (
    <View
      ref={containerRef}
      style={[
        styles.container,
        {
          paddingTop: !embedded ? headerOffset : 0,
        },
      ]}
      onLayout={(event) => {
        // Optional: Report height for debugging or external needs without storing it
        if (onHeightMeasured) {
          const { height } = event.nativeEvent.layout
          // Always report current height, no state comparison needed
          if (height > 0) {
            onHeightMeasured(height)
          }
        }
      }}
    >
      {renderCloseButton()}
      {renderActionCard()}
      {photoDetails?.isPhotoWatched === undefined && (
        <LinearProgress
          color="#4FC3F7"
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
      {renderCommentsRows}
      {renderAddCommentsRow()}
      {renderRecognitions()}
    </View>
  )
}

Photo.propTypes = {
  photo: PropTypes.object.isRequired,
  refreshKey: PropTypes.number,
  onHeightMeasured: PropTypes.func,
  embedded: PropTypes.bool,
  onRequestEnsureVisible: PropTypes.func,
}

export default Photo
