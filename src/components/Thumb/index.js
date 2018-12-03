import React, { Component, } from 'react'
import { connect, } from 'react-redux'

import {
	StyleSheet,
} from 'react-native'

import {
	Card,
	CardItem,
	Thumbnail,
} from 'native-base'

import PropTypes from 'prop-types'
import { setCurrentPhotoIndex, } from './reducer'

class Thumb extends Component {
	static propTypes = {
		navigation: PropTypes.object.isRequired,
		setCurrentPhotoIndex: PropTypes.func.isRequired,
		item: PropTypes.object.isRequired,
		index: PropTypes.number.isRequired,
	}

	constructor(props) {
		super(props)
	}

	onThumbPress(item) {
		const { navigation, index, setCurrentPhotoIndex, } = this.props
		setCurrentPhotoIndex(index)
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

const mapStateToProps = null

const mapDispatchToProps = {
	setCurrentPhotoIndex, // will be wrapped into a dispatch call
}

export default connect(mapStateToProps, mapDispatchToProps)(Thumb)
