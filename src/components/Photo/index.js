import React, {
	Component,
} from 'react'

import {
	Dimensions,
	View,
	Text,
} from 'react-native'

import {
	Icon,
	Spinner,
	Button,
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

				<View style={{
					flex: 2,
					flexDirection: 'row',
					justifyContent: 'space-around',
					width,
					hieght: 100,
					position: 'absolute',
					bottom: 20,

				}}>
					<Button
						rounded
						light
						transparent
						bordered
						style={
							{
								height: 85,
								width: 85,
								backgroundColor: CONST.TRANSPARENT_BUTTON_COLOR,
							}
						}>
						<Icon
							type="FontAwesome"
							name="thumbs-up"
							style={
								{
									fontSize: 50,
									color: CONST.MAIN_COLOR,
								}
							}
						/>
						<Text
							style={
								{
									fontSize: 12,
									color: CONST.SECONDARY_COLOR,
									position: 'absolute',
									right: 0,
									top: "55%",
									textAlign: 'center',
									width: '100%',
								}
							}>
							{item.likes}
						</Text>
					</Button>
					<Button
						rounded
						light
						transparent
						bordered
						style={
							{
								height: 85,
								width: 85,
								backgroundColor: CONST.TRANSPARENT_BUTTON_COLOR,
							}
						}>
						<Icon
							type="FontAwesome"
							name="share"
							style={
								{
									fontSize: 50,
									color: CONST.MAIN_COLOR,
								}
							}
						/>
					</Button>
				</View>
			</View>
		)
	}
}

export default Photo
