import { combineReducers, } from 'redux'

import globals from './reducer'
import photosList from './screens/PhotosList/reducer'
import thumb from './components/Thumb/reducer'


const reducers = combineReducers({
	globals,
	photosList,
	thumb,
})

export default reducers
