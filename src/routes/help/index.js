import React from 'react';
import Layout from '../../components/Layout';
import Page from '../../components/Page';
import help from './help.md';

function action() {
  return {
    chunks: ['help'],
    title: help.title,
    component: (
      <Layout>
        <Page {...help} />
      </Layout>
    ),
  };
}

export default action;
