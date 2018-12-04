import { REQUEST_SOUNDS, RECEIVE_SOUNDS, REJECT_SOUNDS } from '../constants';
import { makeActionCreator, api } from './actionUtils';

export const requestSounds = makeActionCreator(REQUEST_SOUNDS, 'query');
export const receiveSounds = makeActionCreator(RECEIVE_SOUNDS, 'json');
export const rejectSounds = makeActionCreator(REJECT_SOUNDS, 'error');

export default function fetchSounds(payload) {
  return (dispatch, getState) => {
    const state = getState();
    const { query, page, pageSize } = { ...payload };
    if (state.sounds.durationMax === '') {
      dispatch(rejectSounds());
    } else {
      const fields = 'id';
      const filter = `duration:[0 TO ${state.sounds.durationMax}]`;
      dispatch(requestSounds(query));
      return fetch(
        `${
          api.url
        }search/text/?format=json&query=${query}&page=${page}&page_size=${pageSize}&fields=${fields}&filter=${filter}&token=${
          api.token
        }`,
      )
        .then(
          response => response.json(),
          error => dispatch(rejectSounds(error)),
        )
        .then(
          json => {
            dispatch(receiveSounds(json));
          },
          error => dispatch(rejectSounds(error)),
        );
    }
  };
}
