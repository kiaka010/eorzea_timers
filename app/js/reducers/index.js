import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import clock from './clockReducer';
import nodelist from './nodeListReducer';
import search from './searchReducer';
import watchlist from './watchListReducer';
import settings from './settingsReducer';
import list from './listReducer';

const rootReducer = combineReducers({
  clock,
  routing,
  nodelist,
  search,
  watchlist,
  settings,
  list
});

export default rootReducer;
