import React, {
  Component,
} from 'react'

import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  DeviceEventEmitter,
  Platform,
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
  PERMISSIONS,
} from 'react-native-permissions'

import branch from 'react-native-branch'

import {
  connect,
} from 'react-redux'

import FlatGrid from 'react-native-super-grid'

import PropTypes from 'prop-types'

import Modal from "react-native-modal"

import getTheme from "../../../native-base-theme/components"
import material from '../../../native-base-theme/variables/material'

import {
  resetState,
  getPhotos,
  acceptTandC,
  setOrientation,
  setActiveSegment,
  setSearchTerm,
  setNetAvailable,
  checkPermission,
} from './reducer'
import { uploadPendingPhotos } from '../Camera/reducer'

import * as CONST from '../../consts.js'
import Thumb from '../../components/Thumb'

class PhotosList extends Component {
  // static navigationOptions = ({
  //   navigation,
  // }) => ({
  //   headerLeft: () => { navigation.getParam('headerLeft') },
  //   headerTitle: () => { navigation.getParam('headerTitle') },
  //   headerRight: () => { navigation.getParam('headerRight') },
  //   headerBackTitle: null,
  // })

  thumbWidth

  unsubscribeFromNetInfo

  componentDidMount() {
    const {
      navigation,
      setNetAvailable,
    } = this.props
    // alert(global.HermesInternal != null)
    this.unsubscribeFromNetInfo = NetInfo.addEventListener(state => {
      // console.log("Connection type", state.type);
      // console.log("Is connected?", state.isConnected);
      if (state.isConnected === true && state.isInternetReachable === true) {
        setNetAvailable(true)

        navigation.setOptions({
          // handleRefresh: () => { this.reload() },
          // headerLeft: () => { this.renderHeaderLeft() },
          // headerTitle: props => (<this.HeaderTitle props={this.props} reload={() => this.reload()} />),
          // headerRight: () => { this.renderHeaderRight() },
        })
        this.reload()
      } else { // not connected to the internet
        setNetAvailable(false)
        navigation.setOptions({
          handleRefresh: null,
          headerLeft: null,
          title: null,
          headerRight: null,
        })
      }
    })

    DeviceEventEmitter.addListener('namedOrientationDidChange', this.handleOrientationDidChange.bind(this))

    branch.initSessionTtl = 10000 // Set to 10 seconds
    branch.subscribe(async ({ error, params }) => {
      const state = await NetInfo.fetch()
      if (state.isConnected === true && state.isInternetReachable === true) {
        setNetAvailable(true)
      } else { // not connected to the internet
        setNetAvailable(false)
      }

      if (error) {
        Toast.show({
          text: 'No Network',
          buttonText: "OK",
          type: "warning",
        })

        return
      }
      // params will never be null if error is null
      // A Branch link was opened.
      // Route link based on data in params, e.g.

      // Get title and url for route
      // const title = params.$og_title
      // const url = params.$canonical_url
      // const image = params.$og_image_url
      // const photoId = params.$photo_id
      const item = params.$item

      if (item) {
        // go back to the top screen, just in case
        navigation.popToTop()
        navigation.navigate('SharedPhoto', { item })
      }
    })
  }

  componentWillUnmount() {
    DeviceEventEmitter.removeListener('namedOrientationDidChange', this.handleOrientationDidChange.bind(this))
    this.unsubscribeFromNetInfo()
  }

  onLayout(e) {
    this.forceUpdate()
  }

  handleOrientationDidChange(data) {
    const {
      setOrientation,
    } = this.props
    let { name } = data
    // this weird logic is necessary due to a bug in iOS which swaps portrair primary and secondary
    if (Platform.OS === 'ios') {
      if (name === 'landscape-primary') {
        name = 'landscape-secondary'
      } else if (name === 'landscape-secondary') {
        name = 'landscape-primary'
      }
    }

    if (name === 'portrait-secondary') {
      return
    }
    setOrientation(name)
  }

  HeaderTitle(props) {
    const {
      activeSegment,
      setActiveSegment,
      navigation,
      searchTerm,
      reload,
    } = props

    if (searchTerm === null) {
      return (
        <StyleProvider style={getTheme(material)}>
          <Segment style={{ marginBottom: 2 }}>
            <Button
              first active={activeSegment === 0}
              onPress={
                async () => {
                  await setActiveSegment(0)
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
                  await setActiveSegment(1)
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
          setSearchTerm(currentTerm)
          navigation.setOptions({
            title: () => (this.renderHeaderTitle),
            currentTerm,
          })
        }}
        // onSubmitEditing={
        //   () => {
        //     setSearchTerm(navigation.getParam('currentTerm'))
        //     navigation.setParams({
        //       headerTitle: () => this.renderHeaderTitle(),
        //     })
        //     params.handleRefresh()
        //     // this.reload()
        //   }
        // }
        value={navigation.getParam('currentTerm')}
        editable
        autoFocus
      />
    )
  }

  calculateThumbWidth() {
    const { width } = Dimensions.get('window')
    const thumbsCount = Math.floor(width / 100)
    this.thumbWidth = Math.floor((width - thumbsCount * 3 * 2) / thumbsCount)
  }

  isListFilllsScreen() {
    const {
      photos,
      isLastPage,
    } = this.props
    const { width, height } = Dimensions.get('window')
    const numColumns = Math.floor(width / this.thumbWidth)
    const numRows = Math.floor(photos.length / numColumns)
    const listHeight = numRows * this.thumbWidth
    // alert(`${photos.length}:${listHeight}:${height}`)
    // alert(`${listHeight}:${height}:${isLastPage}`)
    return listHeight > height || isLastPage
  }

  isLoading() {
    const {
      loading,
    } = this.props
    return loading
  }

  async reload() {
    const {
      resetState,
      getPhotos,
      uploadPendingPhotos,
      batch,
      navigation,
      netAvailable,
      searchTerm,
      activeSegment,
    } = this.props

    if (netAvailable === true) {
      navigation.setOptions({
        headerTitle: props => (<this.HeaderTitle {...this.props} reload={() => this.reload()} />),
        // headerLeft: () => this.renderHeaderLeft(),
        // headerRight: () => this.renderHeaderRight(),
      })

      /* eslint-disable no-await-in-loop */
      while (this.isLoading() === true) {
        // alert('loading')
        await new Promise(resolve => setTimeout(resolve, 500)) // sleep
      }
      await resetState()

      /* eslint-disable no-await-in-loop */
      while (!this.isListFilllsScreen()) {
        await getPhotos(batch)
      }
      await uploadPendingPhotos()
    } else {
      await resetState()
    }
  }

  async checkPermissionsForPhotoTaking() {
    let permission = await checkPermission(
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
          permission = await checkPermission(
            PERMISSIONS.IOS.PHOTO_LIBRARY,
            'Can we access your photos?', 'How else would you be able to save the photo you take on your device?'
          )
          break
        case 'android':
          permission = await checkPermission(
            PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
            'Can we write photos to your devise?',
            'How else would we be able to save the photos you take on your device?'
          )
          if (permission === 'granted') {
            permission = await checkPermission(
              PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
              'Can we read photos on your devise?',
              'How else would we be able upload the photos you take from your device?'
            )
          }
          break
        default:
          alert('unknown platform')
      }
    }
    if (permission === 'granted') {
      this.takePhoto()
    }
  }

  takePhoto() {
    const {
      navigation,
    } = this.props
    navigation.push('Camera')
  }

  photoButton() {
    const {
      pendingUploads,
      orientation,
    } = this.props
    return (
      <View style={
        [
          {
            flex: 1,
            position: 'absolute',
          },
          orientation === 'portrait-primary' && styles.cameraButtonPortraitPrimary,
          orientation === 'portrait-secondary' && styles.cameraButtonPortraitSecondary,
          orientation === 'landscape-primary' && styles.cameraButtonLandscapePrimary,
          orientation === 'landscape-secondary' && styles.cameraButtonLandscapeSecondary,
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
                this.checkPermissionsForPhotoTaking()
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
  }

  renderHeaderLeft() {
    const {
      searchTerm,
      setSearchTerm,
      navigation,
    } = this.props
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
              title: () => (this.renderHeaderTitle),
              // headerLeft: () => this.renderHeaderLeft(),
              // headerRight: () => this.renderHeaderRight(),
              // currentTerm: '',
            })
            await setSearchTerm(null)
            await this.reload()
          }
        }
      />
    )
  }

  renderHeaderRight() {
    const {
      searchTerm,
      navigation,
      setSearchTerm,
    } = this.props

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
                  title: () => (this.renderHeaderTitle),
                  // headerLeft: () => this.renderHeaderLeft(),
                  // headerRight: () => this.renderHeaderRight(),
                })
                setSearchTerm('')
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
              setSearchTerm(currentTerm)
              navigation.setOptions({
                title: () => (this.renderHeaderTitle),
              })
              await this.reload()
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

  render() {
    const {
      photos,
      getPhotos,
      navigation,
      isTandcAccepted,
      loading,
      acceptTandC,
      batch,
      activeSegment,
      searchTerm,
      isLastPage,
      netAvailable,
    } = this.props

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
          {this.photoButton()}
        </Container>
      )
    }

    if (photos.length === 0 && loading) {
      return (
        <Container>
          <Content padder>
            <Body>
              <Spinner color={
                CONST.MAIN_COLOR
              }
              />
            </Body>
          </Content>
          {this.photoButton()}
        </Container>
      )
    }
    if (photos.length === 0 && !loading) {
      return (
        <Container>
          <Content padder>
            <Body>
              {searchTerm !== null && (
                <Card transparent>
                  <CardItem style={{ borderRadius: 10 }}>
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
          {this.photoButton()}
        </Container>
      )
    }
    this.calculateThumbWidth()
    return (
      <Container onLayout={this.onLayout.bind(this)}>
        <FlatGrid
          // extraData={this.state}
          itemDimension={
            this.thumbWidth
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
                thumbWidth={this.thumbWidth}
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
          onEndReached={
            () => {
              if (!loading && !isLastPage) {
                getPhotos(batch)
              }
            }
          }
          onEndReachedThreshold={
            350
          }
          refreshing={
            false
          }
          onRefresh={
            async () => {
              await this.reload()
            }
          }
          onContentSizeChange={this.onContentSizeChange}
        />

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
                      acceptTandC()
                    }
                  }>
                  <Text>  Agree  </Text>
                </Button>
                <Right />
              </CardItem>
            </Card>
          </Content>
        </Modal>
        {this.photoButton()}
      </Container>
    )
  }
}

const { width, height } = Dimensions.get('screen')

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraButtonPortraitPrimary: {
    flexDirection: 'row',
    bottom: 20,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  cameraButtonPortraitSecondary: {
    flexDirection: 'row',
    bottom: 20,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  cameraButtonLandscapePrimary: {
    flexDirection: 'column',
    right: 20,
    top: width < height ? width * 0.5 - 50 - 32 : height * 0.5 - 50 - 32,
  },
  cameraButtonLandscapeSecondary: {
    flexDirection: 'column',
    left: 20,
    top: width < height ? width * 0.5 - 50 - 32 : height * 0.5 - 50 - 32,
  },
})

const mapStateToProps = state => {
  const { photos, pageNumber } = state.photosList

  return {
    photos,
    pageNumber,
    errorMessage: state.photosList.errorMessage,
    batch: state.photosList.batch,
    isLastPage: state.photosList.isLastPage,
    paging: state.photosList.paging,
    isTandcAccepted: state.photosList.isTandcAccepted,
    loading: state.photosList.loading,
    pendingUploads: state.camera.pendingUploads,
    orientation: state.photosList.orientation,
    activeSegment: state.photosList.activeSegment,
    searchTerm: state.photosList.searchTerm,
    netAvailable: state.photosList.netAvailable,
  }
}

const mapDispatchToProps = {
  // will be wrapped into a dispatch call
  resetState,
  getPhotos,
  acceptTandC,
  uploadPendingPhotos,
  setOrientation,
  setActiveSegment,
  setSearchTerm,
  setNetAvailable,
}

PhotosList.defaultProps = {
  searchTerm: null,
}

PhotosList.propTypes = {
  navigation: PropTypes.object.isRequired,
  resetState: PropTypes.func.isRequired,
  getPhotos: PropTypes.func.isRequired,
  photos: PropTypes.array.isRequired,
  isLastPage: PropTypes.bool.isRequired,
  batch: PropTypes.number.isRequired,
  isTandcAccepted: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  acceptTandC: PropTypes.func.isRequired,
  pendingUploads: PropTypes.number.isRequired,
  uploadPendingPhotos: PropTypes.func.isRequired,
  orientation: PropTypes.string.isRequired,
  setOrientation: PropTypes.func.isRequired,
  activeSegment: PropTypes.number.isRequired,
  setActiveSegment: PropTypes.func.isRequired,
  searchTerm: PropTypes.string,
  setSearchTerm: PropTypes.func.isRequired,
  netAvailable: PropTypes.bool.isRequired,
  setNetAvailable: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(PhotosList)
