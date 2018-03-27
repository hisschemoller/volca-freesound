import { RECEIVE_SOUNDS } from '../constants';

const defaultState = {
  count: 0,
};

export default function sounds(state = defaultState, action) {
  switch (action.type) {
    case RECEIVE_SOUNDS:
      return {
        ...state,
        count: action.json.count,
      };
    default:
      return state;
  }
}
