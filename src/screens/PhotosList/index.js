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

import { listPhotos } from './reducer'

import { Photo, } from '../../components/Photo'

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
		photos: PropTypes.array.isRequired,
		loading: PropTypes.bool.isRequired,
		errorMessage: PropTypes.string.isRequired,
	}

	componentDidMount() {
		const {
			listPhotos,
		} = this.props
		listPhotos()
	}

	onPhotoPress(item) {
		const {
			this.setState({isEdit:true}),
		} = this.props
		switchPhotosPresentationMode(item)
	}

	renderPhoto = ({ item, navigation, }) => (
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

	render() {
		const {
			photos,
			loading,
			errorMessage,
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
						key="thumbnail"
						styles={styles.container}
						data={photos}
						renderItem={this.renderPhoto}
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
		errorMessage: state.photosList.errorMessage,
		loading: state.photosList.loading,
	}
}

const mapDispatchToProps = {
	listPhotos, // will be wrapped into a dispatch call
}


export default connect(mapStateToProps, mapDispatchToProps)(PhotosList)
