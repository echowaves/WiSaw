import {
  createStore, applyMiddleware, compose, combineReducers,
} from 'redux'
import ReduxThunk from 'redux-thunk'

import 'react-native-get-random-values'

// import camera from './screens/Camera/reducer'
import photosList from './screens/PhotosList/reducer'
import feedback from './screens/Feedback/reducer'
import photo from './components/Photo/reducer'

let composeEnhancers = compose
/* eslint no-undef: */
if (__DEV__) {
  composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
}

export const reducers = combineReducers({
  photosList,
  photo,
  feedback,
})

export const store = createStore(reducers, composeEnhancers(applyMiddleware(ReduxThunk)))
