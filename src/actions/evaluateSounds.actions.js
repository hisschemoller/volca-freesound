import fetchRandomSound from './fetchRandomSound.actions';
import { stop } from './volca.actions';

export default function evaluateSounds() {
  return (dispatch, getState) => {
    const state = getState();
    if (
      state.sounds.slots.findIndex(slot => slot === 1 || slot === 3) !== -1 &&
      !state.sounds.isPaused
    ) {
      dispatch(fetchRandomSound());
    } else {
      dispatch(stop());
    }
  };
}
