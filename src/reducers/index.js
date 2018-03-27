import { combineReducers } from 'redux';
import user from './user';
import runtime from './runtime';
import sounds from './sounds';

export default combineReducers({
  user,
  runtime,
  sounds,
});
