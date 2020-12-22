import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"

import { useDeviceOrientation, useDimensions } from '@react-native-community/hooks'

import {
  Dimensions,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native'

import {
  Icon,
  Spinner,
  Button,
  Container,
  Content, Card, CardItem, Text, Item, Input,
} from 'native-base'

import { Col, Row, Grid } from "react-native-easy-grid"

import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView'

import FastImage from 'react-native-fast-image'

import PropTypes from 'prop-types'

import stringifyObject from 'stringify-object'
import jmespath from 'jmespath'

import * as reducer from './reducer'

import * as CONST from '../../consts.js'

const Photo = props => {
  const {
    item,
  } = props
  const dispatch = useDispatch()
  const deviceOrientation = useDeviceOrientation()
  const { width, height } = useDimensions().window

  const likes = useSelector(state => state.photo.likes)
  const inputText = useSelector(state => state.photo.inputText)
  const commentsSubmitting = useSelector(state => state.photo.commentsSubmitting)
  // const error = useSelector(state => state.photo.error)

  // const watched = useSelector(state => state.photo.watched)

  useEffect(() => {
    dispatch(reducer.setInputText({ inputText: '' }))
    dispatch(reducer.getComments({ item }))
    dispatch(reducer.getRecognitions({ item }))

    const intervalId = setInterval(() => { dispatch(reducer.getComments({ item })) }, 30000)
    return (() => clearInterval(intervalId))
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  const isPhotoLikedByMe = ({ photoId }) => likes.includes(photoId)

  const renderCommentButtons = ({ photo, comment }) => {
    if (!comment.hiddenButtons) {
      return (
        <View style={{
          flex: 1,
          flexDirection: 'row',
          position: 'absolute',
          bottom: 10,
          right: 10,

        }}>
          <Icon
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
            type="FontAwesome"
            style={{
              color: CONST.MAIN_COLOR,
            }}
          />
        </View>
      )
    }
    return <View />
  }

  const renderComments = () => {
    if (item.comments) {
      return item.comments.map((comment, i) => (
        <Row
          key={comment.id}
          style={{
            marginLeft: 5,
            marginRight: 15,
          }}>
          <Card
            style={{
              width: "100%",
            }}>
            <TouchableOpacity
              onPress={
                () => {
                  dispatch(reducer.toggleCommentButtons({ photoId: item.id, commentId: comment.id }))
                }
              }>
              <CardItem>
                <Text
                  style={{
                    color: CONST.TEXT_COLOR,
                  }}>{comment.comment}
                </Text>
                {renderCommentButtons({ photo: item, comment })}
              </CardItem>
            </TouchableOpacity>
          </Card>
        </Row>
      ))
    }
  }

  const renderRecognitions = recognition => {
    const labels = jmespath.search(recognition, "metaData.Labels[]")
    const textDetections = jmespath.search(recognition, "metaData.TextDetections[?Type=='LINE']")
    const moderationLabels = jmespath.search(recognition, "metaData.ModerationLabels[]")

    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {labels.length > 0 && (
          <View style={{ paddingBottom: 20 }}>
            <Text style={{ fontWeight: 'bold', textAlignVertical: "center", textAlign: "center" }}>AI recognized tags:</Text>
            {labels.map(label => (
              <Text key={label.Name} style={{ fontSize: label.Confidence / 5, textAlignVertical: "center", textAlign: "center" }}>{stringifyObject(label.Name).replace(/'/g, '')}</Text>
            ))}
          </View>
        )}

        {textDetections.length > 0 && (
          <View style={{ paddingBottom: 20 }}>
            <Text style={{ fontWeight: 'bold', textAlignVertical: "center", textAlign: "center" }}>AI recognized text:</Text>
            {textDetections.map(text => (
              <Text key={text.Id} style={{ fontSize: text.Confidence / 5, textAlignVertical: "center", textAlign: "center" }}>{stringifyObject(text.DetectedText).replace(/'/g, '')}</Text>
            ))}
          </View>
        )}

        {moderationLabels.length > 0 && (
          <View style={{ paddingBottom: 20 }}>
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
          </View>
        )}
      </View>
    )
  }

  // alert(JSON.stringify(navigation))
  return (
    <Container onLayout={null}>
      <Content
        disableKBDismissScroll
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="always"
        enableOnAndroid>
        <Grid>
          <Row>
            <ReactNativeZoomableView
              maxZoom={3}
              minZoom={1}
              zoomStep={3}
              initialZoom={1}
              bindToBorders>

              <View
                style={{
                  flex: 1,
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  right: 0,
                  left: 0,
                }}>
                <FastImage
                  source={{
                    uri: item.getThumbUrl,
                  }}
                  style={{
                    width,
                    height: height - 200,
                  }}
                  backgroundColor="transparent"
                  resizeMode={FastImage.resizeMode.contain}
                />
                <Spinner
                  style={{
                    flex: 1,
                    width,
                    height,
                    position: 'absolute',
                    top: -50,
                    bottom: 0,
                    right: 0,
                    left: 0,
                  }}
                  color={
                    CONST.MAIN_COLOR
                  }
                />
              </View>
              <FastImage
                source={{
                  uri: item.getImgUrl,
                }}
                style={{
                  width,
                  height: height - 200,
                }}
                backgroundColor="transparent"
                resizeMode={FastImage.resizeMode.contain}
              />

            </ReactNativeZoomableView>
            <View style={{
              flex: 2,
              flexDirection: 'row',
              justifyContent: 'space-around',
              width,
              hieght: 100,
              position: 'absolute',
              bottom: 20,

            }}>
              <Button
                rounded
                light
                transparent
                bordered
                disabled={isPhotoLikedByMe({ photoId: item.id })}
                onPress={
                  () => {
                    dispatch(reducer.likePhoto({ photoId: item.id }))
                  }
                }
                style={
                  {
                    height: 85,
                    width: 85,
                    backgroundColor: CONST.TRANSPARENT_BUTTON_COLOR,
                  }
                }>
                <Icon
                  type="FontAwesome"
                  name="thumbs-up"
                  style={
                    {
                      fontSize: 50,
                      color: (isPhotoLikedByMe({ photoId: item.id }) ? CONST.SECONDARY_COLOR : CONST.MAIN_COLOR),
                    }
                  }
                />
                <Text
                  style={
                    {
                      fontSize: 12,
                      color: (!isPhotoLikedByMe({ photoId: item.id }) ? CONST.SECONDARY_COLOR : CONST.MAIN_COLOR),
                      position: 'absolute',
                      right: 0,
                      top: "55%",
                      textAlign: 'center',
                      width: '100%',
                    }
                  }>
                  {item.likes}
                </Text>
              </Button>
              <Button
                rounded
                light
                transparent
                bordered
                onPress={
                  () => {
                    dispatch(reducer.sharePhoto({ item }))
                  }
                }
                style={
                  {
                    height: 85,
                    width: 85,
                    backgroundColor: CONST.TRANSPARENT_BUTTON_COLOR,
                  }
                }>
                <Icon
                  type="FontAwesome"
                  name="share"
                  style={
                    {
                      fontSize: 50,
                      color: CONST.MAIN_COLOR,
                    }
                  }
                />
              </Button>
            </View>
          </Row>
          { item.comments && item.comments.length > 0
                && (
                  <Row style={{ marginTop: 5 }}>
                    <Text style={{ marginLeft: 10, color: CONST.MAIN_COLOR }}>
                      {item.comments ? item.comments.length : 0} Comment{(item.comments ? item.comments.length : 0) !== 1 ? 's' : ''}
                    </Text>
                  </Row>
                )}
          { item.comments && item.comments.length > 0
                && (renderComments())}
          <Row
            style={{
              paddingVertical: 20,
            }}>
            <Col
              style={{
                width: 50,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={
                  {
                    fontSize: 10,
                    color: CONST.MAIN_COLOR,
                    textAlign: 'center',
                    width: '100%',
                  }
                }>
                {140 - inputText.length}
              </Text>
            </Col>
            <Col
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Item
                rounded>
                <Input
                  placeholder="any thoughts?"
                  placeholderTextColor={CONST.PLACEHOLDER_TEXT_COLOR}
                  style={
                    {
                      color: CONST.MAIN_COLOR,
                    }
                  }
                  onChangeText={inputText => dispatch(reducer.setInputText({ inputText }))}
                  value={inputText}
                  editable={!commentsSubmitting}
                  onSubmitEditing={
                    () => {
                      dispatch(reducer.submitComment({ inputText, item }))
                    }
                  }
                />
              </Item>
            </Col>
            <Col
              style={{
                width: 50,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
              }}>
              <Button
                transparent
                iconLeft
                onPress={
                  () => {
                    dispatch(reducer.submitComment({ inputText, item }))
                  }
                }>
                <Icon
                  type="MaterialIcons"
                  name="send"
                  style={
                    {
                      fontSize: 30,
                      color: CONST.MAIN_COLOR,
                    }
                  }
                />
              </Button>
            </Col>
          </Row>
          <Row>
            { item.recognitions
                && (renderRecognitions(item.recognitions))}
          </Row>
        </Grid>
      </Content>
    </Container>
  )
}

// const mapStateToProps = state => ({
//   likes: state.photo.likes,
//   inputText: state.photo.inputText,
//   commentsSubmitting: state.photo.commentsSubmitting,
//   error: state.photo.error,
// })
//
//
Photo.propTypes = {
//   navigation: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired,
//   likes: PropTypes.array.isRequired,
//   likePhoto: PropTypes.func.isRequired,
//   sharePhoto: PropTypes.func.isRequired,
//   setInputText: PropTypes.func.isRequired,
//   inputText: PropTypes.string.isRequired,
//   submitComment: PropTypes.func.isRequired,
//   commentsSubmitting: PropTypes.bool.isRequired,
//   getComments: PropTypes.func.isRequired,
//   getRecognitions: PropTypes.func.isRequired,
//   toggleCommentButtons: PropTypes.func.isRequired,
//   deleteComment: PropTypes.func.isRequired,
}

// Photo.defaultProps = {}

export default Photo
