import { useNavigation } from '@react-navigation/native'
import { router } from 'expo-router'
import { useAtom } from 'jotai'
import { useRef } from 'react'

import PropTypes from 'prop-types'

import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'

import {
  ScrollView,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Text } from '@rneui/themed'

import Swiper from 'react-native-swiper'

import AppHeader from '../../components/AppHeader'
import Photo from '../../components/Photo'
import { isDarkMode } from '../../state'
import { getTheme, SHARED_STYLES } from '../../theme/sharedStyles'

import { getPhotos } from '../PhotosList/reducer'

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.BACKGROUND,
    },
    headerIcon: {
      textShadowColor: theme.CARD_SHADOW,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    headerTitle: {
      ...SHARED_STYLES.header.title,
      textShadowColor: theme.CARD_SHADOW,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
  })

const PhotosDetails = ({ route }) => {
  const [isDark] = useAtom(isDarkMode)
  const theme = getTheme(isDark)
  const styles = createStyles(theme)

  const {
    index,
    photosList,
    searchTerm,
    activeSegment,
    topOffset,
    uuid,
    refreshKey,
  } = route.params

  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const isSmallDevice = width < 768

  const swiper = useRef(null)
  // Using shared AppHeader for consistent height and style across screens

  const renderHeaderTitle = () => {
    switch (activeSegment) {
      case 0:
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <FontAwesome
              name="globe"
              size={20}
              color={theme.TEXT_PRIMARY}
              style={styles.headerIcon}
            />
            <Text style={[styles.headerTitle, { marginLeft: 8 }]}>
              All Photos
            </Text>
          </View>
        )
      case 1:
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AntDesign
              name="star"
              size={20}
              color={theme.STATUS_WARNING}
              style={styles.headerIcon}
            />
            <Text style={[styles.headerTitle, { marginLeft: 8 }]}>Starred</Text>
          </View>
        )
      case 2:
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons
              name="search"
              size={20}
              color={theme.STATUS_SUCCESS}
              style={styles.headerIcon}
            />
            <Text
              style={[styles.headerTitle, { marginLeft: 8 }]}
              numberOfLines={1}
            >
              {searchTerm || 'Search'}
            </Text>
          </View>
        )
      default:
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <FontAwesome
              name="globe"
              size={20}
              color={theme.TEXT_PRIMARY}
              style={styles.headerIcon}
            />
            <Text style={[styles.headerTitle, { marginLeft: 8 }]}>
              All Photos
            </Text>
          </View>
        )
    }
  }

  const renderHeaderLeft = () => (
    <View style={SHARED_STYLES.interactive.headerButton}>
      <Ionicons
        name="chevron-back"
        size={24}
        color={theme.TEXT_PRIMARY}
        style={styles.headerIcon}
        onPress={() => router.back()}
      />
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

  // Remove the useEffect that was calling navigation.setOptions since it doesn't work with Expo Router
  // The header is now rendered as a custom overlay component

  return (
    <View style={styles.container}>
      {renderCustomHeader()}
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <Swiper
        ref={swiper}
        keyboardShouldPersistTaps="always"
        removeClippedSubviews={false}
        bounces
        autoplay={false}
        horizontal
        loop={false}
        index={index}
        onIndexChanged={(newIndex) => {
          if (newIndex > photosList.length - 5) {
            getPhotos() // pre-load more photos when nearing the end
          }
          if (newIndex === 0 || newIndex === photosList.length - 1) {
            Toast.show({
              text1: 'No scrolling beyond this point',
              topOffset,
              visibilityTime: 500,
            })
          }
        }}
        loadMinimal
        scrollEnabled={false}
        loadMinimalSize={1}
        showsPagination={false}
        pagingEnabled={false}
        style={{ backgroundColor: theme.BACKGROUND }}
      >
        {photosList.map((photo) => (
          <ScrollView
            key={photo.id}
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            <Photo
              photo={photo}
              swiper={swiper}
              photosList={photosList}
              refreshKey={refreshKey}
              embedded={false}
            />
          </ScrollView>
        ))}
      </Swiper>
    </View>
  )
}

PhotosDetails.propTypes = {
  route: PropTypes.object.isRequired,
}

export default PhotosDetails
