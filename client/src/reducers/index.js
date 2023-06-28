import loggedReducer from './isLogged'
import URLReducer from './isURLChanged'
import { combineReducers } from 'redux'

const allReducers = combineReducers({
    isLogged: loggedReducer,
    isURLChanged: URLReducer
})

export default allReducers