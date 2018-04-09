import fetchRandomSound from './fetchRandomSound.actions';

export default function evaluateSounds() {
  return (dispatch, getState) => {
    const durationMax = 90;
    const state = getState();
    if (
      state.sounds.totalDuration < durationMax &&
      state.sounds.channel <= state.sounds.channelLast
    ) {
      dispatch(fetchRandomSound());
    }
  };
}
