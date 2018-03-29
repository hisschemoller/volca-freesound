import {
  REQUEST_RANDOM_SOUND,
  RECEIVE_RANDOM_SOUND,
  REJECT_RANDOM_SOUND,
} from '../constants';
// import loadSound from './loadSound.actions';
import { makeActionCreator, api } from './actionUtils';

const requestRandomSound = makeActionCreator(REQUEST_RANDOM_SOUND, 'query');
const receiveRandomSound = makeActionCreator(RECEIVE_RANDOM_SOUND, 'sound');
const rejectRandomSound = makeActionCreator(REJECT_RANDOM_SOUND, 'error');

export default function fetchRandomSound() {
  return (dispatch, getState) => {
    const fields = 'id,url,name,license,type,duration,username,previews';
    const state = getState();
    const pageNr = Math.floor(Math.random() * state.count);
    dispatch(requestRandomSound());
    return fetch(
      `${
        api.url
      }search/text/?format=json&query=''&page=${pageNr}&page_size=1&fields=${fields}&token=${
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
          // dispatch(loadSound(json.results[0].previews['preview-hq-mp3']));
        },
        error => dispatch(rejectRandomSound(error)),
      );
  };
}
