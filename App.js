/**
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

// import 'react-native-gesture-handler' // keep this line to prevent crashes
import { gestureHandlerRootHOC, } from 'react-native-gesture-handler'

import { Root, } from 'native-base'
import React, { Component, } from 'react'
import { StyleSheet, View, } from 'react-native'
import { createAppContainer, } from "react-navigation"
import { createStackNavigator, } from 'react-navigation-stack'
// import createNativeStackNavigator from 'react-native-screens/createNativeStackNavigator'

import { Provider, } from 'react-redux'

// import { enableScreens, } from 'react-native-screens'
import { store, } from './src'

import PhotosList from './src/screens/PhotosList'
import PhotosDetails from './src/screens/PhotosDetails'
import SharedPhoto from './src/screens/SharedPhoto'
import FeedbackScreen from './src/screens/Feedback'
import Camera from './src/screens/Camera'

// enableScreens()

const AppNavigator = createStackNavigator({
	PhotosList: {
		screen: gestureHandlerRootHOC(PhotosList),
	},
	PhotosDetails: {
		screen: gestureHandlerRootHOC(PhotosDetails),
	},
	SharedPhoto: {
		screen: gestureHandlerRootHOC(SharedPhoto),
	},
	Feedback: {
		screen: gestureHandlerRootHOC(FeedbackScreen),
	},
	Camera: {
		screen: gestureHandlerRootHOC(Camera),
	},
},
{
	initialRouteName: 'PhotosList',
})

const AppContainer = createAppContainer(AppNavigator)

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
