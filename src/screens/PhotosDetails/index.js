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
} from 'native-base'

import Swiper from 'react-native-swiper'

import Photo from '../../components/Photo'

import {
	setCurrentPhotoIndex,
} from '../../components/Thumb/reducer'

import {
	banPhoto,
	deletePhoto,
} from '../../components/Photo/reducer'

import { getPhotos, } from '../PhotosList/reducer'

import * as CONST from '../../consts.js'

class PhotosDetails extends Component {
	static navigationOptions = ({
		navigation,
	}) => {
		const { params = {}, } = navigation.state
		return ({
			headerTitle: '',
			headerTintColor: CONST.MAIN_COLOR,
			headerRight: (
				<View style={{
					flex: 1,
					flexDirection: "row",
				}}>
					<Icon
						onPress={
							() => params.handleBan()
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
							() => params.handleDelete()
						}
						name="trash"
						type="FontAwesome"
						style={{ marginRight: 20, color: CONST.MAIN_COLOR, }}
					/>
				</View>
			),
			headerBackTitle: null,
		})
	}

	static propTypes = {
		navigation: PropTypes.object.isRequired,
		photos: PropTypes.array.isRequired,
		currentPhotoIndex: PropTypes.number.isRequired,
		setCurrentPhotoIndex: PropTypes.func.isRequired,
		banPhoto: PropTypes.func.isRequired,
		deletePhoto: PropTypes.func.isRequired,
		bans: PropTypes.array.isRequired,
		getPhotos: PropTypes.func.isRequired,
	}

	componentDidMount() {
		const {
			navigation,
		} = this.props
		navigation.setParams({ handleBan: () => (this.handleBan()), })
		navigation.setParams({ handleDelete: () => (this.handleDelete()), })
	}

	onLayout(e) {
		this.forceUpdate()
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

	render() {
		const {
			photos,
			currentPhotoIndex,
			setCurrentPhotoIndex,
			getPhotos,
		} = this.props
		return (
			<View style={styles.container} onLayout={this.onLayout.bind(this)}>
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
					onIndexChanged={index => {
						setCurrentPhotoIndex(index)
						if (currentPhotoIndex > photos.length - 5) {
							getPhotos() // pre-load more photos when nearing the end
						}
					}} // otherwise will jump to wrong photo onLayout
					loadMinimal
					loadMinimalSize={1}
					showsPagination={false}
					pagingEnabled>
					{photos.map(item => (
						<Photo item={item} key={item.id} />
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
		currentPhotoIndex: state.thumb.currentPhotoIndex,
		bans: state.photo.bans,
	}
)

const mapDispatchToProps = {
	setCurrentPhotoIndex, // will be wrapped into a dispatch call
	banPhoto,
	deletePhoto,
	getPhotos,
}

export default connect(mapStateToProps, mapDispatchToProps)(PhotosDetails)
