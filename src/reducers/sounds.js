import {
  INITIALIZE,
  SET_DURATION_MAX,
  SET_FROM,
  SET_TO,
  RECEIVE_SOUNDS,
  RECEIVE_RANDOM_SOUND,
  REQUEST_RANDOM_SOUND,
  PLAY_START,
  PLAY_END,
  PLAY_PROGRESS,
} from '../constants';

function updateSlots(state, rangeFirst, rangeLast, activeIndex) {
  let value;
  return state.slots.reduce((accumulator, currentValue, currentIndex) => {
    if (currentIndex === activeIndex && state.status === 1) {
      value = 3;
    } else if (state.rangeFirst <= currentIndex && currentIndex <= rangeLast) {
      value = 1;
    } else {
      value = 0;
    }
    accumulator.push(value);
    return accumulator;
  }, []);
}

const initialState = {
  channel: 0,
  channelFirst: 0,
  channelLast: 99,
  channelMax: 99,
  count: 0,
  duration: 0,
  durationMax: 4,
  position: 0,
  slotCount: 100,
  slotIndex: 0,
  slots: [],
  sounds: { allIds: [], byId: {} },
  status: 0, // 0=idle | 1=active
  totalDuration: 0,
};

export default function sounds(state = initialState, action) {
  let channel;
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
        channel: state.channel + 1,
        duration: 0,
        status: 0,
        totalDuration: state.totalDuration + state.duration,
      };
    case REQUEST_RANDOM_SOUND:
      return {
        ...state,
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
    case SET_FROM:
      channel = Math.max(
        0,
        Math.min(Math.round(action.value), state.channelMax),
      );
      return {
        ...state,
        channelFirst: channel,
        channel,
        slots: updateSlots(state, channel, state.channelLast, channel),
      };
    case SET_TO:
      channel = Math.max(
        0,
        Math.min(Math.round(action.value), state.channelMax),
      );
      return {
        ...state,
        channelLast: channel,
        slots: updateSlots(state, state.channelFirst, channel, state.channel),
      };
    case SET_DURATION_MAX:
      return {
        ...state,
        durationMax: Math.max(0, action.value),
      };
    case INITIALIZE:
      return {
        ...state,
        slots: new Array(state.slotCount).fill(1, 0, state.slotCount),
      };
    default:
      return state;
  }
}