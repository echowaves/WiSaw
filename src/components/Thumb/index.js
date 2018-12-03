import React, { Component, } from 'react'

import {
	StyleSheet,
} from 'react-native'

import {
	Card,
	CardItem,
	Thumbnail,
} from 'native-base'

import PropTypes from 'prop-types'

class Thumb extends Component {
	static propTypes = {
		navigation: PropTypes.object.isRequired,
		item: PropTypes.object.isRequired,
	}

	constructor(props) {
		super(props)
	}

	onThumbPress(item) {
		const { navigation, } = 	this.props
		navigation.navigate('PhotosDetails')
	}

	render() {
		const { item, } = this.props
		return (
			<Card>
				<CardItem
					cardBody
					button
					onPress={() => this.onThumbPress(item)}>
					<Thumbnail
						square
						style={styles.thumbnail}
						source={{ uri: item.getThumbUrl, }}
					/>
				</CardItem>
			</Card>
		)
	}
}

const styles = StyleSheet.create({
	thumbnail: {
		width: 100,
		height: 100,
	},
})

export default Thumb
