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
import {
  setFrom,
  setTo,
  setDurationMax,
} from '../../actions/changeSetting.actions';

let audioContext;

class Volca extends React.Component {
  static propTypes = {
    channelFirst: PropTypes.number.isRequired,
    channelLast: PropTypes.number.isRequired,
    channelMax: PropTypes.number.isRequired,
    dispatch: PropTypes.func.isRequired,
    durationMax: PropTypes.number.isRequired,
    position: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
  };

  static defaultProps = {};

  /**
   * When the component mounts:
   * Create an AudioContext to play the encoded samples.
   * Get the total amount of available sounds from Freesound.
   */
  componentDidMount() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.props.dispatch(
      fetchSounds({
        query: '',
        page: 1,
        pageSize: 1,
      }),
    );
  }

  componentWillUnmount() {
    audioContext.close();
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
          <span>{Math.round(this.props.position * 100)}</span>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    channelFirst: state.sounds.channelFirst,
    channelLast: state.sounds.channelLast,
    channelMax: state.sounds.channelMax,
    durationMax: state.sounds.durationMax,
    position: state.sounds.position,
  };
}

export default compose(withStyles(s), connect(mapStateToProps))(Volca);

export function getAudioContext() {
  return audioContext;
}
