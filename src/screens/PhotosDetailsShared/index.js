import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'

import { router } from 'expo-router'

import PropTypes from 'prop-types'

import { AntDesign } from '@expo/vector-icons'

import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native'

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

  const [item, setItem] = useState(null)

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
      <AntDesign name='share-alt' size={20} color={theme.TEXT_PRIMARY} style={styles.headerIcon} />
      <Text style={[styles.headerTitle, { marginLeft: 8 }]}>Shared Photo</Text>
    </View>
  )

  const renderCustomHeader = () => (
    <AppHeader onBack={() => router.back()} title={renderHeaderTitle()} />
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
        <StatusBar barStyle='dark-content' backgroundColor={theme.HEADER_BACKGROUND} />
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
      <StatusBar barStyle='dark-content' backgroundColor={theme.HEADER_BACKGROUND} />
      <Text
        style={{
          color: theme.TEXT_PRIMARY,
          textAlign: 'center',
          marginTop: 40,
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
