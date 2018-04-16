/**
 * Volca Freesound app.
 */

import React from 'react';
import Layout from '../../components/Layout';
import Volca from './Volca';

const title = 'vf';

function action() {
  return {
    title,
    chunks: ['volca'],
    component: (
      <Layout>
        <Volca title={title} numSounds={0} />
      </Layout>
    ),
  };
}

export default action;
