import v4 from 'uuid/v4'
import RNSecureKeyStore, { ACCESSIBLE, } from 'react-native-secure-key-store'
import {
	Toast,
} from 'native-base'

import { store, } from '../App'

export const SET_IS_TANDC_ACCEPTED = 'wisaw/globals/SET_IS_TANDC_ACCEPTED'
export const SET_UUID = 'wisaw/globals/SET_UUID'

const UUID_KEY = 'wisaw_device_uuid'
//  date '+%Y%m%d%H%M%S'
const IS_TANDC_ACCEPTED_KEY = 'wisaw_is_tandc_accepted_on_this_device'

export const initialState = {
	isTandcAccepted: false,
	uuid: null,
}

export default function reducer(state = initialState, action) {
	switch (action.type) {
		case SET_IS_TANDC_ACCEPTED:
			return {
				...state,
				isTandcAccepted: action.isTandcAccepted,
			}
		case SET_UUID:
			return {
				...state,
				uuid: action.uuid,
			}
		default:
			return state
	}
}

export function getUUID() {
	let { uuid, } = store.getState().globals
	if (uuid == null) {
		return async dispatch => {
		// try to retreive from secure store
			try {
				uuid = await RNSecureKeyStore.get(UUID_KEY)
			} catch (err) {
				// Toast.show({
				// 	text: err.toString(),
				// 	buttonText: "OK23",
				// 	duration: 15000,
				// })
			}
			// no uuid in the store, generate a new one and store
			// alert(uuid)
			if (uuid === '' || uuid === null) {
				uuid = v4()
				try {
					await RNSecureKeyStore.set(UUID_KEY, uuid, { accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY, })
				} catch (err) {
					// Toast.show({
					// 	text: err.toString(),
					// 	buttonText: "OK",
					// 	duration: 15000,
					// })
				}
			}
			// Toast.show({
			// 	text: uuid,
			// 	buttonText: "OK",
			// 	duration: 15000,
			// })
			dispatch({
				type: SET_UUID,
				uuid,
			})
		}
	}
	return async dispatch => {
		dispatch({
			type: SET_UUID,
			uuid,
		})
	}
}

export function acceptTandC() {
	return async dispatch => {
		try {
			await RNSecureKeyStore.set(IS_TANDC_ACCEPTED_KEY, "true", { accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY, })
			dispatch({
				type: SET_IS_TANDC_ACCEPTED,
				isTandcAccepted: true,
			})
		} catch (err) {
			dispatch({
				type: SET_IS_TANDC_ACCEPTED,
				isTandcAccepted: false,
			})
			Toast.show({
				text: err.toString(),
				buttonText: "OK",
				duration: 15000,
			})
		}
	}
}

export function getTancAccepted() {
	let { isTandcAccepted, } = store.getState().globals
	if (isTandcAccepted == null || isTandcAccepted === false) {
		return async dispatch => {
			try {
				isTandcAccepted = JSON.parse(await RNSecureKeyStore.get(IS_TANDC_ACCEPTED_KEY))
				dispatch({
					type: SET_IS_TANDC_ACCEPTED,
					isTandcAccepted,
				})
			} catch (err) {
				dispatch({
					type: SET_IS_TANDC_ACCEPTED,
					isTandcAccepted: false,
				})
			}
		}
	}
	return async dispatch => {
		dispatch({
			type: SET_IS_TANDC_ACCEPTED,
			isTandcAccepted,
		})
	}
}
