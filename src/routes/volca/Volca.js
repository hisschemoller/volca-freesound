/**
 * Volca Freesound app.
 * 
 * 1. load sound data
 * 1a. update view
 * 2. load mp3
 * 2a. update view
 * 3. convert audio
 * 3a. update view
 * 4. transfer
 * 4a. update view while transferring
 * 5. done transferring
 */

import React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Volca.css';
import fetchSounds from '../../actions/fetchSounds.actions';

class Volca extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
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
              this.props.dispatch(
                fetchSounds({
                  query: '',
                  page: 1,
                  pageSize: 1,
                }),
              );
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
