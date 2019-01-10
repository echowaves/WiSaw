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
} from 'native-base'

import PropTypes from 'prop-types'

import {
	connect,
} from 'react-redux'

import * as CONST from '../../consts.js'


import {
	submitFeedback,
	setFeedbackText,
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
		submitFeedback: PropTypes.func.isRequired,
		setFeedbackText: PropTypes.func.isRequired,
	}

	componentDidMount() {
		const {
			navigation,
		} = this.props
		navigation.setParams({ handleSubmit: () => (this.handleSubmit()), })
	}

	async handleSubmit() {
		const {
			feedbackText,
			submitFeedback,
		} = this.props
		submitFeedback({ feedbackText, })
	}

	render() {
		const {
			setFeedbackText,
			loading,
			errorMessage,
		} = this.props

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
						/>
					</Form>
				</Content>
				{ loading && (
					<Spinner color={
						CONST.MAIN_COLOR
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
})

const mapDispatchToProps = {
	// will be wrapped into a dispatch call
	setFeedbackText,
	submitFeedback,
}

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackScreen)
