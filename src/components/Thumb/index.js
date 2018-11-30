import React, { Component, } from 'react'
import PropTypes from 'prop-types'

import {
	StyleSheet,
} from 'react-native'

import {
	Card,
	CardItem,
	Thumbnail,
} from 'native-base'


class Photo extends Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
	}

	constructor(props) {
		super(props)
	}

	// componentWillUpdate() {
	// 	LayoutAnimation.spring()
	// }

	onPhotoPress(item) {
		this.setState(previousState => (
			{ isExpanded: !previousState.isExpanded, }
		))
	}

	render() {
		const { item, } = this.props
		return (
			<Card>
				<CardItem
					cardBody
					button
					onPress={() => this.onPhotoPress(item)}>
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

export default Photo
