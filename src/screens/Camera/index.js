
import React, { Component, } from 'react'
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	CameraRoll,
} from 'react-native'
import { RNCamera, } from 'react-native-camera'

// const moment = require('moment')

export default class CameraScreen extends Component {
	takePicture = async function () {
		if (this.camera) {
			const options = { quality: 0.5, base64: true, }
			const data = await this.camera.takePictureAsync(options)
			CameraRoll.saveToCameraRoll(data.uri)
			console.log(data.uri)
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
				/>
				<View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center', }}>
					<TouchableOpacity
						onPress={this.takePicture.bind(this)}
						style={styles.capture}>
						<Text style={{ fontSize: 14, }}> SNAP </Text>
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
		backgroundColor: '#fff',
		borderRadius: 5,
		padding: 15,
		paddingHorizontal: 20,
		alignSelf: 'center',
		margin: 20,
	},
})
