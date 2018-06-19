import React from 'react';
import Layout from '../../components/organisms/Layout';
import About from '../../components/pages/About';

const title = 'About';

function action() {
  return {
    title,
    chunks: ['about'],
    component: (
      <Layout>
        <About title={title} />
      </Layout>
    ),
  };
}

export default action;
