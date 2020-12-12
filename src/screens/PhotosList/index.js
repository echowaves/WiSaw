import React, { useEffect, useLayoutEffect, useState } from 'react'
import { useDeviceOrientation, useDimensions } from '@react-native-community/hooks'

import Geolocation from '@react-native-community/geolocation'

import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  DeviceEventEmitter,
  Platform,
  Alert,
} from 'react-native'

import {
  Icon,
  Container,
  Content,
  Body,
  Spinner,
  Card,
  CardItem,
  Button,
  Left,
  Right,
  Segment,
  StyleProvider,
  Input,
  Toast,
} from 'native-base'

import NetInfo from "@react-native-community/netinfo"

import {
  PERMISSIONS, request, openSettings,
} from 'react-native-permissions'

import branch from 'react-native-branch'

import { useDispatch, useSelector } from "react-redux"

import FlatGrid from 'react-native-super-grid'

import PropTypes from 'prop-types'

import Modal from "react-native-modal"

import getTheme from "../../../native-base-theme/components"
import material from '../../../native-base-theme/variables/material'

import * as reducer from './reducer'

import { uploadPendingPhotos } from '../Camera/reducer'

import * as CONST from '../../consts.js'
import Thumb from '../../components/Thumb'

const PhotosList = ({ navigation }) => {
  const [thumbWidth, setThumbWidth] = useState()

  const photos = useSelector(state => state.photosList.photos)
  // const pageNumber = useSelector(state => state.photosList.pageNumber)
  // const errorMessage = useSelector(state => state.photosList.errorMessage)
  const batch = useSelector(state => state.photosList.batch)
  const isLastPage = useSelector(state => state.photosList.isLastPage)
  // const paging = useSelector(state => state.photosList.paging)
  const isTandcAccepted = useSelector(state => state.photosList.isTandcAccepted)
  const loading = useSelector(state => state.photosList.loading)
  const pendingUploads = useSelector(state => state.photosList.pendingUploads)
  const orientation = useSelector(state => state.photosList.orientation)
  const activeSegment = useSelector(state => state.photosList.activeSegment)
  const searchTerm = useSelector(state => state.photosList.searchTerm)
  const netAvailable = useSelector(state => state.photosList.netAvailable)

  const dispatch = useDispatch()

  const deviceOrientation = useDeviceOrientation()
  const { width, height } = useDimensions().window

  // check permissions and retrieve UUID
  useEffect(() => {
    dispatch(reducer.initState())
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  // when screen orientation changes
  useEffect(() => {
    // alert(deviceOrientation.portrait ? 'portrait' : 'landscape')
    dispatch(reducer.setOrientation(deviceOrientation.portrait ? 'portrait' : 'landscape'))
  }, [deviceOrientation]) // eslint-disable-line react-hooks/exhaustive-deps

  // when network availability changes
  useEffect(() => {
    if (netAvailable) {
      reload()
      Toast.show({
        text: "Connected to Network.",
        buttonText: "OK",
        type: "success",
      })
      navigation.setOptions({
        title: renderHeaderTitle(),
        // headerLeft: renderHeaderLeft(),
        // headerRight: renderHeaderRight(),
        // currentTerm: '',
      })
    } else {
      Toast.show({
        text: 'No Network',
        buttonText: "OK",
        type: "warning",
      })
      navigation.setOptions({
        title: null,
        headerLeft: null,
        headerRight: null,
      })
    }
  }, [netAvailable]) // eslint-disable-line react-hooks/exhaustive-deps

  // when with of screen changes
  useEffect(() => {
    const thumbsCount = Math.floor(width / 100)
    setThumbWidth(Math.floor((width - thumbsCount * 3 * 2) / thumbsCount))
    // alert(`${thumbsCount}, ${Math.floor((width - thumbsCount * 3 * 2) / thumbsCount)}`)
  }, [width])

  // componentDidMount
  useEffect(() => {
    branch.initSessionTtl = 10000 // Set to 10 seconds
    branch.subscribe(async ({ error, params }) => {
      const item = params.$item

      if (item) {
      // go back to the top screen, just in case
        navigation.popToTop()
        navigation.navigate('SharedPhoto', { item })
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // add network availability listener
  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      if (state) {
        dispatch(reducer.setNetAvailable(state.isInternetReachable))
      }
    })
    return () => unsubscribeNetInfo()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const styles = StyleSheet.create({
    container: {
      flex: 1,
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

  // const onLayout = e => {
  //   this.forceUpdate()
  // }

  const renderHeaderTitle = () => {
    if (searchTerm === null) {
      return (
        <StyleProvider style={getTheme(material)}>
          <Segment style={{ marginBottom: 2 }}>
            <Button
              first active={activeSegment === 0}
              onPress={
                async () => {
                  dispatch(reducer.setActiveSegment(0))
                  await reload()
                }
              }>
              <Icon
                name="globe"
                type="FontAwesome"
              />
            </Button>
            <Button
              last active={activeSegment === 1}
              onPress={
                async () => {
                  dispatch(reducer.setActiveSegment(1))
                  await reload()
                }
              }>
              <Icon
                name="eye"
                type="FontAwesome"
              />
            </Button>
          </Segment>
        </StyleProvider>
      )
    }
    return (
      <Input
        placeholder="what are you searching for?"
        placeholderTextColor={CONST.PLACEHOLDER_TEXT_COLOR}
        style={
          {
            color: CONST.MAIN_COLOR,
            paddingLeft: 0,
            paddingRight: 0,
          }
        }
        onChangeText={currentTerm => {
          dispatch(reducer.setSearchTerm(currentTerm))
          navigation.setOptions({
            title: () => renderHeaderTitle(),
            currentTerm,
          })
        }}
        value={navigation.getParam('currentTerm')}
        editable
        autoFocus
      />
    )
  }

  const isListFilllsScreen = () => {
    const numColumns = Math.floor(width / thumbWidth)
    const numRows = Math.floor(photos.length / numColumns)
    const listHeight = numRows * thumbWidth
    return listHeight > height || isLastPage
  }

  const reload = async () => {
    dispatch(reducer.setLocation(await _getLocation()))
    /* eslint-disable no-await-in-loop */
    // while (!isListFilllsScreen()) {
    // alert(`photos batch(${batch})`)
    // dispatch(reducer.getPhotos(batch))
    // }
    await uploadPendingPhotos()
  }

  const checkPermissionsForPhotoTaking = async () => {
    let permission = await reducer.checkPermission(
      Platform.select({
        android: PERMISSIONS.ANDROID.CAMERA,
        ios: PERMISSIONS.IOS.CAMERA,
      }),
      'Can we access your camera?',
      'How else would you be able to take a photo?'
    )
    if (permission === 'granted') {
      switch (Platform.OS) {
        case 'ios':
          permission = dispatch(reducer.checkPermission(
            PERMISSIONS.IOS.PHOTO_LIBRARY,
            'Can we access your photos?', 'How else would you be able to save the photo you take on your device?'
          ))
          break
        case 'android':
          permission = dispatch(reducer.checkPermission(
            PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
            'Can we write photos to your devise?',
            'How else would we be able to save the photos you take on your device?'
          ))
          if (permission === 'granted') {
            permission = dispatch(reducer.checkPermission(
              PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
              'Can we read photos on your devise?',
              'How else would we be able upload the photos you take from your device?'
            ))
          }
          break
        default:
          alert('unknown platform')
      }
    }
    if (permission === 'granted') {
      takePhoto()
    }
  }

  async function _checkPermission(permissionType, alertHeader, alertBody) {
    const permission = await request(permissionType)

    if (permission !== 'granted') {
      Alert.alert(
        alertHeader,
        alertBody,
        [
          {
            text: 'Open Settings',
            onPress: () => {
              // this.checkingPermission = false
              openSettings()
            },
          },
        ],
      )
      // }
      // this.checkingPermission = false
    }
    return permission
  }

  async function _getLocation() {
    // alert('get location')
    let position = null
    // Toast("started checking permission")
    const permission = await _checkPermission(
      Platform.select({
        android: PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      }),
      'How am I supposed to show you the near-by photos?',
      'Why don\'t you enable Location in Settings and Try Again?'
    )
    // Toast("finished checking permission")
    if (permission === 'granted') {
      try {
        position = await _getCurrentPosition({
          enableHighAccuracy: false,
          timeout: 200000,
          maximumAge: 200000,
        })
      } catch (err) {
        position = null
        Toast.show({
          text: 'unable to get location',
          buttonText: "OK",
          type: "danger",
          duration: 5000,
        })
      }
    }
    return position
  }

  function _getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(resolve, reject, options)
      // navigator.geolocation.getCurrentPosition(resolve, reject, options)
    })
  }

  const takePhoto = () => {
    navigation.push('Camera')
  }

  const renderPhotoButton = () => (
    <View style={
      [
        {
          flex: 1,
          position: 'absolute',
        },
        orientation === 'portrait' && styles.cameraButtonPortrait,
        orientation === 'landscape' && styles.cameraButtonLandscape,
      ]
    }>
      <View>
        <Button
          rounded
          light
          transparent
          bordered
          style={
            {
              height: 100,
              width: 100,
              backgroundColor: CONST.TRANSPARENT_BUTTON_COLOR,
            }
          }
          onPress={
            () => {
              checkPermissionsForPhotoTaking()
            }
          }>
          <Icon
            type="FontAwesome"
            name="camera"
            style={
              {
                fontSize: 60,
                color: CONST.MAIN_COLOR,
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
  )

  const renderHeaderLeft = () => {
    const { params = {} } = navigation.state
    if (searchTerm === null) {
      return (
        <Icon
          onPress={
            () => params.handleRefresh()
          }
          name="sync"
          type="MaterialIcons"
          style={
            {
              marginLeft: 10,
              color: CONST.MAIN_COLOR,
            }
          }
        />
      )
    }
    return (
      <Icon
        name="times"
        type="FontAwesome"
        style={{
          marginLeft: 10,
          color: CONST.MAIN_COLOR,
        }}
        onPress={
          async () => {
            navigation.setOptions({
              title: () => renderHeaderTitle(),
              // headerLeft: () => this.renderHeaderLeft(),
              // headerRight: () => this.renderHeaderRight(),
              // currentTerm: '',
            })
            dispatch(reducer.setSearchTerm(null))
            await reload()
          }
        }
      />
    )
  }

  const renderHeaderRight = () => {
    if (searchTerm === null) {
      return (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <Icon
            type="MaterialIcons"
            name="search"
            style={{ marginRight: 20, color: CONST.MAIN_COLOR }}
            onPress={
              () => {
                navigation.setOptions({
                  title: () => (renderHeaderTitle()),
                  // headerLeft: () => this.renderHeaderLeft(),
                  // headerRight: () => this.renderHeaderRight(),
                })
                dispatch(reducer.setSearchTerm(''))
                // this.reload()
              }
            }
          />

          <Icon
            onPress={
              () => navigation.push('Feedback')
            }
            name="feedback"
            type="MaterialIcons"
            style={{
              marginRight: 20,
              color: CONST.MAIN_COLOR,
            }}
          />
        </View>
      )
    }
    return (
      <Icon
        type="MaterialIcons"
        name="search"
        style={
          {
            marginRight: 20,
            color: CONST.MAIN_COLOR,
          }
        }
        onPress={
          async () => {
            // alert(navigation.getParam('currentTerm'))
            const currentTerm = navigation.getParam('currentTerm')
            if (currentTerm && currentTerm.length >= 3) {
              dispatch(reducer.setSearchTerm(currentTerm))
              navigation.setOptions({
                title: () => renderHeaderTitle(),
              })
              await reload()
            } else {
              Toast.show({
                text: "Search for more than 3 characters",
                buttonText: "OK",
                type: "warning",
              })
            }
          }
        }
      />
    )
  }

  if (netAvailable === false) {
    return (
      <Container>
        <Content padder>
          <Body>

            <Card transparent>
              <CardItem style={{ borderRadius: 10 }}>
                <Text style={{
                  fontSize: 20,
                  textAlign: 'center',
                  margin: 10,
                }}>
                  You are not connected to reliable network.
                  You can still snap photos.
                  They will be uploaded later.
                </Text>
              </CardItem>
            </Card>
          </Body>
        </Content>
        {renderPhotoButton()}
      </Container>
    )
  }

  // if (photos.length === 0 && loading) {
  //   return (
  //     <Container>
  //       <Content padder>
  //         <Body>
  //           <Spinner color={
  //             CONST.MAIN_COLOR
  //           }
  //           />
  //         </Body>
  //       </Content>
  //       {renderPhotoButton()}
  //     </Container>
  //   )
  // }

  // if (photos.length === 0 && !loading) {
  //   return (
  //     <Container>
  //       <Content padder>
  //         <Body>
  //           {searchTerm !== null && (
  //             <Card transparent>
  //               <CardItem style={{ borderRadius: 10 }}>
  //                 <Text style={{
  //                   fontSize: 20,
  //                   textAlign: 'center',
  //                   margin: 10,
  //                 }}>
  //                   No Photos found.
  //                   Try to search for something else.
  //                   Search string should be more than 3 characters.
  //                 </Text>
  //               </CardItem>
  //             </Card>
  //           )}
  //           {searchTerm === null && activeSegment === 0 && (
  //             <Card transparent>
  //               <CardItem style={{ borderRadius: 10 }}>
  //                 <Text style={{
  //                   fontSize: 20,
  //                   textAlign: 'center',
  //                   margin: 10,
  //                 }}>
  //                   No Photos found in your location.
  //                   Try to take some photos.
  //                 </Text>
  //               </CardItem>
  //             </Card>
  //           )}
  //           {searchTerm === null && activeSegment === 1 && (
  //             <Card transparent>
  //               <CardItem style={{ borderRadius: 10 }}>
  //                 <Text style={{
  //                   fontSize: 20,
  //                   textAlign: 'center',
  //                   margin: 10,
  //                 }}>
  //                   You don&apos;t seem to be watching any photos.
  //                   Try to take some photos, comment on other&apos;s photos, or start watching somebody else&apos;s photos.
  //                 </Text>
  //               </CardItem>
  //             </Card>
  //           )}
  //
  //         </Body>
  //       </Content>
  //       {renderPhotoButton()}
  //     </Container>
  //   )
  // }

  if (!isTandcAccepted) {
    return (
      <Container>
        <Modal
          isVisible={
            !isTandcAccepted
          }>
          <Content padder>
            <Card transparent>
              <CardItem style={{ borderRadius: 10 }}>
                <Text> * When you take a photo with WiSaw app,
                  it will be added to a Photo Album on your phone,
                  as well as posted to global feed in the cloud.
                </Text>
              </CardItem>
              <CardItem style={{ borderRadius: 10 }}>
                <Text> * People close-by can see your photos.</Text>
              </CardItem>
              <CardItem style={{ borderRadius: 10 }}>
                <Text> * You can see other people&#39;s photos too.
                </Text>
              </CardItem>
              <CardItem style={{ borderRadius: 10 }}>
                <Text>* If you find any photo abusive or inappropriate, you can delete it -- it will be deleted from the cloud so that no one will ever see it again.</Text>
              </CardItem>
              <CardItem style={{ borderRadius: 10 }}>
                <Text>* No one will tolerate objectionable content or abusive users.</Text>
              </CardItem>
              <CardItem style={{ borderRadius: 10 }}>
                <Text>* The abusive users will be banned from WiSaw by other users.</Text>
              </CardItem>
              <CardItem style={{ borderRadius: 10 }}>
                <Text>* By using WiSaw I agree to Terms and Conditions.</Text>
              </CardItem>
              <CardItem footer style={{ borderRadius: 10 }}>
                <Left />
                <Button
                  block
                  bordered
                  success
                  small
                  onPress={
                    () => {
                      dispatch(reducer.acceptTandC())
                    }
                  }>
                  <Text>  Agree  </Text>
                </Button>
                <Right />
              </CardItem>
            </Card>
          </Content>
        </Modal>
      </Container>
    )
  }

  return (
    <Container>
      <FlatGrid
        // extraData={this.state}
        itemDimension={
          thumbWidth
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
              navigation={
                navigation
              }
              thumbWidth={thumbWidth}
            />
          )
        }
        style={
          styles.container
        }
        showsVerticalScrollIndicator={
          false
        }
        horizontal={
          false
        }
        // onEndReached={
        //   () => {
        //     if (!loading && !isLastPage) {
        //       dispatch(reducer.getPhotos(batch))
        //     }
        //   }
        // }
        onEndReachedThreshold={
          350
        }
        refreshing={
          false
        }
        onRefresh={
          async () => {
            await reload()
          }
        }
        // onContentSizeChange={}
      />
      {renderPhotoButton()}
    </Container>
  )
}
PhotosList.propTypes = {
  navigation: PropTypes.object.isRequired,
}

export default PhotosList
