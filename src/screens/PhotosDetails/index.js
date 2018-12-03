import React, { Component, } from 'react'

import PropTypes from 'prop-types'

import {
	StyleSheet,
} from 'react-native'

import { connect, } from 'react-redux'

import {
	Container,
	Icon,
} from 'native-base'

import Swiper from 'react-native-deck-swiper'

import Photo from '../../components/Photo'

import * as CONST from '../../consts.js'

class PhotosDetails extends Component {
	static navigationOptions = ({ navigation, }) => ({
		headerTitle: 'hear&now',
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
	}

	render() {
		const {
			photos,
		} = this.props

		return (
				<Swiper
					cards={photos}
					renderCard={item => <Photo item={item} />}
					containerStyle={styles.container}
					horizontalSwipe
					verticalSwipe={false}
					showSecondCard={false}
					stackSize={1}
					goBackToPreviousCardOnSwipeRight
					infinite
				/>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: CONST.SECONDARY_COLOR,
	},
})

const mapStateToProps = state => (
	{
		photos: state.photosList.photos,
	}
)


const mapDispatchToProps = {
	// listPhotos, // will be wrapped into a dispatch call
}

export default connect(mapStateToProps, mapDispatchToProps)(PhotosDetails)
