import React, { Component, } from 'react'
import { createStackNavigator, } from 'react-navigation'

import HomeScreen from './src/screens/HomeScreen'
import FeedbackScreen from './src/screens/FeedbackScreen'

const RootStack = createStackNavigator({
	Home: {
		screen: HomeScreen,
	},
	Feedback: {
		screen: FeedbackScreen,
	},
},
{
	initialRouteName: 'Home',
})

export default class App extends Component {
	render() {
		return <RootStack />
	}
}
