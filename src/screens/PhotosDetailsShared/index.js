import React, { useEffect, useState } from 'react'

import { useNavigation } from '@react-navigation/native'

import PropTypes from 'prop-types'

import { FontAwesome } from '@expo/vector-icons'

import {
  Text,
} from 'react-native'

import { gql } from "@apollo/client"

import Photo from '../../components/Photo'

import * as CONST from '../../consts.js'

const PhotosDetailsShared = ({ route }) => {
  const navigation = useNavigation()
  const [item, setItem] = useState(null)
  console.log(JSON.stringify(route.params))
  const { photoId } = route.params

  useEffect(() => {
    navigation.setOptions({
      headerTitle: renderHeaderTitle,
      headerLeft: renderHeaderLeft,
    })
    loadPhoto(photoId)
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  const loadPhoto = async photoId => {
    try {
      const response = (await CONST.gqlClient
        .query({
          query: gql`
          query getPhotoAllCurr($photoId: ID!) {
                                getPhotoAllCurr(photoId: $photoId) {
                                  photo {
                                    id
                                    imgUrl
                                    thumbUrl
                                    videoUrl
                                    video
                                    commentsCount
                                    watchersCount
                                    createdAt
                                  }
                                }
                              }
        `,
          variables: {
            photoId,
          },
        })).data.getPhotoAllCurr
      const { photo } = response
      setItem(photo)
    } catch (err4) {
      // eslint-disable-next-line no-console
      console.log({ err4 })// eslint-disable-line
    }
  }

  const renderHeaderLeft = () => (
    <FontAwesome
      name="chevron-left"
      size={30}
      style={
        {
          backgroundColor: '#ffffff',
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

  const renderHeaderTitle = () => (<FontAwesome name="share" size={30} style={{ color: CONST.SECONDARY_COLOR }} />)

  if (item) {
    return (
      <Photo photo={item} key={item.id} />
    )
  }
  return <Text>loading...</Text>
}

PhotosDetailsShared.propTypes = {
  photoId: PropTypes.number.isRequired,
  route: PropTypes.object.isRequired,
}

export default PhotosDetailsShared