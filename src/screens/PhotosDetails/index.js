import React, { useEffect, useRef /* useState */ } from 'react'

import { useNavigation } from '@react-navigation/native'

import PropTypes from 'prop-types'

import { FontAwesome, AntDesign } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'

import // View,
'react-native'

import { Text } from '@rneui/themed'

import { useDispatch, useSelector } from 'react-redux'

import Swiper from 'react-native-swiper'

import Photo from '../../components/Photo'

import { getPhotos } from '../PhotosList/reducer'

import * as CONST from '../../consts'

const PhotosDetails = ({ route }) => {
  const { index, photosList, searchTerm, activeSegment, topOffset } =
    route.params

  const navigation = useNavigation()
  // const currentIndex = useSelector((state) => state.photosList.currentIndex)

  // const photos = useSelector((state) => state.photosList.photos)

  const swiper = useRef(null)

  // const searchTerm = useSelector((state) => state.photosList.searchTerm)
  // const activeSegment = useSelector((state) => state.photosList.activeSegment)

  // const topOffset = useSelector((state) => state.photosList.topOffset)

  const dispatch = useDispatch()

  const renderHeaderTitle = () => {
    switch (activeSegment) {
      case 0:
        return (
          <FontAwesome
            name="globe"
            size={30}
            style={{ color: CONST.SECONDARY_COLOR }}
          />
        )
      case 1:
        return (
          <AntDesign
            name="star"
            size={30}
            style={{ color: CONST.SECONDARY_COLOR }}
          />
        )
      case 2:
        return (
          <Text style={{ color: CONST.SECONDARY_COLOR }}>{searchTerm}</Text>
        )
      default:
        return (
          <FontAwesome
            name="globe"
            size={30}
            style={{ color: CONST.SECONDARY_COLOR }}
          />
        )
    }
  }

  const renderHeaderLeft = () => (
    <FontAwesome
      name="chevron-left"
      size={30}
      style={{
        marginLeft: 10,
        color: CONST.MAIN_COLOR,
        width: 60,
      }}
      onPress={() => navigation.goBack()}
    />
  )

  useEffect(() => {
    navigation.setOptions({
      headerTitle: renderHeaderTitle,
      headerLeft: renderHeaderLeft,
      headerStyle: {
        backgroundColor: CONST.NAV_COLOR,
      },
    })
  }, [])

  return (
    // <GestureHandlerRootView>
    <Swiper
      ref={swiper}
      keyboardShouldPersistTaps="always"
      removeClippedSubviews={false}
      // height="100%"
      // width="100%"
      bounces
      autoplay={false}
      horizontal
      loop={false}
      index={index}
      onIndexChanged={(newIndex) => {
        if (newIndex > photosList.length - 5) {
          dispatch(getPhotos()) // pre-load more photos when nearing the end
        }
        if (newIndex === 0 || newIndex === photosList.length - 1) {
          Toast.show({
            text1: 'No scrolling beyond this point',
            topOffset,
            visibilityTime: 500,
          })
        }
      }} // otherwise will jump to wrong photo onLayout
      loadMinimal
      scrollEnabled
      loadMinimalSize={1}
      showsPagination={false}
      pagingEnabled
    >
      {photosList.map((photo) => (
        <Photo
          photo={photo}
          key={photo.id}
          swiper={swiper}
          topOffset={topOffset}
        />
      ))}
    </Swiper>
    // </GestureHandlerRootView>
  )
}

PhotosDetails.defaultProps = {}

PhotosDetails.propTypes = {
  route: PropTypes.object.isRequired,
}

export default PhotosDetails
