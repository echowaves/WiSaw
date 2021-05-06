import React, { useRef } from 'react'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"

import { useDimensions } from '@react-native-community/hooks'

import {
  // Dimensions,
  View,
  TouchableOpacity,
  Alert,
  InteractionManager,
} from 'react-native'

import {
  Badge,
  Container,
  Content,
  Footer,
  FooterTab,
  Icon,
  Spinner,
  Button, Card, CardItem, Text, Item, Input,
} from 'native-base'

import { Col, Row, Grid } from "react-native-easy-grid"

import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView'

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

  const bans = useSelector(state => state.photo.bans)
  const likes = useSelector(state => state.photo.likes)

  const inputText = useSelector(state => state.photo.inputText)
  const commentsSubmitting = useSelector(state => state.photo.commentsSubmitting)

  // const error = useSelector(state => state.photo.error)

  useFocusEffect(
    React.useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        if (componentIsMounted) dispatch(reducer.setInputText({ inputText: '' }))

        if (componentIsMounted) dispatch(reducer.getComments({ item }))
        if (componentIsMounted) dispatch(reducer.getRecognitions({ item }))
        if (componentIsMounted) dispatch(reducer.checkIsPhotoWatched({ item }))
      })

      return () => {
        componentIsMounted.current = false
        task.cancel()
      }
    }, [])// eslint-disable-line react-hooks/exhaustive-deps
  )

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

  const renderFooter = () => {
    if (item.watched === undefined) {
      return (
        <Footer
          style={{
            backgroundColor: 'white',
          }}>
          <Spinner
            color={
              CONST.SECONDARY_COLOR
            }
          />
        </Footer>
      )
    }
    return (
      <Footer
        style={{
          backgroundColor: '#fafafa',
        }}>
        <FooterTab style={{
          backgroundColor: '#fafafa',
        }}>

          {/* delete button */}
          <Button
            key="delete"
            vertical
            onPress={
              () => handleDelete({ item })
            }>
            <Icon
              name="trash"
              type="FontAwesome"
              style={{
                fontSize: 30,
                color: item.watched ? CONST.SECONDARY_COLOR : CONST.MAIN_COLOR,
              }}
            />
            <Text style={{ fontSize: 10 }}>
              Delete
            </Text>
          </Button>

          {/* ban button */}
          <Button
            key="ban"
            vertical
            onPress={
              () => handleBan({ item })
            }>
            <Icon
              name="ban"
              type="FontAwesome"
              style={{
                fontSize: 30,
                color: item.watched || isPhotoBannedByMe({ photoId: item.id }) ? CONST.SECONDARY_COLOR : CONST.MAIN_COLOR,
              }}
            />
            <Text style={{ fontSize: 10 }}>
              Ban
            </Text>
          </Button>

          {/* watch button */}
          <Button
            key="watch"
            onPress={
              () => handleFlipWatch()
            }
            style={{
              fontSize: 30,
            }}>
            <Icon
              name={item.watched ? "eye" : "eye-slash"}
              type="FontAwesome"
              style={
                {
                  fontSize: 30,
                  color: CONST.MAIN_COLOR,
                }
              }
            />
            <Text style={{ fontSize: 10 }}>
              {`${item.watched ? 'UnWatch' : 'Watch'}`}
            </Text>
          </Button>

          {/* share button */}
          <Button
            key="share"
            vertical
            onPress={
              () => {
                dispatch(reducer.sharePhoto({ item }))
              }
            }>
            <Icon
              type="FontAwesome"
              name="share"
              style={
                {
                  fontSize: 30,
                  color: CONST.MAIN_COLOR,
                }
              }
            />
            <Text style={{ fontSize: 10 }}>
              Share
            </Text>
          </Button>

          {/* likes button */}
          <Button
            key="like"
            vertical
            badge={item.likes > 0}
            onPress={
              () => {
                handleLike({ item })
              }
            }>
            {item.likes > 0 && (
              <Badge style={{ backgroundColor: CONST.PLACEHOLDER_TEXT_COLOR }}>
                <Text style={{ color: CONST.MAIN_COLOR }}>{item.likes}</Text>
              </Badge>
            )}
            <Icon
              type="FontAwesome"
              name="thumbs-up"
              style={
                {
                  fontSize: 30,
                  color: isPhotoLikedByMe({ photoId: item.id }) ? CONST.SECONDARY_COLOR : CONST.MAIN_COLOR,
                }
              }
            />
            <Text style={{ fontSize: 10 }}>
              Like
            </Text>
          </Button>

        </FooterTab>
      </Footer>
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
                <CachedImage
                  source={{ uri: `${item.getThumbUrl}` }}
                  cacheKey={`${item.id}t`}
                  backgroundColor="transparent"
                  resizeMode="contain"
                  style={{
                    width,
                    height: height - 200,
                  }}
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
              <CachedImage
                source={{ uri: `${item.getImgUrl}` }}
                cacheKey={`${item.id}i`}
                backgroundColor="transparent"
                resizeMode="contain"
                style={{
                  width,
                  height: height - 200,
                }}
              />
            </ReactNativeZoomableView>
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
          <Row style={{ height: 110 }} />
        </Grid>

      </Content>
      {renderFooter()}
    </Container>
  )
}

Photo.propTypes = {
  item: PropTypes.object.isRequired,
}

export default (Photo)
