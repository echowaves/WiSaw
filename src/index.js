import { combineReducers, } from 'redux'

import camera from './screens/Camera/reducer'
import photosList from './screens/PhotosList/reducer'
import thumb from './components/Thumb/reducer'
import feedback from './screens/Feedback/reducer'


const reducers = combineReducers({
	camera,
	photosList,
	thumb,
	feedback,
})

export default reducers
