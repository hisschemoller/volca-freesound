import { TEST } from '../constants';

export default function test(state = {}, action) {
  switch (action.type) {
    case TEST:
      return {
        ...state,
        [action.payload.name]: action.payload.value,
      };
    default:
      return state;
  }
}
