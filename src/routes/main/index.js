/**
 * Volca Freesound app.
 */

import React from 'react';
import Layout from '../../components/Layout';
import Main from '../../components/Main';

const title = 'Transfer';

function action() {
  return {
    title,
    chunks: ['main'],
    component: (
      <Layout>
        <Main title={title} numSounds={0} />
      </Layout>
    ),
  };
}

export default action;
