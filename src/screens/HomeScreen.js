import React, { Component, } from 'react'
import { View, Text, } from 'react-native'
import { Icon, } from 'react-native-elements'

class HomeScreen extends Component {
	static navigationOptions = ({ navigation, }) => {
     return {
       headerTitle: 'hear&now',
       headerRight: (
				 <Icon
 						onPress={() => navigation.navigate('Feedback')}
 						name="feedback"
 						raised
 						reverse
 						color="#00aced"
 					/>
       ),
     }
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
