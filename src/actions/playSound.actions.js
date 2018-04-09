import { PLAY_START, PLAY_PROGRESS, PLAY_END } from '../constants';
import { makeActionCreator } from './actionUtils';
import evaluateSounds from './evaluateSounds.actions';

const playStart = makeActionCreator(PLAY_START, 'duration');
const playProgress = makeActionCreator(PLAY_PROGRESS);
const playEnd = makeActionCreator(PLAY_END);

export default function playSound(audioContext, audioBuffer) {
  return dispatch => {
    const bufferSource = audioContext.createBufferSource();
    bufferSource.buffer = audioBuffer;
    bufferSource.connect(audioContext.destination);
    bufferSource.onended = () => {
      dispatch(playEnd());
      dispatch(evaluateSounds());
    };
    bufferSource.start();
    dispatch(playStart(audioBuffer.duration * bufferSource.playbackRate.value));
  };
}
