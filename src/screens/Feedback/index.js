import React, { Component, } from 'react'
import {
	Text,
} from 'react-native'

import {
	Icon,
	Container,
	Content,
	Spinner,
	Form,
	Textarea,
	Item,
	Body,
	Card,
	CardItem,
	Button,
} from 'native-base'

import Modal from "react-native-modal"

import PropTypes from 'prop-types'

import {
	connect,
} from 'react-redux'

import * as CONST from '../../consts.js'


import {
	submitFeedback,
	setFeedbackText,
	resetForm,
} from './reducer'

class FeedbackScreen extends Component {
	static navigationOptions = ({
		navigation,
	}) => {
		const { params = {}, } = navigation.state
		return ({
			headerTitle: 'feedback form',
			headerTintColor: CONST.MAIN_COLOR,
			headerRight: (
				<Icon
					onPress={
						() => params.handleSubmit()
					}
					name="send"
					type="MaterialIcons"
					style={
						{
							marginRight: 10,
							color: CONST.MAIN_COLOR,
						}
					}
				/>
			),
			headerBackTitle: null,
		})
	}

	static propTypes = {
		navigation: PropTypes.object.isRequired,
		feedbackText: PropTypes.string.isRequired,
		errorMessage: PropTypes.string.isRequired,
		loading: PropTypes.bool.isRequired,
		finished: PropTypes.bool.isRequired,
		submitFeedback: PropTypes.func.isRequired,
		setFeedbackText: PropTypes.func.isRequired,
		resetForm: PropTypes.func.isRequired,
	}

	componentDidMount() {
		const {
			navigation,
		} = this.props
		navigation.setParams({ handleSubmit: () => (this.handleSubmit()), })
	}

	handleSubmit() {
		const {
			feedbackText,
			submitFeedback,
		} = this.props
		submitFeedback({ feedbackText, })
	}

	render() {
		const {
			navigation,
			setFeedbackText,
			loading,
			errorMessage,
			finished,
			resetForm,
		} = this.props

		if (finished && errorMessage.length === 0) {
			return (
				<Container>
					<Content padder>
						<Body>
							<Modal isVisible>
								<Content padder>
									<Card transparent>
										<CardItem style={{ borderRadius: 10, }}>
											<Text>Thank you for submitting your feedback.
											</Text>
										</CardItem>
										<CardItem footer style={{ borderRadius: 10, }}>
											<Body>
												<Button
													block
													bordered
													success
													small
													onPress={
														() => {
															navigation.goBack()
															resetForm()
														}
													}>
													<Text> You are Welcome! </Text>
												</Button>
											</Body>
										</CardItem>
									</Card>
								</Content>
							</Modal>
						</Body>
					</Content>
				</Container>
			)
		}
		return (
			<Container>
				<Content padder>
					{ errorMessage.length !== 0 && (
						<Item error>
							<Text>{errorMessage}</Text>
							<Icon name="close-circle" />
						</Item>
					)}
					<Form>
						<Textarea
							rowSpan={5}
							bordered
							onChangeText={feedbackText => setFeedbackText({ feedbackText, })}
							placeholder="Type your feedback here and click send."
							placeholderTextColor={CONST.PLACEHOLDER_TEXT_COLOR}
							style={
								{
									color: CONST.MAIN_COLOR,
								}
							}
						/>
					</Form>
				</Content>
				{ loading && (
					<Spinner
						color={
							CONST.MAIN_COLOR
						}
						style={
							{
								flex: 1,
								position: 'absolute',
								top: 0,
								bottom: 0,
								right: 0,
								left: 0,
							}
						}
					/>
				)}
			</Container>
		)
	}
}


const mapStateToProps = state => ({
	feedbackText: state.feedback.feedbackText,
	loading: state.feedback.loading,
	errorMessage: state.feedback.errorMessage,
	finished: state.feedback.finished,
})

const mapDispatchToProps = {
	// will be wrapped into a dispatch call
	setFeedbackText,
	submitFeedback,
	resetForm,
}

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackScreen)
