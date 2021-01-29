import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from "react-redux"

import { useDeviceOrientation, useDimensions } from '@react-native-community/hooks'
import * as Location from 'expo-location'
import * as Linking from 'expo-linking'
import * as Permissions from 'expo-permissions'
import * as ImagePicker from 'expo-image-picker'
import useKeyboard from '@rnhooks/keyboard'

import {
  StyleSheet,
  Text,
  View,
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
  Toast,
  Input,
  Header,
  // Item,
} from 'native-base'

import NetInfo from "@react-native-community/netinfo"

import FlatGrid from 'react-native-super-grid'

import PropTypes from 'prop-types'

import Modal from "react-native-modal"

// import Branch from '../../util/my-branch'

import getTheme from "../../../native-base-theme/components"
import material from '../../../native-base-theme/variables/material'

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

  const pendingUploadsCount = useSelector(state => state.photosList.pendingUploadsCount)
  const orientation = useSelector(state => state.photosList.orientation)
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
  // const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 50 })

  // check permissions and retrieve UUID
  useEffect(() => {
    dispatch(reducer.cleanupCache())
    dispatch(reducer.initState())
    reload()
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  // add network availability listener
  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      if (state) {
        dispatch(reducer.setNetAvailable(state.isInternetReachable))
      }
    })
    return () => unsubscribeNetInfo()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

  // when with of screen changes
  useEffect(() => {
    const thumbsCount = Math.floor(width / 100)
    setThumbDimension(Math.floor((width - thumbsCount * 3 * 2) / thumbsCount))
  }, [width])

  useEffect(() => {
    if (wantToLoadMore()) {
      dispatch(reducer.getPhotos())
    }
  }, [lastViewableRow, photos, location]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    updateNavBar()
    dispatch(reducer.getPhotos())
  }, [activeSegment]) // eslint-disable-line react-hooks/exhaustive-deps

  const wantToLoadMore = () => {
    if (isLastPage) {
      // console.log(`isLastPage:${isLastPage}`)
      return false
    }

    const screenColumns = /* Math.floor */(width / thumbDimension)
    const screenRows = /* Math.floor */(height / thumbDimension)
    const totalNumRows = /* Math.floor */(photos.length / screenColumns)

    if ((screenRows * 2 + lastViewableRow) > totalNumRows) {
      // console.log(`(screenRows * 2 + lastViewableRow) > totalNumRows : ${screenRows * 2 + lastViewableRow} > ${totalNumRows}`)
      return true
    }

    return false
  }

  const styles = StyleSheet.create({
    container: {
      // flex: 1,
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
        headerTitle: renderHeaderTitle(),
        headerLeft: renderHeaderLeft,
        headerRight: renderHeaderRight,
      })
    } else {
      navigation.setOptions({
        headerTitle: (<Text>Network not Availble</Text>),
        headerLeft: null,
        headerRight: null,
      })
    }
    if (!location) {
      reload()
    }
  }

  const reload = async () => {
    /* eslint-disable no-await-in-loop */

    dispatch(reducer.resetState())
    dispatch(reducer.setLocation(await _getLocation()))

    dispatch(reducer.uploadPendingPhotos())
  }

  const checkPermissionsForPhotoTaking = async () => {
    let permission = await _checkPermission(
      Permissions.CAMERA,
      'Can we access your camera?',
      'How else would you be able to take a photo?'
    )
    if (permission.status === 'granted') {
      permission = await _checkPermission(
        Permissions.MEDIA_LIBRARY,
        'Can we access your photos?', 'How else would you be able to save the photo you take on your device?'
      )
      if (permission.status === 'granted') {
        takePhoto()
      }
    }
  }

  async function _checkPermission(permissionType, alertHeader, alertBody) {
    const permission = await Permissions.askAsync(permissionType)

    if (permission.status !== 'granted') {
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
    return permission
  }

  async function _getLocation() {
    let position = null
    // Toast("started checking permission")
    const permission = await _checkPermission(
      Permissions.LOCATION,
      'How am I supposed to show you the near-by photos?',
      'Why don\'t you enable Location in Settings and Try Again?'
    )
    if (permission.status === 'granted') {
      try {
        position = await Location.getCurrentPositionAsync({
          accuracy: 5000,
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

  const takePhoto = async () => {
    const cameraReturn = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      // allowsEditing: true,
      quality: 1.0,
      exif: false,
    })
    if (cameraReturn.cancelled === true) {
      return Promise.resolve() // simply return
    }

    // have to wait, otherwise the upload will not start
    await dispatch(reducer.queueFileForUpload({ uri: cameraReturn.uri }))
    dispatch(reducer.uploadPendingPhotos())
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
        {pendingUploadsCount > 0 && (
          <Text
            style={
              {
                position: 'absolute',
                alignSelf: 'center',
                color: 'white',
                backgroundColor: CONST.TRANSPARENT_BUTTON_COLOR,
              }
            }>
            {pendingUploadsCount}
          </Text>
        )}
      </View>
    </View>
  )

  const renderHeaderTitle = () => (
    <Header hasSegment style={{ height: '100%', backgroundColor: 'rgba(0, 0, 0, 0)' }}>{/* without this trick the header segment will not receive click events on android */}
      <StyleProvider style={getTheme(material)}>{/* withtout this trick the segment will be styled funny on android */}
        <Segment style={{ marginBottom: 2 }}>
          <Button
            first active={activeSegment === 0}
            onPress={
              () => {
                dispatch(reducer.setActiveSegment(0))
                reload()
              }
            }>
            <Icon
              name="globe"
              type="FontAwesome"
            />
          </Button>
          <Button
            active={activeSegment === 1}
            onPress={
              () => {
                dispatch(reducer.setActiveSegment(1))
                reload()
              }
            }>
            <Icon
              name="eye"
              type="FontAwesome"
            />
          </Button>

          <Button
            last active={activeSegment === 2}
            onPress={
              () => {
                dispatch(reducer.setActiveSegment(2))
                reload()
              }
            }>
            <Icon
              type="MaterialIcons"
              name="search"
            />
          </Button>
        </Segment>
      </StyleProvider>
    </Header>
  )

  const renderHeaderLeft = () => (
    <Icon
      onPress={
        () => {
          // dispatch(reducer.initState())
          reload()
        }
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

  const renderHeaderRight = () => (
    <Icon
      onPress={
        () => navigation.navigate('FeedbackScreen')
      }
      name="feedback"
      type="MaterialIcons"
      style={{
        marginRight: 20,
        color: CONST.MAIN_COLOR,
      }}
    />
  )

  const renderSearchBar = autoFocus => (
    <Header
      searchBar rounded
      style={
        {
          backgroundColor: '#FFFFFF',
        }
      }>

      <Body style={
        {
          width: '100%',
        }
      }>
        <Input
          placeholder="type text here"
          placeholderTextColor={CONST.PLACEHOLDER_TEXT_COLOR}
          style={
            {
              color: CONST.MAIN_COLOR,
              width: '100%',
            }
          }
          onChangeText={currentTerm => {
            dispatch(reducer.setSearchTerm(currentTerm))
          }}
          value={searchTerm}
          editable
          onSubmitEditing={
            () => submitSearch()
          }
          autoFocus={autoFocus}
        />
      </Body>
      <Right>
        <Button transparent>
          <Icon
            type="MaterialIcons"
            name="search"
            style={
              {
                color: CONST.MAIN_COLOR,
              }
            }
            onPress={
              () => submitSearch()
            }
          />
        </Button>
      </Right>
    </Header>
  )

  const submitSearch = () => {
    if (searchTerm && searchTerm.length >= 3) {
      reload()
      if (keyboardVisible) {
        dismissKeyboard()
      }
    } else {
      Toast.show({
        text: "Search for more than 3 characters",
        buttonText: "OK",
        type: "warning",
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
      <Container>
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
      </Container>

    )
  }

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

  if (!location && !loading) {
    return (
      <Container>
        {renderPendingPhotos()}
        <Content padder>
          <Body>
            <Card transparent>
              <CardItem style={{ borderRadius: 10 }}>
                <Text style={{
                  fontSize: 20,
                  textAlign: 'center',
                  margin: 10,
                }}>
                  Unable to get your location, make sure to turn Location Service on and reload screen.
                </Text>
              </CardItem>
            </Card>
          </Body>
        </Content>
        {renderPhotoButton()}
      </Container>
    )
  }

  if (!netAvailable && !loading) {
    return (
      <Container>
        {renderPendingPhotos()}
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

  if (loading) {
    return (
      <Container>
        {activeSegment === 2 && renderSearchBar(false)}
        <Content padder>
          <Body>
            <Spinner color={
              CONST.MAIN_COLOR
            }
            />
          </Body>
        </Content>
        {renderPhotoButton()}
      </Container>
    )
  }

  if (photos.length === 0) {
    return (
      <Container>
        {renderPendingPhotos()}
        <Content padder>
          <Body>
            {activeSegment === 2 && (
              <Card transparent>
                {renderSearchBar(true)}
                <CardItem>
                  <Text style={{
                    fontSize: 20,
                    textAlign: 'center',
                    margin: 10,
                  }}>
                    No Photos found.
                    Try to search for something else.
                    Search string should be more than 3 characters.
                  </Text>
                </CardItem>
              </Card>
            )}
            { activeSegment === 0 && (
              <Card transparent>
                <CardItem style={{ borderRadius: 10 }}>
                  <Text style={{
                    fontSize: 20,
                    textAlign: 'center',
                    margin: 10,
                  }}>
                    No Photos found in your location.
                    Try to take some photos.
                  </Text>
                </CardItem>
              </Card>
            )}
            {activeSegment === 1 && (
              <Card transparent>
                <CardItem style={{ borderRadius: 10 }}>
                  <Text style={{
                    fontSize: 20,
                    textAlign: 'center',
                    margin: 10,
                  }}>
                    You don&apos;t seem to be watching any photos.
                    Try to take some photos, comment on other&apos;s photos, or start watching somebody else&apos;s photos.
                  </Text>
                </CardItem>
              </Card>
            )}

          </Body>
        </Content>
        {renderPhotoButton()}
      </Container>
    )
  }
}

export default PhotosList
