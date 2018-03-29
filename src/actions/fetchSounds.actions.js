import { REQUEST_SOUNDS, RECEIVE_SOUNDS, REJECT_SOUNDS } from '../constants';
import fetchRandomSound from './fetchRandomSound.actions';
import { makeActionCreator, api } from './actionUtils';

export const requestSounds = makeActionCreator(REQUEST_SOUNDS, 'query');
export const receiveSounds = makeActionCreator(RECEIVE_SOUNDS, 'json');
export const rejectSounds = makeActionCreator(REJECT_SOUNDS, 'error');

export default function fetchSounds(payload) {
  return dispatch => {
    const { query, page, pageSize } = { ...payload };
    const fields = 'id';
    dispatch(requestSounds(query));
    return fetch(
      `${
        api.url
      }search/text/?format=json&query=${query}&page=${page}&page_size=${pageSize}&fields=${fields}&token=${
        api.token
      }`,
    )
      .then(response => response.json(), error => dispatch(rejectSounds(error)))
      .then(
        json => {
          dispatch(receiveSounds(json));
          dispatch(fetchRandomSound());
        },
        error => dispatch(rejectSounds(error)),
      );
  };
}
