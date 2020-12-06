import {
  Toast,
} from 'native-base'

import * as CONST from '../../consts.js'

import * as ACTION_TYPES from './action_types'

export const initialState = {
  feedbackText: '',
  loading: false,
  errorMessage: '',
  finished: false,
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_FEEDBACK_TEXT:
      return {
        ...state,
        feedbackText: action.feedbackText,
      }
    case ACTION_TYPES.SUBMIT_FEEDBACK_STARTED:
      return {
        ...state,
        loading: true,
        errorMessage: '',
        finished: false,
      }
    case ACTION_TYPES.SUBMIT_FEEDBACK_FAIL:
      return {
        ...state,
        errorMessage: action.errorMessage,
        loading: false,
        finished: true,
      }
    case ACTION_TYPES.SUBMIT_FEEDBACK_FINISHED:
      return {
        ...state,
        loading: false,
        finished: true,
      }
    case ACTION_TYPES.RESET_FEEDBACK_FORM:
      return initialState
    default:
      return state
  }
}

export function setFeedbackText({ feedbackText }) {
  return {
    type: ACTION_TYPES.SET_FEEDBACK_TEXT,
    feedbackText,
  }
}

export function resetForm() {
  return {
    type: ACTION_TYPES.RESET_FEEDBACK_FORM,
  }
}

export function submitFeedback({ feedbackText }) {
  return async (dispatch, getState) => {
    const { uuid } = getState().photosList
    dispatch({
      type: ACTION_TYPES.SUBMIT_FEEDBACK_STARTED,
    })
    try {
      const response = await fetch(`${CONST.HOST}/contactform`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uuid,
          description: feedbackText,
        }),
      })
      // const responseJson = await response.json()
      if (response.status === 201) {
        dispatch({
          type: ACTION_TYPES.SUBMIT_FEEDBACK_FINISHED,
        })
      } else {
        dispatch({
          type: ACTION_TYPES.SUBMIT_FEEDBACK_FAIL,
          errorMessage: 'Something went wrong. Try again later.',
        })
      }
    } catch (err) {
      dispatch({
        type: ACTION_TYPES.SUBMIT_FEEDBACK_FAIL,
        errorMessage: err.toString(),
      })
      Toast.show({
        text: err.toString(),
      })
    }
    dispatch({
      type: ACTION_TYPES.SUBMIT_FEEDBACK_FINISHED,
    })
  }
}
