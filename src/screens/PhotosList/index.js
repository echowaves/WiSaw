import React, { Component, } from 'react'
import GridView from 'react-native-super-grid'

import PropTypes from 'prop-types'

import {
	StyleSheet,
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
} from 'native-base'

import { listPhotos, } from './reducer'

import Thumb from '../../components/Thumb'

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
					<GridView
						itemDimension={100}
						items={photos}
						renderItem={item => <Thumb item={item} />}
						style={styles.container}
						showsVerticalScrollIndicator={false}
						horizontal={false}
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
})

const mapStateToProps = state => {
	const storedPhotos = state.photosList.photos.map(photo => ({ key: photo.id, ...photo, }))
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
