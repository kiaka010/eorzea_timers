import React from 'react';
import { render } from 'react-dom';
import App from './App';
import reducers from './reducers';
import bootstrap from 'bootstrap';
import styles from '../style/main.sass';
import { browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { createStore } from 'redux';

const store = createStore(reducers);
const history = syncHistoryWithStore(browserHistory, store);

render(
    <App store={store} history={history} />,
    document.getElementById('app')
);
