import React, { Component, } from 'react'

import PropTypes from 'prop-types'

import {
	StyleSheet,
	View,
	Text,
} from 'react-native'

import { connect, } from 'react-redux'

import {
	Icon,
} from 'native-base'

import Swiper from 'react-native-swiper'

import Photo from '../../components/Photo'

import * as CONST from '../../consts.js'

class PhotosDetails extends Component {
	static navigationOptions = ({ navigation, }) => ({
		headerTitle: 'hear&now',
		headerTintColor: CONST.MAIN_COLOR,
		headerRight: (
			<Icon
				onPress={() => navigation.navigate('Feedback')}
				name="feedback"
				type="MaterialIcons"
				style={{ marginRight: 10, color: CONST.MAIN_COLOR, }}
			/>
		),
		headerBackTitle: null,
	})

	static propTypes = {
		photos: PropTypes.array.isRequired,
		currentPhotoIndex: PropTypes.number.isRequired,
	}

	render() {
		const {
			photos,
			currentPhotoIndex,
		} = this.props

		return (
			<View style={styles.container}>
				<Swiper
					autoplay={false}
					horizontal
					loop={false}
					showsButtons
					nextButton={<Text style={{ color: CONST.MAIN_COLOR, fontSize: 60, }}>›</Text>}
					prevButton={<Text style={{ color: CONST.MAIN_COLOR, fontSize: 60, }}>‹</Text>}
					index={currentPhotoIndex}
					loadMinimal
					loadMinimalSize={1}
					showsPagination={false}
					pagingEnabled>
					{photos.map((item, key) => (
						<Photo item={item} key={key} />
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
	}
)


const mapDispatchToProps = {
	// listPhotos, // will be wrapped into a dispatch call
}

export default connect(mapStateToProps, mapDispatchToProps)(PhotosDetails)
