import React, { Component, } from 'react'
import { View, Text, } from 'react-native'
import { Icon, } from 'react-native-elements'

class HomeScreen extends Component {
	static navigationOptions = ({ navigation, }) => ({
		headerTitle: 'hear&now',
		headerRight: (
			<Icon
				onPress={() => navigation.navigate('Feedback')}
				name="feedback"
				color="#00aced"
				containerStyle={{ marginRight: 10, }}
			/>
		),
		headerBackTitle: null,
	})


	render() {
		return (
			<View>
				<Text>
					HomeScreen 2
				</Text>
			</View>
		)
	}
}

export default HomeScreen
