import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"
import * as MediaLibrary from 'expo-media-library'
// import * as FileSystem from 'expo-file-system'

import { useDimensions } from '@react-native-community/hooks'
import * as Location from 'expo-location'
import * as Linking from 'expo-linking'
import * as ImagePicker from 'expo-image-picker'
import * as Updates from 'expo-updates'
import Toast from 'react-native-toast-message'

import useKeyboard from '@rnhooks/keyboard'

import {
  StyleSheet,
  Text,
  View,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native'

import {
  FontAwesome, FontAwesome5, MaterialIcons, Ionicons, AntDesign,
} from '@expo/vector-icons'

import NetInfo from "@react-native-community/netinfo"

import FlatGrid from 'react-native-super-grid'

import PropTypes from 'prop-types'

import {
  Card,
  ListItem,
  Divider,
  Button,
  LinearProgress,
  ButtonGroup,
  SearchBar,
  Overlay,
  Icon,
  Switch,
} from 'react-native-elements'

import * as reducer from './reducer'

import * as CONST from '../../consts.js'
import Thumb from '../../components/Thumb'
import ThumbWithComments from '../../components/ThumbWithComments'
import ThumbPending from '../../components/ThumbPending'

const PhotosList = () => {
  const navigation = useNavigation()

  const dispatch = useDispatch()

  // const deviceOrientation = useDeviceOrientation()
  const { width, height } = useDimensions().window

  const [thumbDimension, setThumbDimension] = useState(100)
  const [lastViewableRow, setLastViewableRow] = useState(1)
  const [cameraType, setCameraType] = useState("camera")
  // const [loadMore, setLoadMore] = useState(false)

  const photos = useSelector(state => state.photosList.photos)
  const pendingPhotos = useSelector(state => state.photosList.pendingPhotos)
  const location = useSelector(state => state.photosList.location)
  // const errorMessage = useSelector(state => state.photosList.errorMessage)
  const isLastPage = useSelector(state => state.photosList.isLastPage)
  // const paging = useSelector(state => state.photosList.paging)
  const isTandcAccepted = useSelector(state => state.photosList.isTandcAccepted)
  const uuid = useSelector(state => state.photosList.uuid)
  const zeroMoment = useSelector(state => state.photosList.zeroMoment)

  const loading = useSelector(state => state.photosList.loading)

  const activeSegment = useSelector(state => state.photosList.activeSegment)
  const searchTerm = useSelector(state => state.photosList.searchTerm)
  const netAvailable = useSelector(state => state.photosList.netAvailable)
  // const batch = useSelector(state => state.photosList.batch)

  const [keyboardVisible, dismissKeyboard] = useKeyboard()

  const onViewRef = React.useRef(viewableItems => {
    const lastViewableItem = viewableItems.changed[viewableItems.changed.length - 1]
    // const lastViewableItem = viewableItems.changed[0]
    setLastViewableRow(lastViewableItem.index)
  })

  const _initState = async () => {
    // /// //////////////////////////////////////
    // const files = await FileSystem.readDirectoryAsync(FileSystem.cacheDirectory)
    // files.forEach(file => {
    //   FileSystem.deleteAsync(`${FileSystem.cacheDirectory}${file}`, { idempotent: true })
    // })
    // // cleanup cache folder
    // /// //////////////////////////////////////
    const thumbsCount = Math.floor(width / 90)
    setThumbDimension(Math.floor((width - thumbsCount * 3 * 2) / thumbsCount) + 2)

    await Promise.all([
      checkForUpdate(),
      // check permissions, retrieve UUID, make sure upload folder exists
      dispatch(reducer.initState()),
      dispatch(reducer.zeroMoment()),
    ])
  }

  useEffect(() => {
    _initState()

    // add network availability listener
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      if (state) {
        dispatch(reducer.setNetAvailable(state.isInternetReachable))
      }
    })
    return () => unsubscribeNetInfo()
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (uuid && zeroMoment) {
      _reload() // initially load only when zero moment is loaded and uuid is assigned
    }
  }, [uuid, zeroMoment])// eslint-disable-line react-hooks/exhaustive-deps

  // re-render title on  state chage
  useEffect(() => {
    // defining this function for special case, when network becomes available after the app has started
    const initandreload = async () => {
      await _initState()
      await _reload()
    }

    _updateNavBar()
    if (netAvailable) {
      initandreload()
    }
  }, [netAvailable]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (wantToLoadMore()) {
      dispatch(reducer.getPhotos())
    }
  }, [lastViewableRow, loading]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    _updateNavBar()
  }, [activeSegment]) // eslint-disable-line react-hooks/exhaustive-deps

  const checkForUpdate = async () => {
    try {
      const update = await Updates.checkForUpdateAsync()
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync()

        Alert.alert(
          "WiSaw just updated over the Air", "Click OK to Reload the app",
          [
            {
              text1: 'OK',
              onPress: async () => {
                await Updates.reloadAsync()
              },
            },
          ],
        )
      }
    } catch (error) {
    // handle or log error
      // Toast.show({
      //   text1: `Failed to get over the air update:`,
      //   text2: `${error}`,
      //   type: "error",
      //   topOffset: 70,
      // })
    }
  }

  const wantToLoadMore = () => {
    if (isLastPage) {
      // console.log(`isLastPage:${isLastPage}`)
      return false
    }

    const screenColumns = /* Math.floor */(width / thumbDimension)
    const screenRows = /* Math.floor */(height / thumbDimension)
    const totalNumRows = /* Math.floor */(photos.length / screenColumns)

    if ((screenRows * 1 + lastViewableRow) > totalNumRows) {
      // console.log(`(screenRows * 2 + lastViewableRow) > totalNumRows : ${screenRows * 2 + lastViewableRow} > ${totalNumRows}`)
      return true
    }

    return false
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    thumbContainer: {
      // height: thumbDimension,
      // paddingBottom: 10,
      // marginBottom: 10,
    },
    cameraButtonPortrait: {
      flexDirection: 'column',
      bottom: 20,
      alignSelf: 'center',
      justifyContent: 'center',
    },

    cameraButtonLandscape: {
      flexDirection: 'column',
      right: 20,
      top: width < height ? width * 0.5 - 50 - 32 : height * 0.5 - 50 - 32,
    },

  })

  const _updateNavBar = async () => {
    if (netAvailable) {
      navigation.setOptions({
        headerTitle: renderHeaderTitle,
        headerLeft: renderHeaderLeft,
        headerRight: renderHeaderRight,
      })
    } else {
      navigation.setOptions({
        headerTitle: null,
        headerLeft: null,
        headerRight: null,
      })
    }
  }

  // const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))

  const _reload = async () => {
    const updatedLocation = await _getLocation()
    if (updatedLocation) {
      dispatch(reducer.resetState(updatedLocation))
    } else {
      if (!location) {
        return // if no location -- don't do anything
      }
      dispatch(reducer.resetState(location))
    }

    // dispatch(reducer.getPhotos())
    dispatch(reducer.uploadPendingPhotos())
  }

  async function _checkPermission({ permissionFunction, alertHeader, alertBody }) {
    const { status } = await permissionFunction()
    if (status !== 'granted') {
      Alert.alert(
        alertHeader,
        alertBody,
        [
          {
            text: 'Open Settings',
            onPress: () => {
              Linking.openSettings()
            },
          },
        ],
      )
    }
    return status
  }

  const checkPermissionsForPhotoTaking = async () => {
    const cameraPermission = await _checkPermission({
      permissionFunction: ImagePicker.requestCameraPermissionsAsync,
      alertHeader: 'Do you want to take photo with wisaw?',
      alertBody: 'Why don\'t you enable photo permission?',
    })

    if (cameraPermission === 'granted') {
      const photoAlbomPermission = await _checkPermission({
        permissionFunction: ImagePicker.requestMediaLibraryPermissionsAsync,
        alertHeader: 'Do you want to save photo on your device?',
        alertBody: 'Why don\'t you enable the permission?',
      })

      if (photoAlbomPermission === 'granted') {
        await takePhoto()
      }
    }
  }

  async function _getLocation() {
    let position = null

    const locationPermission = await _checkPermission({
      permissionFunction: Location.requestForegroundPermissionsAsync,
      alertHeader: 'How am I supposed to show you the near-by photos?',
      alertBody: 'Why don\'t you enable Location in Settings and Try Again?',
    })

    if (locationPermission === 'granted') {
      try {
        position = await Location.getLastKnownPositionAsync({}) // works faster this way, don't really need the accuracy, let's see if it really works
        // await Location.getCurrentPositionAsync({
        //   accuracy: Location.Accuracy.Lowest,
        // })
      } catch (err) {
        position = null
        Toast.show({
          text1: 'Unable to get location',
          type: "error",
          topOffset: 70,
        })
      }
    }
    return position
  }

  const takePhoto = async () => {
    let cameraReturn
    if (cameraType === "camera") {
      // launch photo capturing
      cameraReturn = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        // allowsEditing: true,
        quality: 1.0,
        exif: false,
      })
    } else {
      // launch video capturing
      cameraReturn = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        // allowsEditing: true,
        videoMaxDuration: 5,
        quality: 1.0,
        exif: false,
      })
    }

    // alert(`cameraReturn.cancelled ${cameraReturn.cancelled}`)
    if (cameraReturn.cancelled === false) {
      await MediaLibrary.saveToLibraryAsync(cameraReturn.uri)
      // have to wait, otherwise the upload will not start
      await dispatch(reducer.queueFileForUpload({ uri: cameraReturn.uri, type: cameraReturn.type, location }))
      dispatch(reducer.uploadPendingPhotos())
    }
  }

  const renderThumbs = () => (
    <FlatGrid
      itemDimension={
        thumbDimension
      }
      spacing={3}
      data={
        photos
      }
      renderItem={
        ({ item, index }) => (
          <Thumb
            item={
              item
            }
            index={
              index
            }
            thumbDimension={thumbDimension}
          />
        )
      }
      keyExtractor={item => item.id}
      style={
        styles.container
      }
      showsVerticalScrollIndicator={
        false
      }
      horizontal={
        false
      }
      refreshing={
        false
      }
      onRefresh={
        () => {
          _reload()
        }
      }
      onViewableItemsChanged={onViewRef.current}
      // viewabilityConfig={viewConfigRef.current}
    />
  )

  const renderThumbsWithComments = () => (
    <FlatGrid
      itemDimension={
        width
      }
      spacing={3}
      data={
        photos
      }
      renderItem={
        ({ item, index }) => (
          <ThumbWithComments
            item={
              item
            }
            index={
              index
            }
            thumbDimension={thumbDimension}
            screenWidth={width}
          />
        )
      }
      keyExtractor={item => item.id}
      style={
        styles.container
      }
      showsVerticalScrollIndicator={
        false
      }
      horizontal={
        false
      }
      refreshing={
        false
      }
      onRefresh={
        () => {
          _reload()
        }
      }
      onViewableItemsChanged={onViewRef.current}
      // viewabilityConfig={viewConfigRef.current}
    />
  )

  const renderPhotoButton = () => (
    <View style={
      [
        {
          flex: 1,
          position: 'absolute',
        },
        styles.cameraButtonPortrait,
      ]
    }>
      <Switch
        value={cameraType === 'video'}
        color={CONST.EMPHASIZED_COLOR}
        style={{
          alignSelf: 'center',
        }}
        onValueChange={() => {
          if (cameraType === 'camera') {
            setCameraType('video')
          } else {
            setCameraType('camera')
          }
        }}
      />
      <View><Text /></View>
      <Icon
        name={cameraType}
        type="font-awesome-5"
        color={cameraType === 'camera' ? CONST.MAIN_COLOR : CONST.EMPHASIZED_COLOR}
        backgroundColor={CONST.TRANSPARENT_BUTTON_COLOR}
        size={60}
        style={{
          alignSelf: 'center',
        }}
        containerStyle={
          {
            height: 90,
            width: 90,
            backgroundColor: CONST.TRANSPARENT_BUTTON_COLOR,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 45,
          }
        }
        onPress={
          () => {
            checkPermissionsForPhotoTaking()
          }
        }
      />
    </View>
  )

  const segment0 = () => (
    <FontAwesome
      name="globe"
      size={23}
      color={activeSegment === 0 ? CONST.MAIN_COLOR : CONST.TRANSPARENT_BUTTON_COLOR}
      onPress={
        async () => {
          await dispatch(reducer.setActiveSegment(0))
          _reload()
        }
      }
    />
  )

  const segment1 = () => (
    <AntDesign
      name="star"
      size={23}
      color={activeSegment === 1 ? CONST.MAIN_COLOR : CONST.TRANSPARENT_BUTTON_COLOR}
      onPress={
        async () => {
          await dispatch(reducer.setActiveSegment(1))
          _reload()
        }
      }
    />
  )

  const segment2 = () => (
    <FontAwesome
      name="search"
      size={23}
      color={activeSegment === 2 ? CONST.MAIN_COLOR : CONST.TRANSPARENT_BUTTON_COLOR}
      onPress={
        async () => {
          await dispatch(reducer.setActiveSegment(2))
          _reload()
        }
      }
    />
  )

  const renderHeaderTitle = () => (
    <ButtonGroup
      containerStyle={{ width: 150, height: 30 }}
      buttonStyle={{ alignSelf: 'center' }}
      buttons={[{ element: segment0 }, { element: segment1 }, { element: segment2 }]}
    />
  )

  const renderHeaderLeft = () => (
    <FontAwesome5
      onPress={
        () => {
          _reload()
        }
      }
      name="sync"
      size={30}
      style={
        {
          marginLeft: 10,
          color: CONST.MAIN_COLOR,
          width: 60,
        }
      }
    />
  )

  const renderHeaderRight = () => (
    <MaterialIcons
      onPress={
        () => navigation.navigate('FeedbackScreen')
      }
      name="feedback"
      size={35}
      style={{
        marginRight: 20,
        color: CONST.MAIN_COLOR,
      }}
    />
  )

  const renderSearchBar = autoFocus => (
    <View style={{
      flexDirection: 'row',
    }}>
      <SearchBar
        placeholder="Type Text Here..."
        placeholderTextColor={CONST.PLACEHOLDER_TEXT_COLOR}
        onChangeText={currentTerm => {
          dispatch(reducer.setSearchTerm(currentTerm))
        }}
        value={searchTerm}
        onSubmitEditing={
          () => submitSearch()
        }
        autoFocus={autoFocus}
        containerStyle={{
          width: width - 60,
        }}
        style={
          {
            color: CONST.MAIN_COLOR,
            backgroundColor: "white",
            paddingLeft: 10,
            paddingRight: 10,
          }
        }
        rightIconContainerStyle={{
          margin: 10,
        }}
        lightTheme
      />
      <Ionicons
        onPress={
          () => submitSearch()
        }
        name="send"
        size={30}
        style={
          {
            margin: 10,
            color: CONST.MAIN_COLOR,
            alignSelf: 'center',

          }
        }
      />
    </View>
  )

  const submitSearch = async () => {
    _reload()
    if (searchTerm && searchTerm.length >= 3) {
      if (keyboardVisible) {
        dismissKeyboard()
      }
    } else {
      Toast.show({
        text1: "Search for more than 3 characters",
        type: "error",
        topOffset: 70,
      })
    }
  }

  const renderPendingPhotos = () => {
    if (pendingPhotos.length > 0) {
      return (
        <View>
          <FlatGrid
            itemDimension={
              thumbDimension
            }
            spacing={3}
            data={
              pendingPhotos
            }
            renderItem={
              ({ item }) => (
                <ThumbPending
                  item={
                    item
                  }
                  thumbDimension={thumbDimension}
                />
              )
            }
            keyExtractor={item => item.cacheKey}
            style={
              styles.thumbContainer
            }
            showsVerticalScrollIndicator={
              false
            }
            horizontal={
              false
            }
            fixed
          />
        </View>
      )
    }
  }

  /// //////////////////////////////////////////////////////////////////////////
  // here where the rendering starts
  /// //////////////////////////////////////////////////////////////////////////

  if (
    isTandcAccepted
  && netAvailable
  && location
  && photos.length > 0
  ) {
    return (
      <SafeAreaView style={styles.container}>
        {activeSegment === 2 && renderSearchBar(false)}
        {renderPendingPhotos()}
        {/* photos */}
        {activeSegment === 0 && renderThumbs()}
        {activeSegment === 1 && renderThumbsWithComments()}
        {activeSegment === 2 && renderThumbsWithComments()}
        {renderPhotoButton()}
      </SafeAreaView>
    )
  }

  if (!isTandcAccepted) {
    return (
      <SafeAreaView style={styles.container}>
        <Overlay isVisible>
          <ScrollView>
            <Card containerStyle={{ padding: 0 }}>
              <ListItem style={{ borderRadius: 10 }}>
                <Text>When you take a photo with WiSaw app,
                  it will be added to a Photo Album on your phone,
                  as well as posted to global feed in the cloud.
                </Text>
              </ListItem>
              <Divider />
              <ListItem>
                <Text>Everyone close-by can see your photos.</Text>
              </ListItem>
              <Divider />
              <ListItem>
                <Text>You can see other&#39;s photos too.
                </Text>
              </ListItem>
              <Divider />
              <ListItem>
                <Text>If you find any photo abusive or inappropriate, you can delete it -- it will be deleted from the cloud so that no one will ever see it again.</Text>
              </ListItem>
              <Divider />
              <ListItem>
                <Text>No one will tolerate objectionable content or abusive users.</Text>
              </ListItem>
              <Divider />
              <ListItem>
                <Text>The abusive users will be banned from WiSaw by other users.</Text>
              </ListItem>
              <Divider />
              <ListItem>
                <Text>By using WiSaw I agree to Terms and Conditions.</Text>
              </ListItem>
              <Divider />

              <ListItem style={{ alignItems: 'center' }}>
                <Button
                  title="I Agree"
                  type="outline"
                  onPress={
                    () => {
                      dispatch(reducer.acceptTandC())
                    }
                  }
                />
              </ListItem>
            </Card>
          </ScrollView>
        </Overlay>
      </SafeAreaView>
    )
  }

  if (loading && photos?.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {activeSegment === 2 && renderSearchBar(false)}
        <LinearProgress color={
          CONST.MAIN_COLOR
        }
        />
        {renderPendingPhotos()}
        {renderPhotoButton()}
      </SafeAreaView>
    )
  }

  if (!location) {
    return (
      <SafeAreaView style={styles.container}>
        <Card
          borderRadius={5}
          containerStyle={{
            borderWidth: 0,
          }}>
          <Text style={{
            fontSize: 20,
            textAlign: 'center',
            margin: 10,
          }}>
            Acquiring location, make sure to enable Location Service.
          </Text>
        </Card>
        {renderPendingPhotos()}
        {renderPhotoButton()}
      </SafeAreaView>
    )
  }

  if (!netAvailable) {
    return (
      <SafeAreaView style={styles.container}>
        <Card
          borderRadius={5}
          containerStyle={{
            borderWidth: 0,
          }}>
          <Text style={{
            fontSize: 20,
            textAlign: 'center',
            margin: 10,
          }}>
            No network available, you can still snap photos -- they will be uploaded later.
          </Text>
        </Card>
        {renderPendingPhotos()}
        {renderPhotoButton()}
      </SafeAreaView>
    )
  }

  if (photos.length === 0 && isLastPage && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        {activeSegment === 2 && renderSearchBar(true)}
        {activeSegment === 2 && (
          <Card
            borderRadius={5}
            containerStyle={{
              borderWidth: 0,
            }}>
            <Text style={{
              fontSize: 20,
              textAlign: 'center',
              margin: 10,
            }}>
              Nothing found.
              Search string should be more than 3 characters.
            </Text>
          </Card>
        )}
        { activeSegment === 0 && (
          <Card
            borderRadius={5}
            containerStyle={{
              borderWidth: 0,
            }}>
            <Text style={{
              fontSize: 20,
              textAlign: 'center',
              margin: 10,
            }}>
              No Photos found in your location.
              Try to take some photos.
            </Text>
          </Card>
        )}
        {activeSegment === 1 && (
          <Card
            borderRadius={5}
            containerStyle={{
              borderWidth: 0,
            }}>
            <Text style={{
              fontSize: 20,
              textAlign: 'center',
              margin: 10,
            }}>
              Don&apos;t have anything Starred?
              Try to take a photo, comment on other&apos;s photos, or Star somebody else&apos;s photo -- they will all appear here.
            </Text>
          </Card>
        )}
        {renderPendingPhotos()}
        {renderPhotoButton()}
      </SafeAreaView>
    )
  }
  return (
    <SafeAreaView style={styles.container}>
      {activeSegment === 2 && renderSearchBar(false)}
      {renderPendingPhotos()}
      {renderPhotoButton()}
    </SafeAreaView>
  )
}

export default PhotosList
