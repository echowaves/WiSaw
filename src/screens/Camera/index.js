
import React, { Component, } from 'react'
import {
	StyleSheet,
	TouchableOpacity,
	View,
	CameraRoll,
} from 'react-native'
import { RNCamera, } from 'react-native-camera'
import { Icon, } from 'native-base'

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
				base64: true,
				fixOrientation: true,
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
					<TouchableOpacity
						onPress={this.takePicture.bind(this)}
						style={styles.capture}>
						<Icon name="camera" style={{ fontSize: 40, color: 'white', }} />
					</TouchableOpacity>


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
	capture: {
		flex: 0,
		backgroundColor: 'rgba(0,0,0,.0)',
		color: '#fff',
		borderRadius: 5,
		padding: 15,
		paddingHorizontal: 20,
		alignSelf: 'center',
		margin: 20,
	},
})
