import React from 'react';
import Layout from '../../components/organisms/Layout';
import Help from '../../components/pages/Help';

const title = 'Help';

function action() {
  return {
    title,
    chunks: ['help'],
    component: (
      <Layout>
        <Help title={title} />
      </Layout>
    ),
  };
}

export default action;
