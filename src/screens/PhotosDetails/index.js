import React, { Component, } from 'react'

import PropTypes from 'prop-types'

import {
	StyleSheet,
} from 'react-native'

import { connect, } from 'react-redux'

import {
	Container,
	Content,
	Icon,
} from 'native-base'

import Swiper from 'react-native-deck-swiper'

import Photo from '../../components/Photo'

class PhotosDetails extends Component {
	static navigationOptions = ({ navigation, }) => ({
		headerTitle: 'hear&now',
		headerRight: (
			<Icon
				onPress={() => navigation.navigate('Feedback')}
				name="feedback"
				type="MaterialIcons"
				style={{ marginRight: 10, color: "#00aced", }}
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
			<Container>
				<Swiper
					cards={photos}
					renderCard={item => <Photo item={item} />}
					containerStyle={styles.container}
				/>
			</Container>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F5FCFF",
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
