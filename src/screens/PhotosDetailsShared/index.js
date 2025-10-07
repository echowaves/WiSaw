import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'

import { useNavigation } from '@react-navigation/native'
import { router } from 'expo-router'

import PropTypes from 'prop-types'

import { AntDesign } from '@expo/vector-icons'

import { ScrollView, StatusBar, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { gql } from '@apollo/client'

// eslint-disable-next-line import/no-unresolved, import/extensions
import AppHeader from '../../components/AppHeader'
import Photo from '../../components/Photo'
import { emitPhotoSearch } from '../../events/photoSearchBus'

import * as CONST from '../../consts'
import { isDarkMode } from '../../state'
import { getTheme, SHARED_STYLES } from '../../theme/sharedStyles'

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.BACKGROUND
    },
    headerIcon: {
      textShadowColor: theme.CARD_SHADOW,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2
    },
    headerTitle: {
      ...SHARED_STYLES.header.title,
      textShadowColor: theme.CARD_SHADOW,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2
    }
  })

const PhotosDetailsShared = ({ route }) => {
  const [isDark] = useAtom(isDarkMode)
  const theme = getTheme(isDark)
  const styles = createStyles(theme)

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
                  uuid
                  imgUrl
                  thumbUrl
                  videoUrl
                  video
                  commentsCount
                  watchersCount
                  createdAt
                  width
                  height
                }
              }
            }
          `,
          variables: {
            photoId: photoid
          }
        })
      ).data.getPhotoAllCurr
      const { photo } = response
      // eslint-disable-next-line no-console
      console.log('📸 SharedPhotoDetails loaded photo:', {
        id: photo?.id,
        imgUrl: photo?.imgUrl,
        thumbUrl: photo?.thumbUrl,
        width: photo?.width,
        height: photo?.height
      })
      setItem(photo)
    } catch (err4) {
      // eslint-disable-next-line no-console
      console.log({ err4 }) // eslint-disable-line
    }
  }

  const renderHeaderTitle = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <AntDesign name="share-alt" size={20} color={theme.TEXT_PRIMARY} style={styles.headerIcon} />
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
        zIndex: 1000
      }}
    >
      <AppHeader safeTopOnly onBack={() => router.back()} title={renderHeaderTitle()} />
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
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <Photo
            photo={item}
            key={item.id}
            refreshKey={refreshKey}
            embedded={false}
            onTriggerSearch={emitPhotoSearch}
          />
        </ScrollView>
      </View>
    )
  }
  return (
    <View style={styles.container}>
      {renderCustomHeader()}
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <Text
        style={{
          color: theme.TEXT_PRIMARY,
          textAlign: 'center',
          marginTop: SHARED_STYLES.header.getDynamicHeight(insets.top, isSmallDevice) + 40,
          fontSize: 18,
          fontWeight: '500'
        }}
      >
        Loading...
      </Text>
    </View>
  )
}
PhotosDetailsShared.propTypes = {
  route: PropTypes.object.isRequired
}

export default PhotosDetailsShared
