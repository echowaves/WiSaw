import * as ACTION_TYPES from './action_types'

export const initialState = {
  item: null,
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_ITEM:
      return {
        ...state,
        item: action.item,
      }
    default:
      return state
  }
}

export function setItem({ item }) {
  return {
    type: ACTION_TYPES.SET_ITEM,
    item,
  }
}
