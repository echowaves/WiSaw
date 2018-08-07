import { combineReducers, } from 'redux'
import photosListReducers from './screens/PhotosList/reducer'

const wisawApp = combineReducers({
	photosListReducers,
})

export default wisawApp
