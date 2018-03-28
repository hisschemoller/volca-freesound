import { RECEIVE_SOUNDS, RECEIVE_RANDOM_SOUND } from '../constants';

const defaultState = {
  count: 0,
  sounds: { allIds: [], byId: {} },
};

export default function sounds(state = defaultState, action) {
  switch (action.type) {
    case RECEIVE_SOUNDS:
      return {
        ...state,
        count: action.json.count,
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

    default:
      return state;
  }
}
