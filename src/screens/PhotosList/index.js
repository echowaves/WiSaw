import React, { Component, } from 'react'
import PropTypes from 'prop-types'

import {
	StyleSheet,
	Dimensions,
	Image,
	FlatList,
} from 'react-native'

import { connect, } from 'react-redux'

import {
	Container,
	Header,
	Title,
	Content,
	Footer,
	FooterTab,
	Button,
	Left,
	Right,
	Icon,
	Spinner,
	Body,
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
		error: PropTypes.string.isRequired,
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
			error,
			thumbnailMode,
		} = this.props
		if (photos.length === 0) {
			// return ()
			return (
				<Content>
					<Spinner
						color="#00aced"
					/>
				</Content>
			)
		}
		return (
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
		error: state.photosList.error,
		loading: state.photosList.loading,
	}
}

const mapDispatchToProps = {
	listPhotos,
}

export default connect(mapStateToProps, mapDispatchToProps)(PhotosList)
