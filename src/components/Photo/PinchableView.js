import { router } from 'expo-router'
import { useAtom } from 'jotai'

import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view'

import CachedImage from 'expo-cached-image'

import * as CONST from '../../consts'
import { isDarkMode } from '../../state'
import { getTheme } from '../../theme/sharedStyles'
import SafeAreaView from '../SafeAreaView'

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.BACKGROUND,
    },
    headerButton: {
      padding: 12,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      marginHorizontal: 8,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    headerIcon: {
      textShadowColor: 'rgba(0, 0, 0, 0.8)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    headerTitle: {
      color: 'rgba(255, 255, 255, 0.95)',
      fontSize: 17,
      fontWeight: '600',
      textShadowColor: 'rgba(0, 0, 0, 0.8)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    photoContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: 'transparent',
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
    },
  })

const PinchableView = ({ route, navigation }) => {
  const [isDark] = useAtom(isDarkMode)
  const theme = getTheme(isDark)
  const styles = createStyles(theme)

  const { photo } = route.params
  const { width, height } = useWindowDimensions()

  const renderHeaderLeft = () => (
    <View style={styles.headerButton}>
      <Ionicons
        name="chevron-back"
        size={24}
        color="rgba(255, 255, 255, 0.95)"
        style={styles.headerIcon}
        onPress={() => router.back()}
      />
    </View>
  )

  const renderHeaderTitle = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Ionicons
        name="expand-outline"
        size={20}
        color="rgba(255, 255, 255, 0.95)"
        style={styles.headerIcon}
      />
      <Text style={[styles.headerTitle, { marginLeft: 8 }]}>Full View</Text>
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
    >
      <View
        style={{
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
      </View>
    </SafeAreaView>
  )

  // Remove the useEffect that was calling navigation.setOptions
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
  // }, [])

  return (
    <View style={styles.container}>
      {renderCustomHeader()}
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
            uri: `${photo.thumbUrl}`,
          }}
          cacheKey={`${photo.id}-thumb`}
          resizeMode="contain"
          style={styles.photoContainer}
        />
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
