import React, { Component, } from 'react'

import PropTypes from 'prop-types'

import {
	StyleSheet,
	View,
	Text,
} from 'react-native'

import { connect, } from 'react-redux'

import {
	Icon,
} from 'native-base'

import Swiper from 'react-native-swiper'

import Photo from '../../components/Photo'

import { setCurrentPhotoIndex, } from '../../components/Thumb/reducer'
import * as CONST from '../../consts.js'

class PhotosDetails extends Component {
	static navigationOptions = ({
		navigation,
	}) => {
		const { params = {}, } = navigation.state
		return ({
			headerTitle: 'hear&now',
			headerTintColor: CONST.MAIN_COLOR,
			headerRight: (
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
						style={{ marginRight: 20, color: CONST.MAIN_COLOR, }}
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
			),
			headerBackTitle: null,
		})
	}

	static propTypes = {
		navigation: PropTypes.object.isRequired,
		photos: PropTypes.array.isRequired,
		currentPhotoIndex: PropTypes.number.isRequired,
		setCurrentPhotoIndex: PropTypes.func.isRequired,
	}

	componentDidMount() {
		const {
			navigation,
		} = this.props
		navigation.setParams({ handleBan: () => (this.handleBan()), })
		navigation.setParams({ handleDelete: () => (this.handleDelete()), })
	}

	onLayout(e) {
		this.forceUpdate()
	}

	handleBan() {
		const {
			feedbackText,
			submitFeedback,
		} = this.props
		alert("ban")
	}

	handleDelete() {
		const {
			feedbackText,
			submitFeedback,
		} = this.props
		alert("delete")
	}


	render() {
		const {
			photos,
			currentPhotoIndex,
			setCurrentPhotoIndex,
		} = this.props

		return (
			<View style={styles.container} onLayout={this.onLayout.bind(this)}>
				<Swiper
					autoplay={false}
					horizontal
					loop={false}
					showsButtons
					nextButton={<Text style={{ color: CONST.MAIN_COLOR, fontSize: 60, }}>›</Text>}
					prevButton={<Text style={{ color: CONST.MAIN_COLOR, fontSize: 60, }}>‹</Text>}
					index={currentPhotoIndex}
					onIndexChanged={index => (setCurrentPhotoIndex(index))} // otherwise will jump to wrong photo onLayout
					loadMinimal
					loadMinimalSize={1}
					showsPagination={false}
					pagingEnabled>
					{photos.map(item => (
						<Photo item={item} key={item.id} />
					))}
				</Swiper>
			</View>
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
		photos: state.photosList.photos,
		currentPhotoIndex: state.thumb.currentPhotoIndex,
	}
)


const mapDispatchToProps = {
	setCurrentPhotoIndex, // will be wrapped into a dispatch call
}

export default connect(mapStateToProps, mapDispatchToProps)(PhotosDetails)
