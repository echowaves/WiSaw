import React, {
	Component,
} from 'react'

import {
	Dimensions,
	View,
	TouchableOpacity,
	Image,
} from 'react-native'

import {
	Icon,
	Spinner,
} from 'native-base'

import PhotoView from 'react-native-photo-view-ex'

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
			<View style={{ flex: 1, }}>
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
				{ !this.state.loaded && ( // eslint-disable-line react/destructuring-assignment
					<View style={{
						flex: 1,
						position: 'absolute',
						top: 0,
						bottom: 0,
						right: 0,
						left: 0,
					}}>
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
							}}
							backgroundColor="transparent"
						/>
						<Spinner
							style={{
								flex: 1,
								width,
								height,
								position: 'absolute',
								top: 0,
								bottom: 0,
								right: 0,
								left: 0,
							}}
							color={
								CONST.MAIN_COLOR
							}
						/>
					</View>
				)}
			</View>
		)
	}
}

export default Photo
