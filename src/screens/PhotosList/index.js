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
		switchPhotosPresentationMode: PropTypes.func.isRequired,
		photos: PropTypes.array.isRequired,
		loading: PropTypes.bool.isRequired,
		errorMessage: PropTypes.string.isRequired,
		thumbnailMode: PropTypes.bool.isRequired,
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
		switchPhotosPresentationMode(item.id)
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

		if (thumbnailMode) {
			return (
				<Container>
					<Content>
						<FlatList
							key='thumbnail'
							styles={styles.container}
							data={photos}
							renderItem={this.renderThumbnail}
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
		return (
			<Container>
				<Content>
					<FlatList
						key='fullsize'
						styles={styles.container}
						data={photos}
						renderItem={this.renderFullSize}
						keyExtractor={(item, index) => index.toString()}
						removeClippedSubviews
						showsVerticalScrollIndicator={false}
						horizontal={false}
						numColumns={1}
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
		width: WIDTH,
		height: null,
		resizeMode: 'contain',
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
	listPhotos, // will be wrapped into a dispatch call
	switchPhotosPresentationMode, // will be wrapped into a dispatch call
}


export default connect(mapStateToProps, mapDispatchToProps)(PhotosList)
