export const SET_UUID = 'wisaw/globals/SET_UUID'
export const ACCEPT_TNC = 'wisaw/globals/ACCEPT_TNC'

export const initialState = {
	uuid: '',
	isTandcAccepted: false,
}

export default function reducer(state = initialState, action) {
	switch (action.type) {
		case SET_UUID:
			return {
				...state,
				uuid: action.uuid,
			}
		case ACCEPT_TNC:
			return {
				...state,
				isTandcAccepted: true,
			}
		default:
			return state
	}
}

export function getUUID() {

}

export function isTandcAccepted() {

}
