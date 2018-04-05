import React from 'react';

let audioContext;

export default class WebAudio extends React.Component {
  componentWillMount() {
    if (AudioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  componentWillUnmount() {
    this.audioContext.close();
  }

  render() {
    return null;
  }
}

export function getAudioContext() {
  return audioContext;
}
