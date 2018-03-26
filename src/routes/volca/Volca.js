/**
 * Volca Freesound app.
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Volca.css';

class Volca extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
  };

  onStartClick() {
    console.log('click');
  }

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1 className={s.title}>{this.props.title}</h1>
          <button type="button" onClick={this.onStartClick}>
            Start
          </button>
          <p>...</p>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Volca);
