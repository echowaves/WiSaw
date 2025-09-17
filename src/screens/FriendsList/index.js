import { useNavigation } from '@react-navigation/native'
import { router } from 'expo-router'
import { useAtom } from 'jotai'
import { memo, useCallback, useEffect, useRef, useState } from 'react'

import * as Haptics from 'expo-haptics'

import {
  Alert,
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import { PanGestureHandler, State } from 'react-native-gesture-handler'
import Toast from 'react-native-toast-message'

import { FontAwesome5 } from '@expo/vector-icons'

import * as STATE from '../../state'

import EmptyStateCard from '../../components/EmptyStateCard'
import NamePicker from '../../components/NamePicker'
import ShareFriendNameModal from '../../components/ShareFriendNameModal'
import ShareOptionsModal from '../../components/ShareOptionsModal'
import { SHARED_STYLES, getTheme } from '../../theme/sharedStyles'
import * as friendsHelper from './friends_helper'

const FriendsList = () => {
  const navigation = useNavigation()

  const [uuid] = useAtom(STATE.uuid)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const [friendsList, setFriendsList] = useAtom(STATE.friendsList)
  const [triggerAddFriend, setTriggerAddFriend] = useAtom(
    STATE.triggerAddFriend,
  )

  const theme = getTheme(isDarkMode)

  const createStyles = (theme, isDark) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.INTERACTIVE_BACKGROUND,
      },
      flatList: {
        flex: 1,
      },
      friendItem: {
        backgroundColor: theme.CARD_BACKGROUND,
        flex: 1,
        position: 'relative',
        zIndex: 1,
        borderRadius: 20,
        overflow: 'hidden', // clip inner content to rounded card
        // Rely on container for shadow to match thumbs
        elevation: 0,
      },
      friendContent: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        flex: 1,
      },
      friendHeader: {
        ...SHARED_STYLES.layout.spaceBetween,
      },
      friendInfo: {
        marginRight: 12,
        flex: 1,
      },
      friendName: {
        ...SHARED_STYLES.text.subheading,
        fontSize: 16,
        marginBottom: 4,
      },
      friendStatus: {
        ...SHARED_STYLES.text.secondary,
        fontSize: 14,
      },
      pendingStatus: {
        fontSize: 14,
        color: theme.TEXT_PRIMARY,
        fontWeight: '500',
      },
      pendingShareButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginLeft: 0,
        borderRadius: 8,
        backgroundColor: theme.STATUS_SUCCESS,
        elevation: 15,
        zIndex: 15,
        shadowColor: theme.CARD_SHADOW,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: theme.STATUS_SUCCESS_BORDER,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
        minHeight: 36,
      },
      pendingShareButtonText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '600',
        marginLeft: 4,
      },
      shareButtonContainer: {
        marginTop: 8,
        alignItems: 'flex-start',
        flexDirection: 'row',
        gap: 8,
      },
      pendingDeleteButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginLeft: 0,
        borderRadius: 8,
        backgroundColor: theme.STATUS_ERROR_BACKGROUND,
        elevation: 15,
        zIndex: 15,
        shadowColor: theme.STATUS_ERROR,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: theme.STATUS_ERROR_BORDER,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
        minHeight: 36,
      },
      pendingDeleteButtonText: {
        color: theme.STATUS_ERROR,
        fontSize: 11,
        fontWeight: '600',
        marginLeft: 4,
      },
      swipeAction: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        flexDirection: 'row',
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        width: 240,
      },
      rightSwipeAction: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        flexDirection: 'row',
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        width: 160,
        zIndex: 0,
      },
      leftSwipeAction: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        flexDirection: 'row',
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        width: 80,
        zIndex: 0,
      },
      stripeOverlayLeft: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        flexDirection: 'row',
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        overflow: 'hidden',
        // Two segments (share/edit), full width to scale properly
        width: 160,
        zIndex: 2,
      },
      stripeOverlayRight: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        backgroundColor: theme.STATUS_ERROR,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        overflow: 'hidden',
        // Single segment (delete), full width to scale properly
        width: 80,
        zIndex: 2,
      },
      swipeActionButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: '100%',
      },
      shareAction: {
        backgroundColor: theme.STATUS_SUCCESS,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
      },
      editAction: {
        backgroundColor: theme.STATUS_EDIT,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
      },
      deleteAction: {
        backgroundColor: theme.STATUS_ERROR,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
      },
      swipeActionText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '600',
        marginTop: 4,
        textAlign: 'center',
      },
      friendItemContainer: {
        // Exact thumb-like card container
        backgroundColor: theme.CARD_BACKGROUND,
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 20,
        overflow: 'visible', // allow shadow to render outside
        padding: 0,
        // Shadows (match ExpandableThumb exactly)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 8,
        // Subtle border in dark mode for crisp edges
        borderWidth: isDark ? 1.5 : 0,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
      },
    })

  const styles = createStyles(theme, isDarkMode)

  const headerText =
    'Choose a friendly name to help you remember this person when chatting or sharing content.'

  const [showNamePicker, setShowNamePicker] = useState(false)
  const [selectedFriendshipUuid, setSelectedFriendshipUuid] = useState(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareModalData, setShareModalData] = useState(null)
  const [showShareNameModal, setShowShareNameModal] = useState(false)
  const [shareNameModalData, setShareNameModalData] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleAddFriend = async () => {
    setSelectedFriendshipUuid(null) // make sure we are adding a new friend
    setShowNamePicker(true)
  }

  // Handle external trigger for adding friends from header
  useEffect(() => {
    if (triggerAddFriend) {
      handleAddFriend()
      setTriggerAddFriend(false)
    }
  }, [triggerAddFriend, setTriggerAddFriend])

  const handleShareFriend = async ({
    friendshipUuid,
    contactName,
    isPending = true,
  }) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      if (isPending) {
        // Share friendship invitation for pending friends
        setShareModalData({
          friendshipUuid,
          friendName: contactName,
          isPending,
        })
        setShowShareModal(true)
      } else {
        // Share friend name for confirmed friends
        setShareNameModalData({
          friendshipUuid,
          friendName: contactName,
        })
        setShowShareNameModal(true)
      }
    } catch (error) {
      console.error('Error opening share modal:', error)
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Error',
        text2: 'Unable to open sharing options',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 60,
      })
    }
  }

  const handleRemoveFriend = async ({ friendshipUuid }) => {
    try {
      const success = await friendsHelper.removeFriend({
        uuid,
        friendshipUuid,
      })
      if (success) {
        Toast.show({
          type: 'success',
          position: 'top',
          text1: 'Friend removed',
          visibilityTime: 2000,
          autoHide: true,
          topOffset: 60,
        })
        // need to re-load friendships from local storage
        const newFriendsList = await friendsHelper.getEnhancedListOfFriendships(
          {
            uuid,
          },
        )
        setFriendsList(newFriendsList)
      } else {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Error removing friend',
          text2: 'Please try again',
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 60,
        })
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Error removing friend:', error)
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Error removing friend',
        text2: 'Please try again',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 60,
      })
    }
  }

  const handleDeletePendingFriend = async ({ friendshipUuid, contactName }) => {
    Alert.alert(
      'Remove Pending Friend',
      `Are you sure you want to remove the pending friendship with ${contactName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => handleRemoveFriend({ friendshipUuid }),
        },
      ],
    )
  }

  const setContactName = async ({ friendshipUuid, contactName }) => {
    try {
      let actualFriendshipUuid = friendshipUuid

      // If no friendshipUuid provided, we need to create a new friendship on the server
      if (!actualFriendshipUuid) {
        // Import the reducer to create friendship
        const reducer = await import('./reducer')

        const friendship = await reducer.createFriendship({
          uuid,
          topOffset: 0, // We don't have access to topOffset here, use 0
          contactName,
          autoShare: false, // Don't auto-share, user can share manually later
        })

        if (!friendship) {
          throw new Error('Failed to create friendship on server')
        }

        actualFriendshipUuid = friendship.friendshipUuid
      }

      // Save/update the contact name locally (for both new and existing friendships)
      // eslint-disable-next-line no-console
      console.log(
        `Saving contact name "${contactName}" for friendship ${actualFriendshipUuid}`,
      )

      await friendsHelper.setContactName({
        uuid,
        friendshipUuid: actualFriendshipUuid,
        contactName,
      })

      // reload friendships from server
      const newFriendsList = await friendsHelper.getEnhancedListOfFriendships({
        uuid,
      })
      setFriendsList(newFriendsList)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error in setContactName:', error)
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Error saving friend name',
        text2: 'Please try again',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 60,
      })
    }
  }

  const reload = useCallback(async () => {
    try {
      const newFriendsList = await friendsHelper.getEnhancedListOfFriendships({
        uuid,
      })
      setFriendsList(newFriendsList)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Error loading friendships:', error)
    }
  }, [uuid, setFriendsList])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const newFriendsList = await friendsHelper.getEnhancedListOfFriendships({
        uuid,
      })
      setFriendsList(newFriendsList)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Error refreshing friendships:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [uuid, setFriendsList])

  useEffect(() => {
    // Only load friendships when uuid is properly initialized
    if (uuid && uuid !== '') {
      reload()
    }
  }, [uuid, reload])

  const FriendItem = memo(({ friend }) => {
    const translateX = useRef(new Animated.Value(0)).current
    const currentTranslateXRef = useRef(0)
    const gestureStartOffsetRef = useRef(0)
    const [isSwipeOpen, setIsSwipeOpen] = useState(false)
    const [swipeDirection, setSwipeDirection] = useState(null) // 'left' or 'right'

    const displayName = friend?.contact || 'Unnamed Friend'
    const isPending = friend.uuid2 === null
    const hasUnread = friend.unreadCount > 0

    // Keep current value in a ref to compute offsets across gestures
    useEffect(() => {
      const id = translateX.addListener(({ value }) => {
        currentTranslateXRef.current = value
      })
      return () => {
        translateX.removeListener(id)
      }
    }, [translateX])

    const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

    const handleSwipeGesture = (event) => {
      if (isPending) return // Don't allow swipe for pending friends

      const { translationX, state } = event.nativeEvent

      // When a new gesture begins, capture current offset so we continue from it
      if (state === State.BEGAN) {
        gestureStartOffsetRef.current = currentTranslateXRef.current || 0
        return
      }

      // Update position continuously while swiping (onGestureEvent has no state)
      if (state === undefined || state === State.ACTIVE) {
        // Desired position is prior offset + live translation
        const desired = gestureStartOffsetRef.current + translationX
        translateX.setValue(clamp(desired, -80, 160))
      } else if (state === State.END || state === State.CANCELLED) {
        // Determine if swipe should be open or closed
        const final = gestureStartOffsetRef.current + translationX
        if (final > 80) {
          // Open right swipe action (share/edit)
          Animated.spring(translateX, {
            toValue: 160,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }).start()
          setIsSwipeOpen(true)
          setSwipeDirection('right')
        } else if (final < -40) {
          // Open left swipe action (delete)
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }).start()
          setIsSwipeOpen(true)
          setSwipeDirection('left')
        } else {
          // Close the swipe action
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }).start()
          setIsSwipeOpen(false)
          setSwipeDirection(null)
        }
      }
    }

    // Animated stripes (RIGHT SWIPE): sequential expansion
    // Blue (share) grows first from 8px to 80px as you swipe 0->72px,
    // Yellow (edit) stays visible at 8px and starts growing only after blue is full.
    const shareStripeWidth = translateX.interpolate({
      inputRange: [0, 80, 160],
      outputRange: [8, 80, 80],
      extrapolate: 'clamp',
    })
    const editStripeWidth = translateX.interpolate({
      inputRange: [0, 80, 160],
      outputRange: [8, 8, 80],
      extrapolate: 'clamp',
    })

    // Fade in content (icon + text) when there's enough space
    const shareContentOpacity = translateX.interpolate({
      inputRange: [0, 24, 40],
      outputRange: [0, 0, 1],
      extrapolate: 'clamp',
    })
    const editContentOpacity = translateX.interpolate({
      inputRange: [0, 96, 112, 128],
      outputRange: [0, 0, 0, 1],
      extrapolate: 'clamp',
    })
    // Increase left padding when actions are minimized (at rest)
    const contentPaddingLeft = translateX.interpolate({
      inputRange: [-80, 0, 160],
      outputRange: [16, 28, 16],
      extrapolate: 'clamp',
    })
    // Show left overlay stripes only for right-swipe (hide on left-swipe)
    const leftOverlayOpacity = translateX.interpolate({
      inputRange: [-1, 0, 160],
      outputRange: [0, 1, 1],
      extrapolate: 'clamp',
    })

    // RIGHT SWIPE LEFT: Expand delete stripe width from 8 -> 80 while content stays put
    const deleteStripeWidth = translateX.interpolate({
      inputRange: [-80, 0],
      outputRange: [80, 8],
      extrapolate: 'clamp',
    })
    const deleteContentOpacity = translateX.interpolate({
      inputRange: [-80, -56, -40, 0],
      outputRange: [1, 1, 0, 0],
      extrapolate: 'clamp',
    })

    // Show action backgrounds only when swiping starts to avoid showing through when minimized
    const rightActionsOpacity = translateX.interpolate({
      inputRange: [-80, 0, 10, 160],
      outputRange: [0, 0, 1, 1],
      extrapolate: 'clamp',
    })
    const leftActionsOpacity = translateX.interpolate({
      inputRange: [-80, -10, 0, 160],
      outputRange: [1, 1, 0, 0],
      extrapolate: 'clamp',
    })

    // Note: No opacity applied to the friend item card or stripes to avoid visual fading

    const closeSwipe = () => {
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start(() => {
        currentTranslateXRef.current = 0
        gestureStartOffsetRef.current = 0
      })
      setIsSwipeOpen(false)
      setSwipeDirection(null)
    }

    const handleShareName = () => {
      closeSwipe()
      handleShareFriend({
        friendshipUuid: friend.friendshipUuid,
        contactName: displayName,
        isPending: false,
      })
    }

    const handleEditFriend = () => {
      closeSwipe()
      setSelectedFriendshipUuid(friend.friendshipUuid)
      setShowNamePicker(true)
    }

    const handleDeleteFriend = () => {
      closeSwipe()
      Alert.alert(
        'Remove Friend',
        `Are you sure you want to remove ${displayName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () =>
              handleRemoveFriend({ friendshipUuid: friend.friendshipUuid }),
          },
        ],
      )
    }

    return (
      <View style={styles.friendItemContainer}>
        {/* Right Swipe Action Background - Share and Edit (always present behind) */}
        {!isPending && (
          <Animated.View
            style={[styles.rightSwipeAction, { opacity: rightActionsOpacity }]}
            pointerEvents="box-none"
          >
            <TouchableOpacity
              style={[styles.swipeActionButton, styles.shareAction]}
              onPress={handleShareName}
              activeOpacity={0.7}
            >
              <FontAwesome5 name="share-alt" size={18} color="white" />
              <Text style={styles.swipeActionText}>Share{'\n'}Name</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.swipeActionButton, styles.editAction]}
              onPress={handleEditFriend}
              activeOpacity={0.7}
            >
              <FontAwesome5 name="edit" size={18} color="white" />
              <Text style={styles.swipeActionText}>Edit{'\n'}Name</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Left Swipe Action Background - Delete (always present behind) */}
        {!isPending && (
          <Animated.View
            style={[styles.leftSwipeAction, { opacity: leftActionsOpacity }]}
            pointerEvents="box-none"
          >
            <TouchableOpacity
              style={[styles.swipeActionButton, styles.deleteAction]}
              onPress={handleDeleteFriend}
              activeOpacity={0.7}
            >
              <FontAwesome5 name="trash" size={18} color="white" />
              <Text style={styles.swipeActionText}>Delete{'\n'}Friend</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Main Friend Item */}
        <PanGestureHandler
          onGestureEvent={handleSwipeGesture}
          onHandlerStateChange={handleSwipeGesture}
          enabled={!isPending}
          activeOffsetX={[-20, 20]}
          failOffsetY={[-20, 20]}
          shouldCancelWhenOutside={true}
        >
          <Animated.View
            style={[
              styles.friendItem,
              {
                // Keep content fixed when swiping left (no negative translate visually)
                transform: [
                  {
                    translateX: translateX.interpolate({
                      inputRange: [-80, 0, 160],
                      outputRange: [0, 0, 160],
                      extrapolate: 'clamp',
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                if (isSwipeOpen) {
                  closeSwipe()
                  return
                }

                if (!isPending) {
                  router.push({
                    pathname: '/chat',
                    params: {
                      chatUuid: friend?.chatUuid,
                      contact: JSON.stringify(friend?.contact),
                      friendshipUuid: friend?.friendshipUuid,
                    },
                  })
                }
              }}
              onLongPress={() => {
                if (isSwipeOpen) {
                  closeSwipe()
                  return
                }

                // Only allow long press for pending friends to share friendship request
                if (isPending) {
                  Haptics.selectionAsync()
                  handleShareFriend({
                    friendshipUuid: friend.friendshipUuid,
                    contactName: displayName,
                    isPending: true,
                  })
                }
              }}
              disabled={isPending}
              activeOpacity={isPending ? 1 : 0.7}
            >
              {/* Animated padding wrapper to increase left padding when actions minimized */}
              {isPending ? (
                <View style={styles.friendContent}>
                  <View style={styles.friendHeader}>
                    <View style={styles.friendInfo}>
                      <Text
                        style={styles.friendName}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {displayName}
                      </Text>
                      <>
                        <View
                          style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                          <FontAwesome5
                            name="clock"
                            size={12}
                            color={theme.TEXT_PRIMARY}
                            style={{ marginRight: 6 }}
                          />
                          <Text style={styles.pendingStatus}>
                            Waiting for confirmation
                          </Text>
                        </View>
                        {/* Share and Delete buttons container */}
                        <View style={styles.shareButtonContainer}>
                          <TouchableOpacity
                            style={[styles.pendingShareButton]}
                            onPress={() =>
                              handleShareFriend({
                                friendshipUuid: friend.friendshipUuid,
                                contactName: displayName,
                                isPending: true,
                              })
                            }
                            activeOpacity={0.5}
                            delayPressIn={0}
                            delayPressOut={0}
                            hitSlop={{
                              top: 15,
                              bottom: 15,
                              left: 15,
                              right: 15,
                            }}
                            pressRetentionOffset={{
                              top: 20,
                              bottom: 20,
                              left: 20,
                              right: 20,
                            }}
                            importantForAccessibility="yes"
                          >
                            <FontAwesome5
                              name="share-alt"
                              size={12}
                              color="white"
                            />
                            <Text style={styles.pendingShareButtonText}>
                              Share
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.pendingDeleteButton]}
                            onPress={() =>
                              handleDeletePendingFriend({
                                friendshipUuid: friend.friendshipUuid,
                                contactName: displayName,
                              })
                            }
                            activeOpacity={0.5}
                            delayPressIn={0}
                            delayPressOut={0}
                            hitSlop={{
                              top: 15,
                              bottom: 15,
                              left: 15,
                              right: 15,
                            }}
                            pressRetentionOffset={{
                              top: 20,
                              bottom: 20,
                              left: 20,
                              right: 20,
                            }}
                            importantForAccessibility="yes"
                          >
                            <FontAwesome5
                              name="trash"
                              size={12}
                              color={theme.STATUS_ERROR}
                            />
                            <Text style={styles.pendingDeleteButtonText}>
                              Delete
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    </View>
                    {/* Right-side spacer removed; fixed padding handles consistency */}
                  </View>
                </View>
              ) : (
                <Animated.View
                  style={[
                    styles.friendContent,
                    { paddingLeft: contentPaddingLeft },
                  ]}
                >
                  <View style={styles.friendHeader}>
                    <View style={styles.friendInfo}>
                      <Text
                        style={styles.friendName}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {displayName}
                      </Text>
                      <>
                        <Text style={styles.friendStatus}>
                          {hasUnread
                            ? `${friend.unreadCount} new messages`
                            : ''}
                        </Text>
                      </>
                    </View>
                    {/* Right-side spacer removed; fixed padding handles consistency */}
                  </View>
                </Animated.View>
              )}
            </TouchableOpacity>
          </Animated.View>
        </PanGestureHandler>

        {/* Overlay stripes that hint at swipe actions and expand with swipe */}
        {!isPending && (
          <>
            {/* Left edge (for right swipe -> share/edit). Two segments; blue grows first, yellow follows */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.stripeOverlayLeft,
                { opacity: leftOverlayOpacity },
              ]}
            >
              <View style={{ flexDirection: 'row', height: '100%' }}>
                <Animated.View
                  style={[
                    styles.shareAction,
                    { width: shareStripeWidth, height: '100%' },
                  ]}
                >
                  <Animated.View
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: shareContentOpacity,
                    }}
                  >
                    <FontAwesome5 name="share-alt" size={18} color="white" />
                    <Text style={styles.swipeActionText}>Share{'\n'}Name</Text>
                  </Animated.View>
                </Animated.View>
                <Animated.View
                  style={[
                    styles.editAction,
                    { width: editStripeWidth, height: '100%' },
                  ]}
                >
                  <Animated.View
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: editContentOpacity,
                    }}
                  >
                    <FontAwesome5 name="edit" size={18} color="white" />
                    <Text style={styles.swipeActionText}>Edit{'\n'}Name</Text>
                  </Animated.View>
                </Animated.View>
              </View>
            </Animated.View>

            {/* Right edge (for left swipe -> delete). Expand width while content stays put */}
            <Animated.View
              pointerEvents="auto"
              style={[styles.stripeOverlayRight, { width: deleteStripeWidth }]}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={handleDeleteFriend}
                activeOpacity={0.7}
              >
                <Animated.View
                  style={{
                    alignItems: 'center',
                    opacity: deleteContentOpacity,
                  }}
                >
                  <FontAwesome5 name="trash" size={18} color="white" />
                  <Text style={styles.swipeActionText}>Delete{'\n'}Friend</Text>
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>
          </>
        )}
      </View>
    )
  })

  const renderFriend = ({ item: friend }) => {
    return <FriendItem friend={friend} />
  }

  if (!friendsList || friendsList.length === 0) {
    return (
      <View style={styles.container}>
        <NamePicker
          show={showNamePicker}
          setShow={setShowNamePicker}
          setContactName={setContactName}
          headerText={headerText}
          friendshipUuid={selectedFriendshipUuid}
        />
        <ShareOptionsModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          friendshipUuid={shareModalData?.friendshipUuid}
          friendName={shareModalData?.friendName}
          uuid={uuid}
          topOffset={60}
        />
        <ShareFriendNameModal
          visible={showShareNameModal}
          onClose={() => setShowShareNameModal(false)}
          friendshipUuid={shareNameModalData?.friendshipUuid}
          friendName={shareNameModalData?.friendName}
          topOffset={60}
        />
        <EmptyStateCard
          icon="users"
          title="No Friends Yet"
          subtitle="Add your first friend to start sharing photos and chatting privately. Build your network and stay connected!"
          actionText="Add a Friend"
          onActionPress={handleAddFriend}
          iconColor={theme.TEXT_PRIMARY}
        />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.HEADER_BACKGROUND }}>
      <View style={styles.container}>
        <NamePicker
          show={showNamePicker}
          setShow={setShowNamePicker}
          setContactName={setContactName}
          headerText={headerText}
          friendshipUuid={selectedFriendshipUuid}
        />
        <ShareOptionsModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          friendshipUuid={shareModalData?.friendshipUuid}
          friendName={shareModalData?.friendName}
          uuid={uuid}
          topOffset={60}
        />
        <ShareFriendNameModal
          visible={showShareNameModal}
          onClose={() => setShowShareNameModal(false)}
          friendshipUuid={shareNameModalData?.friendshipUuid}
          friendName={shareNameModalData?.friendName}
          topOffset={60}
        />
        <FlatList
          data={friendsList}
          renderItem={renderFriend}
          keyExtractor={(item) => item.friendshipUuid}
          style={styles.flatList}
          contentContainerStyle={{
            paddingBottom: 20,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={15}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={true}
          getItemLayout={(data, index) => ({
            length: 80, // Approximate height of each friend item
            offset: 80 * index,
            index,
          })}
        />
      </View>
    </View>
  )
}

export default FriendsList
