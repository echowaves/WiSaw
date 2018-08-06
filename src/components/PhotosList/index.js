import React, { Component, } from 'react'
import {
	View,
	Text,
	FlatList,
	StyleSheet,
} from 'react-native'
import { connect, } from 'react-redux'
import { Icon, } from 'react-native-elements'

import { listPhotos, } from './reducer'


class PhotosList extends Component {
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
					Photos List
				</Text>
			</View>
		)
	}
}

export default PhotosList
