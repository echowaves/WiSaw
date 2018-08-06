import React, { Component, } from 'react'
import { createStackNavigator, } from 'react-navigation'

import HomeScreen from './src/components/home'
import FeedbackScreen from './src/components/feedback'

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
