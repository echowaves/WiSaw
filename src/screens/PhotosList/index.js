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

// import Branch, { BranchEvent } from 'expo-branch'

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
  FontAwesome, /* FontAwesome5, */ MaterialIcons, Ionicons, AntDesign,
} from '@expo/vector-icons'

import { Col, /* Row, */ Grid } from "react-native-easy-grid"

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
  const _initandreload = async () => {
    await _initState()
    await _reload()
  }

  useEffect(() => {
    _initBranch({ navigation })
    _getLocation()
    _initandreload()

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
    _updateNavBar()
    if (netAvailable) {
      _initandreload()
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

        Toast.show({
          text1: 'WiSaw just updated over the Air',
          text2: "Reload the app to get the latest version.",
          topOffset: 70,
        })
        // setTimeout(() => { Updates.reloadAsync() }, 3000)
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

  })

  const _updateNavBar = async () => {
    if (netAvailable) {
      navigation.setOptions({
        headerTitle: renderHeaderTitle,
        // headerLeft: renderHeaderLeft,
        // headerRight: renderHeaderRight,
        headerStyle: {
          backgroundColor: CONST.NAV_COLOR,
        },
      })
    } else {
      navigation.setOptions({
        headerTitle: null,
        headerLeft: null,
        headerRight: null,
        headerStyle: {
          backgroundColor: CONST.NAV_COLOR,
        },
      })
    }
  }

  // const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))

  const _reload = async () => {
    dispatch(reducer.resetState())
    dispatch(reducer.uploadPendingPhotos())
  }

  async function _checkPermission({
    permissionFunction, alertHeader, alertBody, permissionFunctionArgument,
  }) {
    const { status } = await permissionFunction(permissionFunctionArgument)
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

  const checkPermissionsForPhotoTaking = async ({ cameraType }) => {
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
        permissionFunctionArgument: true,
      })

      if (photoAlbomPermission === 'granted') {
        await takePhoto({ cameraType })
      }
    }
  }

  async function _getLocation() {
    const locationPermission = await _checkPermission({
      permissionFunction: Location.requestForegroundPermissionsAsync,
      alertHeader: 'How am I supposed to show you the near-by photos?',
      alertBody: 'Why don\'t you enable Location in Settings and Try Again?',
    })

    if (locationPermission === 'granted') {
      try {
        Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Lowest,
            timeInterval: 10000,
            distanceInterval: 3000,
          }, loc => {
            // Toast.show({
            //   text1: 'location udated',
            //   type: "error",
            //   topOffset: 70,
            // })
            dispatch(reducer.setLocation(loc))
          }
        )
      } catch (err) {
        Toast.show({
          text1: 'Unable to get location',
          type: "error",
          topOffset: 70,
        })
      }
    }
  }

  const takePhoto = async ({ cameraType }) => {
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
      await dispatch(reducer.queueFileForUpload({ cameraImgUrl: cameraReturn.uri, type: cameraReturn.type, location }))

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
      style={{
        ...styles.container,
        marginBottom: 95,
      }}
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
      style={{
        ...styles.container,
        marginBottom: 95,
      }}
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

  const renderPhotoButton = () => location && (
    <SafeAreaView
      style={{
        backgroundColor: CONST.FOOTER_COLOR,
        width,
        height: 95,
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 0,
      }}>
      <Divider />
      <Grid>
        {/* feedback button */}
        <Col
          style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <MaterialIcons
            onPress={
              () => navigation.navigate('FeedbackScreen')
            }
            name="feedback"
            size={25}
            style={{
              // marginRight: 20,
              color: CONST.MAIN_COLOR,
              position: 'absolute',
              bottom: 10,
              left: 10,
            }}
          />
        </Col>
        {/*  video button */}
        <Col
          style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={
            () => {
              checkPermissionsForPhotoTaking({ cameraType: 'video' })
            }
          }>
          <Icon
            name="video"
            type="font-awesome-5"
            color={CONST.EMPHASIZED_COLOR}
            size={30}
            style={{
              alignSelf: 'center',
            }}
            containerStyle={
              {
                height: 50,
                width: 80,
                backgroundColor: 'white',
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 45,
              }
            }
          />
        </Col>
        {/* photo button */}
        <Col
          style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={
            () => {
              checkPermissionsForPhotoTaking({ cameraType: 'camera' })
            }
          }>
          <Icon
            name="camera"
            type="font-awesome-5"
            color={CONST.MAIN_COLOR}
            size={30}
            style={{
              alignSelf: 'center',
            }}
            containerStyle={
              {
                height: 50,
                width: 80,
                backgroundColor: 'white',
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 45,
              }
            }
          />
        </Col>
        {/* empty button */}
        <Col
          style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={
            () => {
              checkPermissionsForPhotoTaking({ cameraType: 'video' })
            }
          }
        />
      </Grid>
    </SafeAreaView>
  )

  const segment0 = () => (
    <FontAwesome
      name="globe"
      size={23}
      color={activeSegment === 0 ? CONST.MAIN_COLOR : CONST.TRANSPARENT_ICONS_COLOR}
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
      color={activeSegment === 1 ? CONST.MAIN_COLOR : CONST.TRANSPARENT_ICONS_COLOR}
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
      color={activeSegment === 2 ? CONST.MAIN_COLOR : CONST.TRANSPARENT_ICONS_COLOR}
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

  // const renderHeaderLeft = () => (
  //   <FontAwesome5
  //     onPress={
  //       () => {
  //         _reload()
  //       }
  //     }
  //     name="sync"
  //     size={30}
  //     style={
  //       {
  //         marginLeft: 10,
  //         color: CONST.MAIN_COLOR,
  //         width: 60,
  //       }
  //     }
  //   />
  // )

  // const renderHeaderRight = () => (
  //   <MaterialIcons
  //     onPress={
  //       () => navigation.navigate('FeedbackScreen')
  //     }
  //     name="feedback"
  //     size={35}
  //     style={{
  //       marginRight: 20,
  //       color: CONST.MAIN_COLOR,
  //     }}
  //   />
  // )

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
            keyExtractor={item => item.localImageName}
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
      <View style={styles.container}>
        {activeSegment === 2 && renderSearchBar(false)}
        {renderPendingPhotos()}
        {/* photos */}
        {activeSegment === 0 && renderThumbs()}
        {activeSegment === 1 && renderThumbsWithComments()}
        {activeSegment === 2 && renderThumbsWithComments()}
        {renderPhotoButton()}
      </View>
    )
  }

  if (!isTandcAccepted) {
    return (
      <View style={styles.container}>
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
      </View>
    )
  }

  if (loading && photos?.length === 0) {
    return (
      <View style={styles.container}>
        {activeSegment === 2 && renderSearchBar(false)}
        <LinearProgress color={
          CONST.MAIN_COLOR
        }
        />
        {renderPendingPhotos()}
        {renderPhotoButton()}
      </View>
    )
  }

  if (!location) {
    return (
      <View style={styles.container}>
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
      </View>
    )
  }

  if (!netAvailable) {
    return (
      <View style={styles.container}>
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
      </View>
    )
  }

  if (photos.length === 0 && isLastPage && !loading) {
    return (
      <View style={styles.container}>
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
      </View>
    )
  }
  return (
    <View style={styles.container}>
      {activeSegment === 2 && renderSearchBar(false)}
      {renderPendingPhotos()}
      {renderPhotoButton()}
    </View>
  )
}

export const _initBranch = async ({ navigation }) => {
// eslint-disable-next-line
if (!__DEV__) {
    const ExpoBranch = await import('expo-branch')
    const Branch = ExpoBranch.default

    // console.log('...................................................................................1')
    // console.log({ Branch })
    // alert(JSON.stringify(Branch))
    Branch.subscribe(bundle => {
      if (bundle && bundle.params && bundle?.params?.$canonical_identifier && !bundle.error) {
      // `bundle.params` contains all the info about the link.

        // alert(JSON.stringify(bundle))
        navigation.popToTop()
        navigation.navigate('PhotosDetailsShared', { photoId: bundle?.params?.$canonical_identifier })
      }
    })
  }
}

export default PhotosList
