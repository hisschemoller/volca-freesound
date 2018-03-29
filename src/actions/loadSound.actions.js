import { REQUEST_SOUND, RECEIVE_SOUND, REJECT_SOUND } from '../constants';
import { makeActionCreator, api } from './actionUtils';

const requestSound = makeActionCreator(REQUEST_SOUND, 'query');
const receiveSound = makeActionCreator(RECEIVE_SOUND, 'json');
const rejectSound = makeActionCreator(REJECT_SOUND, 'error');

export default function loadSound(url, audioContext) {
  return dispatch => {
    dispatch(requestSound());
    if (url) {
      fetch(url).then(response => {
        response.arrayBuffer().then(buffer => {
          audioContext.decodeAudioData(buffer).then(decodedBuffer => {
            console.log('audio decoded');
          });
        });
      });
    } else {
      dispatch(rejectSound('no preview url'));
    }
  };
}
