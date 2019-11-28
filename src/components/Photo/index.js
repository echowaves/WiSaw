import React, {
	Component,
} from 'react'

import { connect, } from 'react-redux'

import {
	Dimensions,
	View,
	TouchableOpacity,
	Alert,
} from 'react-native'

import {
	Icon,
	Spinner,
	Button,
	Container,
	Content, Card, CardItem, Text, Item, Input,
} from 'native-base'

import { Col, Row, Grid, } from "react-native-easy-grid"

import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView'

import FastImage from 'react-native-fast-image'


import PropTypes from 'prop-types'


import stringifyObject from 'stringify-object'
import jmespath from 'jmespath'

import {
	likePhoto,
	sharePhoto,
	setInputText,
	submitComment,
	getComments,
	getRecognitions,
	toggleCommentButtons,
	deleteComment,
} from './reducer'

import * as CONST from '../../consts.js'

class Photo extends Component {
	componentDidMount() {
		const {
			item,
			setInputText,
			getComments,
			getRecognitions,
		} = this.props
		setInputText({ inputText: '', })
		getComments({ item, })
		getRecognitions({ item, })

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

	renderRecognitions(recognition) {
		const labels = jmespath.search(recognition, "metaData.Labels[]")
		const textDetections = jmespath.search(recognition, "metaData.TextDetections[?Type=='LINE']")
		const moderationLabels = jmespath.search(recognition, "metaData.ModerationLabels[]")

		return (
			<View>
				{labels.length > 0 && (
					<View style={{ margin: 10, paddingBottom: 20, }}>
						<View align="center" style={{ fontWeight: "bold", }}>
							<Text>AI recognized tags:</Text>
						</View>
						<View align="center">
							{labels.map(label => (
								<View key={label.Name} style={{ fontSize: `${label.Confidence}%`, }}>
									<Text>{stringifyObject(label.Name).replace(/'/g, '')}</Text>
								</View>
							))}
						</View>
					</View>
				)}

				{textDetections.length > 0 && (
					<View style={{ margin: 10, paddingBottom: 20, }}>
						<View align="center" style={{ fontWeight: "bold", }}>
							<Text>AI recognized text:</Text>
						</View>
						<View align="center">
							{textDetections.map(text => (
								<View key={text.Id} style={{ fontSize: `${text.Confidence}%`, }}>
									<Text>{stringifyObject(text.DetectedText).replace(/'/g, '')}</Text>
								</View>
							))}
						</View>
					</View>
				)}


				{moderationLabels.length > 0 && (
					<View style={{ margin: 10, paddingBottom: 20, }}>
						<View align="center" style={{ fontWeight: "bold", color: 'red', }}>
							<Text>AI moderation tags:</Text>
						</View>
						<View align="center">
							{moderationLabels.map(label => (
								<View key={label.Name} style={{ fontSize: `${label.Confidence}%`, color: 'red', }}>
									<Text>{stringifyObject(label.Name).replace(/'/g, '')}</Text>
								</View>
							))}
						</View>
					</View>
				)}
			</View>
		)
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
			navigation,
		} = this.props
		const { width, height, } = Dimensions.get('window')
		// alert(JSON.stringify(navigation))
		return (
			<Container onLayout={this.onLayout.bind(this)}>
				<Content
					disableKBDismissScroll
					keyboardDismissMode="on-drag"
					keyboardShouldPersistTaps="always"
					enableOnAndroid>
					<Grid>
						<Row>
							<ReactNativeZoomableView
								maxZoom={3}
								minZoom={1}
								zoomStep={3}
								initialZoom={1}
								bindToBorders>

								<View
									style={{
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
											top: -50,
											bottom: 0,
											right: 0,
											left: 0,
										}}
										color={
											CONST.MAIN_COLOR
										}
									/>
								</View>
								<FastImage
									source={{
										uri: item.getImgUrl,
									}}
									style={{
										width,
										height: height - 200,
									}}
									backgroundColor="transparent"
									resizeMode={FastImage.resizeMode.contain}
								/>

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
								)}
						{ item.comments && item.comments.length > 0
								&& (this.renderComments())}
						<Row
							style={{
								paddingVertical: 20,
							}}>
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
											() => submitComment({ inputText, item, navigation, })
										}
									/>
								</Item>
							</Col>
							<Col
								style={{
									width: 50,
									alignItems: 'center',
									justifyContent: 'center',
									marginRight: 10,
								}}>
								<Button
									transparent
									iconLeft
									onPress={
										() => {
											submitComment({ inputText, item, navigation, })
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
								</Button>
							</Col>
						</Row>
						<Row>
							{ item.recognitions
								&& (this.renderRecognitions(item.recognitions))}
						</Row>
					</Grid>
				</Content>
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
	getRecognitions,
	toggleCommentButtons,
	deleteComment,
}

Photo.propTypes = {
	navigation: PropTypes.object.isRequired,
	item: PropTypes.object.isRequired,
	likes: PropTypes.array.isRequired,
	likePhoto: PropTypes.func.isRequired,
	sharePhoto: PropTypes.func.isRequired,
	setInputText: PropTypes.func.isRequired,
	inputText: PropTypes.string.isRequired,
	submitComment: PropTypes.func.isRequired,
	commentsSubmitting: PropTypes.bool.isRequired,
	getComments: PropTypes.func.isRequired,
	getRecognitions: PropTypes.func.isRequired,
	toggleCommentButtons: PropTypes.func.isRequired,
	deleteComment: PropTypes.func.isRequired,
}

Photo.defaultProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(Photo)
