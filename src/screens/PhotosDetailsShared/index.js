import React, { useEffect, useState } from 'react'

import { useNavigation } from '@react-navigation/native'

import PropTypes from 'prop-types'

import { AntDesign, Ionicons } from '@expo/vector-icons'

import { StatusBar, StyleSheet, View } from 'react-native'

import { Text } from '@rneui/themed'

import { gql } from '@apollo/client'

import Photo from '../../components/Photo'

import * as CONST from '../../consts'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 8,
  },
  headerIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
})

const PhotosDetailsShared = ({ route }) => {
  const navigation = useNavigation()
  const [item, setItem] = useState(null)

  const { photoId } = route.params

  const loadPhoto = async (photoid) => {
    try {
      const response = (
        await CONST.gqlClient.query({
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
            photoId: photoid,
          },
        })
      ).data.getPhotoAllCurr
      const { photo } = response
      setItem(photo)
    } catch (err4) {
      // eslint-disable-next-line no-console
      console.log({ err4 }) // eslint-disable-line
    }
  }

  const renderHeaderLeft = () => (
    <View style={styles.headerButton}>
      <Ionicons
        name="chevron-back"
        size={24}
        color="#fff"
        style={styles.headerIcon}
        onPress={() => navigation.goBack()}
      />
    </View>
  )

  const renderHeaderTitle = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <AntDesign
        name="sharealt"
        size={20}
        color="#fff"
        style={styles.headerIcon}
      />
      <Text style={[styles.headerTitle, { marginLeft: 8 }]}>Shared Photo</Text>
    </View>
  )

  useEffect(() => {
    navigation.setOptions({
      headerTitle: renderHeaderTitle,
      headerLeft: renderHeaderLeft,
      headerStyle: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderBottomWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTitleAlign: 'center',
      headerTransparent: true,
    })
    loadPhoto(photoId)
  }, [])

  if (item) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <Photo photo={item} key={item.id} />
      </View>
    )
  }
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <Text style={{ color: '#fff', textAlign: 'center', marginTop: 100 }}>
        Loading...
      </Text>
    </View>
  )
}
PhotosDetailsShared.propTypes = {
  // photoId: PropTypes.number.isRequired,
  route: PropTypes.object.isRequired,
}

export default PhotosDetailsShared
