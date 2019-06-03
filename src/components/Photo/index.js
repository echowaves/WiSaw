import React, {
	Component,
} from 'react'

import { connect, } from 'react-redux'

import {
	Dimensions,
	View,
	TouchableOpacity,
	Alert,
	Keyboard,
} from 'react-native'

import { KeyboardAwareScrollView, } from 'react-native-keyboard-aware-scroll-view'

import {
	Icon,
	Spinner,
	Button,
	Container,
	Content, Card, CardItem, Text, Item, Input, Footer,
} from 'native-base'

import { Col, Row, Grid, } from "react-native-easy-grid"

import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView'

import FastImage from 'react-native-fast-image'


import PropTypes from 'prop-types'

import {
	likePhoto,
	sharePhoto,
	setInputText,
	submitComment,
	getComments,
	toggleCommentButtons,
	deleteComment,
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
		deleteComment: PropTypes.func.isRequired,
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
		this.intervalId = setInterval(() => { getComments({ item, }) }, 30000)
	}

	componentWillUnmount() {
		clearInterval(this.intervalId)
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

	renderCommentButtons({ photo, comment, }) {
		const {
			deleteComment,
		} = this.props

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
							() => {
								Alert.alert(
									'Delete Comment?',
									'The comment will be deleted from the cloud and will never be seeing again by anyone. Are you sure?',
									[
										{ text: 'No', onPress: () => null, style: 'cancel', },
										{
											text: 'Yes',
											onPress: () => {
												deleteComment({ photo, comment, })
											},
										},
									],
									{ cancelable: true, }
								)
							}
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
				<Row
					key={comment.id}
					style={{
						marginLeft: 5,
						marginRight: 15,
					}}>
					<Card
						style={{
							width: "100%",
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
								{this.renderCommentButtons({ photo: item, comment, })}
							</CardItem>
						</TouchableOpacity>
					</Card>
				</Row>
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
			<Container
				onLayout={this.onLayout.bind(this)}>
				<KeyboardAwareScrollView keyboardShouldPersistTaps="always">
					<Grid>
						<Row>
							<ReactNativeZoomableView
								maxZoom={3}
								minZoom={0.5}
								zoomStep={3}
								initialZoom={1}
								bindToBorders>
								<FastImage
									source={{
										uri: item.getImgUrl,
									}}
									onLoadEnd={() => this.setState({ loaded: true, })}
									style={{
										width,
										height: height - 200,
									}}
									backgroundColor="transparent"
									resizeMode={FastImage.resizeMode.contain}
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
										<FastImage
											source={{
												uri: item.getThumbUrl,
											}}
											style={{
												width,
												height: height - 200,
											}}
											backgroundColor="transparent"
											resizeMode={FastImage.resizeMode.contain}
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
							</ReactNativeZoomableView>
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
						{ item.comments && item.comments.length > 0
								&& (
									<Row style={{ marginTop: 5, }}>
										<Text style={{ marginLeft: 10, color: CONST.MAIN_COLOR, }}>{item.comments ? item.comments.length : 0} Comment{(item.comments ? item.comments.length : 0) !== 1 ? 's' : ''}</Text>
									</Row>
								)
						}
						{ item.comments && item.comments.length > 0
								&& (this.renderComments())
						}

						<Row>
							<Col
								style={{
									width: 50,
									alignItems: 'center',
									justifyContent: 'center',
								}}>
								<Text
									style={
										{
											fontSize: 10,
											color: CONST.MAIN_COLOR,
											textAlign: 'center',
											width: '100%',
										}
									}>
									{140 - inputText.length}
								</Text>
							</Col>
							<Col
								style={{
									alignItems: 'center',
									justifyContent: 'center',
								}}>
								<Item
									rounded>
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
							<Col
								style={{
									width: 50,
									alignItems: 'center',
									justifyContent: 'center',
								}}>
								<TouchableOpacity
									onPress={
										() => {
											submitComment({ inputText, item, })
										}
									}
									style={
										{
											backgroundColor: 'transparent',
										}
									}>
									<Icon
										type="MaterialIcons"
										name="send"
										style={
											{
												fontSize: 30,
												color: CONST.MAIN_COLOR,
											}
										}
									/>
								</TouchableOpacity>
							</Col>
						</Row>
					</Grid>
				</KeyboardAwareScrollView>
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
	deleteComment,
}

export default connect(mapStateToProps, mapDispatchToProps)(Photo)
