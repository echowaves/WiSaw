import React, { Component, } from 'react'

import {
	Text,
	FlatList,
	StyleSheet,
	ActivityIndicator,
	View,
	Dimensions,
} from 'react-native'

import { connect, } from 'react-redux'
import { Icon, } from 'react-native-elements'

import { Button, } from 'native-base'
import { Image, } from 'react-native-animatable'

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
		<Button
			onPress={() => (item.id)}
			style={{
				backgroundColor: 'transparent',
				borderRadius: 0,
				height: 80,
				width: WIDTH / 3,
			}}>
			<Image
				animation="bounceIn"
				delay={100}
				duration={500}
				source={{ uri: item.getThumbUrl, }}
				style={{
					height: 80,
					left: 0,
					position: 'absolute',
					resizeMode: 'cover',
					top: 0,
					width: WIDTH / 3,
				}}
			/>
		</Button>
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
					<Text styles={styles.container}>No Photos.</Text>
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
				/>
			</View>
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
