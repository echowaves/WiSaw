import React, { useRef } from 'react'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"

import { useDimensions } from '@react-native-community/hooks'

import { FontAwesome, Ionicons } from '@expo/vector-icons'

import {
  // Dimensions,
  View,
  TouchableOpacity,
  Alert,
  InteractionManager,
  StyleSheet,
  ScrollView,
} from 'react-native'

import {
  Text,
  Card,
  LinearProgress,
  Divider,
  Badge,
} from 'react-native-elements'

import { Col, Row, Grid } from "react-native-easy-grid"

import ImageZoom from 'react-native-image-pan-zoom'

import PropTypes from 'prop-types'

import stringifyObject from 'stringify-object'
import jmespath from 'jmespath'

import CachedImage from '../CachedImage'

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
  const likes = useSelector(state => state.photo.likes)

  // const error = useSelector(state => state.photo.error)

  useFocusEffect( // use this to make the navigastion to a detailed screen faster
    React.useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        if (componentIsMounted) {
          Promise.all([
            dispatch(reducer.getComments({ item })),
            dispatch(reducer.checkIsPhotoWatched({ item })),
            dispatch(reducer.getRecognitions({ item })),
            // dispatch(reducer.setInputText({ inputText: '' })),
          ])
        }
        // if (componentIsMounted) dispatch(reducer.getComments({ item }))
        // if (componentIsMounted) dispatch(reducer.checkIsPhotoWatched({ item }))
        // if (componentIsMounted) dispatch(reducer.getRecognitions({ item }))
        // if (componentIsMounted) dispatch(reducer.setInputText({ inputText: '' }))
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
    },
  })

  const renderPhotoRow = () => (
    <ImageZoom
      cropWidth={width}
      cropHeight={imageHeight}
      imageWidth={width}
      imageHeight={imageHeight}>
      <CachedImage
        source={{ uri: `${item.getThumbUrl}` }}
        cacheKey={`${item.id}t`}
        backgroundColor="transparent"
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
        source={{ uri: `${item.getImgUrl}` }}
        cacheKey={`${item.id}i`}
        backgroundColor="transparent"
        resizeMode="contain"
        style={
          styles.photoContainer
        }
      />
    </ImageZoom>
  )

  const renderCommentsStats = () => {
    if (!item.comments) {
      return (
        <LinearProgress
          color={
            CONST.MAIN_COLOR
          }
        />
      )
    }
    if (item.comments.length === 0) {
      return <Text />
    }

    return (
      <Text
        style={{
          paddingTop: 5,
          marginLeft: 10,
          color: CONST.MAIN_COLOR,
        }}>
        {item.comments ? item.comments.length : 0} Comment{(item.comments ? item.comments.length : 0) !== 1 ? 's' : ''}
      </Text>
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
            <Row key={comment.id}>
              <TouchableOpacity
                onPress={
                  () => {
                    dispatch(reducer.toggleCommentButtons({ photoId: item.id, commentId: comment.id }))
                  }
                }>
                <Card width={width - 30}>
                  <Text
                    style={{
                      color: CONST.TEXT_COLOR,
                    }}>{comment.comment}
                  </Text>
                  {renderCommentButtons({ photo: item, comment })}
                </Card>
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
    if (!recognitions) {
      return (<Text />)
    }
    const labels = jmespath.search(recognitions, "metaData.Labels[]")
    const textDetections = jmespath.search(recognitions, "metaData.TextDetections[?Type=='LINE']")
    const moderationLabels = jmespath.search(recognitions, "metaData.ModerationLabels[]")

    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {labels.length > 0 && (
          <Card
            width={width - 100}
            style={{ paddingBottom: 20 }}>
            <Text style={{ fontWeight: 'bold', textAlignVertical: "center", textAlign: "center" }}>AI recognized tags:</Text>
            {labels.map(label => (
              <Text key={label.Name} style={{ fontSize: label.Confidence / 5, textAlignVertical: "center", textAlign: "center" }}>{stringifyObject(label.Name).replace(/'/g, '')}</Text>
            ))}
          </Card>
        )}

        {textDetections.length > 0 && (
          <Card
            width={width - 100}
            style={{ paddingBottom: 20 }}>
            <Text style={{ fontWeight: 'bold', textAlignVertical: "center", textAlign: "center" }}>AI recognized text:</Text>
            {textDetections.map(text => (
              <Text key={text.Id} style={{ fontSize: text.Confidence / 5, textAlignVertical: "center", textAlign: "center" }}>{stringifyObject(text.DetectedText).replace(/'/g, '')}</Text>
            ))}
          </Card>
        )}

        {moderationLabels.length > 0 && (
          <Card
            width={width - 100}
            style={{ paddingBottom: 20 }}>
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
      <View
        style={{
          backgroundColor: 'white',
          width,
          height: 50,
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
            <Col style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              {/* delete button */}
              <FontAwesome
                name="trash"
                style={{
                  color: item.watched ? CONST.SECONDARY_COLOR : CONST.MAIN_COLOR,
                }}
                size={30}
                onPress={
                  () => handleDelete({ item })
                }
              />
              <Text style={{ fontSize: 10 }}>
                Delete
              </Text>
            </Col>
            <Col style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              {/* ban button */}
              <FontAwesome
                name="ban"
                style={{
                  color: item.watched || isPhotoBannedByMe({ photoId: item.id }) ? CONST.SECONDARY_COLOR : CONST.MAIN_COLOR,
                }}
                size={30}
                onPress={
                  () => handleBan({ item })
                }
              />
              <Text style={{ fontSize: 10 }}>
                Ban
              </Text>
            </Col>
            <Col style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              {/* watch button */}
              <FontAwesome
                name={item.watched ? "eye" : "eye-slash"}
                style={
                  {
                    color: CONST.MAIN_COLOR,
                  }
                }
                size={30}
                onPress={
                  () => handleFlipWatch()
                }
              />
              <Text style={{ fontSize: 10 }}>
                {`${item.watched ? 'UnWatch' : 'Watch'}`}
              </Text>
            </Col>
            <Col style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              {/* share button */}
              <FontAwesome
                name="share"
                style={
                  {
                    color: CONST.MAIN_COLOR,
                  }
                }
                size={30}
                onPress={
                  () => {
                    dispatch(reducer.sharePhoto({ item }))
                  }
                }
              />
              <Text style={{ fontSize: 10 }}>
                Share
              </Text>
            </Col>
            <Col style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              {/* likes button */}
              <FontAwesome
                name="thumbs-up"
                style={
                  {
                    color: isPhotoLikedByMe({ photoId: item.id }) ? CONST.SECONDARY_COLOR : CONST.MAIN_COLOR,
                  }
                }
                size={30}
                onPress={
                  () => {
                    handleLike({ item })
                  }
                }>
                {item.likes > 0 && (
                  <Badge
                    badgeStyle={{
                      backgroundColor: CONST.MAIN_COLOR,

                    }}
                    value={item.likes}
                  />
                )}
              </FontAwesome>
              <Text style={{ fontSize: 10 }}>
                Like
              </Text>
            </Col>
          </Grid>
        )}
      </View>
    )
  }

  const handleBan = ({ item }) => {
    if (item.watched) {
      Alert.alert(
        'Unable to ban watched photo.',
        'Unwatch photo first.',
        [
          { text: 'OK', onPress: () => null },
        ],
      )
      return
    }
    if (isPhotoBannedByMe({ photoId: item.id })) {
      Alert.alert(
        'Looks like you already reported this Photo',
        'You can only report same Photo once.',
        [
          { text: 'OK', onPress: () => null },
        ],
      )
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
      Alert.alert(
        'Unable to delete watched photo.',
        'Unwatch photo first.',
        [
          { text: 'OK', onPress: () => null, style: 'cancel' },
        ],
        { cancelable: true }
      )
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
  const isPhotoLikedByMe = ({ photoId }) => likes.includes(photoId)

  const handleLike = ({ item }) => {
    if (isPhotoLikedByMe({ photoId: item.id })) {
      Alert.alert(
        'You already liked this photo.',
        'Try to like some other photo.',
        [
          { text: 'OK', onPress: () => null },
        ],
      )
      return
    }
    dispatch(reducer.likePhoto({ photoId: item.id }))
  }

  const handleFlipWatch = () => {
    if (item.watched) {
      dispatch(reducer.unwatchPhoto({ item, navigation }))
    } else {
      dispatch(reducer.watchPhoto({ item, navigation }))
    }
  }

  return (
    <View>
      <ScrollView style={{ margin: 1 }}>
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
