import React, { useRef, useState /* useEffect */ } from 'react'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"

import { useDimensions } from '@react-native-community/hooks'

import { FontAwesome, Ionicons, AntDesign } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import moment from 'moment'

import {
  // Dimensions,
  View,
  TouchableOpacity,
  Alert,
  InteractionManager,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native'

import {
  Text,
  Card,
  LinearProgress,
  Divider,
  Badge,
} from 'react-native-elements'

import { Col, Row, Grid } from "react-native-easy-grid"

import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView'

import PropTypes from 'prop-types'

import { Video } from 'expo-av'

import CachedImage from 'expo-cached-image'

// import { async } from 'regenerator-runtime'
import * as reducer from './reducer'

import * as friendsHelper from '../../screens/FriendsList/friends_helper'

import * as CONST from '../../consts.js'

const Photo = ({ photo }) => {
  const componentIsMounted = useRef(true)
  const uuid = useSelector(state => state.secret.uuid)
  const friendsList = useSelector(state => state.friendsList.friendsList)

  // const videoRef = React.useRef(null)

  const videoRef = useRef(null)

  // const [status, setStatus] = useState({})
  const [photoDetails, setPhotoDetails] = useState(null)
  const topOffset = useSelector(state => state.photosList.topOffset)

  const navigation = useNavigation()

  const dispatch = useDispatch()
  // const deviceOrientation = useDeviceOrientation()
  const { width, height } = useDimensions().window
  const imageHeight = height - 250
  const bans = useSelector(state => state.photo.bans)
  // const error = useSelector(state => state.photo.error)

  useFocusEffect( // use this to make the navigastion to a detailed screen faster
    React.useCallback(() => {
      const task = InteractionManager.runAfterInteractions(async () => {
        if (componentIsMounted) {
          const photoDetails = await reducer.getPhotoDetails({ photoId: photo.id, uuid })
          setPhotoDetails({
            ...photoDetails,
            watchersCount: photo.watchersCount,
          })
        }
      })

      return () => {
        componentIsMounted.current = false
        task.cancel()
      }
    }, [])// eslint-disable-line react-hooks/exhaustive-deps
  )

  // useEffect(() => {
  //   if (videoRef?.current) {
  //     // console.log({ videoRef })
  //     // videoRef.current.presentFullscreenPlayer()
  //     // videoRef.current.playAsync()
  //   }
  // }, [videoRef])// eslint-disable-line react-hooks/exhaustive-deps

  const renderDateTime = dateString => {
    const dateTime = moment(new Date(dateString), "YYYY-MM-DD-HH-mm-ss-SSS").format("LLL")
    return dateTime
  }

  const renderCommentsStats = ({ photo, photoDetails }) => {
    if (!photoDetails?.comments || photoDetails?.comments?.length === 0) {
      return (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                marginLeft: 10,
                color: CONST.MAIN_COLOR,
              }}>
              {friendsHelper.getLocalContactName({ uuid, friendUuid: photo.uuid, friendsList })}
              {"\n"}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                marginRight: 10,
                color: CONST.MAIN_COLOR,
                textAlign: 'right',
              }}>
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
            }}>
            {friendsHelper.getLocalContactName({ uuid, friendUuid: photo.uuid, friendsList })}
            {"\n"}
            {photoDetails?.comments ? photoDetails?.comments.length : 0} Comment{(photoDetails?.comments ? photoDetails?.comments.length : 0) !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              marginRight: 10,
              color: CONST.MAIN_COLOR,
              textAlign: 'right',
            }}>
            {renderDateTime(photo.createdAt)}
          </Text>
        </View>
      </View>
    )
  }

  const renderCommentButtons = ({ photo, comment }) => {
    if (!comment?.hiddenButtons) {
      return (
        <View style={{
          position: 'absolute',
          right: 1,
          bottom: 1,
        }}>
          <FontAwesome
            onPress={
              () => {
                Alert.alert(
                  'Delete Comment?',
                  'This can\'t be undone. Are you sure? ',
                  [
                    { text: 'No', onPress: () => null, style: 'cancel' },
                    {
                      text: 'Yes',
                      onPress: async () => {
                        // update commentsCount in global reduce store
                        await dispatch(reducer.deleteComment({ photo, comment }))
                        // bruit force reload comments to re-render in the photo details screen
                        const updatedPhotoDetails = await reducer.getPhotoDetails({ photoId: photo.id, uuid })
                        setPhotoDetails({
                          ...photoDetails,
                          ...updatedPhotoDetails,
                        })
                      },
                    },
                  ],
                  { cancelable: true }
                )
              }
            }
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

  const renderCommentsRows = ({ photo, photoDetails }) => {
    if (photoDetails?.comments) {
      return (
        <View>
          {photoDetails?.comments.map((comment, i) => (
            <Row
              key={comment.id}>
              <TouchableOpacity
                onPress={
                  () => {
                    setPhotoDetails(reducer.toggleCommentButtons({ photoDetails, commentId: comment.id }))
                  }
                }>
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
                  }}>
                  <Text
                    style={{
                      color: CONST.TEXT_COLOR,
                      fontSize: 20,
                    }}>{comment.comment}
                  </Text>
                  {renderCommentButtons({ photo, comment })}
                </Card>
                {!comment.hiddenButtons && (
                  <View style={{ flex: 1, flexDirection: 'row' }}>
                    <Text
                      style={{
                        color: CONST.MAIN_COLOR,
                        // fontSize: 10,
                        marginLeft: 10,
                      }}>
                      {friendsHelper.getLocalContactName({ uuid, friendUuid: comment.uuid, friendsList })}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          marginRight: 10,
                          color: CONST.MAIN_COLOR,
                          textAlign: 'right',
                        }}>
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
  }

  const renderAddCommentsRow = ({ photo, photoDetails }) => {
    if (!photoDetails?.comments) {
      return <Text />
    }
    return (
      <TouchableOpacity
        style={{
          flex: 1,
          flexDirection: 'row',
        }}
        onPress={
          () => navigation.navigate('ModalInputTextScreen', { photo })
        }>
        <Col
          size={2}
        />
        <Col
          size={6}
          style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 25,
              color: CONST.MAIN_COLOR,
            }}>
            add comment
          </Text>
        </Col>
        <Col
          size={2}>
          <Ionicons
            name="add-circle"
            style={
              {
                fontSize: 45,
                color: CONST.MAIN_COLOR,
              }
            }
          />
        </Col>
      </TouchableOpacity>
    )
  }

  const renderRecognitions = ({ photoDetails }) => {
    if (!photoDetails || !photoDetails?.recognitions || photoDetails?.recognitions?.length === 0) {
      return <Text />
    }

    const labels = JSON.parse(photoDetails?.recognitions[0].metaData).Labels
    const textDetections = JSON.parse(photoDetails?.recognitions[0].metaData).TextDetections
      .filter(text => text.Type === 'LINE')
    const moderationLabels = JSON.parse(photoDetails?.recognitions[0].metaData).ModerationLabels
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
            }}>
            <Text style={{ fontWeight: 'bold', textAlignVertical: 'center', textAlign: 'center' }}>AI recognized tags:</Text>
            {labels.map(label => (
              <Text key={label.Name} style={{ fontSize: label.Confidence / 5, textAlignVertical: 'center', textAlign: 'center' }}>{label.Name}</Text>
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
            }}>
            <Text style={{
              fontWeight: 'bold', textAlignVertical: 'center', textAlign: 'center',
            }}>AI recognized text:
            </Text>
            {textDetections.map(text => (
              <Text key={text.Id} style={{ fontSize: text.Confidence / 5, textAlignVertical: 'center', textAlign: 'center' }}>{text.DetectedText}</Text>
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
            }}>
            <Text style={{
              fontWeight: 'bold', color: 'red', textAlignVertical: 'center', textAlign: 'center',
            }}>AI moderation tags:
            </Text>
            {moderationLabels.map(label => (
              <Text
                key={label.Name} style={{
                  fontSize: label.Confidence / 5, color: 'red', textAlignVertical: 'center', textAlign: 'center',
                }}>{label.Name}
              </Text>
            ))}
          </Card>
        )}
      </View>
    )
  }

  const renderFooter = ({ photo, photoDetails }) => (
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
      }}>

      { photoDetails?.isPhotoWatched === undefined && (
        <LinearProgress
          color={
            CONST.MAIN_COLOR
          }
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            left: 0,
          }}
        />
      )}
      { photoDetails?.isPhotoWatched !== undefined && (
        <Grid
          style={{
            position: 'absolute',
            top: 10,
            right: 0,
            left: 0,
          }}>
          {/* delete button */}
          <Col
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={
              () => handleDelete({ photo, photoDetails })
            }>
            <FontAwesome
              name="trash"
              style={{
                color: photoDetails?.isPhotoWatched ? CONST.SECONDARY_COLOR : CONST.MAIN_COLOR,
              }}
              size={30}

            />
            <Text style={{ fontSize: 10 }}>
              Delete
            </Text>
          </Col>
          {/* ban button */}
          <Col
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={
              () => handleBan({ photo, photoDetails })
            }>
            <FontAwesome
              name="ban"
              style={{
                color: photoDetails?.isPhotoWatched || isPhotoBannedByMe({ photoId: photo?.id }) ? CONST.SECONDARY_COLOR : CONST.MAIN_COLOR,
              }}
              size={30}
            />
            <Text style={{ fontSize: 10 }}>
              Ban
            </Text>
          </Col>
          {/* watch button */}
          <Col
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={
              async () => {
                handleFlipWatch({ photoDetails, photo })
              }
            }>
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
              name={photoDetails?.isPhotoWatched ? "star" : "staro"}
              style={
                {
                  color: CONST.MAIN_COLOR,
                }
              }
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
            onPress={
              async () => {
                dispatch(reducer.sharePhoto({ photo, photoDetails }))
              }
            }>
            <FontAwesome
              name="share"
              style={
                {
                  color: CONST.MAIN_COLOR,
                }
              }
              size={30}
            />
            <Text style={{ fontSize: 10 }}>
              Share
            </Text>
          </Col>
        </Grid>
      )}
    </SafeAreaView>
  )

  const handleBan = ({ photo, photoDetails }) => {
    if (photoDetails?.isPhotoWatched) {
      Toast.show({
        text1: 'Unable to ban Starred photo',
        text2: 'Un-Star photo first',
        type: "error",
        topOffset,
      })
      return
    }
    if (isPhotoBannedByMe({ photoId: photo?.id })) {
      Toast.show({
        text1: 'Looks like you already Banned this Photo',
        text2: 'You can only Ban same Photo once',
        type: "error",
        topOffset,
      })
    } else {
      Alert.alert(
        'Report abusive Photo?',
        'The user who posted this photo will be banned. Are you sure?',
        [
          { text: 'No', onPress: () => null, style: 'cancel' },
          { text: 'Yes', onPress: () => dispatch(reducer.banPhoto({ photo })) },
        ],
        { cancelable: true }
      )
    }
  }

  const handleDelete = ({ photo, photoDetails }) => {
    if (photoDetails?.isPhotoWatched) {
      Toast.show({
        text1: 'Unable to delete Starred photo',
        text2: 'Un-Star photo first',
        type: "error",
        topOffset,
      })
      return
    }
    Alert.alert(
      'Will delete photo for everyone!',
      'This can\'t be undone. Are you sure? ',
      [
        { text: 'No', onPress: () => null, style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            dispatch(reducer.deletePhoto({ photo }))
            navigation.goBack()
          },
        },
      ],
      { cancelable: true }
    )
  }

  const isPhotoBannedByMe = ({ photoId }) => bans.includes(photoId)

  const handleFlipWatch = async ({ photoDetails, photo }) => {
    try {
      if (photoDetails?.isPhotoWatched) {
        setPhotoDetails({
          ...photoDetails,
          watchersCount: await dispatch(reducer.unwatchPhoto({ photo })),
          isPhotoWatched: !photoDetails?.isPhotoWatched,
        })
      } else {
        setPhotoDetails({
          ...photoDetails,
          watchersCount: await dispatch(reducer.watchPhoto({ photo })),
          isPhotoWatched: !photoDetails?.isPhotoWatched,
        })
      }
    } catch (err) {
      Toast.show({
        text1: 'Unable to complete',
        text2: 'Network issue? Try again later',
        type: "error",
        topOffset,
      })
    }
  }

  const styles = StyleSheet.create({
    photoContainer: {
      width,
      height: imageHeight,
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      backgroundColor: 'transparent',
    },
  })

  const renderPhotoRow = ({ photo }) => {
    if (!photo.video) {
      return (
        <ReactNativeZoomableView
          style={{
            width,
            height: imageHeight,
            // top: 0,
            // bottom: 0,
            // right: 0,
            // left: 0,
            // backgroundColor: 'transparent',
          }}
          zoomEnabled
          maxZoom={3.0}
          minZoom={1}
          zoomStep={3}
          initialZoom={1.0}
          bindToBorders
          captureEvent>
          <CachedImage
            source={{ uri: `${photo.thumbUrl}` }}
            cacheKey={`${photo.id}-thumb`}
            resizeMode="contain"
            style={
              styles.photoContainer
            }
          />
          <CachedImage
            source={{ uri: `${photo.imgUrl}` }}
            cacheKey={`${photo.id}`}
            resizeMode="contain"
            style={
              styles.photoContainer
            }
          />
        </ReactNativeZoomableView>
      )
    }
    return (
      <View
        style={{
          flex: 1,
          height: imageHeight,
        }}>

        <Video
          ref={videoRef}
          style={
            styles.photoContainer
          }
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
      </View>

    )
  }

  return (
    <View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ margin: 1, backgroundColor: 'white' }}>
        {renderPhotoRow({ photo })}
        <Grid>
          <Row />
          <Row>
            {renderCommentsStats({ photo, photoDetails }) }
          </Row>
          <Row>
            { renderCommentsRows({ photo, photoDetails }) }
          </Row>
          <Row>
            { renderAddCommentsRow({ photo, photoDetails }) }
          </Row>
          <Divider />
          <Row>
            {renderRecognitions({ photoDetails }) }
          </Row>
          <Row style={{ height: 110 }} />
        </Grid>
      </ScrollView>
      {renderFooter({ photo, photoDetails })}
    </View>
  )
}

Photo.propTypes = {
  photo: PropTypes.object.isRequired,
}

export default (Photo)
