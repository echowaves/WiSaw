import React, { useEffect, useState } from 'react'

import PropTypes from 'prop-types'

import {
  View,
  Alert,
} from 'react-native'

import { useDispatch, useSelector } from "react-redux"

import {
  Badge,
  Container,
  Content,
  Footer,
  FooterTab,
  Button,
  Icon,
  Text,
} from 'native-base'

import Swiper from 'react-native-swiper'

import Photo from '../../components/Photo'

// import * as thumbReducer from '../../components/Thumb/reducer'
import * as reducer from '../../components/Photo/reducer'

import { getPhotos } from '../PhotosList/reducer'

import * as CONST from '../../consts.js'

const PhotosDetails = ({ route, navigation }) => {
  const { currentPhotoIndex } = route.params
  // console.log(currentPhotoIndex)
  const [index, setIndex] = useState(currentPhotoIndex)

  const photos = useSelector(state => state.photosList.photos)
  const bans = useSelector(state => state.photo.bans)
  const likes = useSelector(state => state.photo.likes)

  const watched = useSelector(state => state.photo.watched)
  const searchTerm = useSelector(state => state.photosList.searchTerm)
  const activeSegment = useSelector(state => state.photosList.activeSegment)

  const dispatch = useDispatch()

  useEffect(() => {
    setIndex(currentPhotoIndex)
    dispatch(reducer.checkIsPhotoWatched({ item: photos[currentPhotoIndex], navigation }))
    navigation.setOptions({
      headerTitle: renderHeaderTitle(),
      headerLeft: renderHeaderLeft,
    })
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const item = photos[index]
    dispatch(reducer.checkIsPhotoWatched({ item, navigation }))
    if (index > photos.length - 5) {
      dispatch(getPhotos()) // pre-load more photos when nearing the end
    }
  }, [index])// eslint-disable-line react-hooks/exhaustive-deps

  const isPhotoBannedByMe = ({ photoId }) => bans.includes(photoId)
  const isPhotoLikedByMe = ({ photoId }) => likes.includes(photoId)

  const handleBan = () => {
    const item = photos[index]
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

  const handleDelete = () => {
    const item = photos[index]

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

  const handleFlipWatch = () => {
    const item = photos[index]
    if (watched) {
      dispatch(reducer.unwatchPhoto({ item, navigation }))
    } else {
      dispatch(reducer.watchPhoto({ item, navigation }))
    }
  }

  const renderHeaderLeft = () => (
    <View style={{
      flex: 1,
      flexDirection: "row",
    }}>
      <Button
        onPress={
          () => navigation.goBack()
        }
        style={{
          backgroundColor: '#ffffff',
        }}>
        <Icon
          name="chevron-left"
          type="FontAwesome"
          style={{
            color: CONST.MAIN_COLOR,
          }}
        />
      </Button>
    </View>
  )

  const renderHeaderTitle = () => {
    switch (activeSegment) {
      case 0:
        return (<Icon name="globe" type="FontAwesome" style={{ color: CONST.SECONDARY_COLOR }} />)
      case 1:
        return (<Icon name="eye" type="FontAwesome" style={{ color: CONST.SECONDARY_COLOR }} />)
      case 2:
        return (
          <Text style={{ color: CONST.SECONDARY_COLOR }}>
            {searchTerm}
          </Text>
        )
      default:
        return (<Icon name="globe" type="FontAwesome" style={{ color: CONST.SECONDARY_COLOR }} />)
    }
  }

  const renderFooter = () => {
    const item = photos[index]
    return (
      <Footer>
        <FooterTab>

          {/* delete button */}
          <Button
            key="delete"
            disabled={watched}
            vertical
            onPress={
              () => handleDelete()
            }>
            <Icon
              name="trash"
              type="FontAwesome"
              style={{
                fontSize: 30,
                color: CONST.MAIN_COLOR,
              }}
            />
            <Text style={{ fontSize: 10 }}>
              Delete
            </Text>
          </Button>

          {/* ban button */}
          <Button
            key="ban"
            disabled={watched}
            vertical
            onPress={
              () => handleBan()
            }>
            <Icon
              name="ban"
              type="FontAwesome"
              style={{
                fontSize: 30,
                color: CONST.MAIN_COLOR,
              }}
            />
            <Text style={{ fontSize: 10 }}>
              Report
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
              name={watched ? "eye" : "eye-slash"}
              type="FontAwesome"
              style={
                {
                  fontSize: 30,
                  color: CONST.MAIN_COLOR,
                }
              }
            />
            <Text style={{ fontSize: 10 }}>
              {`${watched ? 'UnWatch' : 'Watch'}`}
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
            disabled={isPhotoLikedByMe({ photoId: item.id })}
            vertical
            badge={item.likes > 0}
            onPress={
              () => {
                dispatch(reducer.likePhoto({ photoId: item.id }))
              }
            }>
            {item.likes > 0 && (<Badge style={{ backgroundColor: CONST.SECONDARY_COLOR }}><Text style={{ color: CONST.MAIN_COLOR }}>{item.likes}</Text></Badge>)}
            <Icon
              type="FontAwesome"
              name="thumbs-up"
              style={
                {
                  fontSize: 30,
                  color: CONST.MAIN_COLOR,
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

  const item = photos[index] // eslint-disable-line no-unused-vars

  return (
    <Container>
      <Content>
        <Swiper
          keyboardShouldPersistTaps="always"
          autoplay={false}
          horizontal
          loop={false}
          showsButtons
          buttonWrapperStyle={{
            flexDirection: 'row',
            position: 'absolute',
            top: 0,
            left: 0,
            flex: 1,
            paddingHorizontal: 10,
            paddingVertical: 10,
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
          nextButton={<Text style={{ color: CONST.MAIN_COLOR, fontSize: 40 }}>›</Text>}
          prevButton={<Text style={{ color: CONST.MAIN_COLOR, fontSize: 40 }}>‹</Text>}
          index={index}
          onIndexChanged={newIndex => {
          // TODO: ugly timeout, when the library fixes the issue the timeout can be removed
            setTimeout(() => { setIndex(newIndex) }, 1)
          }} // otherwise will jump to wrong photo onLayout
          loadMinimal
          loadMinimalSize={1}
          showsPagination={false}
          pagingEnabled>
          {photos.map(item => (
            <Photo item={item} key={item.id} />
          ))}
        </Swiper>
      </Content>
      {renderFooter()}
    </Container>
  )
}

PhotosDetails.defaultProps = {
  currentPhotoIndex: 0,
}

PhotosDetails.propTypes = {
  navigation: PropTypes.object.isRequired,
  currentPhotoIndex: PropTypes.number,
  route: PropTypes.object.isRequired,
}

export default PhotosDetails
