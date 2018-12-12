import v4 from 'uuid/v4'
import RNSecureKeyStore, { ACCESSIBLE, } from 'react-native-secure-key-store'
import {
	Toast,
} from 'native-base'

import { store, } from '../App'

export const SET_UUID = 'wisaw/globals/SET_UUID'
export const ACCEPT_TNC = 'wisaw/globals/ACCEPT_TNC'

const UUID_KEY = 'wisaw_device_uuid'
const IS_TANDC_ACCEPTED_KEY = 'wisaw_is_tandc_accepted_on_this_device'

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

export async function getUUID() {
	let { uuid, } = store.getState().globals
	if (uuid !== '') return uuid // if uuid is in the store -- just return it

	// try to retreive from secure store
	try {
		uuid = await RNSecureKeyStore.get(UUID_KEY)
	} catch (err) {
		// Toast.show({
		// 	text: err.toString(),
		// 	buttonText: "OK",
		// 	duration: 15000,
		// })
	}
	// no uuid in the store, generate a new one and store
	if (uuid === '' || uuid === null) {
		uuid = v4()
		try {
			await RNSecureKeyStore.set(UUID_KEY, uuid, { accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY, })
		} catch (err) {
			Toast.show({
				text: err.toString(),
				buttonText: "OK",
				duration: 15000,
			})
		}
	}
	store.dispatch({
		type: SET_UUID,
		uuid,
	})
	// Toast.show({
	// 	text: `UUID: ${uuid}`,
	// 	buttonText: "OK",
	// 	duration: 15000,
	// })
	return uuid
}

export async function isTandcAccepted() {
	let { isTandcAccepted, } = store.getState().globals
	if (isTandcAccepted === true) return true

	// try to retreive from secure store
	try {
		isTandcAccepted = await RNSecureKeyStore.get(IS_TANDC_ACCEPTED_KEY)
	} catch (err) {
		// Toast.show({
		// 	text: err.toString(),
		// 	buttonText: "OK",
		// 	duration: 15000,
		// })
	}
	// no uuid in the store, generate a new one and store
	if (isTandcAccepted === false || isTandcAccepted === null) {
		return false
	}
}

export async function acceptTandC() {
	try {
		await RNSecureKeyStore.set(IS_TANDC_ACCEPTED_KEY, true, { accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY, })
	} catch (err) {
		Toast.show({
			text: err.toString(),
			buttonText: "OK",
			duration: 15000,
		})
	}
	store.dispatch({
		type: ACCEPT_TNC,
	})
}
