import { createStackNavigator, } from 'react-navigation'

import HomeScreen from './src/screens/HomeScreen'


export default createStackNavigator({
	Home: {
		screen: HomeScreen,
	},
})
