import React, { Component, } from 'react'

import {
	StyleSheet,
	Text,
	TouchableOpacity,
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
	Title,
	Footer,
} from 'native-base'

import { connect, } from 'react-redux'

import GridView from 'react-native-super-grid'

import PropTypes from 'prop-types'


import Modal from "react-native-modal"

import { getPhotos, resetState, } from './reducer'

import Thumb from '../../components/Thumb'

import * as CONST from '../../consts.js'

import {
	getUUID,
	isTandcAccepted,
	acceptTandC,
} from '../../reducer'

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
		getPhotos: PropTypes.func.isRequired,
		resetState: PropTypes.func.isRequired,
		photos: PropTypes.array.isRequired,
		loading: PropTypes.bool.isRequired,
	}

	componentDidMount() {
		const {
			getPhotos,
			resetState,
		} = this.props
		getUUID()
		resetState()
		getPhotos()
		if (isTandcAccepted() === false) {
			alert('tnc is not accepted')
		}

		// alert('tnc is not accepted123')
	}

	render() {
		const {
			photos,
			loading,
			getPhotos,
			navigation,
		} = this.props

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
					onRefresh={() => (this.componentDidMount())
					}
				/>
				<Modal isVisible={true}>
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
								<Text>* By using WiSaw I agree to Terms and Conditions.</Text>
							</CardItem>
							<CardItem footer>
								<Left />
								<Button block bordered success><Text> I Agree </Text></Button>
								<Right />
							</CardItem>
						</Card>

					</Content>
				</Modal>
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
	}
}

const mapDispatchToProps = {
	getPhotos, resetState, // will be wrapped into a dispatch call
}

export default connect(mapStateToProps, mapDispatchToProps)(PhotosList)
