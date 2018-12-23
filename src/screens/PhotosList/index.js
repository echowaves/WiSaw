import React, { Component, } from 'react'

import {
	StyleSheet,
	Text,
	View,
} from 'react-native'

import {
	Icon,
	Container,
	Content,
	Body,
	Spinner,
	Card,
	CardItem,
	Button,
	Left,
	Right,
} from 'native-base'

import Permissions from 'react-native-permissions'
import DeviceSettings from 'react-native-device-settings'

import { connect, } from 'react-redux'

import GridView from 'react-native-super-grid'

import PropTypes from 'prop-types'

import Modal from "react-native-modal"

import {
	resetState,
	getPhotos,
	acceptTandC,
	setLocationPermission,
} from './reducer'

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

	static defaultProps = {
		locationPermission: null,
	}

	static propTypes = {
		navigation: PropTypes.object.isRequired,
		resetState: PropTypes.func.isRequired,
		getPhotos: PropTypes.func.isRequired,
		photos: PropTypes.array.isRequired,
		loading: PropTypes.bool.isRequired,
		isTandcAccepted: PropTypes.bool.isRequired,
		acceptTandC: PropTypes.func.isRequired,
		locationPermission: PropTypes.string,
		setLocationPermission: PropTypes.func.isRequired,
	}

	componentDidMount() {
		this.reload()
	}

	async reload() {
		const {
			resetState,
			getPhotos,
			setLocationPermission,
		} = this.props
		await resetState()
		// Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
		const permission = await Permissions.check('location')
		setLocationPermission(permission)
		getPhotos()
	}

	render() {
		const {
			photos,
			loading,
			getPhotos,
			navigation,
			isTandcAccepted,
			acceptTandC,
			locationPermission,
		} = this.props

		if (locationPermission === null || locationPermission !== 'authorized') {
			return (
				<Container>
					<Content padder>
						<Body>
							<Modal
								isVisible>
								<Content padder>
									<Card transparent>
										<CardItem>
											<Text>How am I supposed to show you the near-by photos?</Text>
										</CardItem>
										<CardItem>
											<Text>Why don&#39;t you enable Location in Settings and Try Again?</Text>
										</CardItem>
										<CardItem footer>
											<Left>
												<Button
													block
													bordered
													success
													small
													onPress={() => {
														this.reload()
													}}>
													<Text>  Try Again  </Text>
												</Button>
											</Left>
											<Right>
												<Button
													block
													bordered
													warning
													small
													onPress={() => {
														DeviceSettings.app()
													}}>
													<Text>  Open Settings  </Text>
												</Button>
											</Right>
										</CardItem>
									</Card>
								</Content>
							</Modal>
						</Body>
					</Content>
				</Container>
			)
		}

		if (photos.length === 0) {
			return (
				<Container>
					<Content padder>
						<Body>
							<Spinner color={CONST.MAIN_COLOR} />
						</Body>
					</Content>
				</Container>
			)
		}

		return (
			<Container>
				<GridView
					// extraData={this.state}
					itemDimension={100}
					items={photos}
					renderItem={(item, index) => <Thumb item={item} index={index} navigation={navigation} />}
					style={styles.container}
					showsVerticalScrollIndicator={false}
					horizontal={false}
					onEndReached={() => {
						if (loading === false) {
							getPhotos()
						}
					}
					}
					onEndReachedThreshold={5}
					refreshing={false}
					onRefresh={() => (this.reload())
					}
				/>
				<Modal
					isVisible={!isTandcAccepted}>
					<Content padder>
						<Card transparent>
							<CardItem>
								<Text>* When you take a photo with WiSaw app, it will be added to a Photo Album on your phone, as well as posted to global feed in the cloud.</Text>
							</CardItem>
							<CardItem>
								<Text>* People close-by can see your photos.</Text>
							</CardItem>
							<CardItem>
								<Text>* You can see other people&#39;s photos too.</Text>
							</CardItem>
							<CardItem>
								<Text>* If you find any photo abusive or inappropriate, you can delete it -- it will be deleted from the cloud so that no one will ever see it again.</Text>
							</CardItem>
							<CardItem>
								<Text>* No one will tolerate objectionable content or abusive users.</Text>
							</CardItem>
							<CardItem>
								<Text>* The abusive users will be banned from WiSaw by other users.</Text>
							</CardItem>
							<CardItem>
								<Text>
									* By using WiSaw I agree to Terms and Conditions.
								</Text>
							</CardItem>
							<CardItem footer>
								<Left />
								<Button
									block
									bordered
									success
									small
									onPress={() => {
										acceptTandC()
									}}>
									<Text>  Agree  </Text>
								</Button>
								<Right />
							</CardItem>
						</Card>
					</Content>
				</Modal>
				<View style={
					{
						position: 'absolute',
						alignSelf: 'center',
						bottom: 20,
					}}>
					<Button
						rounded
						light
						transparent
						bordered
						style={
							{
								height: 100,
								backgroundColor: 'rgba(10,10,10,.1)',
							}
						}>
						<Icon
							type="FontAwesome"
							name="camera"
							style={
								{
									fontSize: 60,
									color: 'red',
								}
							}
						/>
					</Button>
				</View>
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
	const storedPhotos = state.photosList.photos.map(photo => ({ key: photo.id, ...photo, })) // add key to photos
	return {
		photos: storedPhotos,
		errorMessage: state.photosList.errorMessage,
		loading: state.photosList.loading,
		paging: state.photosList.paging,
		isTandcAccepted: state.photosList.isTandcAccepted,
		locationPermission: state.photosList.locationPermission,
	}
}

const mapDispatchToProps = {
	// will be wrapped into a dispatch call
	resetState,
	getPhotos,
	acceptTandC,
	setLocationPermission,
}

export default connect(mapStateToProps, mapDispatchToProps)(PhotosList)
