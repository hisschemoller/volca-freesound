import {
  REQUEST_RANDOM_SOUND,
  RECEIVE_RANDOM_SOUND,
  REJECT_RANDOM_SOUND,
} from '../constants';
import { makeActionCreator, api } from './actionUtils';
import loadSound from './loadSound.actions';

const requestRandomSound = makeActionCreator(REQUEST_RANDOM_SOUND, 'query');
const receiveRandomSound = makeActionCreator(RECEIVE_RANDOM_SOUND, 'sound');
const rejectRandomSound = makeActionCreator(REJECT_RANDOM_SOUND, 'error');

export default function fetchRandomSound() {
  return (dispatch, getState) => {
    const state = getState();
    const fields = 'id,url,name,license,type,duration,username,previews';
    const filter = `duration:[0 TO ${state.sounds.durationMax}]`;
    const pageNr = Math.floor(Math.random() * state.sounds.count);
    dispatch(requestRandomSound());
    return fetch(
      `${
        api.url
      }search/text/?format=json&query=''&page=${pageNr}&page_size=1&fields=${fields}&filter=${filter}&token=${
        api.token
      }`,
    )
      .then(
        response => response.json(),
        error => dispatch(rejectRandomSound(error)),
      )
      .then(
        json => {
          dispatch(receiveRandomSound(json.results[0]));
          dispatch(loadSound(json.results[0].previews['preview-hq-mp3']));
        },
        error => dispatch(rejectRandomSound(error)),
      );
  };
}
