import React, {
	Component,
} from 'react'

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
} from 'native-base'

import Permissions from 'react-native-permissions'
import DeviceSettings from 'react-native-device-settings'

import {
	connect,
} from 'react-redux'

import GridView from 'react-native-super-grid'

import PropTypes from 'prop-types'

import Modal from "react-native-modal"

import {
	resetState,
	getPhotos,
	acceptTandC,
	setLocationPermission,
	setCameraPermission,
	setPhotoPermission,
} from './reducer'

import Thumb from '../../components/Thumb'

import * as CONST from '../../consts.js'

class PhotosList extends Component {
	static navigationOptions = ({
		navigation,
	}) => ({
		headerTitle: 'hear&now',
		headerRight: (
			<Icon
				onPress={
					() => navigation.push('Feedback')
				}
				name="feedback"
				type="MaterialIcons"
				style={
					{
						marginRight: 10,
						color: CONST.MAIN_COLOR,
					}
				}
			/>
		),
		headerBackTitle: null,
	})

	static defaultProps = {
		locationPermission: null,
		cameraPermission: null,
		photoPermission: null,
	}

	static propTypes = {
		navigation: PropTypes.object.isRequired,
		resetState: PropTypes.func.isRequired,
		getPhotos: PropTypes.func.isRequired,
		photos: PropTypes.array.isRequired,
		loading: PropTypes.bool.isRequired,
		isTandcAccepted: PropTypes.bool.isRequired,
		acceptTandC: PropTypes.func.isRequired,
		locationPermission: PropTypes.string,
		cameraPermission: PropTypes.string,
		photoPermission: PropTypes.string,
		setLocationPermission: PropTypes.func.isRequired,
		setCameraPermission: PropTypes.func.isRequired,
		setPhotoPermission: PropTypes.func.isRequired,
	}

	componentDidMount() {
		const {
			locationPermission,
			setLocationPermission,
		} = this.props
		if (locationPermission !== 'authorized') {
			// Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
			Permissions.request('location', { type: 'whenInUse', }).then(permissionResponse => {
				setLocationPermission(permissionResponse)
				this.reload()
			})
		}
	}

	async reload() {
		const {
			resetState,
			getPhotos,
		} = this.props
		await resetState()
		getPhotos()
	}


	// // Request permission to access photos
	// _requestPermission = () => {
	// 	Permissions.request('photo').then(response => {
	// 		// Returns once the user has chosen to 'allow' or to 'not allow' access
	// 		// Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
	// 		this.setState({
	// 			photoPermission: response,
	// 		})
	// 	})
	// }
	//
	// // Check the status of multiple permissions
	// async _checkCameraAndPhotos() {
	// 	const permissions = await Permissions.checkMultiple(['camera', 'photo', ])
	// 	setCameraPermission(permissions.camera)
	// 	setPhotoPermission(permissions.photo)
	// }
	//
	// // This is a common pattern when asking for permissions.
	// // iOS only gives you once chance to show the permission dialog,
	// // after which the user needs to manually enable them from settings.
	// // The idea here is to explain why we need access and determine if
	// // the user will say no, so that we don't blow our one chance.
	// // If the user already denied access, we can ask them to enable it from settings.
	// _alertForPhotosPermission() {
	// 	Alert.alert(
	// 		'Can we access your photos?',
	// 		'We need access so you can set your profile pic',
	// 		[{
	// 			text: 'No way',
	// 			onPress: () => console.log('Permission denied'),
	// 			style: 'cancel',
	// 		},
	// 		this.state.photoPermission == 'undetermined' ? {
	// 			text: 'OK',
	// 			onPress: this._requestPermission,
	// 		} : {
	// 			text: 'Open Settings',
	// 			onPress: Permissions.openSettings,
	// 		},
	// 		],
	// 	)
	// }
	//
	//
	// async takePhoto() {
	// 	const {
	// 		resetState,
	// 		cameraPermission,
	// 		photoPermission,
	// 		setCameraPermission,
	// 		setPhotoPermission,
	// 	} = this.props
	// 	await resetState()
	// 	// Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
	// 	if (cameraPermission !== 'authorized') {
	// 		const camPermission = Permissions.request('camera')
	// 	}
	// 	if (photoPermission !== 'authorized') {
	// 		const phoPermission = Permissions.request('photo')
	// 	}
	//
	// 	// const permissions = await Permissions.checkMultiple(['camera', 'photo'])
	// 	alert(`${cameraPermission}:${photoPermission}`)
	//
	// 	// setLocationPermission(permission)
	// 	// getPhotos()
	// }

	render() {
		const {
			photos,
			loading,
			getPhotos,
			navigation,
			isTandcAccepted,
			acceptTandC,
			locationPermission,
		} = this.props

		if (locationPermission === 'authorized') {
			if (photos.length === 0) {
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
					</Container>
				)
			}

			return (
				<Container>
					<GridView
						// extraData={this.state}
						itemDimension={
							100
						}
						items={
							photos
						}
						renderItem={
							(item, index) => (
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
								/>
							)}
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
								if (loading === false) {
									getPhotos()
								}
							}
						}
						onEndReachedThreshold={
							5
						}
						refreshing={
							false
						}
						onRefresh={
							() => (this.reload())
						}
					/>

					<Modal
						isVisible={
							!isTandcAccepted
						}>
						<Content padder>
							<Card transparent>
								<CardItem>
									<Text> * When you take a photo with WiSaw app,
								it will be added to a Photo Album on your phone,
								as well as posted to global feed in the cloud.
									</Text>
								</CardItem>
								<CardItem>
									<Text> * People close - by can see your photos.</Text>
								</CardItem>
								<CardItem>
									<Text> * You can see other people & #39;s photos too.
									</Text>
								</CardItem>
								<CardItem>
									<Text>* If you find any photo abusive or inappropriate, you can delete it -- it will be deleted from the cloud so that no one will ever see it again.</Text>
								</CardItem>
								<CardItem>
									<Text>* No one will tolerate objectionable content or abusive users.</Text>
								</CardItem>
								<CardItem>
									<Text>* The abusive users will be banned from WiSaw by other users.</Text>
								</CardItem>
								<CardItem>
									<Text>* By using WiSaw I agree to Terms and Conditions.</Text>
								</CardItem>
								<CardItem footer>
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

					<View style={
						{
							position: 'absolute',
							alignSelf: 'center',
							bottom: 20,
						}
					}>
						<Button
							rounded
							light
							transparent
							bordered
							style={
								{
									height: 100,
									backgroundColor: 'rgba(10,10,10,.1)',
								}
							}
							onPress={
								() => {
									this.takePhoto()
								}
							}>
							<Icon
								type="FontAwesome"
								name="camera"
								style={
									{
										fontSize: 60,
										color: 'red',
									}
								}
							/>
						</Button>
					</View>
				</Container>
			)
		} // if (locationPermission === 'authorized')
		return (
			<Container>
				<Content padder>
					<Body>
						<Modal isVisible>
							<Content padder>
								<Card transparent>
									<CardItem>
										<Text> How am I supposed to show you the near - by photos ?
										</Text>
									</CardItem>
									<CardItem>
										<Text> Why don &#39;t you enable Location in Settings and Try Again?
										</Text>
									</CardItem>
									<CardItem footer>
										<Left>
											<Button
												block
												bordered
												success
												small
												onPress={
													() => {
														this.componentDidMount()
													}
												}>
												<Text> Try Again </Text>
											</Button>
										</Left>
										<Right>
											<Button
												block bordered warning small onPress={
													() => {
														DeviceSettings.app()
													}
												}>
												<Text> Open Settings
												</Text>
											</Button>
										</Right>
									</CardItem>
								</Card>
							</Content>
						</Modal>
					</Body>
				</Content>
			</Container>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
})

const mapStateToProps = state => {
	const storedPhotos = state.photosList.photos.map(photo => ({
		key: photo.id,
		...photo,
	})) // add key to photos
	return {
		photos: storedPhotos,
		errorMessage: state.photosList.errorMessage,
		loading: state.photosList.loading,
		paging: state.photosList.paging,
		isTandcAccepted: state.photosList.isTandcAccepted,
		locationPermission: state.photosList.locationPermission,
		cameraPermission: state.photosList.cameraPermission,
		photoPermission: state.photosList.photoPermission,
	}
}

const mapDispatchToProps = {
	// will be wrapped into a dispatch call
	resetState,
	getPhotos,
	acceptTandC,
	setLocationPermission,
	setCameraPermission,
	setPhotoPermission,
}

export default connect(mapStateToProps, mapDispatchToProps)(PhotosList)
