import { SET_FROM, SET_TO, SET_DURATION_MAX } from '../constants';
import { makeActionCreator } from './actionUtils';

export const setFrom = makeActionCreator(SET_FROM, 'value');
export const setTo = makeActionCreator(SET_TO, 'value');
export const setDurationMax = makeActionCreator(SET_DURATION_MAX, 'value');
