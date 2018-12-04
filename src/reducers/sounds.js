/**
 * Slot values:
 * 0 - empty
 * 1 - empty, selected to load a sample
 * 2 - sample was loaded in the slot
 * 3 - sample loaded, selected to overwrite
 * 4 - currently transferring sample
 */

import {
  CLEAR_ALL,
  INITIALIZE,
  MODAL_HIDE,
  MODAL_SHOW,
  PAUSE,
  PLAY_END,
  PLAY_PROGRESS,
  PLAY_START,
  RECEIVE_SOUNDS,
  RECEIVE_RANDOM_SOUND,
  REJECT_SOUNDS,
  REQUEST_RANDOM_SOUND,
  SELECT_ALL,
  SET_DURATION_MAX,
  SET_RANGE,
  SET_RANGE_FIRST,
  SET_RANGE_LAST,
  START,
  STOP,
  TOGGLE_DOUBLE_SPEED,
  TOGGLE_NORMALIZE,
  TOGGLE_SLOT,
} from '../constants';

const initialState = {
  count: 0,
  duration: 0,
  durationMax: 1,
  isDoubleSpeed: false,
  isNormalize: false,
  isPaused: false,
  isStarted: false,
  modalType: null,
  position: 0,
  rangeFirst: 0,
  rangeLast: 99,
  slotCount: 100,
  slotIndex: null,
  slots: [],
  sounds: { allIds: [], byId: {} },
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
        position: 1,
        slots: state.slots.reduce((accumulator, slot, index) => {
          accumulator.push(index === state.slotIndex ? 2 : slot);
          return accumulator;
        }, []),
        totalDuration: state.totalDuration + state.duration,
      };
    case REQUEST_RANDOM_SOUND:
      return {
        ...state,
        slotIndex: state.slots.findIndex(slot => slot === 1 || slot === 3),
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
              id: action.sound.id,
              license: action.sound.license,
              preview: action.sound.previews['preview-hq-mp3'],
              duration: action.sound.duration,
              type: action.sound.type,
              url: action.sound.url,
              username: action.sound.username,
              slotIndex: state.slotIndex,
            },
          },
        },
      };
    case RECEIVE_SOUNDS:
      return {
        ...state,
        count: action.json.count,
      };
    case REJECT_SOUNDS:
      return {
        ...state,
        count: 0,
      };
    case SET_RANGE:
      return {
        ...state,
        slots: state.slots.reduce((accumulator, currentValue, currentIndex) => {
          let value = state.slots[currentIndex];
          if (
            state.rangeFirst <= currentIndex &&
            currentIndex <= state.rangeLast &&
            (value === 0 || value === 2)
          ) {
            value = value === 0 ? 1 : 3;
          }
          accumulator.push(value);
          return accumulator;
        }, []),
      };
    case SET_RANGE_FIRST:
      return {
        ...state,
        rangeFirst:
          action.value === ''
            ? ''
            : Math.max(
                0,
                Math.min(Math.round(action.value), state.slotCount - 1),
              ),
      };
    case SET_RANGE_LAST:
      return {
        ...state,
        rangeLast:
          action.value === ''
            ? ''
            : Math.max(
                0,
                Math.min(Math.round(action.value), state.slotCount - 1),
              ),
      };
    case SET_DURATION_MAX:
      return {
        ...state,
        durationMax: action.value === '' ? '' : Math.max(0, action.value),
      };
    case TOGGLE_SLOT:
      return {
        ...state,
        slots: state.slots.reduce((accumulator, currentValue, currentIndex) => {
          let value = state.slots[currentIndex];
          if (action.index === currentIndex) {
            switch (value) {
              case 0:
                value = 1;
                break;
              case 1:
                value = 0;
                break;
              case 2:
                value = 3;
                break;
              case 3:
                value = 2;
                break;
              default:
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
      return {
        ...state,
        slots: new Array(state.slotCount).fill(1, 0, state.slotCount),
      };
    case INITIALIZE:
      return {
        ...state,
        slots: new Array(state.slotCount).fill(0, 0, state.slotCount),
      };
    case START:
      return {
        ...state,
        isStarted: true,
        slotIndex: null,
      };
    case STOP:
      return {
        ...state,
        isPaused: false,
        isStarted: false,
        slotIndex: null,
      };
    case PAUSE:
      return {
        ...state,
        isPaused: true,
      };
    case TOGGLE_DOUBLE_SPEED:
      return {
        ...state,
        isDoubleSpeed: !state.isDoubleSpeed,
      };
    case TOGGLE_NORMALIZE:
      return {
        ...state,
        isNormalize: !state.isNormalize,
      };
    case MODAL_HIDE:
      return {
        ...state,
        modalType: initialState.modalType,
      };
    case MODAL_SHOW:
      return {
        ...state,
        modalType: action.modalType,
      };
    default:
      return state;
  }
}
