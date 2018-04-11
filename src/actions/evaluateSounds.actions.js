import fetchRandomSound from './fetchRandomSound.actions';

export default function evaluateSounds() {
  return (dispatch, getState) => {
    const durationMax = 90;
    const state = getState();
    if (
      state.sounds.totalDuration < durationMax &&
      state.sounds.slots.findIndex(slot => slot === 1) !== -1
    ) {
      dispatch(fetchRandomSound());
    } else {
      console.log('done');
    }
  };
}
