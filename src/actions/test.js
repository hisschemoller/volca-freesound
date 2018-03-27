import { TEST } from '../constants';

export default function test({ name, value }) {
  return {
    type: TEST,
    payload: {
      name,
      value,
    },
  };
}
