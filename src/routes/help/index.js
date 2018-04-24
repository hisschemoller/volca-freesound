import React from 'react';
import Layout from '../../components/Layout';

function action() {
  return {
    title: 'Help',
    chunks: ['help'],
    component: (
      <Layout>
        <p>help!</p>
        <p>Dit is de help pagina met tekst, plaatjes en wellicht een video.</p>
      </Layout>
    ),
  };
}

export default action;
