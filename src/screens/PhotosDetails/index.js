import React, { useEffect } from 'react'

import { useNavigation } from '@react-navigation/native'

import PropTypes from 'prop-types'

import { FontAwesome } from '@expo/vector-icons'

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

  const { currentPhotoIndex } = route.params
  // console.log(currentPhotoIndex)
  // const [index, setIndex] = useState(currentPhotoIndex)

  const photos = useSelector(state => state.photosList.photos)

  const searchTerm = useSelector(state => state.photosList.searchTerm)
  const activeSegment = useSelector(state => state.photosList.activeSegment)

  const dispatch = useDispatch()

  useEffect(() => {
    navigation.setOptions({
      headerTitle: renderHeaderTitle,
      headerLeft: renderHeaderLeft,
    })
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  // useEffect(() => {
  //   if (index > photos.length - 5) {
  //     dispatch(getPhotos()) // pre-load more photos when nearing the end
  //   }
  // }, [index])// eslint-disable-line react-hooks/exhaustive-deps

  const renderHeaderLeft = () => (
    <FontAwesome
      name="chevron-left"
      size={30}
      style={
        {
          backgroundColor: '#ffffff',
          marginLeft: 10,
          color: CONST.MAIN_COLOR,
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
        return (<FontAwesome name="eye" size={30} style={{ color: CONST.SECONDARY_COLOR }} />)
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
      index={currentPhotoIndex}
      onIndexChanged={newIndex => {
        if (newIndex > photos.length - 5) {
          dispatch(getPhotos()) // pre-load more photos when nearing the end
        }
      }} // otherwise will jump to wrong photo onLayout
      loadMinimal
      loadMinimalSize={2}
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
  currentPhotoIndex: PropTypes.number,
  route: PropTypes.object.isRequired,
}

export default PhotosDetails
