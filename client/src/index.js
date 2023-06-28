import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter as Router } from "react-router-dom"
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import allReducers from './reducers'
import { persistStore, persistReducer } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'
import storage from 'redux-persist/lib/storage'
import Loading from './components/Loading';

import './static/index.css';
import "bootstrap/dist/css/bootstrap.min.css"
import "@fortawesome/fontawesome-free/css/all.min.css"



const persistConfig = {
	key: 'root',
	storage,
}
const persistedReducer = persistReducer(persistConfig, allReducers)
const store = createStore(persistedReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())
const persistor = persistStore(store)

ReactDOM.render(

	<React.StrictMode>
			<Provider store={store}>
				<PersistGate loading={<Loading />} persistor={persistor}>
					<Router>
						<App />
					</Router>
				</PersistGate>
		</Provider>
	</React.StrictMode>,

  document.getElementById('root')
);
