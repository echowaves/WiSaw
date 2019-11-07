import React, { Component, } from 'react'
import {
	Container, Header, Left, Body, Right, Button, Icon, Segment, Content, Text,
} from 'native-base'

import * as CONST from '../../consts.js'

export default class HeaderTitle extends React.Component {
	render() {
		return (
			<Segment>
				<Button first active>
					<Icon
						onPress={
							() => navigation.push('Feedback')
						}
						name="globe"
						type="FontAwesome"
					/>
				</Button>
				<Button last>
					<Icon
						onPress={
							() => navigation.push('Feedback')
						}
						name="eye"
						type="FontAwesome"
					/>
				</Button>
			</Segment>
		)
	}
}
