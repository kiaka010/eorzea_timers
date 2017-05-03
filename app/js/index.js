import React from 'react';
import { render } from 'react-dom';
import { syncHistoryWithStore } from 'react-router-redux';
import { createStore } from 'redux';
import throttle from 'lodash/throttle';
import assign from 'lodash/assign';
import IS_DEV from 'isdev';

import App from './App';
import reducers from './reducers';
import { loadState, saveState } from './utils/storageUtils';
import { setTime } from './utils/timeUtils';

require('./vendor/materialize.js');
require('../style/main.sass')

const persistedState = loadState() || {};

const store = createStore(
  reducers,
  assign({}, persistedState, {
    clock: setTime()
  }),
  IS_DEV ? window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__() : {}
);

store.subscribe(throttle(() => {
  saveState({
    lists: store.getState().lists,
    settings: store.getState().settings,
    watchlist: store.getState().watchlist
  });
}, 1000));

render(
    <App store={store} />,
    document.getElementById('app')
);
