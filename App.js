import React, { Component, } from 'react'
import { StyleSheet, View, } from 'react-native'
import { createStackNavigator, } from 'react-navigation'
import { createStore, applyMiddleware, compose, } from 'redux'
import { Provider, } from 'react-redux'
import ReduxThunk from 'redux-thunk'

import reducers from './src'

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

let composeEnhancers = compose
/* eslint no-undef: */
if (__DEV__) {
	composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
}
const store = createStore(reducers, composeEnhancers(), applyMiddleware(ReduxThunk))

export default class App extends Component {
	render() {
		return (
			<Provider store={store}>
				<View style={styles.container}>
					<RootStack />
				</View>
			</Provider>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
})
