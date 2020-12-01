import React, { Component, } from 'react'

import PropTypes from 'prop-types'

import {
	StyleSheet,
	View,
	Text,
	Alert,
} from 'react-native'

import { connect, } from 'react-redux'

import {
	Icon,
	Button,
} from 'native-base'

import Swiper from 'react-native-swiper'

import Photo from '../../components/Photo'

import {
	setCurrentPhotoIndex,
} from '../../components/Thumb/reducer'

import {
	banPhoto,
	deletePhoto,
	watchPhoto,
	unwatchPhoto,
	checkIsPhotoWatched,
} from '../../components/Photo/reducer'

import { getPhotos, } from '../PhotosList/reducer'

import * as CONST from '../../consts.js'

class PhotosDetails extends Component {
	static navigationOptions = ({
		navigation,
	}) => ({
		headerTintColor: CONST.MAIN_COLOR,
		headerTitle: () => navigation.getParam('headerTitle'),
		headerLeft: () => navigation.getParam('headerLeft'),
		headerRight: () => navigation.getParam('headerRight'),
		headerBackTitle: null,
	})

	componentDidMount() {
		const {
			navigation,
			currentPhotoIndex,
			photos,
			checkIsPhotoWatched,
		} = this.props

		navigation.setParams({
			handleBan: () => (this.handleBan()),
			handleDelete: () => (this.handleDelete()),
			handleFlipWatch: () => (this.handleFlipWatch()),
			headerTitle: () => (this.renderHeaderTitle()),
			headerLeft: () => (this.renderHeaderLeft()),
			headerRight: () => (this.renderHeaderRight()),
		})

		checkIsPhotoWatched({ item: photos[currentPhotoIndex], navigation, })
	}

	isPhotoBannedByMe({ photoId, }) {
		const {
			bans,
		} = this.props
		return bans.includes(photoId)
	}

	handleBan() {
		const {
			photos,
			currentPhotoIndex,
			banPhoto,
		} = this.props
		const item = photos[currentPhotoIndex]
		if (this.isPhotoBannedByMe({ photoId: item.id, })) {
			Alert.alert(
				'Looks like you already reported this Photo',
				'You can only report same Photo once.',
				[
					{ text: 'OK', onPress: () => null, },
				],
			)
		} else {
			Alert.alert(
				'Report abusive Photo?',
				'The user who posted this photo will be banned. Are you sure?',
				[
					{ text: 'No', onPress: () => null, style: 'cancel', },
					{ text: 'Yes', onPress: () => banPhoto({ item, }), },
				],
				{ cancelable: true, }
			)
		}
	}

	handleDelete() {
		const {
			// navigation,
			photos,
			currentPhotoIndex,
			deletePhoto,
		} = this.props
		const item = photos[currentPhotoIndex]

		Alert.alert(
			'Delete Photo?',
			'The photo will be deleted from the cloud and will never be seeing again by anyone. Are you sure?',
			[
				{ text: 'No', onPress: () => null, style: 'cancel', },
				{
					text: 'Yes',
					onPress: () => {
						deletePhoto({ item, })
						// navigation.goBack()
					},
				},
			],
			{ cancelable: true, }
		)
	}

	handleFlipWatch() {
		const {
			navigation,
			photos,
			currentPhotoIndex,
			watchPhoto,
			unwatchPhoto,
			watched,
		} = this.props
		const item = photos[currentPhotoIndex]
		if (watched) {
			navigation.setParams({ watched: false, })
			unwatchPhoto({ item, navigation, })
		} else {
			navigation.setParams({ watched: true, })
			watchPhoto({ item, navigation, })
		}
	}

	renderHeaderLeft() {
		const {
			navigation,
		} = this.props
		return (
			<View style={{
				flex: 1,
				flexDirection: "row",
			}}>
				<Button
					onPress={
						() => navigation.goBack()
					}
					style={{
						backgroundColor: '#ffffff',
					}}>
					<Icon
						name="chevron-left"
						type="FontAwesome"
						style={{
							color: CONST.MAIN_COLOR,
						}}
					/>
				</Button>
				<Button
					onPress={
						navigation.getParam('handleFlipWatch')
					}
					style={{
						backgroundColor: '#ffffff',
					}}>
					<Icon
						name={navigation.getParam('watched') ? "eye" : "eye-slash"}
						type="FontAwesome"
						style={{ color: CONST.MAIN_COLOR, }}
					/>
				</Button>
			</View>
		)
	}

	renderHeaderRight() {
		const {
			navigation,
		} = this.props
		return (!navigation.getParam('watched') && (
			<View style={{
				flex: 1,
				flexDirection: "row",
			}}>
				<Icon
					onPress={
						navigation.getParam('handleBan')
					}
					name="ban"
					type="FontAwesome"
					style={{
						marginRight: 20,
						color: CONST.MAIN_COLOR,
					}}
				/>
				<Icon
					onPress={
						navigation.getParam('handleDelete')
					}
					name="trash"
					type="FontAwesome"
					style={{ marginRight: 20, color: CONST.MAIN_COLOR, }}
				/>
			</View>
		))
	}

	renderHeaderTitle() {
		const {
			activeSegment,
			searchTerm,
		} = this.props

		if (searchTerm !== null) {
			return (
				<Text style={{ color: CONST.SECONDARY_COLOR, }}>
					{searchTerm}
				</Text>
			)
		} if (activeSegment === 0) {
			return (<Icon name="globe" type="FontAwesome" style={{ color: CONST.SECONDARY_COLOR, }} />)
		}
		return (<Icon name="eye" type="FontAwesome" style={{ color: CONST.SECONDARY_COLOR, }} />)
	}

	render() {
		const {
			navigation,
			photos,
			currentPhotoIndex,
			setCurrentPhotoIndex,
			getPhotos,
			batch,
			checkIsPhotoWatched,
		} = this.props

		return (
			<View style={styles.container}>
				<Swiper
					keyboardShouldPersistTaps="always"
					autoplay={false}
					horizontal
					loop={false}
					showsButtons
					buttonWrapperStyle={{
						backgroundColor: 'transparent',
						flexDirection: 'row',
						position: 'absolute',
						top: 0,
						left: 0,
						flex: 1,
						paddingHorizontal: 10,
						paddingVertical: 10,
						justifyContent: 'space-between',
						alignItems: 'baseline',
					}}
					nextButton={<Text style={{ color: CONST.MAIN_COLOR, fontSize: 60, }}>›</Text>}
					prevButton={<Text style={{ color: CONST.MAIN_COLOR, fontSize: 60, }}>‹</Text>}
					index={currentPhotoIndex}
					onIndexChanged={async index => {
						navigation.setParams({
							headerTitle: () => (this.renderHeaderTitle()),
							headerLeft: () => (this.renderHeaderLeft()),
							headerRight: () => (this.renderHeaderRight()),
						})
						// navigation.setParams({
						// 	headerTitle: null,
						// 	headerLeft: null,
						// 	headerRight: null,
						// })
						setCurrentPhotoIndex(index)
						await checkIsPhotoWatched({ item: photos[index], navigation, })
						// navigation.setParams({
						// 	headerTitle: () => (this.renderHeaderTitle()),
						// 	headerLeft: () => (this.renderHeaderLeft()),
						// 	headerRight: () => (this.renderHeaderRight()),
						// })
						if (currentPhotoIndex > photos.length - 5) {
							getPhotos(batch) // pre-load more photos when nearing the end
						}
					}} // otherwise will jump to wrong photo onLayout
					loadMinimal
					loadMinimalSize={1}
					showsPagination={false}
					pagingEnabled>
					{photos.map(item => (
						<Photo item={item} key={item.id} navigation={navigation} />
					))}
				</Swiper>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
})

const mapStateToProps = state => (
	{
		photos: state.photosList.photos,
		batch: state.photosList.batch,
		currentPhotoIndex: state.thumb.currentPhotoIndex,
		bans: state.photo.bans,
		watched: state.photo.watched,
		searchTerm: state.photosList.searchTerm,
		activeSegment: state.photosList.activeSegment,
	}
)

const mapDispatchToProps = {
	setCurrentPhotoIndex, // will be wrapped into a dispatch call
	banPhoto,
	deletePhoto,
	getPhotos,
	watchPhoto,
	unwatchPhoto,
	checkIsPhotoWatched,
}

PhotosDetails.defaultProps = {
	searchTerm: null,
}

PhotosDetails.propTypes = {
	navigation: PropTypes.object.isRequired,
	photos: PropTypes.array.isRequired,
	batch: PropTypes.number.isRequired,
	currentPhotoIndex: PropTypes.number.isRequired,
	setCurrentPhotoIndex: PropTypes.func.isRequired,
	watched: PropTypes.bool.isRequired,
	banPhoto: PropTypes.func.isRequired,
	deletePhoto: PropTypes.func.isRequired,
	bans: PropTypes.array.isRequired,
	getPhotos: PropTypes.func.isRequired,
	watchPhoto: PropTypes.func.isRequired,
	unwatchPhoto: PropTypes.func.isRequired,
	checkIsPhotoWatched: PropTypes.func.isRequired,
	searchTerm: PropTypes.string,
	activeSegment: PropTypes.number.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(PhotosDetails)
