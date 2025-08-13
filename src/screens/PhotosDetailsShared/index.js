import { useEffect, useState } from 'react'

import { useNavigation } from '@react-navigation/native'
import { router } from 'expo-router'

import PropTypes from 'prop-types'

import { AntDesign } from '@expo/vector-icons'

import { StatusBar, StyleSheet, View, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Text } from '@rneui/themed'

import { gql } from '@apollo/client'

import AppHeader from '../../components/AppHeader'
import Photo from '../../components/Photo'

import * as CONST from '../../consts'
import { SHARED_STYLES } from '../../theme/sharedStyles'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SHARED_STYLES.theme.BACKGROUND,
  },
  headerIcon: {
    textShadowColor: SHARED_STYLES.theme.CARD_SHADOW,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerTitle: {
    ...SHARED_STYLES.header.title,
    textShadowColor: SHARED_STYLES.theme.CARD_SHADOW,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
})

const PhotosDetailsShared = ({ route }) => {
  const navigation = useNavigation()
  const [item, setItem] = useState(null)
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const isSmallDevice = width < 768

  const { photoId, refreshKey } = route.params

  const loadPhoto = async (photoid) => {
    try {
      const response = (
        await CONST.gqlClient.query({
          query: gql`
            query getPhotoAllCurr($photoId: String!) {
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

  const renderHeaderTitle = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <AntDesign
        name="sharealt"
        size={20}
        color={SHARED_STYLES.theme.TEXT_PRIMARY}
        style={styles.headerIcon}
      />
      <Text style={[styles.headerTitle, { marginLeft: 8 }]}>Shared Photo</Text>
    </View>
  )

  const renderCustomHeader = () => (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      <AppHeader
        safeTopOnly
        onBack={() => router.back()}
        title={renderHeaderTitle()}
      />
    </View>
  )

  useEffect(() => {
    // Clear previous photo data when refreshing
    setItem(null)
    loadPhoto(photoId)
  }, [photoId, refreshKey]) // Added refreshKey to dependencies to refresh comments when returning from add comment

  if (item) {
    return (
      <View style={styles.container}>
        {renderCustomHeader()}
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <Photo photo={item} key={item.id} refreshKey={refreshKey} />
      </View>
    )
  }
  return (
    <View style={styles.container}>
      {renderCustomHeader()}
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <Text
        style={{
          color: SHARED_STYLES.theme.TEXT_PRIMARY,
          textAlign: 'center',
          marginTop:
            SHARED_STYLES.header.getDynamicHeight(insets.top, isSmallDevice) +
            40,
          fontSize: 18,
          fontWeight: '500',
        }}
      >
        Loading...
      </Text>
    </View>
  )
}
PhotosDetailsShared.propTypes = {
  route: PropTypes.object.isRequired,
}

export default PhotosDetailsShared
