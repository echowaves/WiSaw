import React, { Component, } from 'react'
import PropTypes from 'prop-types'

import {
	StyleSheet,
	Dimensions,
	FlatList,
	Image,
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

import { listPhotos, switchPhotosPresentationMode, } from './reducer'

const WIDTH = Dimensions.get('window').width
const HEIGHT = Dimensions.get('window').height

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
		switchPhotosPresentationMode: PropTypes.func.isRequired,
		photos: PropTypes.array.isRequired,
		loading: PropTypes.bool.isRequired,
		errorMessage: PropTypes.string.isRequired,
		thumbnailMode: PropTypes.bool.isRequired,
		currentPhoto: PropTypes.object.isRequired,
	}

	componentDidMount() {
		const {
			listPhotos,
		} = this.props
		listPhotos()
	}

	onPhotoPress(item) {
		const {
			switchPhotosPresentationMode,
		} = this.props
		switchPhotosPresentationMode(item)
	}

	renderThumbnail = ({ item, navigation, }) => (
		<Card>
			<CardItem
				cardBody
				button
				onPress={() => this.onPhotoPress(item)}>
				<Thumbnail
					square
					style={styles.thumbnail}
					source={{ uri: item.getThumbUrl, }}
				/>
			</CardItem>
		</Card>
	)

	renderFullSize = ({ item, navigation, }) => (
		<Card>
			<CardItem
				cardBody
				button
				onPress={() => this.onPhotoPress(item)}>
				<Image
					style={styles.fullSizeImage}
					source={{ uri: item.getImgUrl, }}
				/>
			</CardItem>
		</Card>
	)

	render() {
		const {
			photos,
			loading,
			errorMessage,
			thumbnailMode,
			currentPhoto,
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

		const tmpScrollIndex = photos.findIndex(x => x.id === currentPhoto.id)
		const initialScrollIndex = tmpScrollIndex === -1 ? 0 : tmpScrollIndex
		// const initialScrollIndex = photos.findIndex(x => x.id === currentPhoto.id)
		if (thumbnailMode) {
			return (
				<Container>
					<Content>
						<FlatList
							key="thumbnail"
							styles={styles.container}
							data={photos}
							renderItem={this.renderThumbnail}
							showsVerticalScrollIndicator={false}
							horizontal={false}
							numColumns={3}
							initialScrollIndex={initialScrollIndex}
						/>
					</Content>
				</Container>
			)
		}
		return (
			<Container>
				<Content>
					<FlatList
						key="fullsize"
						styles={styles.container}
						data={photos}
						renderItem={this.renderFullSize}
						showsVerticalScrollIndicator={false}
						horizontal={false}
						numColumns={1}
						initialScrollIndex={initialScrollIndex}
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
	},
	fullSizeImage: {
		width: "100%",
		height: HEIGHT,
		resizeMode: 'contain',
	},
})

const mapStateToProps = state => {
	const storedPhotos = state.photosList.photos.map(photo => ({ ...photo, key: photo.id.toString(), }))
	return {
		photos: storedPhotos,
		thumbnailMode: state.photosList.thumbnailMode,
		errorMessage: state.photosList.errorMessage,
		loading: state.photosList.loading,
		currentPhoto: state.photosList.currentPhoto,
	}
}

const mapDispatchToProps = {
	listPhotos, // will be wrapped into a dispatch call
	switchPhotosPresentationMode, // will be wrapped into a dispatch call
}


export default connect(mapStateToProps, mapDispatchToProps)(PhotosList)
