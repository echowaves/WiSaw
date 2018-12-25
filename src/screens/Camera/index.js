import React, { Component, } from 'react'
import {
	StyleSheet,
	View,
	StatusBar,
	Dimensions,
	TouchableOpacity,
} from 'react-native'
import Camera from 'react-native-camera'
import { Icon, } from 'native-base'
import RNFS from 'react-native-fs'

import moment from 'moment'

import { dirPicutures, } from './dirStorage'


const { height, width, } = Dimensions.get('window')
const orientation = height > width ? 'Portrait' : 'Landscape'

// move the attachment to app folder
const moveAttachment = async (filePath, newFilepath) => new Promise((resolve, reject) => {
	RNFS.mkdir(dirPicutures)
		.then(() => {
			RNFS.moveFile(filePath, newFilepath)
				.then(() => {
					console.log('FILE MOVED', filePath, newFilepath)
					resolve(true)
				})
				.catch(error => {
					console.log('moveFile error', error)
					reject(error)
				})
		})
		.catch(err => {
			console.log('mkdir error', err)
			reject(err)
		})
})

class CameraScreen extends Component {
	constructor(props) {
		super(props)
		this.state = {
			orientation,
		}
	}

	componentWillMount() {
		Dimensions.addEventListener('change', this.handleOrientationChange)
	}

	componentWillUnmount() {
		Dimensions.removeEventListener('change', this.handleOrientationChange)
	}

	// ************************** Captur and Save Image *************************
	async saveImage(filePath) {
		try {
			// set new image name and filepath
			const newImageName = `${moment().format('DDMMYY_HHmmSSS')}.jpg`
			const newFilepath = `${dirPicutures}/${newImageName}`
			// move and save image to new filepath
			const imageMoved = await moveAttachment(filePath, newFilepath)
			console.log('image moved', imageMoved)
		} catch (error) {
			console.log(error)
		}
	}


	handleOrientationChange(dimensions) {
		const { height, width, } = dimensions.window
		const orientation = height > width ? 'Portrait' : 'Landscape'
		this.setState({ orientation, })
	}


	takePicture() {
		this.camera
			.capture()
			.then(data => {
			// data is an object with the file path
			// save the file to app  folder
				this.saveImage(data.path)
			})
			.catch(err => {
				console.error('capture picture error', err)
			})
	}

	render() {
		return (
			<View style={{ flex: 1, }}>
				<StatusBar barStyle="light-content" translucent />

				<Camera
					captureTarget={Camera.constants.CaptureTarget.disk}
					ref={cam => {
						this.camera = cam
					}}
					style={styles.container}
					aspect={Camera.constants.Aspect.fill}
					orientation="auto">
					<View
						style={
							this.state.orientation === 'Portrait' ? (
								styles.buttonContainerPortrait
							) : (
								styles.buttonContainerLandscape
							)
						}>
						<TouchableOpacity
							onPress={() => this.takePicture()}
							style={
								this.state.orientation === 'Portrait' ? (
									styles.buttonPortrait
								) : (
									styles.buttonLandscape
								)
							}>
							<Icon name="camera" style={{ fontSize: 40, color: 'white', }} />
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => this.props.navigation.goBack()}
							style={
								this.state.orientation === 'Portrait' ? (
									styles.buttonPortrait
								) : (
									styles.buttonLandscape
								)
							}>
							<Icon
								name="close-circle"
								style={{ fontSize: 40, color: 'white', }}
							/>
						</TouchableOpacity>
					</View>
				</Camera>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	buttonContainerPortrait: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		flexDirection: 'row',
		justifyContent: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.9)',
	},
	buttonContainerLandscape: {
		position: 'absolute',
		bottom: 0,
		top: 0,
		right: 0,
		flexDirection: 'column',
		justifyContent: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	buttonPortrait: {
		backgroundColor: 'transparent',
		padding: 5,
		marginHorizontal: 20,
	},
	buttonLandscape: {
		backgroundColor: 'transparent',
		padding: 5,
		marginVertical: 20,
	},
})

export default CameraScreen
