import React, { Component, } from 'react'

import {
	Container,
	Card,
	CardItem,
} from 'native-base'

import Image from 'react-native-image-progress'
import Progress from 'react-native-progress/Bar'

import PropTypes from 'prop-types'

import * as CONST from '../../consts.js'

class Photo extends Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
	}

	constructor(props) {
		super(props)
	}

	onPhotoPress(item) {
		this.setState(previousState => (
			{ isExpanded: !previousState.isExpanded, }
		))
	}

	render() {
		const { item, } = this.props
		return (
			<Container>
			<Card style={{ elevation: 3, }}>
				<CardItem cardBody>
					<Image
						source={{ uri: item.getThumbUrl, }}
						indicator={Progress}
						indicatorProps={{
							color: CONST.MAIN_COLOR,
							unfilledColor: CONST.UNFILLED_COLOR,
						}}
						style={{
							position: 'absolute',
							width: 320,
							height: 240,
						}}
					/>
				</CardItem>
				<CardItem cardBody>
					<Image
						source={{ uri: item.getImgUrl, }}
						indicator={Progress}
						indicatorProps={{
							color: CONST.MAIN_COLOR,
							unfilledColor: CONST.UNFILLED_COLOR,
						}}
						style={{
							position: 'absolute',
							width: 320,
							height: 240,
						}}
					/>
				</CardItem>

			</Card>
			</Container>

		)
	}
}

export default Photo
