import React, { useEffect, useState, useContext } from 'react'

import { useNavigation } from '@react-navigation/native'
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
import { CacheManager } from 'expo-cached-image'
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

import * as friendsHelper from '../FriendsList/friends_helper'

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
    const uuid = await SecureStore.getItemAsync(CONST.UUID_KEY)
    const unreadCountList = await friendsHelper.getUnreadCountsList({ uuid })

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

let currentBatch = `${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`
let activeSegment = 0

const PhotosList = () => {
  const { authContext, setAuthContext } = useContext(CONST.AuthContext)

  const navigation = useNavigation()

  const { width, height } = useWindowDimensions()

  const [thumbDimension, setThumbDimension] = useState(100)
  const [lastViewableRow, setLastViewableRow] = useState(1)

  const [isTandcAccepted, setIsTandcAccepted] = useState(true)
  const [zeroMoment, setZeroMoment] = useState(null)

  const [netAvailable, setNetAvailable] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [location, setLocation] = useState({
    coords: { latitude: 0, longitude: 0 },
  })

  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  // const [isLastPage, setIsLastPage] = useState(false)

  const [pageNumber, setPageNumber] = useState(null)

  const [pendingPhotos, setPendingPhotos] = useState([])

  // const [activeSegment, setActiveSegment] = useState(0)

  const [loading, setLoading] = useState(false)

  const [unreadCountList, setUnreadCountList] = useState([])

  const [unreadCount, setUnreadCount] = useState(0)

  const [keyboardVisible, dismissKeyboard] = useKeyboard()

  const onViewRef = React.useRef((viewableItems) => {
    const lastViewableItem =
      viewableItems.changed[viewableItems.changed.length - 1]
    // const lastViewableItem = viewableItems.changed[0]
    setLastViewableRow(lastViewableItem.index)
  })

  useEffect(() => {
    setUnreadCount(unreadCountList.reduce((a, b) => a + (b.unread || 0), 0))
  }, [unreadCountList])

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
    const { photosList } = authContext

    if (photosList.length === 0) return true
    const screenColumns = /* Math.floor */ width / thumbDimension
    const screenRows = /* Math.floor */ height / thumbDimension
    const totalNumRows = /* Math.floor */ photosList.length / screenColumns

    if (screenRows * 2 + lastViewableRow > totalNumRows) {
      // console.log(`(screenRows * 2 + lastViewableRow) > totalNumRows : ${screenRows * 2 + lastViewableRow} > ${totalNumRows}`)
      return true
    }

    return false
  }

  const load = async () => {
    const { uuid, topOffset } = authContext

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
      setAuthContext((prevAuthContext) => ({
        ...prevAuthContext,
        photosList: [...prevAuthContext.photosList, ...photos]
          .sort((a, b) => a.row_number - b.row_number)
          .filter(
            (obj, pos, arr) =>
              arr.map((mapObj) => mapObj.id).indexOf(obj.id) === pos,
          ), // fancy way to remove duplicate photos
      }))
    }
    // else {
    //   console.log('batch missmatch')
    // }

    if (noMoreData === false && wantToLoadMore()) {
      setPageNumber((currentPage) => currentPage + 1)
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
  async function uploadPendingPhotos() {
    const { uuid, topOffset } = authContext

    // return Promise.resolve()
    // console.log(1)
    if (netAvailable === false) {
      return Promise.resolve()
    }

    if (uploadingPhoto) {
      // console.log({ uploadingPhoto })
      // already uploading photos, just exit here
      return Promise.resolve()
    }
    setUploadingPhoto(true)
    try {
      let i
      // here let's iterate over the items and upload one file at a time

      // generatePhotoQueue will only contain item with undefined photo
      const generatePhotoQueue = (await reducer.getQueue()).filter(
        (image) => !image.photo,
      )

      // first pass iteration to generate photos ID and the photo record on the backend
      for (i = 0; i < generatePhotoQueue.length; i += 1) {
        const item = generatePhotoQueue[i]
        try {
          // eslint-disable-next-line no-await-in-loop
          const photo = await reducer.generatePhoto({
            uuid,
            lat: item.location.coords.latitude,
            lon: item.location.coords.longitude,
            video: item?.type === 'video',
          })
          // eslint-disable-next-line no-await-in-loop
          CacheManager.addToCache({
            file: item.localThumbUrl,
            key: `${photo.id}-thumb`,
          })
          // eslint-disable-next-line no-await-in-loop
          CacheManager.addToCache({
            file: item.localImgUrl,
            key: `${photo.id}`,
          })
          // eslint-disable-next-line no-await-in-loop
          await reducer.removeFromQueue(item)
          // eslint-disable-next-line no-await-in-loop
          await reducer.addToQueue({
            ...item,
            photo,
          })
          // eslint-disable-next-line no-await-in-loop
          // setPendingPhotos(await reducer.getQueue())
        } catch (err123) {
          // eslint-disable-next-line no-console
          console.log({ err123 })
          if (`${err123}`.includes('banned')) {
            // eslint-disable-next-line no-await-in-loop
            await reducer.removeFromQueue(item)
            // eslint-disable-next-line no-await-in-loop
            setPendingPhotos(await reducer.getQueue())

            Toast.show({
              text1: "Sorry, you've been banned",
              text2: 'Try again later',
              type: 'error',
              topOffset,
            })
          }
        }
      }

      // uploadQueue will only contain item with photo generated on the backend
      const uploadQueue = (await reducer.getQueue()).filter(
        (image) => image.photo,
      )
      // second pass -- upload files
      for (i = 0; i < uploadQueue.length; i += 1) {
        const item = uploadQueue[i]

        // eslint-disable-next-line no-await-in-loop
        const { responseData } = await reducer.uploadItem({
          item,
        })

        if (responseData.status === 200) {
          // console.log('uploaded', { item: item?.id })
          // eslint-disable-next-line no-await-in-loop
          await reducer.removeFromQueue(item)

          // eslint-disable-next-line no-await-in-loop
          // await updatePendingPhotos()

          // show the photo in the photo list immidiately

          // eslint-disable-next-line no-await-in-loop
          // dispatch({
          //   type: ACTION_TYPES.PHOTO_UPLOADED_PREPEND,
          //   photo: item.photo,
          // })

          // eslint-disable-next-line no-await-in-loop
          // setPendingPhotos((prevQueue) => [
          //   ...prevQueue.filter((photo) => item.id !== photo.id),
          // ])

          setAuthContext((prevAuthContext) => ({
            ...prevAuthContext,
            photosList: [item.photo, ...prevAuthContext.photosList].filter(
              (obj, pos, arr) =>
                arr.map((mapObj) => mapObj.id).indexOf(obj.id) === pos,
            ), // fancy way to remove duplicate photos
          }))

          // Toast.show({
          //   text1: `${item.photo.video ? 'Video' : 'Photo'} uploaded`,
          //   topOffset,
          //   visibilityTime: 500,
          // })
          // eslint-disable-next-line no-await-in-loop
          setPendingPhotos(await reducer.getQueue())
        } else {
          // alert(JSON.stringify({ responseData }))
          Toast.show({
            text1: 'Upload is going slooooow...',
            text2: 'Still trying to upload.',
            visibilityTime: 500,
            topOffset,
          })
        }
      }
    } catch (err2) {
      // eslint-disable-next-line no-console
      // console.log({ err2 })
      Toast.show({
        text1: 'Upload is slow...',
        text2: 'Still trying to upload.',
        visibilityTime: 500,
        topOffset,
      })
      // console.log({ error }) // eslint-disable-line no-console
      // dispatch(uploadPendingPhotos())
    }

    setUploadingPhoto(false)
    // sleep for 1 second before re-trying
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if ((await reducer.getQueue()).length > 0) {
      uploadPendingPhotos()
    }
    return Promise.resolve()
  }

  const reload = async () => {
    const { uuid, topOffset } = authContext

    setAuthContext((prevAuthContext) => ({
      ...prevAuthContext,
      photosList: [],
    }))

    setPageNumber(0)

    currentBatch = `${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`

    setPendingPhotos(await reducer.getQueue())

    uploadPendingPhotos()
    if (uuid.length > 0) {
      const friendsList = await friendsHelper.getEnhancedListOfFriendships({
        uuid,
      })

      setAuthContext((prevAuthContext) => ({
        ...prevAuthContext,
        friendsList, // the list of enhanced friends list has to be loaded earlier on
      }))

      const unreadCounts = await friendsHelper.getUnreadCountsList({ uuid })

      setUnreadCountList(unreadCounts) // the list of enhanced friends list has to be loaded earlier on
    }
    // setPendingPhotos(await reducer.getQueue())
  }

  const updateIndex = async (index) => {
    activeSegment = index
    // setActiveSegment(index)
    // updateNavBar()
    reload()
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
    const { uuid, topOffset } = authContext

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

    // alert(`cameraReturn.canceled ${cameraReturn.canceled}`)
    if (cameraReturn.canceled === false) {
      await MediaLibrary.saveToLibraryAsync(cameraReturn.assets[0].uri)
      // have to wait, otherwise the upload will not start
      await reducer.queueFileForUpload({
        cameraImgUrl: cameraReturn.assets[0].uri,
        type: cameraReturn.assets[0].type,
        location,
      })

      setPendingPhotos(await reducer.getQueue())

      uploadPendingPhotos({
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
    const { topOffset } = authContext

    const locationPermission = await checkPermission({
      permissionFunction: Location.requestForegroundPermissionsAsync,
      alertHeader:
        'WiSaw shows you near-by photos based on your current location.',
      alertBody: 'You need to enable Location in Settings and Try Again.',
    })

    if (locationPermission === 'granted') {
      try {
        // initially set the location that is last known -- works much faster this way
        let loc = await Location.getLastKnownPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        })
        if (!loc) {
          loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.BestForNavigation,
          })
        }

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

    ;(async () => {
      if (!loading) setLoading(true)
      await load()
      if (loading) setLoading(false)
    })()
  }, [pageNumber, activeSegment])

  // useEffect(() => {
  //   // console.log({ activeSegment })
  //   updateNavBar()
  //   // reload()
  // }, [activeSegment])

  useEffect(() => {
    if (wantToLoadMore() && loading === false) {
      setPageNumber((currentPage) => currentPage + 1)
      // load()
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

  const renderThumbs = () => {
    const { uuid, topOffset, photosList } = authContext

    return (
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
            uuid={uuid}
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
  }

  const renderThumbsWithComments = () => {
    const { uuid, topOffset, photosList } = authContext

    return (
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
            uuid={uuid}
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
  }

  const renderFooter = () => {
    const { uuid, nickName, topOffset, photosList } = authContext

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
          {loading && (
            <LinearProgress
              color={CONST.MAIN_COLOR}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                left: 0,
              }}
            />
          )}
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
    const { uuid, nickName, topOffset, photosList } = authContext

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

  const renderSearchBar = (autoFocus) => {
    const { uuid, nickName, topOffset, photosList } = authContext

    return (
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
  }

  const renderPendingPhotos = () => {
    const { uuid, nickName, topOffset, photosList } = authContext

    if (pendingPhotos.length > 0) {
      return (
        <View>
          <FlatGrid
            itemDimension={thumbDimension}
            spacing={3}
            data={pendingPhotos}
            renderItem={({ item }) => (
              <ThumbPending
                item={item}
                thumbDimension={thumbDimension}
                uuid={uuid}
              />
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

  if (
    isTandcAccepted &&
    // netAvailable &&
    location &&
    authContext?.photosList.length > 0
  ) {
    return (
      <View style={styles.container}>
        {netAvailable && activeSegment === 2 && renderSearchBar(false)}
        {renderPendingPhotos()}
        {/* photos */}
        {netAvailable && activeSegment === 0 && renderThumbs()}
        {netAvailable && activeSegment === 1 && renderThumbsWithComments()}
        {netAvailable && activeSegment === 2 && renderThumbsWithComments()}
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

  if (authContext?.photosList.length === 0 && !loading) {
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
