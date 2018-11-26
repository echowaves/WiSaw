import React, { Component, } from 'react'
import PropTypes from 'prop-types'

import {
	StyleSheet,
	Dimensions,
} from 'react-native'

import {
	Card,
	CardItem,
	Thumbnail,
} from 'native-base'

const WIDTH = Dimensions.get('window').width
const HEIGHT = Dimensions.get('window').height

class Photo extends Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
	}

	onPhotoPress(item) {
	}

	render() {
		const { item, } = this.props

		return (
			<Card>
				<CardItem
					cardBody
					button
					onPress={() => this.onPhotoPress(item.item)}>
					<Thumbnail
						square
						style={styles.thumbnail}
						source={{ uri: item.item.getThumbUrl, }}
					/>
				</CardItem>
			</Card>
		)
	}
}

const styles = StyleSheet.create({
	thumbnail: {
		width: WIDTH / 3,
		height: WIDTH / 3,
		resizeMode: 'cover',
	},
	fullSizeImage: {
		width: "100%",
		height: HEIGHT,
		resizeMode: 'contain',
	},
})

export default Photo
