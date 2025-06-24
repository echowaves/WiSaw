import { useNavigation } from '@react-navigation/native'
import { router } from 'expo-router'
import { useRef } from 'react'

import PropTypes from 'prop-types'

import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'

import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native'

import { Text } from '@rneui/themed'

import Swiper from 'react-native-swiper'

import Photo from '../../components/Photo'

import { getPhotos } from '../PhotosList/reducer'

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

const PhotosDetails = ({ route }) => {
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

  const swiper = useRef(null)

  const renderHeaderTitle = () => {
    switch (activeSegment) {
      case 0:
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <FontAwesome
              name="globe"
              size={20}
              color="#fff"
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
              color="#FFD700"
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
              color="#4FC3F7"
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
              color="#fff"
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
    <View style={styles.headerButton}>
      <Ionicons
        name="chevron-back"
        size={24}
        color="#fff"
        style={styles.headerIcon}
        onPress={() => router.back()}
      />
    </View>
  )

  const renderCustomHeader = () => (
    <SafeAreaView
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
      }}
    >
      {renderHeaderLeft()}
      {renderHeaderTitle()}
      <View style={{ width: 40 }} />
    </SafeAreaView>
  )

  // Remove the useEffect that was calling navigation.setOptions since it doesn't work with Expo Router
  // The header is now rendered as a custom overlay component

  return (
    <View style={styles.container}>
      {renderCustomHeader()}
      <StatusBar
        barStyle="light-content"
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
        scrollEnabled
        loadMinimalSize={1}
        showsPagination={false}
        pagingEnabled
        style={{ backgroundColor: '#000' }}
      >
        {photosList.map((photo) => (
          <Photo
            photo={photo}
            key={photo.id}
            swiper={swiper}
            photosList={photosList}
            refreshKey={refreshKey}
          />
        ))}
      </Swiper>
    </View>
  )
}

PhotosDetails.propTypes = {
  route: PropTypes.object.isRequired,
}

export default PhotosDetails
