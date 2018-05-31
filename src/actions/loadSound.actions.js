import { REQUEST_SOUND, RECEIVE_SOUND, REJECT_SOUND } from '../constants';
import playSound from './playSound.actions';
import { makeActionCreator } from './actionUtils';
import { getAudioContext } from '../components/Main';

const requestSound = makeActionCreator(REQUEST_SOUND, 'query');
const receiveSound = makeActionCreator(RECEIVE_SOUND, 'json');
const rejectSound = makeActionCreator(REJECT_SOUND, 'error');

/**
 * Write a text string as unsigned 8 bit integers to a DataView object.
 * @param {DataView} view
 * @param {Number} offset
 * @param {String} string
 */
function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i += 1) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Write an AudioBuffer as 16 bit integers to a DataView object.
 * @param {DataView} output
 * @param {Number} offset
 * @param {AudioBuffer} input
 */
function floatTo16BitPCM(output, offset, input) {
  let offst = offset;
  for (let i = 0, n = input.numberOfChannels; i < n; i += 1) {
    if (i === 0) {
      const float32Array = input.getChannelData(i);
      for (let j = 0, p = float32Array.length; j < p; j += 1, offst += 2) {
        const s = Math.max(-1, Math.min(1, float32Array[j]));
        output.setInt16(offst, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      }
    }
  }
}

/**
 * Convert an AudioBuffer to a Wav file formatted Blob object.
 * @param {AudioBuffer} samples
 * @param {*} numChannels
 * @param {*} sampleRate
 * @returns {Blob}
 */
function bufferToWav(samples, numChannels, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* RIFF chunk length */
  view.setUint32(4, 36 + samples.length * 2, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 4, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, numChannels * 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  floatTo16BitPCM(view, 44, samples);

  let offset = 1000;
  while (offset < view.byteLength) {
    offset += 2400;
  }

  const type = 'audio/wav';
  const audioBlob = new Blob([view], { type });

  return audioBlob;
}

/**
 * Normalize audio to maximum possible amplitude.
 * @param {Object} audioBuffer AudioBuffer object.
 */
function normalize(audioBuffer) {
  // find the amplitude maximum
  let maxPos = -1;
  let maxNeg = 1;
  const bufferLength = audioBuffer.length;
  for (
    let channelIndex = 0;
    channelIndex < audioBuffer.numberOfChannels;
    channelIndex += 1
  ) {
    const audioFloat32Array = audioBuffer.getChannelData(channelIndex);

    for (let i = 0; i < bufferLength; i += 1) {
      if (audioFloat32Array[i] > maxPos) maxPos = audioFloat32Array[i];
      if (audioFloat32Array[i] < maxNeg) maxNeg = audioFloat32Array[i];
    }
  }
  const max = Math.max(Math.abs(maxPos), Math.abs(maxNeg));
  const amp = Math.max(1 / max, 1);
  // amp values
  for (
    let channelIndex = 0;
    channelIndex < audioBuffer.numberOfChannels;
    channelIndex += 1
  ) {
    const audioFloat32Array = audioBuffer.getChannelData(channelIndex);
    for (let i = 0; i < bufferLength; i += 1) {
      audioFloat32Array[i] = Math.max(
        -1,
        Math.min(audioFloat32Array[i] * amp, 1),
      );
    }
  }
  return audioBuffer;
}

/**
 * Double the speed of the sample.
 * @param {Object} audioBuffer AudioBuffer object.
 * @return {Object} audioBuffer New half length double speed audioBuffer.
 */
function doubleSpeed(audioBuffer) {
  const newAudioBuffer = new AudioBuffer(
    Math.floor(audioBuffer.length / 2),
    audioBuffer.numberOfChannels,
    audioBuffer.sampleRate,
  );
  const bufferLength = newAudioBuffer.length;
  for (
    let channelIndex = 0;
    channelIndex < audioBuffer.numberOfChannels;
    channelIndex += 1
  ) {
    const oldAudioFloat32Array = audioBuffer.getChannelData(channelIndex);
    const newAudioFloat32Array = newAudioBuffer.getChannelData(channelIndex);
    for (let i = 0; i < bufferLength; i += 1) {
      const oldArrayIndex = Math.min(i * 2, audioBuffer.length - 1);
      newAudioFloat32Array[i] = oldAudioFloat32Array[oldArrayIndex];
    }
  }
  return newAudioBuffer;
}

/**
 * Load an MP3 audio file from the provided URL,
 * convert the loaded audio to a Wav file formatted Blob,
 * convert that to a Syro type audio file
 * and start playback (to the connected Volca Sample).
 * @param {*} url
 */
export default function loadSound(url) {
  return (dispatch, getState) => {
    dispatch(requestSound());
    if (url) {
      fetch(url).then(response => {
        response.arrayBuffer().then(arrayBuffer => {
          const audioContext = getAudioContext();
          audioContext.decodeAudioData(arrayBuffer).then(audioBuffer => {
            const state = getState();

            // normalize the sample
            let audioBuffer2 = audioBuffer;
            if (state.isNormalize) {
              audioBuffer2 = normalize(audioBuffer);
            }

            // double speed sample
            let audioBuffer3 = audioBuffer2;
            if (state.isDoubleSpeed) {
              audioBuffer3 = doubleSpeed(audioBuffer2);
            }

            const wavBlob = bufferToWav(
              audioBuffer3,
              audioBuffer3.numberOfChannels,
              audioBuffer3.sampleRate,
            );

            window.Syrialize(wavBlob, state.sounds.slotIndex, syroBlob => {
              const fileReader = new FileReader();
              fileReader.onload = () => {
                const syroArrayBuffer = fileReader.result;
                audioContext
                  .decodeAudioData(syroArrayBuffer)
                  .then(syroAudioBuffer => {
                    dispatch(playSound(audioContext, syroAudioBuffer));
                  });
              };
              fileReader.readAsArrayBuffer(syroBlob);
            });
          });
        });
      });
    } else {
      dispatch(rejectSound('no preview url'));
    }
  };
}
