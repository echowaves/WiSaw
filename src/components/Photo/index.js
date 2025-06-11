import { useFocusEffect, useNavigation } from '@react-navigation/native'
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

import { Badge, Card, Divider, LinearProgress, Text } from '@rneui/themed'

import { Col, Grid, Row } from 'react-native-easy-grid'

// import ReactNativeZoomableView from '@openspacelabs/react-native-zoomable-view/src/ReactNativeZoomableView'

// import ImageZoom from 'react-native-image-pan-zoom'

import PropTypes from 'prop-types'

import { useEvent } from 'expo'
import { useVideoPlayer, VideoView } from 'expo-video'

import * as reducer from './reducer'

import * as friendsHelper from '../../screens/FriendsList/friends_helper'

import * as CONST from '../../consts'
import * as STATE from '../../state'

import ShareModal from '../ShareModal'
import ImageView from './ImageView'

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
  const [shareModalVisible, setShareModalVisible] = useState(false)

  const navigation = useNavigation()

  const { width, height } = useWindowDimensions()
  const imageHeight = height - 250

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
    // console.log({ friendsList })

    if (!photoDetails?.comments || photoDetails?.comments?.length === 0) {
      return (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                marginLeft: 10,
                color: CONST.MAIN_COLOR,
              }}
            >
              {friendsHelper.getLocalContactName({
                uuid,
                friendUuid: photo.uuid,
                friendsList,
              })}
              {'\n'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                marginRight: 10,
                color: CONST.MAIN_COLOR,
                textAlign: 'right',
              }}
            >
              {renderDateTime(photo.createdAt)}
            </Text>
            <Text />
          </View>
        </View>
      )
    }

    return (
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              marginLeft: 10,
              color: CONST.MAIN_COLOR,
            }}
          >
            {friendsHelper.getLocalContactName({
              uuid,
              friendUuid: photo.uuid,
              friendsList,
            })}
            {'\n'}
            {photoDetails?.comments ? photoDetails?.comments?.length : 0}{' '}
            Comment
            {(photoDetails?.comments ? photoDetails?.comments?.length : 0) !== 1
              ? 's'
              : ''}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              marginRight: 10,
              color: CONST.MAIN_COLOR,
              textAlign: 'right',
            }}
          >
            {renderDateTime(photo.createdAt)}
          </Text>
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
        <View>
          {photoDetails?.comments.map((comment, i) => (
            <Row key={comment.id}>
              <TouchableOpacity
                onPress={() => {
                  setPhotoDetails(
                    reducer.toggleCommentButtons({
                      photoDetails,
                      commentId: comment.id,
                    }),
                  )
                }}
              >
                <Card
                  width={width - 30}
                  containerStyle={{
                    paddingTop: 5,
                    paddingBottom: 5,
                    marginTop: 5,
                    marginBottom: 5,
                    borderWidth: 0,
                    elevation: 0,
                    shadowColor: 'rgba(0,0,0, .2)',
                    shadowOffset: { height: 0, width: 0 },
                    shadowOpacity: 0, // default is 1
                    shadowRadius: 0, // default is 1
                  }}
                >
                  <Text
                    style={{
                      color: CONST.TEXT_COLOR,
                      fontSize: 20,
                    }}
                  >
                    {comment.comment}
                  </Text>
                  {renderCommentButtons({ comment })}
                </Card>
                {!comment.hiddenButtons && (
                  <View style={{ flex: 1, flexDirection: 'row' }}>
                    <Text
                      style={{
                        color: CONST.MAIN_COLOR,
                        // fontSize: 10,
                        marginLeft: 10,
                      }}
                    >
                      {friendsHelper.getLocalContactName({
                        uuid,
                        friendUuid: comment.uuid,
                        friendsList,
                      })}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          marginRight: 10,
                          color: CONST.MAIN_COLOR,
                          textAlign: 'right',
                        }}
                      >
                        {renderDateTime(comment.updatedAt)}
                      </Text>
                    </View>
                  </View>
                )}
                <Divider />
              </TouchableOpacity>
            </Row>
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
        style={{
          flex: 1,
          flexDirection: 'row',
        }}
        onPress={() =>
          navigation.navigate('ModalInputTextScreen', {
            photo,
            uuid,
            topOffset,
          })
        }
      >
        <Col size={2} />
        <Col
          size={6}
          style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text
            style={{
              fontSize: 25,
              color: CONST.MAIN_COLOR,
            }}
          >
            add comment
          </Text>
        </Col>
        <Col size={2}>
          <Ionicons
            name="add-circle"
            style={{
              fontSize: 45,
              color: CONST.MAIN_COLOR,
            }}
          />
        </Col>
      </TouchableOpacity>
    )
  }

  const renderRecognitions = () => {
    if (
      !photoDetails ||
      !photoDetails?.recognitions ||
      photoDetails?.recognitions?.length === 0
    ) {
      return <Text />
    }

    const labels = JSON.parse(photoDetails?.recognitions[0].metaData).Labels
    const textDetections = JSON.parse(
      photoDetails?.recognitions[0].metaData,
    ).TextDetections?.filter((text) => text.Type === 'LINE')
    const moderationLabels = JSON.parse(
      photoDetails?.recognitions[0].metaData,
    ).ModerationLabels
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {labels?.length > 0 && (
          <Card
            width={width - 100}
            containerStyle={{
              borderWidth: 0,
              elevation: 0,
              shadowColor: 'rgba(0,0,0, .2)',
              shadowOffset: { height: 0, width: 0 },
              shadowOpacity: 0, // default is 1
              shadowRadius: 0, // default is 1
            }}
          >
            <Text
              style={{
                fontWeight: 'bold',
                textAlignVertical: 'center',
                textAlign: 'center',
              }}
            >
              AI recognized tags:
            </Text>
            {labels.map((label) => (
              <Text
                key={label.Name}
                style={{
                  fontSize: label.Confidence / 5,
                  textAlignVertical: 'center',
                  textAlign: 'center',
                }}
              >
                {label.Name}
              </Text>
            ))}
            <Text />
            <Divider />
          </Card>
        )}

        {textDetections?.length > 0 && (
          <Card
            width={width - 100}
            containerStyle={{
              borderWidth: 0,
              elevation: 0,
              shadowColor: 'rgba(0,0,0, .2)',
              shadowOffset: { height: 0, width: 0 },
              shadowOpacity: 0, // default is 1
              shadowRadius: 0, // default is 1
            }}
          >
            <Text
              style={{
                fontWeight: 'bold',
                textAlignVertical: 'center',
                textAlign: 'center',
              }}
            >
              AI recognized text:
            </Text>
            {textDetections.map((text) => (
              <Text
                key={text.Id}
                style={{
                  fontSize: text.Confidence / 5,
                  textAlignVertical: 'center',
                  textAlign: 'center',
                }}
              >
                {text.DetectedText}
              </Text>
            ))}
            <Text />
            <Divider />
          </Card>
        )}

        {moderationLabels?.length > 0 && (
          <Card
            width={width - 100}
            containerStyle={{
              borderWidth: 0,
              elevation: 0,
              shadowColor: 'rgba(0,0,0, .2)',
              shadowOffset: { height: 0, width: 0 },
              shadowOpacity: 0, // default is 1
              shadowRadius: 0, // default is 1
            }}
          >
            <Text
              style={{
                fontWeight: 'bold',
                color: 'red',
                textAlignVertical: 'center',
                textAlign: 'center',
              }}
            >
              AI moderation tags:
            </Text>
            {moderationLabels.map((label) => (
              <Text
                key={label.Name}
                style={{
                  fontSize: label.Confidence / 5,
                  color: 'red',
                  textAlignVertical: 'center',
                  textAlign: 'center',
                }}
              >
                {label.Name}
              </Text>
            ))}
          </Card>
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
            navigation.goBack()
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
    <SafeAreaView
      style={{
        backgroundColor: CONST.NAV_COLOR,
        width,
        borderWidth: 0.5,
        borderColor: 'rgba(100,100,100,0.1)',
        height: 85,
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 0,
      }}
    >
      {photoDetails?.isPhotoWatched === undefined && (
        <LinearProgress
          color={CONST.MAIN_COLOR}
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            left: 0,
          }}
        />
      )}
      {photoDetails?.isPhotoWatched !== undefined && (
        <Grid
          style={{
            position: 'absolute',
            top: 10,
            right: 0,
            left: 0,
          }}
        >
          {/* delete button */}
          <Col
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => handleDelete()}
          >
            <FontAwesome
              name="trash"
              style={{
                color: photoDetails?.isPhotoWatched
                  ? CONST.SECONDARY_COLOR
                  : CONST.MAIN_COLOR,
              }}
              size={30}
            />
            <Text style={{ fontSize: 10 }}>Delete</Text>
          </Col>
          {/* ban button */}
          <Col
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => handleBan()}
          >
            <FontAwesome
              name="ban"
              style={{
                color:
                  photoDetails?.isPhotoWatched || isPhotoBannedByMe()
                    ? CONST.SECONDARY_COLOR
                    : CONST.MAIN_COLOR,
              }}
              size={30}
            />
            <Text style={{ fontSize: 10 }}>Report Abuse</Text>
          </Col>
          {/* watch button */}
          <Col
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={async () => {
              handleFlipWatch()
            }}
          >
            {photoDetails.watchersCount > 0 && (
              <Badge
                badgeStyle={{
                  backgroundColor: CONST.MAIN_COLOR,
                }}
                containerStyle={{ position: 'absolute', top: -9, right: -9 }}
                value={photoDetails.watchersCount}
              />
            )}
            <AntDesign
              name={photoDetails?.isPhotoWatched ? 'star' : 'staro'}
              style={{
                color: CONST.MAIN_COLOR,
              }}
              size={30}
            />
            <Text style={{ fontSize: 10 }}>
              {`${photoDetails?.isPhotoWatched ? 'un-Star' : 'Star'}`}
            </Text>
          </Col>
          {/* share button */}
          <Col
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => {
              setShareModalVisible(true)
            }}
          >
            <FontAwesome
              name="share"
              style={{
                color: CONST.MAIN_COLOR,
              }}
              size={30}
            />
            <Text style={{ fontSize: 10 }}>Share</Text>
          </Col>
        </Grid>
      )}
    </SafeAreaView>
  )

  const styles = StyleSheet.create({
    photoContainer: {
      width,
      height,
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      backgroundColor: 'transparent',
    },
  })

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
    <View>
      <ScrollView
        // disableScrollViewPanResponder
        // nestedScrollEnabled
        // overScrollMode="always"
        showsVerticalScrollIndicator
        style={{ margin: 1, backgroundColor: 'white' }}
      >
        {renderPhotoRow()}
        <Grid>
          <Row>{renderCommentsStats()}</Row>
          <Row>{renderCommentsRows()}</Row>
          <Row>{renderAddCommentsRow()}</Row>
          <Divider />
          <Row>{renderRecognitions()}</Row>
          <Row style={{ height: 110 }} />
        </Grid>
      </ScrollView>
      {renderFooter()}

      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        shareData={{
          type: 'photo',
          photo,
          photoDetails,
        }}
        topOffset={topOffset}
      />
    </View>
  )
}

Photo.propTypes = {
  photo: PropTypes.object.isRequired,
}

export default Photo
