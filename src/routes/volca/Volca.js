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
import loadSound from '../../actions/loadSound.actions';

class Volca extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    hasNewSound: PropTypes.bool,
    numSounds: PropTypes.number.isRequired,
    sounds: PropTypes.shape({
      allIds: PropTypes.array,
      byId: PropTypes.shape({}),
    }),
  };

  static defaultProps = {
    hasNewSound: false,
    sounds: {
      allIds: [],
      byId: {},
    },
  };

  componentDidMount() {
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.hasNewSound) {
      this.props.dispatch(
        loadSound(
          nextProps.sounds.byId[
            nextProps.sounds.allIds[nextProps.numSounds - 1]
          ].preview,
          this.audioContext,
        ),
      );
    }
  }

  componentWillUnmount() {
    this.audioContext.close();
  }

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

function mapStateToProps(state, ownProps) {
  return {
    count: state.sounds.count,
    sounds: state.sounds.sounds,
    numSounds: state.sounds.sounds.allIds.length,
    hasNewSound: state.sounds.sounds.allIds.length !== ownProps.numSounds,
  };
}

export default compose(withStyles(s), connect(mapStateToProps))(Volca);
