/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Header.css';
import Link from '../../atoms/Link';
import Navigation from '../../molecules/Navigation';

class Header extends React.PureComponent {
  render() {
    return (
      <div className={s.root}>
        <Link className={s.brand} to="main">
          <span className={s.brandTxt}>
            Volca<img
              src="img/logo.svg"
              alt="Volca Freesound logo"
              className={s.brandLogo}
            />Freesound
          </span>
        </Link>
        <span className={s.version}>v1.01</span>
        <Navigation />
      </div>
    );
  }
}

export default withStyles(s)(Header);
