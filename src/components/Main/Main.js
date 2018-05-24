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
import s from './Main.css';
import downloadReceipt from '../../actions/downloadReceipt.actions';
import fetchRandomSound from '../../actions/fetchRandomSound.actions';
import {
  clearAll,
  initialize,
  pause,
  selectAll,
  setRange,
  setRangeFirst,
  setRangeLast,
  start,
} from '../../actions/volca.actions';
import Freesound from '../../components/Freesound';
import Slots from '../../components/Slots';

let audioContext;

class Main extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    isPaused: PropTypes.bool.isRequired,
    isStarted: PropTypes.bool.isRequired,
    position: PropTypes.number.isRequired,
    rangeFirst: PropTypes.number.isRequired,
    rangeLast: PropTypes.number.isRequired,
    showReceipt: PropTypes.bool.isRequired,
    slotCount: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
  };

  static defaultProps = {};

  /**
   * When the component mounts:
   * Create an AudioContext to play the encoded samples.
   */
  componentDidMount() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.props.dispatch(initialize());
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
          <Freesound />
          <div className={s.row}>
            <progress max="1" value={this.props.position} />
            <span>{Math.round(this.props.position * 100)}%</span>
            <button
              onClick={e => {
                e.preventDefault();
                if (this.props.isStarted) {
                  this.props.dispatch(pause());
                } else {
                  this.props.dispatch(start());
                  this.props.dispatch(fetchRandomSound());
                }
              }}
              type="button"
            >
              {btnText}
            </button>
          </div>
          <div
            className={
              s.receipt + (this.props.showReceipt ? ` ${s.receiptreveal}` : '')
            }
          >
            <span className={s.textline}>
              File transfer has finished. Please download your receipt.
            </span>
            <button
              onClick={e => {
                e.preventDefault();
                this.props.dispatch(downloadReceipt());
              }}
              type="button"
            >
              Download receipt (text file)
            </button>
          </div>
          <div className={s.row}>
            <label htmlFor="from">
              <span>From</span>
              <input
                disabled={this.props.isStarted ? 'disabled' : ''}
                id="from"
                max={this.props.slotCount - 1}
                min="0"
                onChange={e => {
                  e.preventDefault();
                  this.props.dispatch(setRangeFirst(e.target.value));
                }}
                type="number"
                value={this.props.rangeFirst}
              />
            </label>
            <label htmlFor="to">
              <span>To</span>
              <input
                disabled={this.props.isStarted ? 'disabled' : ''}
                id="to"
                max={this.props.slotCount - 1}
                min="0"
                onChange={e => {
                  e.preventDefault();
                  this.props.dispatch(setRangeLast(e.target.value));
                }}
                type="number"
                value={this.props.rangeLast}
              />
            </label>
            <button
              disabled={this.props.isStarted ? 'disabled' : ''}
              onClick={e => {
                e.preventDefault();
                this.props.dispatch(setRange());
              }}
              type="button"
            >
              Set range
            </button>
          </div>
          <div className={s.row}>
            <button
              disabled={this.props.isStarted ? 'disabled' : ''}
              onClick={e => {
                e.preventDefault();
                this.props.dispatch(clearAll());
              }}
              type="button"
            >
              Clear All
            </button>
            <button
              disabled={this.props.isStarted ? 'disabled' : ''}
              onClick={e => {
                e.preventDefault();
                this.props.dispatch(selectAll());
              }}
              type="button"
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
    isPaused: state.sounds.isPaused,
    isStarted: state.sounds.isStarted,
    rangeFirst: state.sounds.rangeFirst,
    rangeLast: state.sounds.rangeLast,
    position: state.sounds.position,
    slotCount: state.sounds.slotCount,
    showReceipt: !!state.sounds.sounds.allIds.length && !state.sounds.isStarted,
  };
}

export default compose(withStyles(s), connect(mapStateToProps))(Main);

export function getAudioContext() {
  return audioContext;
}
