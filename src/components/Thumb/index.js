import React, { Component, } from 'react'
import { connect, } from 'react-redux'

import {
	StyleSheet,
	Image,
	TouchableHighlight,
} from 'react-native'

import PropTypes from 'prop-types'
import { setCurrentPhotoIndex, } from './reducer'

class Thumb extends Component {
	static propTypes = {
		navigation: PropTypes.object.isRequired,
		setCurrentPhotoIndex: PropTypes.func.isRequired,
		item: PropTypes.object.isRequired,
		index: PropTypes.number.isRequired,
		thumbWidth: PropTypes.number,
	}

	static defaultProps = {
		thumbWidth: 100,
	}

	constructor(props) {
		super(props)
	}

	onThumbPress(item) {
		const { navigation, index, setCurrentPhotoIndex, } = this.props
		setCurrentPhotoIndex(index)
		navigation.navigate('PhotosDetails')
	}

	render() {
		const { item, thumbWidth, } = this.props

		// alert(this.thumbD)
		const thumbWidthStyles = {
			width: thumbWidth,
			height: thumbWidth,
		}

		return (
			<TouchableHighlight
				onPress={() => this.onThumbPress(item)}
				style={[
					styles.container,
					thumbWidthStyles,
				]}>
				<Image
					source={{ uri: item.getThumbUrl, }}
					style={styles.thumbnail}
				/>
			</TouchableHighlight>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		borderRadius: 10,
		borderWidth: 1,
		borderColor: 'rgba(100,100,100,0.1)',
	},
	thumbnail: {
		flex: 1,
		alignSelf: 'stretch',
		width: '100%',
		height: '100%',
		borderRadius: 10,
		// resizeMode: 'contain',
	},
})

const mapStateToProps = null

const mapDispatchToProps = {
	setCurrentPhotoIndex, // will be wrapped into a dispatch call
}

export default connect(mapStateToProps, mapDispatchToProps)(Thumb)
