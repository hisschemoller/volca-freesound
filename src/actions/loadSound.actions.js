import { REQUEST_SOUND, RECEIVE_SOUND, REJECT_SOUND } from '../constants';
import { makeActionCreator, api, audioContext } from './actionUtils';

const requestSound = makeActionCreator(REQUEST_SOUND, 'query');
const receiveSound = makeActionCreator(RECEIVE_SOUND, 'json');
const rejectSound = makeActionCreator(REJECT_SOUND, 'error');

export default function loadSound(url) {
  return dispatch => {
    dispatch(requestSound());
    if (url) {
      fetch(url).then(response => {
        response.arrayBuffer().then(buffer => {
          audioContext.decodeAudioData(buffer).then(decodedBuffer => {});
        });
      });
    } else {
      dispatch(rejectSound('no preview url'));
    }
    // return fetch(`${api.url}sounds/${id}/?token=${api.token}`)
    //   .then(response => response.json(), error => dispatch(rejectSound(error)))
    //   .then(
    //     json => dispatch(receiveSound(json)),
    //     error => dispatch(rejectSound(error)),
    //   );
  };
}
