import { combineReducers, } from 'redux'

import camera from './screens/Camera/reducer'
import photosList from './screens/PhotosList/reducer'
import thumb from './components/Thumb/reducer'


const reducers = combineReducers({
	camera,
	photosList,
	thumb,
})

export default reducers
