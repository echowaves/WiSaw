import React, { Component, } from 'react'
import { View, Text, } from 'react-native'

class HomeScreen extends Component {
	static navigationOptions = {
		title: 'hear&now',
	}

	render() {
		return (
			<View>
				<Text>
					HomeScreen
				</Text>
			</View>
		)
	}
}

export default HomeScreen
