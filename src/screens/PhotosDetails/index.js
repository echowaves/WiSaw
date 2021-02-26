import React, { useEffect, useState } from 'react'

import { useFocusEffect } from '@react-navigation/native'

import PropTypes from 'prop-types'

import {
  View,
  Alert,
  InteractionManager,
} from 'react-native'

import { useDispatch, useSelector } from "react-redux"

import {
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
    navigation.setOptions({
      headerTitle: null,
      headerLeft: null,
    })
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  useFocusEffect(
    React.useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        navigation.setOptions({
          headerTitle: renderHeaderTitle(),
          headerLeft: renderHeaderLeft,
        })
        checkIsPhotoWatched()
      })

      return () => task.cancel()
    }, [])// eslint-disable-line react-hooks/exhaustive-deps
  )

  useEffect(() => {
    checkIsPhotoWatched()
  }, [index])// eslint-disable-line react-hooks/exhaustive-deps

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

  const item = photos[index] // eslint-disable-line no-unused-vars

  return (
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
