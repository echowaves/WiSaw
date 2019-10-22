import 'react-native-gesture-handler' // keep this line to prevent crashes

import { Root, } from 'native-base'
import React, { Component, } from 'react'
import { StyleSheet, View, } from 'react-native'
import { createAppContainer, } from "react-navigation"
import { createStackNavigator, } from 'react-navigation-stack'
// import createNativeStackNavigator from 'react-native-screens/createNativeStackNavigator'


import { createStore, applyMiddleware, compose, } from 'redux'
import { Provider, } from 'react-redux'
import ReduxThunk from 'redux-thunk'

// import { enableScreens, } from 'react-native-screens'
import reducers from './src'

import PhotosList from './src/screens/PhotosList'
import PhotosDetails from './src/screens/PhotosDetails'
import SharedPhoto from './src/screens/SharedPhoto'
import FeedbackScreen from './src/screens/Feedback'
import Camera from './src/screens/Camera'

// enableScreens()

const AppNavigator = createStackNavigator({
	PhotosList: {
		screen: PhotosList,
	},
	PhotosDetails: {
		screen: PhotosDetails,
	},
	SharedPhoto: {
		screen: SharedPhoto,
	},
	Feedback: {
		screen: FeedbackScreen,
	},
	Camera: {
		screen: Camera,
	},
},
{
	initialRouteName: 'PhotosList',
})

const AppContainer = createAppContainer(AppNavigator)

let composeEnhancers = compose
/* eslint no-undef: */
if (__DEV__) {
	composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
}

export const store = createStore(reducers, composeEnhancers(applyMiddleware(ReduxThunk)))

export default class App extends Component {
	render() {
		return (
			<Provider store={store}>
				<View style={styles.container}>
					<Root>
						<AppContainer />
					</Root>
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
