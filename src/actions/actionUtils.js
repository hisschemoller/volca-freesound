/**
 * Action creator generator.
 * @param  {String} type Action type for which to generate a creator function.
 * @param  {[type]} argNames [description]
 * @return {Function} Action creator function.
 */
export function makeActionCreator(type, ...argNames) {
  return (...args) => {
    const action = { type };
    argNames.forEach((arg, index) => {
      action[argNames[index]] = args[index];
    });
    return action;
  };
}

export const api = {
  url: 'https://freesound.org/apiv2/',
  token: 'I4LLx1YDPjNbkBCuK0zYbQAV9njbRLJ9ZhctDhGP',
};
