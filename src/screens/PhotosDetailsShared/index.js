import { useEffect, useState } from 'react'

import { useNavigation } from '@react-navigation/native'
import { router } from 'expo-router'

import PropTypes from 'prop-types'

import { AntDesign, Ionicons } from '@expo/vector-icons'

import { StatusBar, StyleSheet, View, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Text } from '@rneui/themed'

import { gql } from '@apollo/client'

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

  const renderHeaderLeft = () => (
    <View style={SHARED_STYLES.interactive.headerButton}>
      <Ionicons
        name="chevron-back"
        size={24}
        color={SHARED_STYLES.theme.TEXT_PRIMARY}
        style={styles.headerIcon}
        onPress={() => router.back()}
      />
    </View>
  )

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

  // Remove navigation.setOptions as it's not compatible with Expo Router
  // The header is now controlled by the layout in app/(drawer)/(tabs)/shared/[photoId].tsx
  // useEffect(() => {
  //   navigation.setOptions({
  //     headerTitle: renderHeaderTitle,
  //     headerLeft: renderHeaderLeft,
  //     headerStyle: {
  //       backgroundColor: 'rgba(0, 0, 0, 0.9)',
  //       borderBottomWidth: 0,
  //       elevation: 0,
  //       shadowOpacity: 0,
  //     },
  //     headerTitleAlign: 'center',
  //     headerTransparent: true,
  //   })
  //   loadPhoto(photoId)
  // }, [])

  useEffect(() => {
    // Clear previous photo data when refreshing
    setItem(null)
    loadPhoto(photoId)
  }, [photoId, refreshKey]) // Added refreshKey to dependencies to refresh comments when returning from add comment

  if (item) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <Photo photo={item} key={item.id} refreshKey={refreshKey} />
      </View>
    )
  }
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <Text
        style={{
          color: SHARED_STYLES.theme.TEXT_PRIMARY,
          textAlign: 'center',
          marginTop: 100,
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
