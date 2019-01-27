import React, {
	Component,
} from 'react'

import { connect, } from 'react-redux'

import {
	Dimensions,
	View,
	Image,
	TouchableOpacity,
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

import KeyboardSpacer from 'react-native-keyboard-spacer'

import PropTypes from 'prop-types'

import {
	likePhoto,
	sharePhoto,
	setInputText,
	submitComment,
	getComments,
	toggleCommentButtons,
} from './reducer'

import * as CONST from '../../consts.js'

class Photo extends Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
		likes: PropTypes.array.isRequired,
		likePhoto: PropTypes.func.isRequired,
		sharePhoto: PropTypes.func.isRequired,
		setInputText: PropTypes.func.isRequired,
		inputText: PropTypes.string.isRequired,
		submitComment: PropTypes.func.isRequired,
		commentsSubmitting: PropTypes.bool.isRequired,
		getComments: PropTypes.func.isRequired,
		toggleCommentButtons: PropTypes.func.isRequired,
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
		loaded: false, // this state is only used for loading photos
	}

	componentWillMount() {
		const {
			item,
			setInputText,
			getComments,
		} = this.props
		setInputText({ inputText: '', })
		getComments({ item, })
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

	renderCommentButtons({ comment, }) {
		if (!comment.hiddenButtons) {
			return (
				<View style={{
					flex: 1,
					flexDirection: 'row',
					position: 'absolute',
					bottom: 10,
					right: 10,

				}}>
					<Icon
						onPress={
							() => params.handleBan()
						}
						name="ban"
						type="FontAwesome"
						style={{
							color: CONST.MAIN_COLOR,
							marginRight: 10,
						}}
					/>
					<Icon
						onPress={
							() => params.handleDelete()
						}
						name="trash"
						type="FontAwesome"
						style={{
							color: CONST.MAIN_COLOR,
						}}
					/>
				</View>
			)
		}
		return <View />
	}

	renderComments() {
		const {
			item,
			toggleCommentButtons,
		} = this.props
		if (item.comments) {
			return item.comments.map((comment, i) => (
				<Card
					key={comment.id}
					style={{
						marginRight: 10,
						marginLeft: 10,
					}}>
					<TouchableOpacity
						onPress={
							() => {
								toggleCommentButtons({ photoId: item.id, commentId: comment.id, })
							}
						}>
						<CardItem>
							<Text
								style={{
									color: CONST.TEXT_COLOR,
								}}>{comment.comment}
							</Text>
							{this.renderCommentButtons({ comment, })}
						</CardItem>
					</TouchableOpacity>
				</Card>
			))
		}
	}

	render() {
		const {
			item,
			likePhoto,
			sharePhoto,
			setInputText,
			inputText,
			submitComment,
			commentsSubmitting,
		} = this.props

		const { width, height, } = Dimensions.get('window')

		return (
			<Container onLayout={this.onLayout.bind(this)}>
				<Content>
					<Grid>
						<Row style={{ height: height - 170, }}>
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
									height: height - 170,
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
											height: height - 170,
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
						<Row style={{ marginTop: 10, }}>
							<Text style={{ marginLeft: 10, color: CONST.MAIN_COLOR, }}>{item.commentsCount} Comment{item.commentsCount !== '1' ? 's' : ''}</Text>
						</Row>
						<Row style={{ height: 10, }} />
					</Grid>
					{this.renderComments()}
				</Content>
				<Footer style={{ marginTop: 5, }} keyboardShouldPersistTaps="always">
					<Col style={{ width: 50, justifyContent: 'center', }}>
						<Text style={
							{
								color: CONST.MAIN_COLOR,
								textAlign: 'center',
							}
						}>
							{140 - inputText.length}
						</Text>
					</Col>
					<Col>
						<Item rounded>
							<Input
								placeholder="any thoughts?"
								placeholderTextColor={CONST.PLACEHOLDER_TEXT_COLOR}
								style={
									{
										color: CONST.MAIN_COLOR,
									}
								}
								onChangeText={inputText => setInputText({ inputText, })}
								value={inputText}
								editable={!commentsSubmitting}
								onSubmitEditing={
									() => submitComment({ inputText, item, })
								}
							/>
						</Item>
					</Col>
				</Footer>
				<KeyboardSpacer />
			</Container>
		)
	}
}

const mapStateToProps = state => ({
	likes: state.photo.likes,
	inputText: state.photo.inputText,
	commentsSubmitting: state.photo.commentsSubmitting,
	error: state.photo.error,
})
const mapDispatchToProps = {
	likePhoto, // will be wrapped into a dispatch call
	sharePhoto,
	setInputText,
	submitComment,
	getComments,
	toggleCommentButtons,
}

export default connect(mapStateToProps, mapDispatchToProps)(Photo)
