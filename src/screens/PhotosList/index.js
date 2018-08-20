import React, { Component, } from 'react'
import PropTypes from 'prop-types'

import {
	StyleSheet,
	Dimensions,
	FlatList,
} from 'react-native'

import { connect, } from 'react-redux'

import {
	Container,
	Card,
	CardItem,
	Content,
	Icon,
	Spinner,
	Text,
	Thumbnail,
} from 'native-base'

import { listPhotos, } from './reducer'

const WIDTH = Dimensions.get('window').width
// const HEIGHT = Dimensions.get('window').height

class PhotosList extends Component {
	static navigationOptions = ({ navigation, }) => ({
		headerTitle: 'hear&now',
		headerRight: (
			<Icon
				onPress={() => navigation.navigate('Feedback')}
				name="feedback"
				type="MaterialIcons"
				style={{ marginRight: 10, color: "#00aced", }}
			/>
		),
		headerBackTitle: null,
	})

	static propTypes = {
		listPhotos: PropTypes.func.isRequired,
		photos: PropTypes.array.isRequired,
		loading: PropTypes.bool.isRequired,
		errorMessage: PropTypes.string.isRequired,
		thumbnailMode: PropTypes.bool.isRequired,
	}

	componentDidMount() {
		const {
			listPhotos,
			switchPhotosPresentationMode,
		} = this.props
		listPhotos()
	}

	renderItem = ({ item, navigation, }) => (
		<Thumbnail
			square
			style={styles.thumbnail}
			source={{ uri: item.getThumbUrl, }}
		/>
	)

	render() {
		const {
			photos,
			loading,
			errorMessage,
			thumbnailMode,
		} = this.props

		if (loading === true) {
			// return ()
			return (
				<Container>
					<Content>
						<Spinner
							color="#00aced"
						/>
					</Content>
				</Container>
			)
		}
		if (errorMessage.length > 0) {
			return (
				<Container>
					<Content>
						<Card>
							<CardItem header bordered>
								<Text>No Photos Loaded.</Text>
							</CardItem>
						</Card>
					</Content>
				</Container>
			)
		}
		return (
			<Container>
				<Content>
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
				</Content>
			</Container>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	thumbnail: {
		width: WIDTH / 3,
		height: WIDTH / 3,
		resizeMode: 'cover',
		borderWidth: 3,
		borderColor: '#000000',
	},
})

const mapStateToProps = state => {
	const storedPhotos = state.photosList.photos.map(photo => ({ key: photo.id, ...photo, }))
	return {
		photos: storedPhotos,
		thumbnailMode: state.photosList.thumbnailMode,
		errorMessage: state.photosList.errorMessage,
		loading: state.photosList.loading,
	}
}

const mapDispatchToProps = {
	listPhotos,
}

export default connect(mapStateToProps, mapDispatchToProps)(PhotosList)
