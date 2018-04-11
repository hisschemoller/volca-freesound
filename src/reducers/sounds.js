import {
  CLEAR_ALL,
  INITIALIZE,
  PLAY_END,
  PLAY_PROGRESS,
  PLAY_START,
  RECEIVE_SOUNDS,
  RECEIVE_RANDOM_SOUND,
  REQUEST_RANDOM_SOUND,
  SELECT_ALL,
  SET_DURATION_MAX,
  SET_RANGE,
  SET_RANGE_FIRST,
  SET_RANGE_LAST,
  START,
  TOGGLE_SLOT,
} from '../constants';

// function updateSlots(state, rangeFirst, rangeLast, activeIndex) {
//   let value;
//   return state.slots.reduce((accumulator, currentValue, currentIndex) => {
//     if (currentIndex === activeIndex && state.status === 1) {
//       value = 3;
//     } else if (state.rangeFirst <= currentIndex && currentIndex <= rangeLast) {
//       value = 1;
//     } else {
//       value = 0;
//     }
//     accumulator.push(value);
//     return accumulator;
//   }, []);
// }

const initialState = {
  count: 0,
  duration: 0,
  durationMax: 4,
  position: 0,
  rangeFirst: 0,
  rangeLast: 99,
  slotCount: 100,
  slotIndex: 0,
  slots: [],
  sounds: { allIds: [], byId: {} },
  status: 0, // 0=idle | 1=active
  totalDuration: 0,
};

export default function sounds(state = initialState, action) {
  switch (action.type) {
    case PLAY_PROGRESS:
      return {
        ...state,
        position: action.position,
      };
    case PLAY_START:
      return {
        ...state,
      };
    case PLAY_END:
      return {
        ...state,
        duration: 0,
        slots: state.slots.reduce((accumulator, slot, index) => {
          accumulator.push(index === state.slotIndex ? 2 : slot);
          return accumulator;
        }, []),
        status: 0,
        totalDuration: state.totalDuration + state.duration,
      };
    case REQUEST_RANDOM_SOUND:
      return {
        ...state,
        slotIndex: state.slots.findIndex(slot => slot === 1),
        status: 1,
      };
    case RECEIVE_RANDOM_SOUND:
      return {
        ...state,
        duration: action.sound.duration,
        sounds: {
          allIds: [...state.sounds.allIds, action.sound.id],
          byId: {
            ...state.sounds.byId,
            [action.sound.id]: {
              name: action.sound.name,
              license: action.sound.license,
              preview: action.sound.previews['preview-hq-mp3'],
              duration: action.sound.duration,
              type: action.sound.type,
              url: action.sound.url,
              username: action.sound.username,
            },
          },
        },
      };
    case RECEIVE_SOUNDS:
      return {
        ...state,
        count: action.json.count,
      };
    case SET_RANGE:
      return {
        ...state,
        slots: state.slots.reduce((accumulator, currentValue, currentIndex) => {
          let value = state.slots[currentIndex];
          if (
            state.rangeFirst <= currentIndex &&
            currentIndex <= state.rangeLast &&
            value === 0
          ) {
            value = 1;
          }
          accumulator.push(value);
          return accumulator;
        }, []),
      };
    case SET_RANGE_FIRST:
      return {
        ...state,
        rangeFirst: Math.max(
          0,
          Math.min(Math.round(action.value), state.slotCount - 1),
        ),
      };
    case SET_RANGE_LAST:
      return {
        ...state,
        rangeLast: Math.max(
          0,
          Math.min(Math.round(action.value), state.slotCount - 1),
        ),
      };
    case SET_DURATION_MAX:
      return {
        ...state,
        durationMax: Math.max(0, action.value),
      };
    case TOGGLE_SLOT:
      return {
        ...state,
        slots: state.slots.reduce((accumulator, currentValue, currentIndex) => {
          let value = state.slots[currentIndex];
          if (action.index === currentIndex) {
            if (value === 0) {
              value = 1;
            } else if (value === 1) {
              value = 0;
            }
          }
          accumulator.push(value);
          return accumulator;
        }, []),
      };
    case CLEAR_ALL:
      return {
        ...state,
        slots: new Array(state.slotCount).fill(0, 0, state.slotCount),
      };
    case SELECT_ALL:
    case INITIALIZE:
      return {
        ...state,
        slots: new Array(state.slotCount).fill(1, 0, state.slotCount),
      };
    case START:
      return {
        ...state,
        slotIndex: 0,
      };
    default:
      return state;
  }
}
