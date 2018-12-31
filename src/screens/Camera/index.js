import React, { Component, } from 'react'
import {
	StyleSheet,
	View,
	CameraRoll,
	AsyncStorage,
	Text,
} from 'react-native'

import {
	Icon,
	Button,
} from 'native-base'

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
} from './reducer'

// import * as CONST from '../../consts'
import { store, } from '../../../App'

class Camera extends Component {
	static navigationOptions = {
		headerTintColor: '#ffffff',
		headerStyle: {
			backgroundColor: '#000',
			borderBottomColor: 'black',
			borderBottomWidth: 0,
		},
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
	}

	componentDidMount() {
		const {
			setPreviewUri,
		} = this.props
		setPreviewUri(null)
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


			await AsyncStorage.setItem(`wisaw-${now}`,
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
		const {
			setPreviewUri,
		} = this.props
		return (
			<Animatable.Image
				ref={ref => {
					this.animatableImage = ref
				}}
				source={imageUri ? { uri: imageUri, } : {}}
				animation="fadeOut"
				duration={10000}
				style={
					{
						position: 'absolute',
						alignSelf: 'auto',
						bottom: 20,
						left: 20,
						height: 100,
						width: 100,
						borderRadius: 10,
						borderWidth: imageUri ? 1 : 0,
						borderColor: '#fff',
					}
				}
				onAnimationEnd={() => setPreviewUri(null)}
			/>
		)
	}

	render() {
		const {
			previewUri,
			pendingUploads,
		} = this.props
		return (
			<View style={styles.container}>
				<RNCamera
					ref={ref => {
						this.cameraView = ref
					}}
					style={styles.camera}
					type={RNCamera.Constants.Type.back}
					flashMode={RNCamera.Constants.FlashMode.off}
					orientation={RNCamera.Constants.Orientation.auto}
					onFaceDetected={null}
					onGoogleVisionBarcodesDetected={null}
					onTextRecognized={null}
					onBarCodeRead={null}
				/>
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
						onPress={this.takePicture.bind(this)}>
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
				{ this.renderPreviewImage(previewUri) }
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	camera: {
		flex: 1,
		alignItems: 'center',
	},
})


const mapStateToProps = state => ({
	previewUri: state.camera.previewUri,
	pendingUploads: state.camera.pendingUploads,
})

const mapDispatchToProps = {
	// will be wrapped into a dispatch call
	setPreviewUri,
	uploadPendingPhotos,
}

export default connect(mapStateToProps, mapDispatchToProps)(Camera)
