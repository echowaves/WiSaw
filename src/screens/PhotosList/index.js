import React, { useEffect, useState } from 'react'

import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import * as MediaLibrary from 'expo-media-library'
// import * as FileSystem from 'expo-file-system'
import * as SecureStore from 'expo-secure-store'
import * as Notifications from 'expo-notifications'

import * as Location from 'expo-location'
import * as Linking from 'expo-linking'
import * as ImagePicker from 'expo-image-picker'
// import * as Updates from 'expo-updates'
import Toast from 'react-native-toast-message'

import * as BackgroundFetch from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'

import useKeyboard from '@rnhooks/keyboard'

import {
  StyleSheet,
  View,
  Alert,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
} from 'react-native'

import {
  FontAwesome,
  Ionicons,
  AntDesign,
  FontAwesome5,
} from '@expo/vector-icons'

import { Col, /* Row, */ Grid } from 'react-native-easy-grid'

import NetInfo from '@react-native-community/netinfo'

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
  Text,
  Badge,
} from '@rneui/themed'

import { UUID_KEY, getUUID } from '../Secret/reducer'
import * as friendsReducer from '../FriendsList/reducer'

import { getUnreadCountsList } from '../FriendsList/friends_helper'
import * as reducer from './reducer'

import * as CONST from '../../consts'

import Thumb from '../../components/Thumb'
import ThumbWithComments from '../../components/ThumbWithComments'
import ThumbPending from '../../components/ThumbPending'

const BACKGROUND_FETCH_TASK = 'background-fetch'

// 1. Define the task by providing a name and the function that should be executed
// Note: This needs to be called in the global scope (e.g outside of your React components)
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  // const now = Date.now()
  try {
    const uuid = await SecureStore.getItemAsync(UUID_KEY)
    const unreadCountList = getUnreadCountsList({ uuid })
    const badgeCount = unreadCountList.reduce((a, b) => a + (b.unread || 0), 0)
    Notifications.setBadgeCountAsync(badgeCount || 0)
    // console.log("background fetch", { badgeCount })

    // Be sure to return the successful result type!
    return BackgroundFetch.BackgroundFetchResult.NewData
  } catch (error) {
    // console.log("background fetch", { error })
    return BackgroundFetch.Result.Failed
  }
})

// 2. Register the task at some point in your app by providing the same name, and some configuration options for how the background fetch should behave
// Note: This does NOT need to be in the global scope and CAN be used in your React components!
async function registerBackgroundFetchAsync() {
  // console.log('registering background fetch...')
  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 60 * 15, // 15 minutes
    stopOnTerminate: false, // android only,
    startOnBoot: true, // android only
  })
}

// 3. (Optional) Unregister tasks by specifying the task name
// This will cancel any future background fetch calls that match the given name
// Note: This does NOT need to be in the global scope and CAN be used in your React components!
// async function unregisterBackgroundFetchAsync() {
//   return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK)
// }

const FOOTER_HEIGHT = 90

const PhotosList = () => {
  const navigation = useNavigation()

  const dispatch = useDispatch()

  // const deviceOrientation = useDeviceOrientation()
  const { width, height } = useWindowDimensions()

  const [topOffset, setTopOffset] = useState(100)

  const [thumbDimension, setThumbDimension] = useState(100)
  const [lastViewableRow, setLastViewableRow] = useState(1)
  // const [loadMore, setLoadMore] = useState(false)

  const [isTandcAccepted, setIsTandcAccepted] = useState(true)
  const [uuid, setUuid] = useState(null)
  const [zeroMoment, setZeroMoment] = useState(null)

  const [photosList, setPhotosList] = useState([])

  const [netAvailable, setNetAvailable] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [location, setLocation] = useState(null)

  // const [isLastPage, setIsLastPage] = useState(false)

  const [pageNumber, setPageNumber] = useState(null)

  const [currentBatch, setCurrentBatch] = useState(
    `${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`,
  )

  const [pendingPhotos, setPendingPhotos] = useState([])

  const [activeSegment, setActiveSegment] = useState(0)

  // const errorMessage = useSelector(state => state.photosList.errorMessage)
  // const paging = useSelector(state => state.photosList.paging)

  const [loading, setLoading] = useState(true)

  // const batch = useSelector(state => state.photosList.batch)
  const unreadCountList = useSelector(
    (state) => state.friendsList.unreadCountsList,
  )

  const unreadCount = unreadCountList.reduce((a, b) => a + (b.unread || 0), 0)

  const [keyboardVisible, dismissKeyboard] = useKeyboard()

  const onViewRef = React.useRef((viewableItems) => {
    const lastViewableItem =
      viewableItems.changed[viewableItems.changed.length - 1]
    // const lastViewableItem = viewableItems.changed[0]
    setLastViewableRow(lastViewableItem.index)
  })

  useEffect(() => {
    // checkStatusAsync()
    Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowAnnouncements: true,
      },
    })
    registerBackgroundFetchAsync()
  }, [])

  // const checkStatusAsync = async () => {
  //   const status = await BackgroundFetch.getStatusAsync()
  //   const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK)
  //   // setStatus(status)
  //   // setIsRegistered(isRegistered)
  // }

  const wantToLoadMore = () => {
    if (photosList.length === 0) return true
    const screenColumns = /* Math.floor */ width / thumbDimension
    const screenRows = /* Math.floor */ height / thumbDimension
    const totalNumRows = /* Math.floor */ photosList.length / screenColumns

    if (screenRows * 1 + lastViewableRow > totalNumRows) {
      // console.log(`(screenRows * 2 + lastViewableRow) > totalNumRows : ${screenRows * 2 + lastViewableRow} > ${totalNumRows}`)
      return true
    }

    return false
  }

  const load = async () => {
    const { photos, noMoreData, batch } = await reducer.getPhotos({
      uuid,
      zeroMoment,
      location,
      netAvailable,
      searchTerm,
      topOffset,
      activeSegment,
      batch: currentBatch,
      pageNumber,
    })

    // console.log({
    //   activeSegment,
    //   pageNumber,
    //   photos: photos.length,
    //   noMoreData,
    // })
    // const newPhotosList = [...photosList, ...photos].sort(
    //   (a, b) => a.row_number - b.row_number,
    // )

    if (batch === currentBatch) {
      // avoid duplicates
      setPhotosList((prevPhotosList) =>
        [...prevPhotosList, ...photos]
          .filter(
            (obj, pos, arr) =>
              arr.map((mapObj) => mapObj.id).indexOf(obj.id) === pos,
          ) // fancy way to remove duplicate photos
          .sort((a, b) => a.row_number - b.row_number),
      )
    }

    if (noMoreData === false && wantToLoadMore()) {
      setPageNumber((currentPage) => currentPage + 1)
    } else {
      setLoading(false)
    }
  }
  const segment0 = () => (
    <FontAwesome
      name="globe"
      size={23}
      color={
        activeSegment === 0 ? CONST.MAIN_COLOR : CONST.TRANSPARENT_ICONS_COLOR
      }
    />
  )

  const segment1 = () => (
    <AntDesign
      name="star"
      size={23}
      color={
        activeSegment === 1 ? CONST.MAIN_COLOR : CONST.TRANSPARENT_ICONS_COLOR
      }
    />
  )

  const segment2 = () => (
    <FontAwesome
      name="search"
      size={23}
      color={
        activeSegment === 2 ? CONST.MAIN_COLOR : CONST.TRANSPARENT_ICONS_COLOR
      }
    />
  )

  const updateIndex = async (index) => {
    setActiveSegment(index)
  }

  const renderHeaderTitle = () => (
    <>
      <ButtonGroup
        onPress={updateIndex}
        containerStyle={{
          width: 200,
          height: 35,
        }}
        buttonStyle={{ alignSelf: 'center' }}
        buttons={[
          { element: segment0 },
          { element: segment1 },
          { element: segment2 },
        ]}
      />
      {loading && (
        <LinearProgress
          color={CONST.MAIN_COLOR}
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            left: 0,
          }}
        />
      )}
    </>
  )

  const updateNavBar = async () => {
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
        headerTitle: '',
        headerLeft: '',
        headerRight: '',
        headerStyle: {
          backgroundColor: CONST.NAV_COLOR,
        },
      })
    }
  }

  const reload = async () => {
    setCurrentBatch(`${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`)
    updateNavBar()
    setPhotosList([])

    await new Promise((resolve) => setTimeout(resolve, 500))

    setPhotosList([])
    setPageNumber(0)
    // dispatch(reducer.resetState())
    // setPhotosList({})

    reducer.uploadPendingPhotos({
      uuid,
      topOffset,
      netAvailable,
      uploadingPhoto: true,
    })
    dispatch(friendsReducer.reloadFriendsList({ uuid })) // the list of enhanced friends list has to be loaded earlier on
    dispatch(friendsReducer.reloadUnreadCountsList({ uuid })) // the list of enhanced friends list has to be loaded earlier on

    setPendingPhotos(await reducer.getQueue())

    load()
  }

  const initState = async () => {
    // /// //////////////////////////////////////
    // const files = await FileSystem.readDirectoryAsync(FileSystem.cacheDirectory)
    // files.forEach(file => {
    //   FileSystem.deleteAsync(`${FileSystem.cacheDirectory}${file}`, { idempotent: true })
    // })
    // // cleanup cache folder
    // /// //////////////////////////////////////
    const thumbsCount = Math.floor(width / 90)
    setThumbDimension(
      Math.floor((width - thumbsCount * 3 * 2) / thumbsCount) + 2,
    )

    // checkForUpdate(),
    // check permissions, retrieve UUID, make sure upload folder exists
    setIsTandcAccepted(await reducer.getTancAccepted())
    setUuid(await getUUID())
    setZeroMoment(await reducer.getZeroMoment())
    // reload()
  }

  async function checkPermission({
    permissionFunction,
    alertHeader,
    alertBody,
    permissionFunctionArgument,
  }) {
    const { status } = await permissionFunction(permissionFunctionArgument)
    if (status !== 'granted') {
      Alert.alert(alertHeader, alertBody, [
        {
          text: 'Open Settings',
          onPress: () => {
            Linking.openSettings()
          },
        },
      ])
    }
    return status
  }

  const takePhoto = async ({ cameraType }) => {
    let cameraReturn
    if (cameraType === 'camera') {
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
      await dispatch(
        reducer.queueFileForUpload({
          cameraImgUrl: cameraReturn.uri,
          type: cameraReturn.type,
          location,
        }),
      )

      reducer.uploadPendingPhotos({
        uuid,
        topOffset,
        netAvailable,
        uploadingPhoto: true,
      })
    }
  }

  const checkPermissionsForPhotoTaking = async ({ cameraType }) => {
    const cameraPermission = await checkPermission({
      permissionFunction: ImagePicker.requestCameraPermissionsAsync,
      alertHeader: 'Do you want to take photo with wisaw?',
      alertBody: "Why don't you enable photo permission?",
    })

    if (cameraPermission === 'granted') {
      const photoAlbomPermission = await checkPermission({
        permissionFunction: ImagePicker.requestMediaLibraryPermissionsAsync,
        alertHeader: 'Do you want to save photo on your device?',
        alertBody: "Why don't you enable the permission?",
        permissionFunctionArgument: true,
      })

      if (photoAlbomPermission === 'granted') {
        await takePhoto({ cameraType })
      }
    }
  }

  async function getLocation() {
    const locationPermission = await checkPermission({
      permissionFunction: Location.requestForegroundPermissionsAsync,
      alertHeader:
        'WiSaw shows you near-by photos based on your current location.',
      alertBody: 'You need to enable Location in Settings and Try Again.',
    })

    if (locationPermission === 'granted') {
      try {
        // initially set the location that is last known -- works much faster this way
        const loc = await Location.getLastKnownPositionAsync({
          maxAge: 86400000,
          requiredAccuracy: 5000,
        })
        setLocation(loc)

        // Location.watchPositionAsync(
        //   {
        //     accuracy: Location.Accuracy.Lowest,
        //     timeInterval: 10000,
        //     distanceInterval: 3000,
        //   },
        //   async (loc1) => {
        //     // Toast.show({
        //     //   text1: 'location udated',
        //     //   type: "error",
        //     // topOffset: topOffset,
        //     // })
        //     setLocation(loc1)
        //   },
        // )
        return loc
      } catch (err) {
        Toast.show({
          text1: 'Unable to get location',
          type: 'error',
          topOffset,
        })
      }
    }
    return null
  }

  useEffect(() => {
    // TODO: delete next line -- debuggin
    // navigation.navigate('ConfirmFriendship', { friendshipUuid: "544e4564-1fb2-429f-917c-3495f545552b" })

    setTopOffset(height / 3)
    ;(async () => {
      await initState()
      const loc = await getLocation()
      // console.log({ loc })

      // eslint-disable-next-line no-undef
      if (!__DEV__) {
        const branchHelper = await import('../../branch_helper')
        branchHelper.initBranch({ navigation })
      }
    })()

    // add network availability listener
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      if (state) {
        setNetAvailable(state.isInternetReachable)
      }
    })
    return () => {
      unsubscribeNetInfo()
    }
  }, [])

  useEffect(() => {
    reload()
  }, [location])

  // useEffect(() => {}, [currentBatch])

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: CONST.BG_COLOR,
    },
    thumbContainer: {
      // height: thumbDimension,
      // paddingBottom: 10,
      // marginBottom: 10,
    },
  })

  useEffect(() => {
    updateNavBar()
  }, [loading])

  useEffect(() => {
    // console.log({ pageNumber })
    setLoading(true)
    load()
  }, [pageNumber])

  useEffect(() => {
    // console.log({ activeSegment })
    reload()
  }, [activeSegment])

  useEffect(() => {
    if (wantToLoadMore() && !loading) {
      setPageNumber((currentPage) => currentPage + 1)
    }
  }, [lastViewableRow])

  // const checkForUpdate = async () => {
  //   try {
  //     const update = await Updates.checkForUpdateAsync()
  //     if (update.isAvailable) {
  //       await Updates.fetchUpdateAsync()

  //       Toast.show({
  //         text1: 'WiSaw updated',
  //         text2: "Restart to see changes",
  //         topOffset,
  //       })
  //       // setTimeout(() => { Updates.reloadAsync() }, 3000)
  //     }
  //   } catch (error) {
  //   // handle or log error
  //     // Toast.show({
  //     //   text1: `Failed to get over the air update:`,
  //     //   text2: `${error}`,
  //     //   type: "error",
  //     // topOffset: topOffset,
  //     // })
  //   }
  // }

  // const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))

  const renderThumbs = () => (
    <FlatGrid
      itemDimension={thumbDimension}
      spacing={3}
      data={photosList}
      renderItem={({ item, index }) => (
        <Thumb
          item={item}
          index={index}
          thumbDimension={thumbDimension}
          photosList={photosList}
          searchTerm={searchTerm}
          activeSegment={activeSegment}
          topOffset={topOffset}
        />
      )}
      keyExtractor={(item) => item.id}
      style={{
        ...styles.container,
        marginBottom: FOOTER_HEIGHT,
      }}
      showsVerticalScrollIndicator={false}
      horizontal={false}
      refreshing={false}
      onRefresh={() => {
        reload()
      }}
      onViewableItemsChanged={onViewRef.current}
      // viewabilityConfig={viewConfigRef.current}
    />
  )

  const renderThumbsWithComments = () => (
    <FlatGrid
      itemDimension={width}
      spacing={3}
      data={photosList}
      renderItem={({ item, index }) => (
        <ThumbWithComments
          item={item}
          index={index}
          thumbDimension={thumbDimension}
          screenWidth={width}
          photosList={photosList}
          searchTerm={searchTerm}
          activeSegment={activeSegment}
          topOffset={topOffset}
        />
      )}
      keyExtractor={(item) => item.id}
      style={{
        ...styles.container,
        marginBottom: 95,
      }}
      showsVerticalScrollIndicator={false}
      horizontal={false}
      refreshing={false}
      onRefresh={() => {
        reload()
      }}
      onViewableItemsChanged={onViewRef.current}
      // viewabilityConfig={viewConfigRef.current}
    />
  )

  const renderFooter = () => {
    Notifications.setBadgeCountAsync(unreadCount || 0)

    return (
      location && (
        <SafeAreaView
          style={{
            backgroundColor: CONST.NAV_COLOR,
            width,
            height: FOOTER_HEIGHT,
            position: 'absolute',
            bottom: 0,
            right: 0,
            left: 0,
          }}
        >
          <Grid
            style={{
              position: 'absolute',
              top: 5,
              right: 0,
              left: 0,
            }}
          >
            {/* drawer button */}
            <Col
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {netAvailable && (
                <FontAwesome
                  onPress={() => navigation.openDrawer()}
                  name="navicon"
                  size={25}
                  style={{
                    color: CONST.MAIN_COLOR,
                    position: 'absolute',
                    bottom: 0,
                    left: 15,
                  }}
                />
              )}
            </Col>

            {/*  video button */}
            <Col
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 45,
                backgroundColor: 'white',
                height: 50,
                width: 80,
              }}
              onPress={() => {
                checkPermissionsForPhotoTaking({ cameraType: 'video' })
              }}
            >
              <FontAwesome5
                name="video"
                color={CONST.EMPHASIZED_COLOR}
                size={30}
                style={{
                  alignSelf: 'center',
                }}
                containerStyle={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              />
            </Col>
            <Col
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                height: 50,
                width: 25,
              }}
            />
            {/* photo button */}
            <Col
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                height: 50,
                width: 80,
                backgroundColor: 'white',
                borderRadius: 45,
              }}
              onPress={() => {
                checkPermissionsForPhotoTaking({ cameraType: 'camera' })
              }}
            >
              <FontAwesome5
                name="camera"
                color={CONST.MAIN_COLOR}
                size={30}
                style={{
                  alignSelf: 'center',
                }}
                containerStyle={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              />
            </Col>
            {/* drawer button */}
            <Col
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {netAvailable && (
                <FontAwesome5
                  onPress={() => navigation.navigate('FriendsList')}
                  name="user-friends"
                  size={35}
                  style={{
                    color: CONST.MAIN_COLOR,
                    position: 'absolute',
                    bottom: 0,
                    right: 15,
                  }}
                />
              )}
              {unreadCount > 0 && (
                <Badge
                  value={unreadCount}
                  badgeStyle={{
                    backgroundColor: CONST.MAIN_COLOR,
                  }}
                  containerStyle={{ position: 'absolute', top: 5, right: 5 }}
                />
              )}
            </Col>
          </Grid>
        </SafeAreaView>
      )
    )
  }

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
  const submitSearch = async () => {
    reload()
    if (searchTerm && searchTerm.length >= 3) {
      if (keyboardVisible) {
        dismissKeyboard()
      }
    } else {
      Toast.show({
        text1: 'Search for more than 3 characters',
        type: 'error',
        topOffset,
      })
    }
  }

  const renderSearchBar = (autoFocus) => (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: CONST.NAV_COLOR,
      }}
    >
      <SearchBar
        placeholder="Type Text Here..."
        placeholderTextColor={CONST.PLACEHOLDER_TEXT_COLOR}
        onChangeText={(currentTerm) => {
          setSearchTerm(currentTerm)
        }}
        value={searchTerm}
        onSubmitEditing={() => submitSearch()}
        autoFocus={autoFocus}
        containerStyle={{
          width: width - 60,
        }}
        style={{
          color: CONST.MAIN_COLOR,
          backgroundColor: 'white',
          paddingLeft: 10,
          paddingRight: 10,
        }}
        rightIconContainerStyle={{
          margin: 10,
        }}
        lightTheme
      />
      <Ionicons
        onPress={() => submitSearch()}
        name="send"
        size={30}
        style={{
          margin: 10,
          color: CONST.MAIN_COLOR,
          alignSelf: 'center',
        }}
      />
    </View>
  )

  const renderPendingPhotos = () => {
    if (pendingPhotos.length > 0) {
      return (
        <View>
          <FlatGrid
            itemDimension={thumbDimension}
            spacing={3}
            data={pendingPhotos}
            renderItem={({ item }) => (
              <ThumbPending item={item} thumbDimension={thumbDimension} />
            )}
            keyExtractor={(item) => item.localImageName}
            showsVerticalScrollIndicator={false}
            horizontal={false}
            fixed
          />
          <LinearProgress
            color={CONST.MAIN_COLOR}
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              left: 0,
            }}
          />
        </View>
      )
    }
    return null
  }

  /// //////////////////////////////////////////////////////////////////////////
  // here where the rendering starts
  /// //////////////////////////////////////////////////////////////////////////

  if (isTandcAccepted && netAvailable && location && photosList.length > 0) {
    return (
      <View style={styles.container}>
        {activeSegment === 2 && renderSearchBar(false)}
        {renderPendingPhotos()}
        {/* photos */}
        {activeSegment === 0 && renderThumbs()}
        {activeSegment === 1 && renderThumbsWithComments()}
        {activeSegment === 2 && renderThumbsWithComments()}
        {renderFooter({ unreadCount })}
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
                <Text>
                  When you take a photo with WiSaw app, it will be added to a
                  Photo Album on your phone, as well as posted to global feed in
                  the cloud.
                </Text>
              </ListItem>
              <Divider />
              <ListItem>
                <Text>Everyone close-by can see your photos.</Text>
              </ListItem>
              <Divider />
              <ListItem>
                <Text>You can see other&#39;s photos too.</Text>
              </ListItem>
              <Divider />
              <ListItem>
                <Text>
                  If you find any photo abusive or inappropriate, you can delete
                  it -- it will be deleted from the cloud so that no one will
                  ever see it again.
                </Text>
              </ListItem>
              <Divider />
              <ListItem>
                <Text>
                  No one will tolerate objectionable content or abusive users.
                </Text>
              </ListItem>
              <Divider />
              <ListItem>
                <Text>
                  The abusive users will be banned from WiSaw by other users.
                </Text>
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
                  onPress={() => {
                    setIsTandcAccepted(reducer.acceptTandC())
                  }}
                />
              </ListItem>
            </Card>
          </ScrollView>
        </Overlay>
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
          }}
        >
          <Text
            style={{
              fontSize: 20,
              textAlign: 'center',
              margin: 10,
            }}
          >
            No network available, you can still snap photos -- they will be
            uploaded later.
          </Text>
        </Card>
        {renderPendingPhotos()}
        {renderFooter({ unreadCount })}
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
          }}
        >
          <Text
            style={{
              fontSize: 20,
              textAlign: 'center',
              margin: 10,
            }}
          >
            Acquiring location, make sure to enable Location Service.
          </Text>
        </Card>
        {renderPendingPhotos()}
        {renderFooter({ renderFooter })}
      </View>
    )
  }

  if (photosList.length === 0) {
    return (
      <View style={styles.container}>
        {activeSegment === 2 && renderSearchBar(true)}
        {activeSegment === 2 && (
          <Card
            borderRadius={5}
            containerStyle={{
              borderWidth: 0,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                textAlign: 'center',
                margin: 10,
              }}
            >
              Nothing found. Try to search for something else.
            </Text>
          </Card>
        )}
        {activeSegment === 0 && (
          <Card
            borderRadius={5}
            containerStyle={{
              borderWidth: 0,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                textAlign: 'center',
                margin: 10,
              }}
            >
              No Photos found in your location. Try to take some photos.
            </Text>
          </Card>
        )}
        {activeSegment === 1 && (
          <Card
            borderRadius={5}
            containerStyle={{
              borderWidth: 0,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                textAlign: 'center',
                margin: 10,
              }}
            >
              Don&apos;t have anything Starred? Try to take a photo, comment on
              other&apos;s photos, or Star somebody else&apos;s photo -- they
              will all appear here.
            </Text>
          </Card>
        )}
        {renderPendingPhotos()}
        {renderFooter({ unreadCount })}
      </View>
    )
  }

  // dispatch(reducer.getPhotos())
  return (
    <View style={styles.container}>
      {activeSegment === 2 && renderSearchBar(false)}
      {renderPendingPhotos()}
      {renderFooter({ unreadCount })}
    </View>
  )
}

export default PhotosList
