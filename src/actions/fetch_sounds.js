const api = {
  url: 'https://freesound.org/apiv2/',
  token: 'I4LLx1YDPjNbkBCuK0zYbQAV9njbRLJ9ZhctDhGP',
};

/**
 * Action creator generator.
 * @param  {String} type Action type for which to generate a creator function.
 * @param  {[type]} argNames [description]
 * @return {Function} Action creator function.
 */
function makeActionCreator(type, ...argNames) {
  return (...args) => {
    const action = { type };
    argNames.forEach((arg, index) => {
      action[argNames[index]] = args[index];
    });
    return action;
  };
}

export const REQUEST_SOUNDS = 'REQUEST_SOUNDS';
export const RECEIVE_SOUNDS = 'RECEIVE_SOUNDS';
export const REJECT_SOUNDS = 'REJECT_SOUNDS';

export const requestSounds = makeActionCreator(REQUEST_SOUNDS, 'query');
export const receiveSounds = makeActionCreator(
  RECEIVE_SOUNDS,
  'query',
  'sounds',
);
export const rejectSounds = makeActionCreator(REJECT_SOUNDS, 'error');

export default function fetchSounds(payload) {
  return (dispatch, getState) => {
    const { query, page, pageSize } = { ...payload };
    const fields =
      'id,name,previews,images,username,created,duration,num_downloads,avg_rating,tags';
    dispatch(requestSounds(query));
    return fetch(
      `${
        api.url
      }search/text/?format=json&query=${query}&page=${page}&page_size=${pageSize}&fields=${fields}&token=${
        api.token
      }`,
    )
      .then(response => response.json(), error => dispatch(rejectSounds(error)))
      .then(
        json => dispatch(receiveSounds(query, json)),
        error => dispatch(rejectSounds(error)),
      );
  };
}
