import React, { Component, } from 'react'
import { View, Text, } from 'react-native'
import * as CONST from '../../consts.js'

class FeedbackScreen extends Component {
	static navigationOptions = ({ navigation, }) => ({
		headerTintColor: CONST.MAIN_COLOR,
	})

	render() {
		return (
			<View>
				<Text>
					FeedbackScreen 2
				</Text>
			</View>
		)
	}
}

export default FeedbackScreen
