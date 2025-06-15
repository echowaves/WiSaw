import { useEffect } from 'react'

import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view'
import { Text } from '@rneui/themed'

import CachedImage from 'expo-cached-image'

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
  photoContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
})

const PinchableView = ({ route, navigation }) => {
  const { photo } = route.params
  const { width, height } = useWindowDimensions()

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
      <Ionicons
        name="expand-outline"
        size={20}
        color="#fff"
        style={styles.headerIcon}
      />
      <Text style={[styles.headerTitle, { marginLeft: 8 }]}>Full View</Text>
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
  }, [])

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <ReactNativeZoomableView
        maxZoom={10}
        minZoom={0.8}
        zoomStep={0.5}
        initialZoom={2}
        bindToBorders={true}
        style={{
          width,
          height,
        }}
        resizeMode="contain"
      >
        <CachedImage
          source={{
            uri: `${photo.imgUrl}`,
          }}
          cacheKey={`${photo.id}`}
          placeholderContent={
            <ActivityIndicator
              color={CONST.MAIN_COLOR}
              size="small"
              style={{
                flex: 1,
                justifyContent: 'center',
              }}
            />
          }
          resizeMode="contain"
          style={styles.photoContainer}
        />
      </ReactNativeZoomableView>
    </View>
  )
}

PinchableView.propTypes = {
  // photo: PropTypes.object.isRequired,
  // width: PropTypes.number.isRequired,
  // height: PropTypes.number.isRequired,
}

export default PinchableView
