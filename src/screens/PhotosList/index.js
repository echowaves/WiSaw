import React, { Component, } from 'react'
import {
	Text,
	TouchableOpacity,
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

	// state = { photos: [], }

	componentDidMount() {
		const { listPhotos, } = this.props
		listPhotos()
	}

	renderItem = ({ item, navigation, }) => (
		<TouchableOpacity
			style={styles.item}
			onPress={() => navigation.navigate('Detail', { name: item.name, })
			}>
			<Text>{item.name}</Text>
		</TouchableOpacity>
	)

	render() {
		const { photos, } = this.props
		return (
			<FlatList
				styles={styles.container}
				data={photos}
				renderItem={this.renderItem}
			/>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	item: {
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#ccc',
	},
})


const mapStateToProps = state => {
	const storedPhotos = [] // state.photos.map(photo => ({ key: photo.id, ...photo, }))
	return {
		photos: storedPhotos,
	}
}

const mapDispatchToProps = {
	listPhotos,
}

export default connect(mapStateToProps, mapDispatchToProps)(PhotosList)
