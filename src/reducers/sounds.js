import {
  RECEIVE_SOUNDS,
  RECEIVE_RANDOM_SOUND,
  PLAY_START,
  PLAY_END,
} from '../constants';

const defaultState = {
  channel: 0,
  count: 0,
  duration: 0,
  maxDuration: 4,
  sounds: { allIds: [], byId: {} },
  totalDuration: 0,
};

export default function sounds(state = defaultState, action) {
  switch (action.type) {
    case PLAY_START:
      return {
        ...state,
        duration: action.duration,
      };
    case PLAY_END:
      return {
        ...state,
        channel: state.channel + 1,
        duration: 0,
        totalDuration: state.totalDuration + state.duration,
      };
    case RECEIVE_RANDOM_SOUND:
      return {
        ...state,
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

    default:
      return state;
  }
}
