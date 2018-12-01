import React, { Component, } from 'react'

import {
	StyleSheet,
	Dimensions,
} from 'react-native'

import {
	Card,
	CardItem,
} from 'native-base'

import Image from 'react-native-image-progress'
import Progress from 'react-native-progress/Bar'

import PropTypes from 'prop-types'

class Photo extends Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
	}

	constructor(props) {
		super(props)
	}

	onPhotoPress(item) {
		this.setState(previousState => (
			{ isExpanded: !previousState.isExpanded, }
		))
	}

	render() {
		const { item, } = this.props
		return (
			<Card style={{ elevation: 3, }}>
				<CardItem cardBody>
					<Image
						source={{ uri: item.getImgUrl, }}
						indicator={Progress}
						indicatorProps={{
							size: 80,
							borderWidth: 0,
							color: '#00aced',
							unfilledColor: 'rgba(200, 200, 200, 0.2)'
						}}
						style={{
							width: 320,
							height: 240,
						}}
					/>
				</CardItem>
			</Card>
		)
	}
}


// <ImageZoomable
// 	uri={item.getThumbUrl}
// 	uriHD={item.getImgUrl}
// />


// <ImageZoom
// 	cropWidth={Dimensions.get('window').width}
// 	cropHeight={Dimensions.get('window').height / 2}
// 	imageWidth={200}
// 	imageHeight={200}>
// 	<Image
// 		style={{ width: 200, height: 200, }}
// 		source={{ uri: item.getImgUrl, }}
// 	/>
// </ImageZoom>

const styles = StyleSheet.create({
	photo: {
		height: 400,
		width: null,

	},
})

export default Photo
