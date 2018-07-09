import fetchRandomSound from './fetchRandomSound.actions';
import { stop } from './volca.actions';

/**
 * Find the first Volca Sample slot that
 * has status === 1 (selected empty slot) or
 * has status === 3 (selected slot to overwrite earlier loaded sample) and
 * transfer hasn't been paused.
 */
export default function evaluateSounds() {
  return (dispatch, getState) => {
    const state = getState();
    if (
      state.sounds.slots.findIndex(slot => slot === 1 || slot === 3) !== -1 &&
      !state.sounds.isPaused
    ) {
      setTimeout(() => {
        dispatch(fetchRandomSound());
      }, 1000);
    } else {
      dispatch(stop());
    }
  };
}
