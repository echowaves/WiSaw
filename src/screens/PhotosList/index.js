import React, { Component, } from 'react'
import { connect, } from 'react-redux'

import GridView from 'react-native-super-grid'

import PropTypes from 'prop-types'

import {
	StyleSheet,
} from 'react-native'


import {
	Icon,
} from 'native-base'

import { getPhotos, resetState, } from './reducer'

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
		resetState()
		getPhotos()
	}

	render() {
		const {
			photos,
			loading,
			getPhotos,
			navigation,
		} = this.props

		return (
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
