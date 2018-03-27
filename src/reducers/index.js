import { combineReducers } from 'redux';
import user from './user';
import runtime from './runtime';
import test from './test';

export default combineReducers({
  user,
  runtime,
  test,
});
