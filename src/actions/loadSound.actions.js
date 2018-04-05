import { REQUEST_SOUND, RECEIVE_SOUND, REJECT_SOUND } from '../constants';
import playSound from './playSound.actions';
import { makeActionCreator } from './actionUtils';

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

  // let offst = offset;
  // for (let i = 0; i < input.length; i += 1, offst += 2) {
  //   const s = Math.max(-1, Math.min(1, input[i]));
  //   output.setInt16(offst, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  // }
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

  // let offset = 0;
  // while (offset < samples.length) {
  //   console.log('samples', offset, samples[offset]);
  //   offset += 1000;
  // }

  let offset = 1000;
  while (offset < view.byteLength) {
    // console.log('view', offset, view.getInt16(offset));
    offset += 2400;
  }

  const type = 'audio/wav';
  const audioBlob = new Blob([view], { type });

  return audioBlob;
}

// function blobTo(blob) {
//   const fileReader = new FileReader();
//   fileReader.onload = () => {
//     arrayBuffer = fileReader.result;
//   };
//   fileReader.readAsArrayBuffer(blob);
// }

/**
 * Trigger the download of a file.
 * @param {Blob} blob
 * @param {String} filename
 */
// function forceDownload(blob, filename) {
//   const url = (window.URL || window.webkitURL).createObjectURL(blob);
//   const link = window.document.createElement('a');
//   link.href = url;
//   link.download = filename || 'output.wav';
//   const click = document.createEvent('Event');
//   click.initEvent('click', true, true);
//   link.dispatchEvent(click);
//   console.log('forceDownload click', click);
//   console.log('forceDownload link', link);
// }

/**
 * Load an MP3 audio file from the provided URL,
 * convert the loaded audio to a Wav file formatted Blob,
 * convert that to a Syro type audio file
 * and start playback (to the connected Volca Sample).
 * @param {*} url
 * @param {*} audioContext
 */
export default function loadSound(url, audioContext) {
  return (dispatch, getState) => {
    dispatch(requestSound());
    if (url) {
      fetch(url).then(response => {
        // console.log('response', response.length, response);
        // response.arrayBuffer() takes a Response stream and reads it to completion.
        // It returns a promise that resolves with an ArrayBuffer.
        response.arrayBuffer().then(arrayBuffer => {
          // console.log('buffer', arrayBuffer.length, arrayBuffer);
          audioContext.decodeAudioData(arrayBuffer).then(audioBuffer => {
            // console.log('audioBuffer', audioBuffer.length, audioBuffer);
            const wavBlob = bufferToWav(
              audioBuffer,
              audioBuffer.numberOfChannels,
              audioBuffer.sampleRate,
            );
            // console.log('blob', wavBlob.length, wavBlob);

            // const channel = state.sounds.channel;
            // console.log('channel', channel);
            const state = getState();
            Syrialize(wavBlob, state.sounds.channel, syroBlob => {
              // console.log('syroBlob', syroBlob);
              // forceDownload(syroBlob, `${channel}_syro.wav`);
              const fileReader = new FileReader();
              fileReader.onload = () => {
                const syroArrayBuffer = fileReader.result;
                // console.log('syroArrayBuffer', syroArrayBuffer);
                audioContext
                  .decodeAudioData(syroArrayBuffer)
                  .then(syroAudioBuffer => {
                    // console.log('syroAudioBuffer', syroAudioBuffer);
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
