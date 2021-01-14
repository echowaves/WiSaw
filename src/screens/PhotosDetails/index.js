import React, { useEffect, useState } from 'react'

import PropTypes from 'prop-types'

import {
  StyleSheet,
  View,
  Text,
  Alert,
} from 'react-native'

import { useDispatch, useSelector } from "react-redux"

import {
  Icon,
  Button,
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

  const watched = useSelector(state => state.photo.watched)
  const searchTerm = useSelector(state => state.photosList.searchTerm)
  const activeSegment = useSelector(state => state.photosList.activeSegment)

  const item = photos[currentPhotoIndex]

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(reducer.checkIsPhotoWatched({ item: photos[currentPhotoIndex], navigation }))
    setIndex(currentPhotoIndex)
    navigation.setOptions({
      headerTitle: renderHeaderTitle(),
      headerLeft: renderHeaderLeft,
      headerRight: renderHeaderRight,
    })
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    dispatch(reducer.checkIsPhotoWatched({ item: photos[index], navigation }))
    if (index > photos.length - 5) {
      dispatch(getPhotos()) // pre-load more photos when nearing the end
    }
  }, [index])// eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    navigation.setOptions({
      headerTitle: renderHeaderTitle(),
      headerLeft: renderHeaderLeft,
      headerRight: renderHeaderRight,
    })
  }, [watched])// eslint-disable-line react-hooks/exhaustive-deps

  const isPhotoBannedByMe = ({ photoId }) => bans.includes(photoId)

  const handleBan = () => {
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
      <Button
        onPress={
          () => handleFlipWatch()
        }
        style={{
          backgroundColor: '#ffffff',
        }}>
        <Icon
          name={watched ? "eye" : "eye-slash"}
          type="FontAwesome"
          style={{ color: CONST.MAIN_COLOR }}
        />
      </Button>
    </View>
  )

  const renderHeaderRight = () => {
    if (!watched) {
      return (
        <View style={{
          flex: 1,
          flexDirection: "row",
        }}>
          <Icon
            onPress={
              () => handleBan()
            }
            name="ban"
            type="FontAwesome"
            style={{
              marginRight: 20,
              color: CONST.MAIN_COLOR,
            }}
          />
          <Icon
            onPress={
              () => handleDelete()
            }
            name="trash"
            type="FontAwesome"
            style={{ marginRight: 20, color: CONST.MAIN_COLOR }}
          />
        </View>
      )
    }
  }

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

  return (
    <View style={styles.container}>
      <Swiper
        keyboardShouldPersistTaps="always"
        autoplay={false}
        horizontal
        loop={false}
        showsButtons
        buttonWrapperStyle={{
          backgroundColor: 'transparent',
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
        nextButton={<Text style={{ color: CONST.MAIN_COLOR, fontSize: 60 }}>›</Text>}
        prevButton={<Text style={{ color: CONST.MAIN_COLOR, fontSize: 60 }}>‹</Text>}
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
          <Photo item={item} key={item.id} navigation={navigation} />
        ))}
      </Swiper>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

PhotosDetails.defaultProps = {
  currentPhotoIndex: 0,
}

PhotosDetails.propTypes = {
  navigation: PropTypes.object.isRequired,
  //   photos: PropTypes.array.isRequired,
  currentPhotoIndex: PropTypes.number,
  route: PropTypes.object.isRequired,
//   setCurrentPhotoIndex: PropTypes.func.isRequired,
//   watched: PropTypes.bool.isRequired,
//   banPhoto: PropTypes.func.isRequired,
//   deletePhoto: PropTypes.func.isRequired,
//   bans: PropTypes.array.isRequired,
//   getPhotos: PropTypes.func.isRequired,
//   watchPhoto: PropTypes.func.isRequired,
//   unwatchPhoto: PropTypes.func.isRequired,
//   checkIsPhotoWatched: PropTypes.func.isRequired,
//   searchTerm: PropTypes.string,
//   activeSegment: PropTypes.number.isRequired,
}

export default PhotosDetails
