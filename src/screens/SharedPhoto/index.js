import React, { Component, } from 'react'

import PropTypes from 'prop-types'

import {
	StyleSheet,
	View,
	Alert,
} from 'react-native'

import { connect, } from 'react-redux'

import {
	Icon,
	Button,
	Container,
	Content,
	Body,
	Spinner,
} from 'native-base'

import Photo from '../../components/Photo'

import {
	banPhoto,
	deletePhoto,
	watchPhoto,
	unwatchPhoto,
	checkIsPhotoWatched,
} from '../../components/Photo/reducer'

import {
	setItem,
} from './reducer'

import * as CONST from '../../consts.js'

class SharedPhoto extends Component {
	static navigationOptions = ({
		navigation,
	}) => {
		const { params = {}, } = navigation.state
		return ({
			headerTitle: 'shared photo',
			headerTintColor: CONST.MAIN_COLOR,
			headerLeft: (
				<View style={{
					flex: 1,
					flexDirection: "row",
				}}>
					<Button
						onPress={
							() => navigation.goBack()
						}
						style={{
							backgroundColor: '#ffffff',
						}}>
						<Icon
							name="angle-left"
							type="FontAwesome"
							style={{
								color: CONST.MAIN_COLOR,
							}}
						/>
					</Button>
					<Button
						onPress={
							navigation.getParam('handleFlipWatch')
						}
						style={{
							backgroundColor: '#ffffff',
						}}>
						<Icon
							name={navigation.getParam('watched') ? "eye" : "eye-slash"}
							type="FontAwesome"
							style={{ color: CONST.MAIN_COLOR, }}
						/>
					</Button>
				</View>
			),
			headerRight: (!navigation.getParam('watched') && (
				<View style={{
					flex: 1,
					flexDirection: "row",
				}}>
					<Icon
						onPress={
							() => params.handleBan()
						}
						name="ban"
						type="FontAwesome"
						style={{
							marginRight: 20,
							color: CONST.MAIN_COLOR,
						}}
					/>
					<Icon
						onPress={
							() => params.handleDelete()
						}
						name="trash"
						type="FontAwesome"
						style={{ marginRight: 20, color: CONST.MAIN_COLOR, }}
					/>
				</View>
			)),
			headerBackTitle: null,
		})
	}

	static propTypes = {
		navigation: PropTypes.object.isRequired,
		banPhoto: PropTypes.func.isRequired,
		deletePhoto: PropTypes.func.isRequired,
		bans: PropTypes.array.isRequired,
		item: PropTypes.object,
		setItem: PropTypes.func.isRequired,
		watched: PropTypes.bool.isRequired,
		watchPhoto: PropTypes.func.isRequired,
		unwatchPhoto: PropTypes.func.isRequired,
		checkIsPhotoWatched: PropTypes.func.isRequired,
	}

	static defaultProps = {
		item: null,
	}

	componentDidMount() {
		const {
			navigation,
			setItem,
			checkIsPhotoWatched,
		} = this.props
		navigation.setParams({ handleBan: () => (this.handleBan()), })
		navigation.setParams({ handleDelete: () => (this.handleDelete()), })

		setItem({ item: navigation.getParam('item'), })

		navigation.setParams({
			handleFlipWatch: () => (this.handleFlipWatch()),
		})
		checkIsPhotoWatched({ item: navigation.getParam('item'), navigation, })
	}

	isPhotoBannedByMe({ photoId, }) {
		const {
			bans,
		} = this.props
		return bans.includes(photoId)
	}

	handleBan() {
		const {
			banPhoto,
			item,
		} = this.props

		if (this.isPhotoBannedByMe({ photoId: item.id, })) {
			Alert.alert(
				'Looks like you already reported this Photo',
				'You can only report same Photo once.',
				[
					{ text: 'OK', onPress: () => null, },
				],
			)
		} else {
			Alert.alert(
				'Report abusive Photo?',
				'The user who posted this photo will be banned. Are you sure?',
				[
					{ text: 'No', onPress: () => null, style: 'cancel', },
					{ text: 'Yes', onPress: () => banPhoto({ item, }), },
				],
				{ cancelable: true, }
			)
		}
	}

	handleDelete() {
		const {
			// navigation,
			deletePhoto,
			item,
		} = this.props

		Alert.alert(
			'Delete Photo?',
			'The photo will be deleted from the cloud and will never be seeing again by anyone. Are you sure?',
			[
				{ text: 'No', onPress: () => null, style: 'cancel', },
				{
					text: 'Yes',
					onPress: () => {
						deletePhoto({ item, })
						// navigation.goBack()
					},
				},
			],
			{ cancelable: true, }
		)
	}

	handleFlipWatch() {
		const {
			navigation,
			watchPhoto,
			unwatchPhoto,
			watched,
			item,
		} = this.props
		if (watched) {
			unwatchPhoto({ item, navigation, })
		} else {
			watchPhoto({ item, navigation, })
		}
	}

	render() {
		const {
			item,
		} = this.props
		if (item) {
			return (
				<View style={styles.container}>
					<Photo item={item} key={item.id} />
				</View>
			)
		}

		return (
			<Container>
				<Content padder>
					<Body>
						<Spinner color={
							CONST.MAIN_COLOR
						}
						/>
					</Body>
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

const mapStateToProps = state => (
	{
		item: state.sharedPhoto.item,
		bans: state.photo.bans,
		watched: state.photo.watched,
	}
)


const mapDispatchToProps = {
	banPhoto,
	deletePhoto,
	setItem,
	watchPhoto,
	unwatchPhoto,
	checkIsPhotoWatched,
}

export default connect(mapStateToProps, mapDispatchToProps)(SharedPhoto)
