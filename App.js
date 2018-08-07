import React, { Component, } from 'react'
import { createStackNavigator, } from 'react-navigation'
import { createStore, applyMiddleware, } from 'redux'
import { Provider, } from 'react-redux'
import axios from 'axios'
import axiosMiddleware from 'redux-axios-middleware'

import wisawApp from './src'

import PhotosList from './src/screens/PhotosList'
import FeedbackScreen from './src/screens/Feedback'

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

const client = axios.create({
	baseURL: 'https://api.github.com',
	responseType: 'json',
})

const store = createStore(wisawApp, applyMiddleware(axiosMiddleware(client)))

export default class App extends Component {
	render() {
		return (
			<Provider store={store}>
				<RootStack />
			</Provider>
		)
	}
}
