import {
  CLEAR_ALL,
  SELECT_ALL,
  INITIALIZE,
  SET_RANGE,
  SET_RANGE_FIRST,
  SET_RANGE_LAST,
  SET_DURATION_MAX,
  START,
  TOGGLE_SLOT,
} from '../constants';
import { makeActionCreator } from './actionUtils';

export const initialize = makeActionCreator(INITIALIZE);
export const start = makeActionCreator(START);

export const setRange = makeActionCreator(SET_RANGE);
export const setRangeFirst = makeActionCreator(SET_RANGE_FIRST, 'value');
export const setRangeLast = makeActionCreator(SET_RANGE_LAST, 'value');
export const setDurationMax = makeActionCreator(SET_DURATION_MAX, 'value');

export const toggleSlot = makeActionCreator(TOGGLE_SLOT, 'index');

export const clearAll = makeActionCreator(CLEAR_ALL);
export const selectAll = makeActionCreator(SELECT_ALL);
