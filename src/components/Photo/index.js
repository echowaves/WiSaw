import React, {
	Component,
} from 'react'

import {
	Dimensions,
	View,
} from 'react-native'

// import Image from 'react-native-image-progress'
import PhotoView from 'react-native-photo-view'

import Progress from 'react-native-progress/Bar'

import PropTypes from 'prop-types'

import * as CONST from '../../consts.js'


class Photo extends Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
	}

	state = {
		loaded: false,
	}

	render() {
		const { item, } = this.props
		const { width, height, } = Dimensions.get('window')


		return (
			<View>
				<PhotoView
					source={{
						uri: item.getImgUrl,
					}}
					onLoadEnd={() => this.setState({ loaded: true, })}

					minimumZoomScale={1}
					maximumZoomScale={5}
					androidScaleType="fitCenter"
					style={{
						width,
						height,
					}}
					backgroundColor="transparent"
				/>
				{!this.state.loaded && ( // eslint-disable-line react/destructuring-assignment
					<PhotoView
						source={{
							uri: item.getThumbUrl,
						}}
						minimumZoomScale={1}
						maximumZoomScale={5}
						androidScaleType="fitCenter"
						style={{
							width,
							height,
							position: 'absolute',
						}}
						backgroundColor="transparent"
					/>
				)}
			</View>
		)
	}
}

export default Photo
