/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

// external-global styles must be imported in your JS.
import normalizeCss from 'normalize.css';
import s from './Layout.css';
import Footer from '../Footer';
import Header from '../Header';
import ModalContainer from '../ModalContainer';
import WebAudio from '../WebAudio';

class Layout extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  render() {
    return (
      <div className={s.container}>
        <Header />
        {this.props.children}
        <Footer />
        <ModalContainer />
        <WebAudio />
      </div>
    );
  }
}

export default withStyles(normalizeCss, s)(Layout);
