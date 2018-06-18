import { PLAY_START, PLAY_PROGRESS, PLAY_END } from '../constants';
import { makeActionCreator } from './actionUtils';
import evaluateSounds from './evaluateSounds.actions';

const playStart = makeActionCreator(PLAY_START, 'duration');
const playProgress = makeActionCreator(PLAY_PROGRESS, 'position');
const playEnd = makeActionCreator(PLAY_END);

export default function playSound(audioContext, audioBuffer) {
  return dispatch => {
    let intervalID;
    const bufferSource = audioContext.createBufferSource();
    bufferSource.buffer = audioBuffer;
    bufferSource.connect(audioContext.destination);
    bufferSource.onended = () => {
      clearInterval(intervalID);
      dispatch(playEnd());
      dispatch(evaluateSounds());
    };
    bufferSource.start();
    dispatch(playStart(audioBuffer.duration * bufferSource.playbackRate.value));

    const startTime = performance.now();
    const duration =
      audioBuffer.duration * bufferSource.playbackRate.value * 1000;
    intervalID = setInterval(() => {
      dispatch(
        playProgress(Math.min((performance.now() - startTime) / duration), 1),
      );
    }, 200);
  };
}
