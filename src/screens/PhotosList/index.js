import React, { Component, } from 'react'
import {
	BallIndicator,
	BarIndicator,
	DotIndicator,
	MaterialIndicator,
	PacmanIndicator,
	PulseIndicator,
	SkypeIndicator,
	UIActivityIndicator,
	WaveIndicator,
} from 'react-native-indicators'

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
		if (photos.length === 0) {
			// return (<Text styles={styles.container}>No Photos Loaded yet.</Text>)
			return (<DotIndicator color="#00aced" />)
		}
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
	const storedPhotos = state.photosList.photos.map(photo => ({ key: photo.id, ...photo, }))
	return {
		photos: storedPhotos,
	}
}

const mapDispatchToProps = {
	listPhotos,
}

export default connect(mapStateToProps, mapDispatchToProps)(PhotosList)
