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
import fetchRandomSound from '../../actions/fetchRandomSound.actions';
import fetchSounds from '../../actions/fetchSounds.actions';
import loadSound from '../../actions/loadSound.actions';
import {
  setFrom,
  setTo,
  setDurationMax,
} from '../../actions/changeSetting.actions';

class Volca extends React.Component {
  static propTypes = {
    channelFirst: PropTypes.number.isRequired,
    channelLast: PropTypes.number.isRequired,
    channelMax: PropTypes.number.isRequired,
    dispatch: PropTypes.func.isRequired,
    durationMax: PropTypes.number.isRequired,
    hasNewSound: PropTypes.bool,
    numSounds: PropTypes.number.isRequired,
    sounds: PropTypes.shape({
      allIds: PropTypes.array,
      byId: PropTypes.shape({}),
    }),
    title: PropTypes.string.isRequired,
  };

  static defaultProps = {
    hasNewSound: false,
    sounds: {
      allIds: [],
      byId: {},
    },
  };

  /**
   * When the component mounts:
   * Create an AudioContext to play the encoded samples.
   * Get the total amount of available sounds from Freesound.
   */
  componentDidMount() {
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    this.props.dispatch(
      fetchSounds({
        query: '',
        page: 1,
        pageSize: 1,
      }),
    );
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
          <label htmlFor="duration_max">
            <span>Max. duration</span>
            <input
              type="number"
              min="0"
              max="none"
              value={this.props.durationMax}
              id="duration_max"
              onChange={e => {
                e.preventDefault();
                this.props.dispatch(setDurationMax(e.target.value));
                this.props.dispatch(
                  fetchSounds({
                    query: '',
                    page: 1,
                    pageSize: 1,
                  }),
                );
              }}
            />
          </label>
          <label htmlFor="from">
            <span>From</span>
            <input
              type="number"
              min="0"
              max={this.props.channelMax}
              value={this.props.channelFirst}
              id="from"
              onChange={e => {
                e.preventDefault();
                this.props.dispatch(setFrom(e.target.value));
              }}
            />
          </label>
          <label htmlFor="to">
            <span>To</span>
            <input
              type="number"
              min="0"
              max={this.props.channelMax}
              value={this.props.channelLast}
              id="to"
              onChange={e => {
                e.preventDefault();
                this.props.dispatch(setTo(e.target.value));
              }}
            />
          </label>
          <button
            type="button"
            onClick={e => {
              e.preventDefault();
              this.props.dispatch(fetchRandomSound());
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
    channelFirst: state.sounds.channelFirst,
    channelLast: state.sounds.channelLast,
    channelMax: state.sounds.channelMax,
    count: state.sounds.count,
    durationMax: state.sounds.durationMax,
    hasNewSound: state.sounds.sounds.allIds.length !== ownProps.numSounds,
    numSounds: state.sounds.sounds.allIds.length,
    sounds: state.sounds.sounds,
  };
}

export default compose(withStyles(s), connect(mapStateToProps))(Volca);
