import { combineReducers, } from 'redux'

import camera from './screens/Camera/reducer'
import photosList from './screens/PhotosList/reducer'
import feedback from './screens/Feedback/reducer'

import thumb from './components/Thumb/reducer'
import photo from './components/Photo/reducer'


const reducers = combineReducers({
	camera,
	photosList,
	thumb,
	photo,
	feedback,
})

export default reducers
