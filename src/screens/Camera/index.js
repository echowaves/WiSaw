import React, { Component, } from 'react'
import {
	StyleSheet,
	View,
	CameraRoll,
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

// const moment = require('moment')

import {
	setPreviewUri,
} from './reducer'

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
	}

	takePicture = async function () {
		const {
			setPreviewUri,
		} = this.props

		if (this.camera) {
			const options = {
				quality: 1,
				// orientation: "auto",
				base64: false,
				fixOrientation: true,
				forceUpOrientation: true,
				exif: false,
				pauseAfterCapture: false,
			}
			const data = await this.camera.takePictureAsync(options)
			setPreviewUri(data.uri)

			if (this.animatableImage) {
				this.animatableImage.stopAnimation()
				if (this.timeOutJob) {
					clearTimeout(this.timeOutJob)
				}
				this.timeOutJob = setTimeout(() => {
					if (this.animatableImage) {
						this.animatableImage.fadeOut()
					}
				}, 3000)
			}

			const cameraRollUri = await CameraRoll.saveToCameraRoll(data.uri)
		}
	}

	animatableImage

	timeOutJob

	renderPreviewImage(imageUri) {
		if (imageUri) {
			return (
				<Animatable.Image
					ref={ref => {
						this.animatableImage = ref
					}}
					source={{ uri: imageUri, }}
					animation="fadeOut"
					delay={3000}
					style={
						{
							position: 'absolute',
							alignSelf: 'auto',
							bottom: 20,
							left: 20,
							height: 100,
							width: 100,
							borderRadius: 10,
							borderWidth: 1,
							borderColor: '#fff',
						}
					}
				/>
			)
		}
		return (<View />)
	}

	render() {
		const {
			previewUri,
		} = this.props
		return (
			<View style={styles.container}>
				<RNCamera
					ref={ref => {
						this.camera = ref
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
})

const mapDispatchToProps = {
	// will be wrapped into a dispatch call
	setPreviewUri,
}

export default connect(mapStateToProps, mapDispatchToProps)(Camera)
