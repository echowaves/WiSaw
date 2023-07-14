import React, { useRef, useState, useContext /* useEffect */ } from 'react'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'

import { FontAwesome, Ionicons, AntDesign } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import moment from 'moment'
import {
  View,
  TouchableOpacity,
  Alert,
  InteractionManager,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'

import { Text, Card, LinearProgress, Divider, Badge } from '@rneui/themed'

import { Col, Row, Grid } from 'react-native-easy-grid'

// import ReactNativeZoomableView from '@openspacelabs/react-native-zoomable-view/src/ReactNativeZoomableView'

// import ImageZoom from 'react-native-image-pan-zoom'

import PropTypes from 'prop-types'

import { Video } from 'expo-av'

import * as reducer from './reducer'

import * as friendsHelper from '../../screens/FriendsList/friends_helper'

import * as CONST from '../../consts'

import ImageView from './ImageView'

const Photo = ({ photo }) => {
  const { authContext, setAuthContext } = useContext(CONST.AuthContext)

  const componentIsMounted = useRef(true)

  const videoRef = useRef(null)

  const [bans, setBans] = useState([])

  // const [status, setStatus] = useState({})
  const [photoDetails, setPhotoDetails] = useState(null)
  // const topOffset = useSelector((state) => state.photosList.topOffset)

  const navigation = useNavigation()

  const dispatch = useDispatch()
  // const deviceOrientation = useDeviceOrientation()
  const { width, height } = useWindowDimensions()
  const imageHeight = height - 250
  // const error = useSelector(state => state.photo.error)

  useFocusEffect(
    // use this to make the navigastion to a detailed screen faster
    React.useCallback(() => {
      const { uuid, topOffset } = authContext

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
    const { uuid, topOffset, friendsList } = authContext
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
            {photoDetails?.comments ? photoDetails?.comments.length : 0} Comment
            {(photoDetails?.comments ? photoDetails?.comments.length : 0) !== 1
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
    const { uuid, topOffset } = authContext

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
    const { uuid, topOffset, friendsList } = authContext

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
    const { uuid, topOffset } = authContext

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
    ).TextDetections.filter((text) => text.Type === 'LINE')
    const moderationLabels = JSON.parse(
      photoDetails?.recognitions[0].metaData,
    ).ModerationLabels
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {labels.length > 0 && (
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

        {textDetections.length > 0 && (
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

        {moderationLabels.length > 0 && (
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
    const { uuid, topOffset } = authContext

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
              // console.log('deleted:', { photo })
              setAuthContext((prevAuthContext) => ({
                ...prevAuthContext,
                photosList: [
                  ...prevAuthContext.photosList.filter(
                    (item) => item.id !== photo.id,
                  ),
                ],
              }))
            }
            navigation.goBack()
          },
        },
      ],
      { cancelable: true },
    )
  }

  const handleBan = () => {
    const { uuid, topOffset } = authContext

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
    const { uuid, topOffset } = authContext

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

  const renderFooter = () => {
    const { uuid, topOffset } = authContext
    return (
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
              onPress={async () => {
                await reducer.sharePhoto({ photo, photoDetails, topOffset })
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
  }

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
      <Video
        ref={videoRef}
        style={{
          flex: 1,
          height: imageHeight,
        }}
        // style={
        //   styles.photoContainer
        // }
        source={{
          uri: `${photo.videoUrl}`,
        }}
        useNativeControls
        // overrideFileExtensionAndroid
        resizeMode="contain"
        // onPlaybackStatusUpdate={status => setStatus(() => status)}
        usePoster={false}
        posterSource={{ uri: `${photo.thumbUrl}` }}
        isLooping
      />
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
    </View>
  )
}

Photo.propTypes = {
  photo: PropTypes.object.isRequired,
}

export default Photo
