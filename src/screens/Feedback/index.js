import React, { Component, } from 'react'
import { View, Text, } from 'react-native'

import {
	Icon,
	Container,
	Content,
	Spinner,
	Form,
	Textarea,
} from 'native-base'

import PropTypes from 'prop-types'

import * as CONST from '../../consts.js'


import {
	submitFeedback,
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
	}

	componentDidMount() {
		const {
			navigation,
		} = this.props
		navigation.setParams({ handleSubmit: () => (this.handleSubmit()), })
	}

	async handleSubmit() {
		const {
			resetState,
			getPhotos,
			uploadPendingPhotos,
		} = this.props
	}

	render() {
		return (
			<Container>
				<Content padder>
					<Form>
						<Textarea rowSpan={5} bordered placeholder="Type your feedback here and click send." />
					</Form>
				</Content>
			</Container>
		)
	}
}

export default FeedbackScreen
