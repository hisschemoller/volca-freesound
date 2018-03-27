/**
 * Volca Freesound app.
 */

import React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Volca.css';
import test from '../../actions/test';

class Volca extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
  };

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1 className={s.title}>{this.props.title}</h1>
          <button
            type="button"
            onClick={e => {
              e.preventDefault();
              test({
                name: 'ja',
                value: 10,
              });
            }}
          >
            Start
          </button>
          <p>...</p>
        </div>
      </div>
    );
  }
}

function mapStateToProps() {
  return {};
}

export default compose(withStyles(s), connect(mapStateToProps))(Volca);
