import Toast from 'react-native-toast-message'

import { gql } from "@apollo/client"

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
      // const contactForm =
      await CONST.gqlClient
        .mutate({
          mutation: gql`
            mutation createContactForm($uuid: String!, $description: String!) {
              createContactForm(uuid: $uuid, description: $description)
                     {
                        createdAt
                        id
                        updatedAt
                        uuid
                      }
            }`,
          variables: {
            uuid,
            description: feedbackText,
          },
        })

      // console.log({ contactForm })

      dispatch({
        type: ACTION_TYPES.SUBMIT_FEEDBACK_FINISHED,
      })
    } catch (err) {
      dispatch({
        type: ACTION_TYPES.SUBMIT_FEEDBACK_FAIL,
        errorMessage: err.toString(),
      })
      Toast.show({
        text1: 'Error',
        text2: err.toString(),
        type: "error",
        topOffset: 200,
      })
    }
  }
}
