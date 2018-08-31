import { Reducer, } from 'redux-testkit'
import uut from './reducer'

describe('photosList reducer', () => {
	it('should have initial state', () => {
		expect(uut()).toEqual({
			photos: [],
			loading: false,
			errorMessage: '',
			thumbnailMode: true,
		})
	})
})
