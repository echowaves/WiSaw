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

import { RNCamera, } from 'react-native-camera'

import * as Animatable from 'react-native-animatable'

// const moment = require('moment')

export default class CameraScreen extends Component {
	static navigationOptions = {
		headerTintColor: '#ffffff',
		headerStyle: {
			backgroundColor: '#000',
			borderBottomColor: 'black',
			borderBottomWidth: 0,
		},
	}


	constructor(props) {
		super(props)
		this.state = {
			previewData: null,
		}
	}

	takePicture = async function () {
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

			this.setState({
				previewData: data,
			})
			this.previewView.stopAnimation()
			if (this.timeOutJob) {
				clearTimeout(this.timeOutJob)
			}
			this.timeOutJob = setTimeout(() => {
				this.previewView.fadeOut()
			}, 3000)

			CameraRoll.saveToCameraRoll(data.uri)
		}
	}

	timeOutJob

	render() {
		const { previewData, } = this.state

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
				{
					previewData !== null
						&& (
							<Animatable.Image
								ref={ref => {
									this.previewView = ref
								}}
								source={{ uri: previewData.uri, }}
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
