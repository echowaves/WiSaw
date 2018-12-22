import { combineReducers, } from 'redux'

import photosList from './screens/PhotosList/reducer'
import thumb from './components/Thumb/reducer'


const reducers = combineReducers({
	photosList,
	thumb,
})

export default reducers
