export const SET_ITEM = 'wisaw/sharedPhoto/SET_ITEM'

export const initialState = {
	item: null,
}

export default function reducer(state = initialState, action) {
	switch (action.type) {
		case SET_ITEM:
			return {
				...state,
				item: action.item,
			}
		default:
			return state
	}
}

export function setItem({ item, }) {
	return {
		type: SET_ITEM,
		item,
	}
}
