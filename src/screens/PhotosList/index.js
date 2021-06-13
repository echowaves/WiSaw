import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"
import * as MediaLibrary from 'expo-media-library'

import { useDeviceOrientation, useDimensions } from '@react-native-community/hooks'
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
} from 'react-native'

import {
  FontAwesome, FontAwesome5, MaterialIcons,
} from '@expo/vector-icons'

import NetInfo from "@react-native-community/netinfo"

import FlatGrid from 'react-native-super-grid'

import PropTypes from 'prop-types'

import Modal from "react-native-modal"

import {
  Card,
  ListItem,
  Divider,
  Button,
  LinearProgress,
  ButtonGroup,
  SearchBar,
} from 'react-native-elements'

import { CacheManager } from 'expo-cached-image'

import * as reducer from './reducer'

import * as CONST from '../../consts.js'
import Thumb from '../../components/Thumb'
import ThumbPending from '../../components/ThumbPending'

const PhotosList = () => {
  const navigation = useNavigation()

  const dispatch = useDispatch()

  const deviceOrientation = useDeviceOrientation()
  const { width, height } = useDimensions().window

  const [thumbDimension, setThumbDimension] = useState(100)
  const [lastViewableRow, setLastViewableRow] = useState(1)
  // const [loadMore, setLoadMore] = useState(false)

  const photos = useSelector(state => state.photosList.photos)
  const pendingPhotos = useSelector(state => state.photosList.pendingPhotos)
  const location = useSelector(state => state.photosList.location)
  // const errorMessage = useSelector(state => state.photosList.errorMessage)
  const isLastPage = useSelector(state => state.photosList.isLastPage)
  // const paging = useSelector(state => state.photosList.paging)
  const isTandcAccepted = useSelector(state => state.photosList.isTandcAccepted)
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

  useEffect(() => {
    const initState = async () => {
      await checkForUpdate()
      CacheManager.initCache()
      // check permissions, retrieve UUID, make sure upload folder exists
      await dispatch(reducer.initState())

      await reload()
    }
    initState()

    // add network availability listener
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      if (state) {
        dispatch(reducer.setNetAvailable(state.isInternetReachable))
      }
    })
    return () => unsubscribeNetInfo()
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  // when screen orientation changes
  useEffect(() => {
    dispatch(reducer.setOrientation(deviceOrientation.portrait ? 'portrait' : 'landscape'))
  }, [deviceOrientation]) // eslint-disable-line react-hooks/exhaustive-deps

  // re-render title on  state chage
  useEffect(() => {
    updateNavBar()
    if (netAvailable) {
      dispatch(reducer.uploadPendingPhotos())
    }
  }, [netAvailable]) // eslint-disable-line react-hooks/exhaustive-deps

  // when width of screen changes
  useEffect(() => {
    // const tmpWidth = width < height ? width : height
    const thumbsCount = Math.floor(width / 90)
    setThumbDimension(Math.floor((width - thumbsCount * 3 * 2) / thumbsCount) + 2)
    // setThumbDimension(Math.floor(tmpWidth / 4) - 4)
  }, [width])// eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (wantToLoadMore()) {
      dispatch(reducer.getPhotos())
    }
  }, [lastViewableRow, loading]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    updateNavBar()
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
      Toast.show({
        text1: `Failed to get over the air update:`,
        text2: `${error}`,
        type: "error",
      })
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
      flexDirection: 'row',
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

  const updateNavBar = () => {
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
    // if (!location) {
    //   reload()
    // }
  }

  const reload = async () => {
    const location = await _getLocation()
    await dispatch(reducer.resetState(location))
    await dispatch(reducer.uploadPendingPhotos())
    await dispatch(reducer.getPhotos())
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
        takePhoto()
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
        position = await Location.getCurrentPositionAsync({
          accuracy: 5000,
        })
      } catch (err) {
        position = null
        Toast.show({
          text1: 'Unable to get location',
          type: "error",
        })
      }
    }
    return position
  }

  const takePhoto = async () => {
    // dispatch(reducer.cleanupCache())
    CacheManager.initCache()
    const cameraReturn = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      // allowsEditing: true,
      quality: 1.0,
      exif: false,
    })
    // alert(`cameraReturn.cancelled ${cameraReturn.cancelled}`)

    if (cameraReturn.cancelled === false) {
      await MediaLibrary.saveToLibraryAsync(cameraReturn.uri)
      // have to wait, otherwise the upload will not start
      await dispatch(reducer.queueFileForUpload({ uri: cameraReturn.uri }))
      dispatch(reducer.uploadPendingPhotos())
    }
  }

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
      <Button
        type="clear"
        containerStyle={
          {
            height: 100,
            width: 100,
            backgroundColor: CONST.TRANSPARENT_BUTTON_COLOR,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 50,
          }
        }
        icon={(
          <FontAwesome
            name="camera"
            size={60}
            style={
              {
                color: CONST.MAIN_COLOR,
              }
            }
          />
        )}
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
          await reload()
        }
      }
    />
  )

  const segment1 = () => (
    <FontAwesome
      name="eye"
      size={23}
      color={activeSegment === 1 ? CONST.MAIN_COLOR : CONST.TRANSPARENT_BUTTON_COLOR}
      onPress={
        async () => {
          await dispatch(reducer.setActiveSegment(1))
          await reload()
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
          await reload()
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
          // dispatch(reducer.initState())
          reload()
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
      style={
        {
          color: CONST.MAIN_COLOR,
          backgroundColor: "white",
          width: '100%',
          paddingLeft: 10,
        }
      }
      lightTheme
    />
  )

  const submitSearch = async () => {
    await reload()
    if (searchTerm && searchTerm.length >= 3) {
      if (keyboardVisible) {
        dismissKeyboard()
      }
    } else {
      Toast.show({
        text1: "Search for more than 3 characters",
        type: "error",
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
            keyExtractor={item => item}
            style={
              styles.thumbContainer
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
              reload()
            }
          }
          onViewableItemsChanged={onViewRef.current}
          // viewabilityConfig={viewConfigRef.current}
        />
        {renderPhotoButton()}
      </SafeAreaView>
    )
  }

  if (!isTandcAccepted) {
    return (
      <SafeAreaView style={styles.container}>
        <Modal
          isVisible={
            !isTandcAccepted
          }>
          <Card containerStyle={{ padding: 0 }}>
            <ListItem style={{ borderRadius: 10 }}>
              <Text> When you take a photo with WiSaw app,
                it will be added to a Photo Album on your phone,
                as well as posted to global feed in the cloud.
              </Text>
            </ListItem>
            <Divider />
            <ListItem>
              <Text>People close-by can see your photos.</Text>
            </ListItem>
            <Divider />
            <ListItem>
              <Text>You can see other people&#39;s photos too.
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
        </Modal>
      </SafeAreaView>
    )
  }

  if (!location && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderPendingPhotos()}
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
        {renderPhotoButton()}
      </SafeAreaView>
    )
  }

  if (!netAvailable && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderPendingPhotos()}
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
            You are not connected to reliable network.
            You can still snap photos.
            They will be uploaded later.
          </Text>
        </Card>
        {renderPhotoButton()}
      </SafeAreaView>
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {activeSegment === 2 && renderSearchBar(false)}
        <LinearProgress color={
          CONST.MAIN_COLOR
        }
        />
        {renderPhotoButton()}
      </SafeAreaView>
    )
  }

  if (photos.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {activeSegment === 2 && renderSearchBar(true)}
        {renderPendingPhotos()}
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
              No Photos found.
              Try to search for something else.
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
              You don&apos;t seem to be watching any photos.
              Try to take some photos, comment on other&apos;s photos, or start watching somebody else&apos;s photos.
            </Text>
          </Card>
        )}
        {renderPhotoButton()}
      </SafeAreaView>
    )
  }
}

export default PhotosList
