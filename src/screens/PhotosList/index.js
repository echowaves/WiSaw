import React, {
	Component,
} from 'react'

import {
	StyleSheet,
	Text,
	View,
	Alert,
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
} from 'native-base'

import Permissions from 'react-native-permissions'
import DeviceSettings from 'react-native-device-settings'
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
	setLocationPermission,
	setOrientation,
	setActiveSegment,
	setSearchTerm,
} from './reducer'
import { uploadPendingPhotos, } from '../Camera/reducer'

import * as CONST from '../../consts.js'
import Thumb from '../../components/Thumb'


class PhotosList extends Component {
	static navigationOptions = ({
		navigation,
	}) => ({
		headerTintColor: CONST.MAIN_COLOR,
		headerLeft: navigation.getParam('headerLeft'),
		headerTitle: navigation.getParam('headerTitle'),
		headerRight: navigation.getParam('headerRight'),
		headerBackTitle: null,
	})

	thumbWidth

	componentDidMount() {
		const {
			navigation,
			locationPermission,
			setLocationPermission,
		} = this.props

		navigation.setParams({
			handleRefresh: () => this.reload(),
			headerLeft: () => this.renderHeaderLeft(),
			headerTitle: () => this.renderHeaderTitle(),
			headerRight: () => this.renderHeaderRight(),
		})

		DeviceEventEmitter.addListener('namedOrientationDidChange', this.handleOrientationDidChange.bind(this))

		if (locationPermission !== 'authorized') {
			// Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
			Permissions.request('location', { type: 'whenInUse', }).then(async permissionResponse => {
				setLocationPermission(permissionResponse)
				this.reload()
			})
		} else {
			this.reload()
		}

		branch.initSessionTtl = 10000 // Set to 10 seconds
		branch.subscribe(({ error, params, }) => {
			if (error) {
				alert(`Error from Branch: ${error}`)
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
				navigation.navigate('SharedPhoto', { item, })
			}
		})
	}

	componentWillUnmount() {
		DeviceEventEmitter.removeListener('namedOrientationDidChange', this.handleOrientationDidChange.bind(this))
	}

	onLayout(e) {
		this.forceUpdate()
	}

	handleOrientationDidChange(data) {
		const {
			setOrientation,
		} = this.props
		let { name, } = data
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

	calculateThumbWidth() {
		const { width, } = Dimensions.get('window')
		const thumbsCount = Math.floor(width / 100)
		this.thumbWidth = Math.floor((width - thumbsCount * 3 * 2) / thumbsCount)
	}

	isListFilllsScreen() {
		const {
			photos,
			isLastPage,
		} = this.props
		const { width, height, } = Dimensions.get('window')
		const numColumns = Math.floor(width / this.thumbWidth)
		const numRows = Math.floor(photos.length / numColumns)
		const listHeight = numRows * this.thumbWidth
		// alert(`${photos.length}:${listHeight}:${height}`)
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
		} = this.props
		navigation.setParams({
			headerTitle: () => this.renderHeaderTitle(),
			headerLeft: () => this.renderHeaderLeft(),
			headerRight: () => this.renderHeaderRight(),
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
		const { params = {}, } = navigation.state
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
					() => {
						navigation.setParams({
							headerTitle: () => this.renderHeaderTitle(),
							headerLeft: () => this.renderHeaderLeft(),
							headerRight: () => this.renderHeaderRight(),
						})
						setSearchTerm(null)
						this.reload()
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
				<View style={{ flex: 1, flexDirection: 'row', }}>
					<Icon
						type="MaterialIcons"
						name="search"
						style={{ marginRight: 20, color: CONST.MAIN_COLOR, }}
						onPress={
							() => {
								navigation.setParams({
									headerTitle: () => this.renderHeaderTitle(),
									headerLeft: () => this.renderHeaderLeft(),
									headerRight: () => this.renderHeaderRight(),
								})
								setSearchTerm('')
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
					() => {
						setSearchTerm(navigation.getParam('currentTerm'))
						navigation.setParams({
							headerTitle: () => this.renderHeaderTitle(),
						})
						this.reload()
					}
				}
			/>
		)
	}

	renderHeaderTitle() {
		const {
			activeSegment,
			setActiveSegment,
			navigation,
			searchTerm,
		} = this.props
		// const { params = {}, } = navigation.state

		if (searchTerm === null) {
			return (
				<StyleProvider style={getTheme(material)}>
					<Segment style={{ marginBottom: 2, }}>
						<Button
							first active={activeSegment === 0}
							onPress={
								() => {
									setActiveSegment(0)
									this.reload()
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
								() => {
									setActiveSegment(1)
									this.reload()
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
					navigation.setParams({
						headerTitle: () => this.renderHeaderTitle(),
						currentTerm,
					})
				}}
				// onSubmitEditing={
				// 	() => {
				// 		setSearchTerm(navigation.getParam('currentTerm'))
				// 		navigation.setParams({
				// 			headerTitle: () => this.renderHeaderTitle(),
				// 		})
				// 		params.handleRefresh()
				// 		// this.reload()
				// 	}
				// }
				value={navigation.getParam('currentTerm')}
				editable
				autoFocus
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
			locationPermission,
			batch,
			activeSegment,
			searchTerm,
			isLastPage,
		} = this.props

		if (locationPermission === 'authorized') {
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
										<CardItem style={{ borderRadius: 10, }}>
											<Text style={{
												fontSize: 20,
												textAlign: 'center',
												margin: 10,
											}}>
									No Photos found.
									Try to search for something else.
											</Text>
										</CardItem>
									</Card>
								)}
								{searchTerm === null && activeSegment === 0 && (
									<Card transparent>
										<CardItem style={{ borderRadius: 10, }}>
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
										<CardItem style={{ borderRadius: 10, }}>
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
						items={
							photos
						}
						renderItem={
							({ item, index, }) => (
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
							() => {
								this.reload()
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
								<CardItem style={{ borderRadius: 10, }}>
									<Text> * When you take a photo with WiSaw app,
								it will be added to a Photo Album on your phone,
								as well as posted to global feed in the cloud.
									</Text>
								</CardItem>
								<CardItem style={{ borderRadius: 10, }}>
									<Text> * People close-by can see your photos.</Text>
								</CardItem>
								<CardItem style={{ borderRadius: 10, }}>
									<Text> * You can see other people&#39;s photos too.
									</Text>
								</CardItem>
								<CardItem style={{ borderRadius: 10, }}>
									<Text>* If you find any photo abusive or inappropriate, you can delete it -- it will be deleted from the cloud so that no one will ever see it again.</Text>
								</CardItem>
								<CardItem style={{ borderRadius: 10, }}>
									<Text>* No one will tolerate objectionable content or abusive users.</Text>
								</CardItem>
								<CardItem style={{ borderRadius: 10, }}>
									<Text>* The abusive users will be banned from WiSaw by other users.</Text>
								</CardItem>
								<CardItem style={{ borderRadius: 10, }}>
									<Text>* By using WiSaw I agree to Terms and Conditions.</Text>
								</CardItem>
								<CardItem footer style={{ borderRadius: 10, }}>
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
		} // if (locationPermission === 'authorized')
		return (
			<Container>
				<Content padder>
					<Body>
						<Modal isVisible>
							<Content padder>
								<Card transparent>
									<CardItem style={{ borderRadius: 10, }}>
										<Text> How am I supposed to show you the near-by photos ?
										</Text>
									</CardItem>
									<CardItem style={{ borderRadius: 10, }}>
										<Text> Why don &#39;t you enable Location in Settings and Try Again?
										</Text>
									</CardItem>
									<CardItem footer style={{ borderRadius: 10, }}>
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

const { width, height, } = Dimensions.get('screen')

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
	const { photos, pageNumber, } = state.photosList

	return {
		photos,
		pageNumber,
		errorMessage: state.photosList.errorMessage,
		batch: state.photosList.batch,
		isLastPage: state.photosList.isLastPage,
		paging: state.photosList.paging,
		isTandcAccepted: state.photosList.isTandcAccepted,
		loading: state.photosList.loading,
		locationPermission: state.photosList.locationPermission,
		pendingUploads: state.camera.pendingUploads,
		orientation: state.photosList.orientation,
		activeSegment: state.photosList.activeSegment,
		searchTerm: state.photosList.searchTerm,
	}
}

const mapDispatchToProps = {
	// will be wrapped into a dispatch call
	resetState,
	getPhotos,
	acceptTandC,
	setLocationPermission,
	uploadPendingPhotos,
	setOrientation,
	setActiveSegment,
	setSearchTerm,
}

PhotosList.defaultProps = {
	locationPermission: null,
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
	locationPermission: PropTypes.string,
	setLocationPermission: PropTypes.func.isRequired,
	pendingUploads: PropTypes.number.isRequired,
	uploadPendingPhotos: PropTypes.func.isRequired,
	orientation: PropTypes.string.isRequired,
	setOrientation: PropTypes.func.isRequired,
	activeSegment: PropTypes.number.isRequired,
	setActiveSegment: PropTypes.func.isRequired,
	searchTerm: PropTypes.string,
	setSearchTerm: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(PhotosList)
