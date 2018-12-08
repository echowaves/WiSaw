import React, { Component, } from 'react'
import { connect, } from 'react-redux'

import GridView from 'react-native-super-grid'

import PropTypes from 'prop-types'

import {
	StyleSheet,
} from 'react-native'


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

import * as CONST from '../../consts.js'

class PhotosList extends Component {
	static navigationOptions = ({ navigation, }) => ({
		headerTitle: 'hear&now',
		headerRight: (
			<Icon
				onPress={() => navigation.push('Feedback')}
				name="feedback"
				type="MaterialIcons"
				style={{ marginRight: 10, color: CONST.MAIN_COLOR, }}
			/>
		),
		headerBackTitle: null,
	})

	static propTypes = {
		navigation: PropTypes.object.isRequired,
		listPhotos: PropTypes.func.isRequired,
		daysAgo: PropTypes.number.isRequired,
		photos: PropTypes.array.isRequired,
		loading: PropTypes.bool.isRequired,
		errorMessage: PropTypes.string.isRequired,
	}

	componentDidMount() {
		const {
			listPhotos,
			daysAgo,
		} = this.props
		listPhotos(daysAgo)
	}

	render() {
		const {
			photos,
			loading,
			errorMessage,
			listPhotos,
			daysAgo,
		} = this.props

		if (loading === true) {
			// return ()
			return (
				<Container>
					<Content>
						<Spinner
							color={CONST.MAIN_COLOR}
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

		const { navigation, } = this.props
		return (
			<GridView
				// extraData={this.state}
				itemDimension={100}
				items={photos}
				renderItem={(item, index) => <Thumb item={item} index={index} navigation={navigation} />}
				style={styles.container}
				showsVerticalScrollIndicator={false}
				horizontal={false}
				onEndReached={() => (listPhotos(daysAgo))}
				onEndReachedThreshold={5}
				// refreshing={false}
				// onRefresh={() => (listPhotos(daysAgo))}
			/>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
})

const mapStateToProps = state => {
	const storedPhotos = state.photosList.photos.map(photo => ({ key: photo.id, ...photo, })) // add key to photos
	return {
		photos: storedPhotos,
		errorMessage: state.photosList.errorMessage,
		loading: state.photosList.loading,
		paging: state.photosList.paging,
		daysAgo: state.photosList.daysAgo,
	}
}

const mapDispatchToProps = {
	listPhotos, // will be wrapped into a dispatch call
}

export default connect(mapStateToProps, mapDispatchToProps)(PhotosList)
