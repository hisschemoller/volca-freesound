import { getAudioContext } from '../components/app/WebAudio';
import { initialize } from './volca.actions';

export default function unlockIOSAudio() {
  return dispatch => {
    const audioContext = getAudioContext();

    // create an empty buffer
    const buffer = audioContext.createBuffer(1, 1, 22050);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);

    // play the empty buffer
    if (typeof source.start === 'undefined') {
      source.noteOn(0);
    } else {
      source.start(0);
    }

    // setup a timer to wait for audio to run
    const interval = setInterval(() => {
      if (audioContext.currentTime > 0) {
        clearInterval(interval);
        dispatch(initialize());
      }
    }, 100);
  };
}
