import React, {
	Component,
} from 'react'

import { connect, } from 'react-redux'

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

import {
	likePhoto,
} from './reducer'

import * as CONST from '../../consts.js'

class Photo extends Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
		likes: PropTypes.array.isRequired,
		likePhoto: PropTypes.func.isRequired,
	}

	static navigationOptions = {
		drawerLabel: 'Home',
		drawerIcon: ({ tintColor, }) => (
			<Icon
				type="FontAwesome"
				name="bars"
				style={
					{
						color: CONST.MAIN_COLOR,
					}
				}
			/>
		),
	};

	static defaultProps = {}

	state = {
		loaded: false,
	}

	onLayout(e) {
		this.forceUpdate()
	}

	isPhotoLikedByMe({ photoId, }) {
		const {
			likes,
		} = this.props
		return likes.includes(photoId)
	}

	render() {
		const {
			item,
			likePhoto,
		} = this.props
		const { width, height, } = Dimensions.get('window')

		return (
			<View style={{ flex: 1, }} onLayout={this.onLayout.bind(this)}>
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
						disabled={this.isPhotoLikedByMe({ photoId: item.id, })}
						onPress={
							() => {
								likePhoto({ photoId: item.id, })
							}
						}
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
									color: (this.isPhotoLikedByMe({ photoId: item.id, }) ? CONST.SECONDARY_COLOR : CONST.MAIN_COLOR),
								}
							}
						/>
						<Text
							style={
								{
									fontSize: 12,
									color: (!this.isPhotoLikedByMe({ photoId: item.id, }) ? CONST.SECONDARY_COLOR : CONST.MAIN_COLOR),
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


const mapStateToProps = state => ({
	likes: state.photo.likes,
})
const mapDispatchToProps = {
	likePhoto, // will be wrapped into a dispatch call
}

export default connect(mapStateToProps, mapDispatchToProps)(Photo)
