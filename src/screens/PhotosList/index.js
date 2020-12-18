import React, { useEffect, useState } from 'react'
import { useDeviceOrientation, useDimensions } from '@react-native-community/hooks'
import { useNavigation } from '@react-navigation/native'
import { Col, Row, Grid } from 'react-native-easy-grid'

import Geolocation from '@react-native-community/geolocation'

import {
  StyleSheet,
  Text,
  View,
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
  Toast,
  Input,
  Header,
  Item,
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

const PhotosList = () => {
  const navigation = useNavigation()

  const [thumbWidth, setThumbWidth] = useState()
  const [loadMore, setLoadMore] = useState(false)

  const photos = useSelector(state => state.photosList.photos)
  // const pageNumber = useSelector(state => state.photosList.pageNumber)
  // const errorMessage = useSelector(state => state.photosList.errorMessage)
  const isLastPage = useSelector(state => state.photosList.isLastPage)
  // const paging = useSelector(state => state.photosList.paging)
  const isTandcAccepted = useSelector(state => state.photosList.isTandcAccepted)
  const loading = useSelector(state => state.photosList.loading)
  const pendingUploads = useSelector(state => state.photosList.pendingUploads)
  const orientation = useSelector(state => state.photosList.orientation)
  const activeSegment = useSelector(state => state.photosList.activeSegment)
  const searchTerm = useSelector(state => state.photosList.searchTerm)
  const netAvailable = useSelector(state => state.photosList.netAvailable)
  const batch = useSelector(state => state.photosList.batch)

  const dispatch = useDispatch()

  const deviceOrientation = useDeviceOrientation()
  const { width, height } = useDimensions().window

  // check permissions and retrieve UUID
  useEffect(() => {
    dispatch(reducer.initState())
    reload()
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  // when screen orientation changes
  useEffect(() => {
    dispatch(reducer.setOrientation(deviceOrientation.portrait ? 'portrait' : 'landscape'))
  }, [deviceOrientation]) // eslint-disable-line react-hooks/exhaustive-deps

  // re-render title on  state chage
  useEffect(() => {
    updateNavBar()
  }, [netAvailable]) // eslint-disable-line react-hooks/exhaustive-deps

  // when with of screen changes
  useEffect(() => {
    const thumbsCount = Math.floor(width / 100)
    setThumbWidth(Math.floor((width - thumbsCount * 3 * 2) / thumbsCount))
  }, [width])

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
  }

  // componentDidMount branch initialization
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

  // when screen orientation changes
  useEffect(() => {
    if (searchTerm === null || searchTerm.length >= 3) {
      if (loadMore && !isLastPage && batch) {
        dispatch(reducer.getPhotos())
        setLoadMore(false)
      }
      if (!isListFilllsScreen()) {
        dispatch(reducer.getPhotos())
      }
    } else {
      setLoadMore(false)
    }
  }, [loading, loadMore, isLastPage]) // eslint-disable-line react-hooks/exhaustive-deps

  // when screen orientation changes
  useEffect(() => {
    if (searchTerm === null || searchTerm === '') {
      updateNavBar()
    }
  }, [activeSegment, searchTerm]) // eslint-disable-line react-hooks/exhaustive-deps

  const isListFilllsScreen = () => {
    const numColumns = Math.floor(width / thumbWidth)
    const numRows = Math.floor(photos.length / numColumns)
    const listHeight = numRows * thumbWidth
    return listHeight > height || isLastPage
  }

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

  const reload = async () => {
    /* eslint-disable no-await-in-loop */

    dispatch(reducer.resetState())
    dispatch(reducer.setLocation(await _getLocation()))
    setLoadMore(true)

    uploadPendingPhotos()
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
      <Text />
    )
  }

  const renderHeaderLeft = () => {
    if (searchTerm === null) {
      return (
        <Icon
          onPress={
            () => {
              dispatch(reducer.initState())
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
          () => {
            dispatch(reducer.setSearchTerm(null))
            reload()
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
                dispatch(reducer.setSearchTerm(''))
                reload()
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
      <Text />
    )
  }

  const renderSearchBar = () => (
    <Header searchBar rounded renderSearchBar>
      <Item>
        <Input
          placeholder="what are you searching for?"
          placeholderTextColor={CONST.PLACEHOLDER_TEXT_COLOR}
          style={
            {
              color: CONST.MAIN_COLOR,
            }
          }
          onChangeText={currentTerm => {
            dispatch(reducer.setSearchTerm(currentTerm))
          }}
          value={searchTerm}
          editable
          autoFocus
        />
      </Item>
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
            () => {
              if (searchTerm && searchTerm.length >= 3) {
                reload()
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
      </Button>
    </Header>
  )

  if (
    isTandcAccepted
  && netAvailable
  && photos.length > 0
  ) {
    return (
      <Container>

        {searchTerm && (renderSearchBar())}

        <FlatGrid
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
                thumbWidth={thumbWidth}
                navigation={navigation}
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
          onMomentumScrollBegin={
            async () => {
              setLoadMore(true)
            }
          }
          onMomentumScrollEnd={
            async () => {
              setLoadMore(true)
            }
          }
          onEndReached={
            async () => {
              setLoadMore(true)
            }
          }
          onEndReachedThreshold={
            0.9
          }
          refreshing={
            false
          }
          onRefresh={
            () => {
              reload()
            }
          }
        />

        {renderPhotoButton()}
      </Container>

    )
  }

  if (loading) {
    return (
      <Container>
        {searchTerm && (renderSearchBar())}
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

  if (!loading && photos.length === 0 && isTandcAccepted) {
    return (
      <Container>
        <Content padder>
          <Body>
            {searchTerm !== null && (
              <Card transparent>
                {renderSearchBar()}
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
            {searchTerm === null && activeSegment === 0 && (
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
            {searchTerm === null && activeSegment === 1 && (
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

  return ( // if TANDC is not accepted, this should always come last to prevemt flickering
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
// PhotosList.propTypes = {
//   navigation: PropTypes.object.isRequired,
// }

export default PhotosList
