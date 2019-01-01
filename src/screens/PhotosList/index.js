import React, {
	Component,
} from 'react'

import {
	StyleSheet,
	Text,
	View,
	Alert,
	Dimensions,
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
} from './reducer'

import { uploadPendingPhotos, } from '../Camera/reducer'

import * as CONST from '../../consts.js'
import Thumb from '../../components/Thumb'

class PhotosList extends Component {
	static navigationOptions = ({
		navigation,
	}) => {
		const { params = {}, } = navigation.state
		return ({
			headerTitle: 'hear&now',
			headerTintColor: CONST.MAIN_COLOR,
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
			headerLeft: (
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
			),
			headerBackTitle: null,
		})
	}


	static defaultProps = {
		locationPermission: null,
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
		setLocationPermission: PropTypes.func.isRequired,
		pendingUploads: PropTypes.number.isRequired,
		uploadPendingPhotos: PropTypes.func.isRequired,
	}

	componentDidMount() {
		const {
			navigation,
			locationPermission,
			setLocationPermission,
		} = this.props
		navigation.setParams({ handleRefresh: () => (this.reload()), })

		if (locationPermission !== 'authorized') {
			// Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
			Permissions.request('location', { type: 'whenInUse', }).then(permissionResponse => {
				setLocationPermission(permissionResponse)
				this.reload()
			})
		}
	}

	onLayout() {
		this.forceUpdate()
	}

	thumbWidth

	calculateThumbWidth() {
		const { width, } = Dimensions.get('window')
		const thumbsCount = Math.floor(width / 100)
		this.thumbWidth = Math.floor((width - thumbsCount * 3 * 2) / thumbsCount)
	}

	async reload() {
		const {
			resetState,
			getPhotos,
			uploadPendingPhotos,
		} = this.props
		await resetState()
		getPhotos()
		uploadPendingPhotos()
	}

	async alertForPermission(headerText, bodyText) {
		return new Promise((resolve, reject) => {
			Alert.alert(
				headerText,
				bodyText,
				[{
					text: 'Try Again',
					onPress: () => reject,
					style: 'cancel',
				},
				{
					text: 'Open Settings',
					onPress: () => DeviceSettings.app(),
				},
				],
			)
		})
	}

	async checkPermissionsForPhotoTaking() {
		let cameraPermission = await Permissions.check('camera')
		let photoPermission = await Permissions.check('photo')
		// alert(`${cameraPermission}, ${photoPermission}`)
		// Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'

		if (cameraPermission === 'denied') {
			await this.alertForPermission('Can we access your camera?', 'How else would you be able to take a photo?')
		} else if (cameraPermission !== 'authorized') {
			cameraPermission = await Permissions.request('camera')
		}

		if (photoPermission === 'denied') {
			await this.alertForPermission('Can we access your photos?', 'How else would you be able to save the photo you take on your device?')
		} else if (photoPermission !== 'authorized') {
			photoPermission = await Permissions.request('photo')
		}


		if (cameraPermission === 'authorized' && photoPermission === 'authorized') {
			this.takePhoto()
		}
	}

	takePhoto() {
		const {
			navigation,
		} = this.props
		navigation.push('Camera')
	}

	render() {
		const {
			photos,
			loading,
			getPhotos,
			navigation,
			isTandcAccepted,
			acceptTandC,
			locationPermission,
			pendingUploads,
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

			this.calculateThumbWidth()
			return (
				<Container>
					<GridView
						// extraData={this.state}
						itemDimension={
							this.thumbWidth
						}
						spacing={3}
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
									thumbWidth={this.thumbWidth}
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
										backgroundColor: 'rgba(10,10,10,.5)',
									}
								}>
								{pendingUploads}
							</Text>
						)}
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
		pendingUploads: state.camera.pendingUploads,
	}
}

const mapDispatchToProps = {
	// will be wrapped into a dispatch call
	resetState,
	getPhotos,
	acceptTandC,
	setLocationPermission,
	uploadPendingPhotos,
}

export default connect(mapStateToProps, mapDispatchToProps)(PhotosList)
