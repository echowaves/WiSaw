import React, { useRef } from 'react'
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

import stringifyObject from 'stringify-object'

import CachedImage from 'expo-cached-image'

import * as reducer from './reducer'

import * as CONST from '../../consts.js'

const Photo = ({ item }) => {
  const componentIsMounted = useRef(true)

  const navigation = useNavigation()

  const dispatch = useDispatch()
  // const deviceOrientation = useDeviceOrientation()
  const { width, height } = useDimensions().window
  const imageHeight = height - 200
  const bans = useSelector(state => state.photo.bans)

  // const error = useSelector(state => state.photo.error)

  useFocusEffect( // use this to make the navigastion to a detailed screen faster
    React.useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        if (componentIsMounted) {
          dispatch(reducer.getPhotoDetails({ item }))
        }
      })

      return () => {
        componentIsMounted.current = false
        task.cancel()
      }
    }, [])// eslint-disable-line react-hooks/exhaustive-deps
  )

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

  const renderPhotoRow = () => (
    <ReactNativeZoomableView
      style={{
        flex: 1,
        height: imageHeight,
      }}
      zoomEnabled
      maxZoom={10.0}
      minZoom={1.0}
      zoomStep={1.0}
      initialZoom={1.0}
      bindToBorders
      doubleTapZoomToCenter={false}
      captureEvent={false}>
      <CachedImage
        source={{ uri: `${item.thumbUrl}` }}
        cacheKey={`${item.id}-thumb`}
        resizeMode="contain"
        style={
          styles.photoContainer
        }
      />
      <LinearProgress
        color={
          CONST.MAIN_COLOR
        }
        style={{
          alignSelf: 'center',
          width: width / 4,
          position: 'absolute',
          top: imageHeight / 2,
        }}
      />
      <CachedImage
        source={{ uri: `${item.imgUrl}` }}
        cacheKey={`${item.id}`}
        resizeMode="contain"
        style={
          styles.photoContainer
        }
      />
    </ReactNativeZoomableView>
  )
  const renderDateTime = dateString => {
    const dateTime = moment(new Date(dateString), "YYYY-MM-DD-HH-mm-ss-SSS").format("LLL")
    return dateTime
  }

  const renderCommentsStats = () => {
    if (!item.comments || item.comments.length === 0) {
      return (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                marginRight: 10,
                color: CONST.MAIN_COLOR,
                textAlign: 'right',
              }}>
              {renderDateTime(item.createdAt)}
            </Text>
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
            {item.comments ? item.comments.length : 0} Comment{(item.comments ? item.comments.length : 0) !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              marginRight: 10,
              color: CONST.MAIN_COLOR,
              textAlign: 'right',
            }}>
            {renderDateTime(item.createdAt)}
          </Text>
        </View>
      </View>
    )
  }

  const renderCommentButtons = ({ photo, comment }) => {
    if (!comment.hiddenButtons) {
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
                  'The comment will be deleted from the cloud and will never be seeing again by anyone. Are you sure?',
                  [
                    { text: 'No', onPress: () => null, style: 'cancel' },
                    {
                      text: 'Yes',
                      onPress: () => {
                        dispatch(reducer.deleteComment({ photo, comment }))
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

  const renderCommentsRows = () => {
    if (item.comments) {
      return (
        <View>
          {item.comments.map((comment, i) => (
            <Row
              key={comment.id}>
              <TouchableOpacity
                onPress={
                  () => {
                    dispatch(reducer.toggleCommentButtons({ photoId: item.id, commentId: comment.id }))
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
                  {renderCommentButtons({ photo: item, comment })}
                </Card>
                {!comment.hiddenButtons && (
                  <View style={{ flex: 1, flexDirection: 'row' }}>
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

  const renderAddCommentsRow = () => {
    if (!item.comments) {
      return <Text />
    }
    return (
      <TouchableOpacity
        style={{
          flex: 1,
          flexDirection: 'row',
        }}
        onPress={
          () => navigation.navigate('ModalInputTextScreen', { item })
        }>
        <Col
          size={2}
        />
        <Col
          size={6}
          style={
            {
              justifyContent: 'center',
              alignItems: 'center',
            }
          }>
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

  const renderRecognitions = () => {
    const { recognitions } = item
    if (!recognitions || recognitions.length === 0) {
      return (<Text />)
    }

    const labels = JSON.parse(recognitions[0].metaData).Labels
    const textDetections = JSON.parse(recognitions[0].metaData).TextDetections
      .filter(text => text.Type === 'LINE')
    const moderationLabels = JSON.parse(recognitions[0].metaData).ModerationLabels
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
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
            <Text style={{ fontWeight: 'bold', textAlignVertical: "center", textAlign: "center" }}>AI recognized tags:</Text>
            {labels.map(label => (
              <Text key={label.Name} style={{ fontSize: label.Confidence / 5, textAlignVertical: "center", textAlign: "center" }}>{stringifyObject(label.Name).replace(/'/g, '')}</Text>
            ))}
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
              fontWeight: 'bold', textAlignVertical: "center", textAlign: "center",
            }}>AI recognized text:
            </Text>
            {textDetections.map(text => (
              <Text key={text.Id} style={{ fontSize: text.Confidence / 5, textAlignVertical: "center", textAlign: "center" }}>{stringifyObject(text.DetectedText).replace(/'/g, '')}</Text>
            ))}
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
              fontWeight: 'bold', color: 'red', textAlignVertical: "center", textAlign: "center",
            }}>AI moderation tags:
            </Text>
            {moderationLabels.map(label => (
              <Text
                key={label.Name} style={{
                  fontSize: label.Confidence / 5, color: 'red', textAlignVertical: "center", textAlign: "center",
                }}>{stringifyObject(label.Name).replace(/'/g, '')}
              </Text>
            ))}
          </Card>
        )}
      </View>
    )
  }

  const renderFooter = () => {
    const { watched } = item
    return (
      <SafeAreaView
        style={{
          backgroundColor: 'white',
          width,
          height: 70,
          position: 'absolute',
          bottom: 0,
          right: 0,
          left: 0,
        }}>
        <Divider />
        { watched === undefined && (
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
        { watched !== undefined && (
          <Grid>
            {/* delete button */}
            <Col
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={
                () => handleDelete({ item })
              }>
              <FontAwesome
                name="trash"
                style={{
                  color: item.watched ? CONST.SECONDARY_COLOR : CONST.MAIN_COLOR,
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
                () => handleBan({ item })
              }>
              <FontAwesome
                name="ban"
                style={{
                  color: item.watched || isPhotoBannedByMe({ photoId: item.id }) ? CONST.SECONDARY_COLOR : CONST.MAIN_COLOR,
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
                () => handleFlipWatch()
              }>
              {item.watchersCount > 0 && (
                <Badge
                  badgeStyle={{
                    backgroundColor: CONST.MAIN_COLOR,
                  }}
                  containerStyle={{ position: 'absolute', top: -10, right: -10 }}
                  value={item.watchersCount}
                />
              )}
              <AntDesign
                name={item.watched ? "star" : "staro"}
                style={
                  {
                    color: CONST.MAIN_COLOR,
                  }
                }
                size={30}
              />
              <Text style={{ fontSize: 10 }}>
                {`${item.watched ? 'un-Star' : 'Star'}`}
              </Text>
            </Col>
            {/* share button */}
            <Col
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={
                () => {
                  dispatch(reducer.sharePhoto({ item }))
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
  }

  const handleBan = ({ item }) => {
    if (item.watched) {
      Toast.show({
        text1: 'Unable to ban Starred photo.',
        text2: 'Un-Star photo first.',
        type: "error",
        topOffset: 70,
      })
      return
    }
    if (isPhotoBannedByMe({ photoId: item.id })) {
      Toast.show({
        text1: 'Looks like you already reported this Photo',
        text2: 'You can only report same Photo once.',
        type: "error",
        topOffset: 70,
      })
    } else {
      Alert.alert(
        'Report abusive Photo?',
        'The user who posted this photo will be banned. Are you sure?',
        [
          { text: 'No', onPress: () => null, style: 'cancel' },
          { text: 'Yes', onPress: () => dispatch(reducer.banPhoto({ item })) },
        ],
        { cancelable: true }
      )
    }
  }

  const handleDelete = ({ item }) => {
    if (item.watched) {
      Toast.show({
        text1: 'Unable to delete Starred photo.',
        text2: 'Un-Star photo first.',
        type: "error",
        topOffset: 70,
      })
      return
    }
    Alert.alert(
      'Delete Photo?',
      'The photo will be deleted from the cloud and will never be seeing again by anyone. Are you sure?',
      [
        { text: 'No', onPress: () => null, style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            dispatch(reducer.deletePhoto({ item }))
            navigation.goBack()
          },
        },
      ],
      { cancelable: true }
    )
  }

  const isPhotoBannedByMe = ({ photoId }) => bans.includes(photoId)

  const handleFlipWatch = () => {
    if (item.watched) {
      dispatch(reducer.unwatchPhoto({ item, navigation }))
    } else {
      dispatch(reducer.watchPhoto({ item, navigation }))
    }
  }

  return (
    <View>
      <ScrollView style={{ margin: 1, backgroundColor: 'white' }}>
        <Grid>
          <Row>
            {renderPhotoRow()}
          </Row>
          <Row>
            {renderCommentsStats()}
          </Row>
          <Row>
            {renderCommentsRows()}
          </Row>
          <Row>
            {renderAddCommentsRow()}
          </Row>
          <Divider />
          <Row>
            {renderRecognitions()}
          </Row>
          <Row style={{ height: 110 }} />
        </Grid>
      </ScrollView>
      {renderFooter()}
    </View>
  )
}

Photo.propTypes = {
  item: PropTypes.object.isRequired,
}

export default (Photo)
