import React, { useEffect /* useState */ } from 'react'

import { useNavigation } from '@react-navigation/native'

import PropTypes from 'prop-types'

import { FontAwesome, AntDesign } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'

import {

} from 'react-native'

import {
  Text,
} from 'react-native-elements'

import { useDispatch, useSelector } from "react-redux"

import Swiper from 'react-native-swiper'

import Photo from '../../components/Photo'

import { getPhotos } from '../PhotosList/reducer'

import * as CONST from '../../consts.js'

const PhotosDetails = ({ route }) => {
  const navigation = useNavigation()
  const currentIndex = useSelector(state => state.photosList.currentIndex)

  const photos = useSelector(state => state.photosList.photos)

  const searchTerm = useSelector(state => state.photosList.searchTerm)
  const activeSegment = useSelector(state => state.photosList.activeSegment)

  const headerHeight = useSelector(state => state.photosList.headerHeight)

  const dispatch = useDispatch()

  useEffect(() => {
    navigation.setOptions({
      headerTitle: renderHeaderTitle,
      headerLeft: renderHeaderLeft,
      headerStyle: {
        backgroundColor: CONST.NAV_COLOR,
      },
    })
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  const renderHeaderLeft = () => (
    <FontAwesome
      name="chevron-left"
      size={30}
      style={
        {
          marginLeft: 10,
          color: CONST.MAIN_COLOR,
          width: 60,
        }
      }
      onPress={
        () => navigation.goBack()
      }
    />
  )

  const renderHeaderTitle = () => {
    switch (activeSegment) {
      case 0:
        return (<FontAwesome name="globe" size={30} style={{ color: CONST.SECONDARY_COLOR }} />)
      case 1:
        return (<AntDesign name="star" size={30} style={{ color: CONST.SECONDARY_COLOR }} />)
      case 2:
        return (
          <Text style={{ color: CONST.SECONDARY_COLOR }}>
            {searchTerm}
          </Text>
        )
      default:
        return (<FontAwesome name="globe" size={30} style={{ color: CONST.SECONDARY_COLOR }} />)
    }
  }

  return (
    <Swiper
      // keyboardShouldPersistTaps="always"
      bounces
      autoplay={false}
      horizontal
      loop={false}
      index={currentIndex}
      onIndexChanged={newIndex => {
        if (newIndex > photos.length - 5) {
          dispatch(getPhotos()) // pre-load more photos when nearing the end
        }
        if (newIndex === 0 || newIndex === (photos.length - 1)) {
          Toast.show({
            text1: 'No scrolling beyond this point',
            topOffset: headerHeight + 15,
            visibilityTime: 500,
          })
        }
      }} // otherwise will jump to wrong photo onLayout
      loadMinimal
      loadMinimalSize={1}
      showsPagination={false}
      pagingEnabled>
      {photos.map(photo => (
        <Photo photo={photo} key={photo.id} />
      ))}
    </Swiper>
  )
}

PhotosDetails.defaultProps = {
}

PhotosDetails.propTypes = {
  route: PropTypes.object.isRequired,
}

export default PhotosDetails
