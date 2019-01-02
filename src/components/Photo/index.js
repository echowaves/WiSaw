import React, {
	Component,
} from 'react'

import {
	Dimensions,
	View,
} from 'react-native'

import Image from 'react-native-image-progress'

import Progress from 'react-native-progress/Bar'

import PropTypes from 'prop-types'

import * as CONST from '../../consts.js'


class Photo extends Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
	}

	state = {
		imgWidth: 0,
		imgHeight: 0,
	}

	componentDidMount() {
		const { item, } = this.props

		Image.getSize(item.getImgUrl, (width, height) => {
			// calculate image width and height
			const screenWidth = Dimensions.get('window').width
			const scaleFactor = width / screenWidth
			const imageHeight = height / scaleFactor

			this.setState({ imgWidth: screenWidth, imgHeight: imageHeight, })
		})
	}

	onPhotoPress(item) {
		this.setState(previousState => (
			{ isExpanded: !previousState.isExpanded, }
		))
	}

	render() {
		const { item, } = this.props
		const { imgWidth, imgHeight, } = this.state

		return (
			<View>
				<Image
					source={{ uri: item.getThumbUrl, }}
					indicator={Progress}
					indicatorProps={{
						color: CONST.MAIN_COLOR,
						unfilledColor: CONST.UNFILLED_COLOR,
					}}
					style={{
						position: 'absolute',
						width: imgWidth,
						height: imgHeight,
					}}
				/>
				<Image
					source={{ uri: item.getImgUrl, }}
					indicator={Progress}
					indicatorProps={{
						color: CONST.MAIN_COLOR,
						unfilledColor: CONST.UNFILLED_COLOR,
					}}
					style={{
						width: imgWidth,
						height: imgHeight,
					}}
				/>
			</View>
		)
	}
}

export default Photo
