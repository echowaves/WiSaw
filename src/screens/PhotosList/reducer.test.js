import { Reducer, } from 'redux-testkit'
import * as reducer from './reducer'

describe('photosList reducer', () => {
	it('should have initial state', () => {
		expect(reducer.initialState).toEqual({
			photos: [],
			loading: false,
			errorMessage: '',
			thumbnailMode: true,
		})
	})
})
