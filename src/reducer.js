import v4 from 'uuid/v4'
import RNSecureKeyStore, { ACCESSIBLE, } from 'react-native-secure-key-store'
import {
	Toast,
} from 'native-base'

// import { store, } from '../App'

export const SET_IS_TANDC_ACCEPTED = 'wisaw/globals/SET_IS_TANDC_ACCEPTED'

const UUID_KEY = 'wisaw_device_uuid'
const IS_TANDC_ACCEPTED_KEY = 'wisaw_is_tandc_accepted_on_this_device'

export const initialState = {
	isTandcAccepted: true,
}

export default function reducer(state = initialState, action) {
	switch (action.type) {
		case SET_IS_TANDC_ACCEPTED:
			return {
				...state,
				isTandcAccepted: action.isTandcAccepted,
			}
		default:
			return state
	}
}

export function getUUID() {
	let uuid = null
	if (uuid === null) { uuid = null } // stupid smelly parsing fixing
	(async () => {
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
	})()
	return uuid
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
	return async dispatch => {
		try {
			const isTandcAccepted = JSON.parse(await RNSecureKeyStore.get(IS_TANDC_ACCEPTED_KEY))
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
