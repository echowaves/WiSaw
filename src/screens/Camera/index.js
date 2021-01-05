import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"

import {
  AsyncStorage,
  StyleSheet,
  View,
  Text,
  Platform,
  TouchableOpacity,
} from 'react-native'

import CameraRoll from "@react-native-community/cameraroll"

import { PinchGestureHandler, State } from 'react-native-gesture-handler'
import { useDimensions } from '@react-native-community/hooks'

import {
  Icon,
  Button,
  // Toast,
} from 'native-base'

import PropTypes from 'prop-types'

import { RNCamera } from 'react-native-camera'

import * as Animatable from 'react-native-animatable'

import moment from 'moment'

import * as reducer from './reducer'

import { store } from '../../index.js' // eslint-disable-line import/no-cycle
import * as CONST from '../../consts.js'

const osFactor = Platform.OS === 'ios' ? 0.05 : 1
const initialZoom = 0.01

const Camera = () => {
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const [cameraView, setCameraView] = useState()
  const [animatableImage, setAnimatableImage] = useState()

  // const deviceOrientation = useDeviceOrientation()
  const { width, height } = useDimensions().window

  const previewUri = useSelector(state => state.camera.previewUri)
  const pendingUploads = useSelector(state => state.camera.pendingUploads)
  const orientation = useSelector(state => state.photosList.orientation)
  const flashMode = useSelector(state => state.camera.flashMode)
  const frontCam = useSelector(state => state.camera.frontCam)
  const zoom = useSelector(state => state.camera.zoom)
  const initialPinchValue = useSelector(state => state.camera.initialPinchValue)

  useEffect(() => {
    navigation.setOptions({
      headerTintColor: CONST.MAIN_COLOR,
      headerStyle: {
        borderBottomColor: 'black',
        borderBottomWidth: 0,
      },
      headerTransparent: true,
      headerTitle: null,
      // headerLeft: null,
      headerRight: null,
      headerBackTitle: <Text />,
    })
    dispatch(reducer.setPreviewUri(null))
    dispatch(reducer.setZoom(0))
    dispatch(reducer.setInitialPinchValue(0))
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  const startStopPinching = event => {
    if (event.nativeEvent.state === State.ACTIVE) {
      if (zoom < initialZoom * osFactor) {
        dispatch(reducer.setInitialPinchValue(initialZoom * osFactor))
      } else {
        dispatch(reducer.setInitialPinchValue(zoom))
      }
    }
  }

  const pinching = event => {
    let zoomFactor = initialPinchValue * event.nativeEvent.scale
    if (zoomFactor > 1 * osFactor) {
      zoomFactor = 1 * osFactor
    }
    if (zoomFactor < initialZoom * osFactor) {
      zoomFactor = 0
    }

    dispatch(reducer.setZoom(zoomFactor))
  }

  const takePicture = () => {
    if (cameraView) {
      const options = {
        quality: 1,
        // orientation: "auto",
        base64: false,
        fixOrientation: true,
        forceUpOrientation: true,
        exif: false,
        pauseAfterCapture: false,
      }

      cameraView.takePictureAsync(options)
        .then(data => {
          if (animatableImage) {
            animatableImage.stopAnimation()
            animatableImage.fadeOut()
          }
          dispatch(reducer.setPreviewUri(data.uri))
        })
    }
  }

  const upload = uri => {
    CameraRoll.save(uri)
      .then(
        cameraRollUri => {
          const now = moment().format()
          const { uuid, location } = store.getState().photosList
          AsyncStorage.setItem(`wisaw-pending-${now}`,
            JSON.stringify(
              {
                time: now,
                uri: cameraRollUri,
                uuid,
                location: {
                  type: 'Point',
                  coordinates: [
                    location.coords.latitude,
                    location.coords.longitude,
                  ],
                },
              }
            )).then(
            () => {
              dispatch(reducer.uploadPendingPhotos())
            }
          )
        }
      )
    dispatch(reducer.setPreviewUri(null))
  }

  const renderPreviewImage = imageUri => (
    <View style={{
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#000',
    }}>
      <Animatable.Image
        ref={ref => {
          setAnimatableImage(ref)
        }}
        source={imageUri ? { uri: imageUri } : {}}
        animation="fadeIn"
        duration={1000}
        useNativeDriver
        style={
          {
            flex: 1,
            resizeMode: "contain",
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '#fff',
          }
        }
      />
      <Button
        iconLeft danger large
        style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          paddingRight: 20,
          width: 100,
        }}
        onPress={
          () => {
            dispatch(reducer.setPreviewUri(null))
          }
        }>
        <Icon name="times-circle" type="FontAwesome" />
        <Text
          style={
            {
              color: '#fff',
              paddingLeft: 5,
            }
          }>skip
        </Text>
      </Button>
      <Button
        iconRight success large
        style={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          paddingLeft: 20,
          width: 100,
        }}
        onPress={
          () => {
            upload(imageUri)
          }
        }>
        <Text
          style={
            {
              color: '#fff',
              paddingRight: 5,
            }
          }>share
        </Text>
        <Icon name="cloud-upload" type="FontAwesome" />
      </Button>
    </View>
  )

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    cameraView: {
      flex: 1,
      alignItems: 'center',
    },

    cameraButtonPortrait: {
      position: 'absolute',
      flex: 1,
      flexDirection: 'row',
      width: width < height ? width : height,
      bottom: 20,
      alignItems: 'stretch',
      justifyContent: 'center',

    },
    cameraButtonLandscape: {
      position: 'absolute',
      flex: 1,
      flexDirection: 'column',
      top: 0,
      right: 20,
      height: width < height ? width : height,
      justifyContent: 'space-between',
    },
    cameraButtonLandscapeSecondary: {
      position: 'absolute',
      flex: 1,
      flexDirection: 'column',
      top: 0,
      left: 20,
      height: width < height ? width : height,
      justifyContent: 'space-between',
    },

  })

  return (
    <PinchGestureHandler
      onGestureEvent={pinching}
      onHandlerStateChange={startStopPinching}>
      <View style={styles.container}>

        <RNCamera
          ref={ref => {
            setCameraView(ref)
          }}
          style={styles.cameraView}
          orientation={RNCamera.Constants.Orientation.auto}
          onFaceDetected={null}
          onGoogleVisionBarcodesDetected={null}
          onTextRecognized={null}
          onBarCodeRead={null}
          flashMode={flashMode ? RNCamera.Constants.FlashMode.on : RNCamera.Constants.FlashMode.off}
          type={frontCam ? RNCamera.Constants.Type.front : RNCamera.Constants.Type.back}
          zoom={zoom}
          captureAudio={false}
        />
        <View style={
          [
            orientation === 'portrait' && styles.cameraButtonPortrait,
            orientation === 'landscape' && styles.cameraButtonLandscape,
          ]
        }>
          <View style={{
            flex: 2,
            justifyContent: 'space-evenly',
            alignSelf: 'center',
          }}>
            <TouchableOpacity
              onPress={
                val => {
                  dispatch(reducer.setFlashMode(!flashMode))
                }
              }>
              <Icon
                type="MaterialIcons" name={flashMode ? "flash-on" : "flash-off"}
                style={{
                  flex: 0,
                  alignSelf: 'center',
                  color: CONST.MAIN_COLOR,
                }}
              />
            </TouchableOpacity>
          </View>
          <View style={
            [
              {
                flex: 2,
              },
              orientation === 'portrait' && { flexDirection: 'row', justifyContent: 'center' },
              orientation === 'landscape' && { flexDirection: 'column', justifyContent: 'center' },
            ]
          }>
            <View
              style={
                {
                  alignSelf: 'center',
                  height: 100,
                  width: 100,
                }
              }>
              <Button
                rounded
                light
                transparent
                bordered
                style={
                  {
                    flex: 1,
                    height: 100,
                    width: 100,
                    backgroundColor: CONST.TRANSPARENT_BUTTON_COLOR,
                  }
                }
                onPress={
                  () => {
                    takePicture()
                  }
                }>
                <Icon
                  type="FontAwesome"
                  name="camera"
                  style={
                    {
                      fontSize: 60,
                      color: '#FF4136',
                    }
                  }
                />
              </Button>
              {pendingUploads > 0 && (
                <Text
                  style={
                    {
                      position: 'absolute',
                      alignSelf: 'center',
                      color: 'white',
                      backgroundColor: CONST.TRANSPARENT_BUTTON_COLOR,
                    }
                  }>
                  {pendingUploads}
                </Text>
              )}
            </View>
          </View>
          <View style={
            [
              {
                flex: 2,
                justifyContent: 'space-evenly',
                alignSelf: 'center',
              },
              orientation === 'portrait' && { flexDirection: 'row' },
              orientation === 'landscape' && { flexDirection: 'column' },
            ]
          }>
            <TouchableOpacity
              onPress={
                val => {
                  dispatch(reducer.setFrontCam(!frontCam))
                }
              }>
              <Icon
                type="MaterialIcons"
                name={frontCam ? "camera-front" : "camera-rear"}
                style={{
                  flex: 0,
                  alignSelf: 'center',
                  color: CONST.MAIN_COLOR,
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
        { previewUri && renderPreviewImage(previewUri) }
      </View>
    </PinchGestureHandler>
  )
}

Camera.navigationOptions = {
  headerTintColor: CONST.MAIN_COLOR,
  headerStyle: {
    borderBottomColor: 'black',
    borderBottomWidth: 0,
  },
  headerTransparent: true,
}

Camera.defaultProps = {
  previewUri: null,
}

// Camera.propTypes = {
//   // navigation: PropTypes.object.isRequired,
//   previewUri: PropTypes.string,
//   setPreviewUri: PropTypes.func.isRequired,
//   uploadPendingPhotos: PropTypes.func.isRequired,
//   pendingUploads: PropTypes.number.isRequired,
//   orientation: PropTypes.string.isRequired,
//   flashMode: PropTypes.bool.isRequired,
//   setFlashMode: PropTypes.func.isRequired,
//   frontCam: PropTypes.bool.isRequired,
//   setFrontCam: PropTypes.func.isRequired,
//   zoom: PropTypes.number.isRequired,
//   setZoom: PropTypes.func.isRequired,
//   initialPinchValue: PropTypes.number.isRequired,
//   setInitialPinchValue: PropTypes.func.isRequired,
// }

export default Camera
