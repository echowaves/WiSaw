import React, { Component, } from 'react'
import { createStackNavigator, } from 'react-navigation'

import PhotosList from './src/components/PhotosList'
import FeedbackScreen from './src/components/feedback'

const RootStack = createStackNavigator({
	PhotosList: {
		screen: PhotosList,
	},
	Feedback: {
		screen: FeedbackScreen,
	},
},
{
	initialRouteName: 'PhotosList',
})

export default class App extends Component {
	render() {
		return <RootStack />
	}
}
