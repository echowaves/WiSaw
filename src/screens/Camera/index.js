
import React, { Component, } from 'react'
import {
	StyleSheet,
	View,
	CameraRoll,
} from 'react-native'
import { RNCamera, } from 'react-native-camera'
import {
	Icon,
	Button,
} from 'native-base'

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
			CameraRoll.saveToCameraRoll(data.uri)
		}
	}

	render() {
		return (
			<View style={styles.container}>
				<RNCamera
					ref={ref => {
						this.camera = ref
					}}
					style={styles.preview}
					type={RNCamera.Constants.Type.back}
					flashMode={RNCamera.Constants.FlashMode.off}
					orientation={RNCamera.Constants.Orientation.auto}
					onFaceDetected={null}
					onGoogleVisionBarcodesDetected={null}
					onTextRecognized={null}
					onBarCodeRead={null}
				/>
				<View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center', }}>
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
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		backgroundColor: 'black',
	},
	preview: {
		flex: 1,
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
})
