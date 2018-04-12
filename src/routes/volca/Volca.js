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
 *
 * 1. Initially all slots are selected.
 * 2. Range selectors adjust the range from first to last slot.
 * 3. All and Clear buttons to select all or no slots.
 * 4. Slots are clickable to toggle individual slots.
 * 5. Click and drag to select multiple slots.
 */

import React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Volca.css';
import downloadReceipt from '../../actions/downloadReceipt.actions';
import fetchSounds from '../../actions/fetchSounds.actions';
import fetchRandomSound from '../../actions/fetchRandomSound.actions';
import {
  clearAll,
  initialize,
  pause,
  selectAll,
  setDurationMax,
  setRange,
  setRangeFirst,
  setRangeLast,
  start,
} from '../../actions/volca.actions';
import Slots from '../../components/Slots';

let audioContext;

class Volca extends React.Component {
  static propTypes = {
    count: PropTypes.number.isRequired,
    dispatch: PropTypes.func.isRequired,
    isPaused: PropTypes.bool.isRequired,
    isStarted: PropTypes.bool.isRequired,
    durationMax: PropTypes.number.isRequired,
    position: PropTypes.number.isRequired,
    rangeFirst: PropTypes.number.isRequired,
    rangeLast: PropTypes.number.isRequired,
    slotCount: PropTypes.number.isRequired,
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
    this.props.dispatch(initialize());
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
    let btnText = 'Start';
    if (this.props.isStarted) {
      btnText = this.props.isPaused ? 'Stopping...' : 'Stop';
    }

    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1 className={s.title}>{this.props.title}</h1>
          <span className={s.samplecount}>
            {this.props.count > 0
              ? `${this.props.count} samples found`
              : `No samples available.`}
          </span>
          <div className={s.row}>
            <progress max="1" value={this.props.position} />
            <span>{Math.round(this.props.position * 100)}%</span>
            <button
              type="button"
              onClick={e => {
                e.preventDefault();
                if (this.props.isStarted) {
                  this.props.dispatch(pause());
                } else {
                  this.props.dispatch(start());
                  this.props.dispatch(fetchRandomSound());
                }
              }}
            >
              {btnText}
            </button>
          </div>
          <div className={s.row}>
            <span className={s.textline}>
              File transfer has finished. Please download your receipt.
            </span>
            <button
              type="button"
              onClick={e => {
                e.preventDefault();
                this.props.dispatch(downloadReceipt());
              }}
            >
              Download receipt (text file)
            </button>
          </div>
          <div className={s.row}>
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
          </div>
          <div className={s.row}>
            <label htmlFor="from">
              <span>From</span>
              <input
                type="number"
                min="0"
                max={this.props.slotCount - 1}
                value={this.props.rangeFirst}
                id="from"
                onChange={e => {
                  e.preventDefault();
                  this.props.dispatch(setRangeFirst(e.target.value));
                }}
              />
            </label>
            <label htmlFor="to">
              <span>To</span>
              <input
                type="number"
                min="0"
                max={this.props.slotCount - 1}
                value={this.props.rangeLast}
                id="to"
                onChange={e => {
                  e.preventDefault();
                  this.props.dispatch(setRangeLast(e.target.value));
                }}
              />
            </label>
            <button
              type="button"
              onClick={e => {
                e.preventDefault();
                this.props.dispatch(setRange());
              }}
            >
              Set range
            </button>
          </div>
          <div className={s.row}>
            <button
              type="button"
              onClick={e => {
                e.preventDefault();
                this.props.dispatch(clearAll());
              }}
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={e => {
                e.preventDefault();
                this.props.dispatch(selectAll());
              }}
            >
              Select All
            </button>
          </div>
          <Slots />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    count: state.sounds.count,
    durationMax: state.sounds.durationMax,
    isPaused: state.sounds.isPaused,
    isStarted: state.sounds.isStarted,
    rangeFirst: state.sounds.rangeFirst,
    rangeLast: state.sounds.rangeLast,
    position: state.sounds.position,
    slotCount: state.sounds.slotCount,
  };
}

export default compose(withStyles(s), connect(mapStateToProps))(Volca);

export function getAudioContext() {
  return audioContext;
}
