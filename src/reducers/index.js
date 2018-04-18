import { combineReducers } from 'redux';
import runtime from './runtime';
import sounds from './sounds';

export default combineReducers({
  runtime,
  sounds,
});
