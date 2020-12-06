import * as ACTION_TYPES from './action_types'

export const initialState = {
  currentPhotoIndex: 0,
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_CURRENT_PHOTO_INDEX:
      return {
        ...state,
        currentPhotoIndex: action.currentPhotoIndex,
      }
    default:
      return state
  }
}

export function setCurrentPhotoIndex(currentPhotoIndex) {
  return {
    type: ACTION_TYPES.SET_CURRENT_PHOTO_INDEX,
    currentPhotoIndex,
  }
}
