import React, { Component, } from 'react'
import {
	StyleSheet,
	View,
	CameraRoll,
	Text,
	Dimensions,
	Platform,
	TouchableOpacity,
} from 'react-native'

import AsyncStorage from '@react-native-community/async-storage'

import {
	Icon,
	Button,
} from 'native-base'

import Slider from 'react-native-slider'

import PropTypes from 'prop-types'

import {
	connect,
} from 'react-redux'

import { RNCamera, } from 'react-native-camera'

import * as Animatable from 'react-native-animatable'

import moment from 'moment'

import {
	setPreviewUri,
	uploadPendingPhotos,
	setFlashMode,
	setFrontCam,
	setZoom,
} from './reducer'

import { store, } from '../../../App'
import * as CONST from '../../consts.js'

class Camera extends Component {
	static navigationOptions = {
		headerTintColor: CONST.MAIN_COLOR,
		headerStyle: {
			borderBottomColor: 'black',
			borderBottomWidth: 0,
		},
		headerTransparent: true,
	}

	static defaultProps = {
		previewUri: null,
	}

	static propTypes = {
		// navigation: PropTypes.object.isRequired,
		previewUri: PropTypes.string,
		setPreviewUri: PropTypes.func.isRequired,
		uploadPendingPhotos: PropTypes.func.isRequired,
		pendingUploads: PropTypes.number.isRequired,
		orientation: PropTypes.string.isRequired,
		flashMode: PropTypes.bool.isRequired,
		setFlashMode: PropTypes.func.isRequired,
		frontCam: PropTypes.bool.isRequired,
		setFrontCam: PropTypes.func.isRequired,
		zoom: PropTypes.number.isRequired,
		setZoom: PropTypes.func.isRequired,
	}

	componentDidMount() {
		const {
			setPreviewUri,
			setZoom,
		} = this.props
		setPreviewUri(null)
		setZoom(0)
	}

	takePicture = async function () {
		const {
			setPreviewUri,
			uploadPendingPhotos,
		} = this.props

		if (this.cameraView) {
			const options = {
				quality: 1,
				// orientation: "auto",
				base64: false,
				fixOrientation: true,
				forceUpOrientation: true,
				exif: false,
				pauseAfterCapture: false,
			}
			const data = await this.cameraView.takePictureAsync(options)

			if (this.animatableImage) {
				this.animatableImage.stopAnimation()
				this.animatableImage.fadeOut()
			}

			const cameraRollUri = await CameraRoll.saveToCameraRoll(data.uri)

			setPreviewUri(data.uri)

			const now = moment().format()
			const { uuid, location, } = store.getState().photosList


			await AsyncStorage.setItem(`wisaw-pending-${now}`,
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
				))
			uploadPendingPhotos()
		}
	}

	renderPreviewImage(imageUri) {
		return (
			<Animatable.Image
				ref={ref => {
					this.animatableImage = ref
				}}
				source={imageUri ? { uri: imageUri, } : {}}
				animation="fadeOut"
				duration={30000}
				style={
					{
						position: 'absolute',
						alignSelf: 'center',
						top: 20,
						height: 100,
						width: 100,
						borderRadius: 10,
						borderWidth: imageUri ? 1 : 0,
						borderColor: '#fff',
					}
				}
			/>
		)
	}

	render() {
		const {
			previewUri,
			pendingUploads,
			orientation,
			flashMode,
			frontCam,
			zoom,
			setFlashMode,
			setFrontCam,
			setZoom,
		} = this.props
		return (
			<View style={styles.container}>
				<RNCamera
					ref={ref => {
						this.cameraView = ref
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
				/>
				<View style={
					[
						orientation === 'portrait-primary' && styles.cameraButtonPortraitPrimary,
						orientation === 'portrait-secondary' && styles.cameraButtonPortraitSecondary,
						orientation === 'landscape-primary' && styles.cameraButtonLandscapePrimary,
						orientation === 'landscape-secondary' && styles.cameraButtonLandscapeSecondary,
					]
				}>
					<View style={{ flex: 2, }}>
						<Slider
							maximumValue={10}
							minimumValue={0}
							step={1}
							value={zoom}
							onValueChange={
								val => {
									setZoom(Platform.OS === 'ios' ? (val / 200) : (val / 10)) // this is to address iOS bug
								}
							}
							style={
								{
									flex: 1,
									width: '80%',
									height: '80%',
									justifyContent: 'center',
									alignSelf: 'center',
								}
							}
							maximumTrackTintColor={CONST.MAIN_COLOR}
							minimumTrackTintColor={CONST.MAIN_COLOR}
							thumbTintColor={CONST.MAIN_COLOR}
						/>
					</View>
					<View style={
						[
							{
								flex: 2,
							},
							orientation === 'portrait-primary' && { flexDirection: 'row', justifyContent: 'center', },
							orientation === 'portrait-secondary' && { flexDirection: 'row', justifyContent: 'center', },
							orientation === 'landscape-primary' && { flexDirection: 'column', justifyContent: 'center', },
							orientation === 'landscape-secondary' && { flexDirection: 'column', justifyContent: 'center', },
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
								onPress={this.takePicture.bind(this)}>
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
							orientation === 'portrait-primary' && { flexDirection: 'row', },
							orientation === 'portrait-secondary' && { flexDirection: 'row', },
							orientation === 'landscape-primary' && { flexDirection: 'column', },
							orientation === 'landscape-secondary' && { flexDirection: 'column', },
						]
					}>
						<TouchableOpacity
							onPress={
								val => {
									setFrontCam(!frontCam)
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
						<TouchableOpacity
							onPress={
								val => {
									setFlashMode(!flashMode)
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
				</View>
				{ this.renderPreviewImage(previewUri) }
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	cameraView: {
		flex: 1,
		alignItems: 'center',
	},

	cameraButtonPortraitPrimary: {
		position: 'absolute',
		flex: 1,
		flexDirection: 'row',
		width: Dimensions.get('screen').width < Dimensions.get('screen').height ? Dimensions.get('screen').width : Dimensions.get('screen').height,
		bottom: 20,
		alignItems: 'stretch',
		justifyContent: 'center',

	},
	cameraButtonPortraitSecondary: {
		position: 'absolute',
		flex: 1,
		flexDirection: 'row',
		width: Dimensions.get('screen').width < Dimensions.get('screen').height ? Dimensions.get('screen').width : Dimensions.get('screen').height,
		bottom: 20,
		alignItems: 'stretch',
		justifyContent: 'center',
	},
	cameraButtonLandscapePrimary: {
		position: 'absolute',
		flex: 1,
		flexDirection: 'column',
		top: 0,
		right: 20,
		height: Dimensions.get('screen').width < Dimensions.get('screen').height ? Dimensions.get('screen').width : Dimensions.get('screen').height,
		justifyContent: 'space-between',
	},
	cameraButtonLandscapeSecondary: {
		position: 'absolute',
		flex: 1,
		flexDirection: 'column',
		top: 0,
		left: 20,
		height: Dimensions.get('screen').width < Dimensions.get('screen').height ? Dimensions.get('screen').width : Dimensions.get('screen').height,
		justifyContent: 'space-between',
	},

})


const mapStateToProps = state => ({
	previewUri: state.camera.previewUri,
	pendingUploads: state.camera.pendingUploads,
	orientation: state.photosList.orientation,
	flashMode: state.camera.flashMode,
	frontCam: state.camera.frontCam,
	zoom: state.camera.zoom,
})

const mapDispatchToProps = {
	// will be wrapped into a dispatch call
	setPreviewUri,
	uploadPendingPhotos,
	setFlashMode,
	setFrontCam,
	setZoom,
}

export default connect(mapStateToProps, mapDispatchToProps)(Camera)
