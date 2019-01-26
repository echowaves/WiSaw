import React, {
	Component,
} from 'react'

import { connect, } from 'react-redux'

import {
	Dimensions,
	View,
	Image,
} from 'react-native'

import {
	Icon,
	Spinner,
	Button,
	Container,
	Header, Content, Card, CardItem, Body, Text, Item, Input, Footer,
} from 'native-base'

import { Col, Row, Grid, } from "react-native-easy-grid"

import PhotoView from 'react-native-photo-view-ex'

import PropTypes from 'prop-types'

import {
	likePhoto,
	sharePhoto,
} from './reducer'

import * as CONST from '../../consts.js'

class Photo extends Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
		likes: PropTypes.array.isRequired,
		likePhoto: PropTypes.func.isRequired,
		sharePhoto: PropTypes.func.isRequired,
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
		width: 0,
		height: 0,
	}

	// componentWillMount() {
	// 	const {
	// 		item,
	// 	} = this.props
	// 	Image.getSize(item.getImgUrl, (width, height) => { this.setState({ width, height, }) })
	// }

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
			sharePhoto,
		} = this.props
		// const { width, height, } = this.state
		const { width, height, } = Dimensions.get('window')

		return (
			<Container onLayout={this.onLayout.bind(this)}>
				<Content>
					<Grid>
						<Row style={{ height: height - 100, }}>
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
									height: height - 100,
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
											height: height - 100,
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
									onPress={
										() => {
											sharePhoto({ item, })
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
						</Row>
						<Row style={{ height: 10, }} />
						<Row>
							<Col style={{ width: 50, justifyContent: 'center', }}>
								<Text style={
									{
										color: CONST.MAIN_COLOR,
										textAlign: 'center',
									}
								}>140
								</Text>
							</Col>
							<Col>
								<Item rounded>
									<Input placeholder="any thoughts?" />
								</Item>
							</Col>
							<Col style={{ width: 50, }}>
								<Icon
									onPress={
										() => params.handleSubmit()
									}
									name="send"
									type="MaterialIcons"
									style={
										{
											margin: 10,
											color: CONST.MAIN_COLOR,
										}
									}
								/>
							</Col>
						</Row>
					</Grid>
				</Content>
			</Container>
		)
	}
}


const mapStateToProps = state => ({
	likes: state.photo.likes,
})
const mapDispatchToProps = {
	likePhoto, // will be wrapped into a dispatch call
	sharePhoto,
}

export default connect(mapStateToProps, mapDispatchToProps)(Photo)
