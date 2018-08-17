import React, { Component, } from 'react'

import {
	StyleSheet,
	ActivityIndicator,
	View,
	Dimensions,
	Image,
	FlatList,
} from 'react-native'

import { connect, } from 'react-redux'
import { Icon, } from 'react-native-elements'

import {
	List,
	ListItem,
	Thumbnail,
	Text,
	Button,
} from 'native-base'

// import { Image, } from 'react-native-animatable'

import { listPhotos, } from './reducer'

const WIDTH = Dimensions.get('window').width

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
		<Image
			style={styles.image}
			source={{ uri: item.getThumbUrl, }}
		/>
	)

	render() {
		const { photos, } = this.props
		if (photos.length === 0) {
			// return ()
			return (
				<View>
					<ActivityIndicator
						size="large"
						color="#00aced"
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							bottom: 0,
							top: 20,
						}}
					/>
				</View>
			)
		}
		return (
			<View>
				<FlatList
					styles={styles.container}
					data={photos}
					renderItem={this.renderItem}
					keyExtractor={(item, index) => index.toString()}
					removeClippedSubviews
					showsVerticalScrollIndicator={false}
					horizontal={false}
					numColumns={3}
				/>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	image: {
		width: WIDTH / 3,
		height: WIDTH / 3,
		resizeMode: 'cover',
		borderWidth: 3,
		borderColor: '#ffffff',
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
